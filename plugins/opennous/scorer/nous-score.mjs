#!/usr/bin/env node
// nous-score — score your accounts with YOUR scorecard.md, using Jev, and write the scores to Nous.
//
// Runs anywhere Node 20 runs (your laptop, a GitHub Action). No dependencies. Talks to Nous only
// through the public API, exactly like any outside scorer:
//   read   POST /v2/context   the account record Jev judges
//   write  POST /v2/scores    the score, tier and reason, stamped with your scorecard's version
//
// Usage:
//   node nous-score.mjs check  [--card icp/scorecard.md]           validate the scorecard, write nothing
//   node nous-score.mjs test   <email|domain|linkedin|id> [...]     score a few accounts, print, write nothing
//   node nous-score.mjs run    --all                                score every person, write the scores
//   node nous-score.mjs run    <email|domain|linkedin|id> [...]     score just these, write the scores
//   flags: --card <path> (default icp/scorecard.md) · --dry-run · --json · --concurrency <n> (default 6)
//
// Keys (env first, then ~/.nous/config.json for the Nous key):
//   NOUS_API_KEY        your workspace key (pk_…)
//   OPENROUTER_API_KEY  for Jev (typesafe/jev-1.13 on OpenRouter's decisions endpoint)
//   NOUS_API_URL        optional, defaults to https://api.opennous.cloud
//
// The workspace must score with its own scorer (GET /v2/icp/scorer → external). The API plan does by
// default; otherwise run: PUT /v2/icp/scorer { "scorer": "external" }.

import { readFileSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const JEV_MODEL = 'typesafe/jev-1.13';
const JEV_URL = 'https://openrouter.ai/api/alpha/decisions';
const STATE_LIMIT = 24000;   // characters of account record sent to Jev; its ceiling is ~32k tokens
const POST_BATCH = 500;      // /v2/scores accepts up to 500 per call

// ── args + keys ──────────────────────────────────────────────────────────────────────────────────
const argv = process.argv.slice(2);
const cmd = argv[0];
const flag = (name) => argv.includes(`--${name}`);
const opt = (name, dflt) => { const i = argv.indexOf(`--${name}`); return i >= 0 ? argv[i + 1] : dflt; };
const positional = argv.slice(1).filter((a, i, all) => !a.startsWith('--') && !['--card', '--concurrency'].includes(all[i - 1]));

function nousConfig() {
  const p = join(homedir(), '.nous', 'config.json');
  try { return existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : {}; } catch { return {}; }
}
const cfg = nousConfig();
const NOUS_API_KEY = process.env.NOUS_API_KEY || cfg.apiKey;
const NOUS_API_URL = (process.env.NOUS_API_URL || cfg.apiUrl || 'https://api.opennous.cloud').replace(/\/$/, '');
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

function die(msg) { console.error(`nous-score: ${msg}`); process.exit(1); }

// ── scorecard.md → { meta, dims, disq } ──────────────────────────────────────────────────────────
//
// The format (see the build-scorecard skill's reference): YAML-ish frontmatter, then one `## key · weight`
// section per layer with an `evidence:` line and `- 0: … - 4:` answers worst first, then
// `## disqualify · key` sections with `yes:` / `no:` lines. Any other `##` section is ignored.
export function parseScorecard(text) {
  const fm = text.replace(/\r\n/g, '\n').match(/^---\n([\s\S]*?)\n---/);
  if (!fm) throw new Error('scorecard needs a --- frontmatter block at the top');
  const meta = {};
  for (const line of fm[1].split('\n')) {
    const m = line.match(/^(\w+):\s*(.+?)\s*(?:#.*)?$/);
    if (m) meta[m[1]] = m[2].trim();
  }
  if (!meta.scorer) throw new Error('frontmatter needs scorer: <name>');
  if (!meta.version) throw new Error('frontmatter needs version: <n>');
  const tiers = Object.fromEntries([...(meta.tiers ?? '').matchAll(/(tier_\d):\s*(\d+)/g)].map(m => [m[1], +m[2]]));
  const t = { tier_1: tiers.tier_1 ?? 85, tier_2: tiers.tier_2 ?? 70, tier_3: tiers.tier_3 ?? 50 };
  if (!(t.tier_1 > t.tier_2 && t.tier_2 > t.tier_3)) throw new Error('tiers must descend: tier_1 > tier_2 > tier_3');

  const dims = [], disq = [];
  for (const sec of text.replace(/\r\n/g, '\n').split(/\n## /).slice(1)) {
    const [head, ...rest] = sec.split('\n');
    const body = rest.join('\n').trim();
    let m;
    if ((m = head.match(/^([a-z][\w-]*)\s*·\s*(\d+)\s*$/i))) {
      const rungs = [...body.matchAll(/^- (\d+): (.+)$/gm)].map(r => r[2].trim());
      const evidence = body.match(/^evidence: (.+)$/m)?.[1].trim();
      const instructions = body.split(/\n(?:evidence:|answers)/)[0].trim();
      if (!evidence) throw new Error(`## ${m[1]}: needs an "evidence:" line (what in the record lets you judge it)`);
      if (rungs.length < 2) throw new Error(`## ${m[1]}: needs at least two answers, "- 0: …" worst first`);
      dims.push({ key: m[1], weight: +m[2], instructions, evidence, rungs });
    } else if ((m = head.match(/^disqualify\s*·\s*([\w-]+)/i))) {
      const yes = body.match(/^yes: (.+)$/m)?.[1].trim();
      const no = body.match(/^no: (.+)$/m)?.[1].trim();
      if (!yes || !no) throw new Error(`## disqualify · ${m[1]}: needs both a "yes:" and a "no:" line`);
      disq.push({ key: m[1], yes, no });
    }
  }
  if (!dims.length) throw new Error('no scored sections found (## <name> · <weight>)');
  const total = dims.reduce((s, d) => s + d.weight, 0);
  if (total !== 100) throw new Error(`weights sum to ${total}; they must sum to 100`);
  const num = (k, d) => { const v = parseFloat(meta[k]); return Number.isFinite(v) ? v : d; };
  return {
    meta: {
      scorer: meta.scorer, version: meta.version, tiers: t,
      evidence_floor: num('evidence_floor', 0.5),
      spread_floor: num('spread_floor', 0.5),
      disqualify_floor: num('disqualify_floor', 0.7),
      disqualified_cap: num('disqualified_cap', 15),
    },
    dims, disq,
  };
}

export const scorerName = (card) => `${card.meta.scorer}-v${card.meta.version}`;

// ── Nous + Jev ───────────────────────────────────────────────────────────────────────────────────
async function nous(method, path, body) {
  const r = await fetch(NOUS_API_URL + path, {
    method,
    headers: { 'X-API-Key': NOUS_API_KEY, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) {
    const e = new Error(`${method} ${path} → ${r.status} ${j.error || ''}${j.hint ? ` (${j.hint})` : ''}`);
    e.status = r.status; e.body = j;
    throw e;
  }
  return j;
}

async function jev(state, questions) {
  const r = await fetch(JEV_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${OPENROUTER_API_KEY}`, 'Content-Type': 'application/json', 'X-Title': 'opennous:nous-score' },
    body: JSON.stringify({ model: JEV_MODEL, state: state.slice(0, STATE_LIMIT), questions }),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || j.error) {
    const code = j.error?.code ?? r.status;
    const e = new Error(`Jev ${code}: ${j.error?.message || JSON.stringify(j).slice(0, 200)}`);
    // Out of credits or a bad key fails every account the same way: stop the run, say it once.
    e.fatal = code === 401 || code === 402 || code === 403;
    throw e;
  }
  return j;
}

// The account as Jev's state: facts about the account only. Never the workspace's own notes, which
// /v2/context also returns, or Jev would be judging our ICP document instead of the account.
function stateOf(ctx) {
  const keep = (arr, n) => (Array.isArray(arr) ? arr.slice(0, n) : arr);
  return JSON.stringify({
    entity: ctx.entity,
    facts_about_account: keep(ctx.claims, 80),
    durable_facts: keep(ctx.facts, 40),
    stakeholders: keep(ctx.stakeholders, 15),
    recent_timeline: keep(ctx.timeline, 25),
  });
}

export function questionsFor(card) {
  const q = {};
  for (const d of card.dims) {
    q[d.key] = { type: 'score', instructions: d.instructions, criteria: d.rungs };
    // A separate yes/no for "can this record answer it at all", so no evidence is UNKNOWN, never low.
    q[`ev_${d.key}`] = {
      type: 'noul',
      instructions: `Is there evidence in this record to judge "${d.key}"? ${d.instructions.split('\n')[0]}`,
      criteria: { true: d.evidence, false: 'the record says nothing usable about this' },
    };
  }
  for (const x of card.disq) q[`dq_${x.key}`] = { type: 'noul', instructions: `Disqualifier: ${x.key}`, criteria: { true: x.yes, false: x.no } };
  return q;
}

// Turn Jev's answers into a score. Exported so it can be tested without a network.
//
// - Jev's `score` on a ladder is the probability-WEIGHTED mean rung, not its pick, so it is used as
//   points directly: an unsure answer pulls toward the middle on its own.
// - A layer the record can't answer (evidence < evidence_floor) is unknown and left out.
// - Unknown is not low, and not high either: the score moves from 50 toward the raw score only as far
//   as the evidence covers the card. A strong fit read alone cannot reach Tier 1.
// - A disqualifier at or above disqualify_floor caps the score.
export function combine(card, answers) {
  const { evidence_floor, spread_floor, disqualify_floor, disqualified_cap, tiers: t } = card.meta;
  let points = 0, knownWeight = 0;
  const layers = [], unknown = [], review = [];
  for (const d of card.dims) {
    const ans = answers[d.key];
    if (!ans || ans.type !== 'score') throw new Error(`Jev returned no answer for ${d.key}`);
    const top = d.rungs.length - 1;
    const ev = answers[`ev_${d.key}`]?.noul ?? 0;
    const best = Object.entries(ans.probabilities || {}).sort((x, y) => y[1] - x[1])[0] ?? [String(Math.round(ans.score)), null];
    const known = ev >= evidence_floor;
    if (known) {
      points += d.weight * (ans.score / top);
      knownWeight += d.weight;
      if (best[1] != null && best[1] < spread_floor) review.push(d.key);
    } else unknown.push(d.key);
    layers.push({
      key: d.key, weight: d.weight, expected: +Number(ans.score).toFixed(2), of: top, evidence: +ev.toFixed(2),
      likeliest: { rung: +best[0], p: best[1], answer: d.rungs[+best[0]] }, counted: known,
    });
  }
  const fired = card.disq.filter(x => (answers[`dq_${x.key}`]?.noul ?? 0) >= disqualify_floor).map(x => x.key);
  const coverage = knownWeight / 100;
  const raw = knownWeight ? (points / knownWeight) * 100 : null;
  let score = raw == null ? null : Math.round(50 + (raw - 50) * coverage);
  if (score != null && fired.length) score = Math.min(score, disqualified_cap);
  const tier = score == null ? null
    : score >= t.tier_1 ? 'tier_1' : score >= t.tier_2 ? 'tier_2' : score >= t.tier_3 ? 'tier_3' : 'not_icp';
  const reason = (fired.length ? `Disqualified: ${fired.join(', ')}. ` : '') +
    layers.filter(l => l.counted).map(l => `${l.key}: ${l.likeliest.answer} (${Math.round((l.likeliest.p ?? 0) * 100)}%)`).join(' · ') +
    ` · evidence covers ${Math.round(coverage * 100)}%` +
    (unknown.length ? ` · unknown: ${unknown.join(', ')}` : '') +
    (review.length ? ` · review: ${review.join(', ')}` : '');
  return { score, tier, reason: reason.replace(/^ · /, ''), coverage: knownWeight, raw: raw == null ? null : Math.round(raw), layers, disqualified: fired };
}

async function scoreOne(card, questions, focus) {
  const ctx = await nous('POST', '/v2/context', { focus, intent: 'account_review' });
  const res = await jev(stateOf(ctx), questions);
  return { focus, entity_id: ctx.entity?.id ?? null, ...combine(card, res.answers), cost: res.usage?.cost ?? 0 };
}

async function allPeople() {
  const out = [];
  for (let offset = 0; ; ) {
    const page = await nous('GET', `/v2/people?limit=200&offset=${offset}`);
    const ps = page.people || [];
    for (const p of ps) {
      out.push({
        focus: p.email || p.linkedin_url || p.id,
        name: [p.first_name, p.last_name].filter(Boolean).join(' ') || p.email || p.id,
      });
    }
    if (!page.has_more || !ps.length) break;
    offset += ps.length;
  }
  return out;
}

async function pool(items, n, fn) {
  const out = new Array(items.length);
  let i = 0;
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, async () => {
    while (i < items.length) { const k = i++; out[k] = await fn(items[k], k); }
  }));
  return out;
}

function printTable(rows) {
  const sorted = [...rows].sort((a, b) => (b.score ?? -1) - (a.score ?? -1));
  for (const r of sorted) {
    if (r.error) { console.log(`  —   ${r.name || r.focus}: ${r.error}`); continue; }
    const tier = (r.tier || 'unscored').replace('_', ' ');
    console.log(`  ${String(r.score ?? '—').padStart(3)}  ${tier.padEnd(8)}  ${(r.name || r.focus).slice(0, 32).padEnd(32)}  ${r.reason}`);
  }
}

// ── commands ─────────────────────────────────────────────────────────────────────────────────────
async function main() {
  if (!['check', 'test', 'run'].includes(cmd)) {
    console.log('usage: nous-score.mjs check | test <account…> | run --all | run <account…>   [--card path] [--dry-run] [--json]');
    process.exit(cmd ? 1 : 0);
  }
  const cardPath = opt('card', 'icp/scorecard.md');
  if (!existsSync(cardPath)) die(`no scorecard at ${cardPath} (run /opennous:build-scorecard, or pass --card)`);
  let card;
  try { card = parseScorecard(readFileSync(cardPath, 'utf8')); } catch (e) { die(`${cardPath}: ${e.message}`); }

  if (cmd === 'check') {
    console.log(`ok: ${scorerName(card)} · ${card.dims.map(d => `${d.key} ${d.weight}`).join(' · ')}` +
      (card.disq.length ? ` · ${card.disq.length} disqualifier(s)` : '') +
      ` · tiers ${card.meta.tiers.tier_1}/${card.meta.tiers.tier_2}/${card.meta.tiers.tier_3}`);
    return;
  }

  if (!NOUS_API_KEY) die('NOUS_API_KEY is not set (and ~/.nous/config.json has no apiKey). Run /opennous:login.');
  if (!OPENROUTER_API_KEY) die('OPENROUTER_API_KEY is not set: Jev runs on OpenRouter (https://openrouter.ai/keys).');

  const write = cmd === 'run' && !flag('dry-run');
  if (write) {
    const s = await nous('GET', '/v2/icp/scorer');
    if (s.scorer !== 'external') {
      die('this workspace is scored by Nous\'s own model. To score it with your scorecard, switch it once:\n' +
          `  curl -X PUT ${NOUS_API_URL}/v2/icp/scorer -H "X-API-Key: $NOUS_API_KEY" -H "Content-Type: application/json" -d '{"scorer":"external"}'`);
    }
  }

  let targets;
  if (cmd === 'run' && flag('all')) targets = await allPeople();
  else targets = positional.map(f => ({ focus: f, name: f }));
  if (!targets.length) die(cmd === 'test' ? 'name at least one account to test' : 'pass --all or name the accounts to score');

  const questions = questionsFor(card);
  const conc = Math.max(1, parseInt(opt('concurrency', '6'), 10) || 6);
  let fatal = null;
  const rows = await pool(targets, conc, async (t) => {
    if (fatal) return { name: t.name, focus: t.focus, error: 'skipped' };
    try { return { name: t.name, ...(await scoreOne(card, questions, t.focus)) }; }
    catch (e) {
      if (e.fatal) fatal = e;
      return { name: t.name, focus: t.focus, error: e.message };
    }
  });
  if (fatal) die(`${fatal.message}\nNothing was written. Fix the OpenRouter key or credits (https://openrouter.ai/settings/credits) and run again.`);

  const scored = rows.filter(r => r.score != null);
  const cost = rows.reduce((s, r) => s + (r.cost || 0), 0);
  let posted = null;
  if (write && scored.length) {
    posted = { staked: 0, updated: 0, unchanged: 0, missed: [] };
    for (let i = 0; i < scored.length; i += POST_BATCH) {
      const chunk = scored.slice(i, i + POST_BATCH);
      const out = await nous('POST', '/v2/scores', {
        scorer: scorerName(card),
        scores: chunk.map(r => ({ identifier: r.focus, score: r.score, tier: r.tier, reason: r.reason.slice(0, 500) })),
      });
      for (const x of out.results || []) {
        if (x.status && posted[x.status] != null) posted[x.status]++;
        else posted.missed.push(`${x.identifier}: ${x.error || x.reason}`);
      }
    }
  }

  if (flag('json')) {
    console.log(JSON.stringify({ scorer: scorerName(card), wrote: write, posted, cost_usd: +cost.toFixed(5), results: rows }, null, 2));
    return;
  }
  printTable(rows);
  const tiers = scored.reduce((m, r) => ((m[r.tier] = (m[r.tier] || 0) + 1), m), {});
  console.log(`\n${scorerName(card)}: scored ${scored.length}/${rows.length}` +
    ` · ${Object.entries(tiers).map(([k, v]) => `${k.replace('_', ' ')} ${v}`).join(' · ')}` +
    ` · Jev cost $${cost.toFixed(4)}` +
    (rows.length - scored.length ? ` · ${rows.length - scored.length} not scored (no evidence, or an error)` : ''));
  if (posted) {
    console.log(`written to Nous: ${posted.staked} new · ${posted.updated} updated · ${posted.unchanged} unchanged` +
      (posted.missed.length ? ` · ${posted.missed.length} not written:\n  ${posted.missed.slice(0, 20).join('\n  ')}` : ''));
  } else if (cmd === 'run') console.log('dry run: nothing written.');
  else console.log('test: nothing written.');
}

// Run as a CLI; stay importable for tests.
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('nous-score.mjs')) {
  main().catch((e) => die(e.message));
}
