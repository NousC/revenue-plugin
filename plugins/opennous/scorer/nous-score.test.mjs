// node --test plugins/opennous/scorer/  (no network, no keys)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseScorecard, combine, questionsFor, scorerName } from './nous-score.mjs';

const EXAMPLE = readFileSync(new URL('./scorecard.example.md', import.meta.url), 'utf8');

// Shapes copied from real Jev answers (Rev-Box, 2026-10-03): `score` is the probability-weighted mean
// rung, `probabilities` keyed by rung index.
const ladder = (score, probabilities) => ({ type: 'score', score, probabilities, confidence: 0.3 });
const yes = (p) => ({ type: 'noul', noul: p });

test('the shipped example scorecard parses', () => {
  const card = parseScorecard(EXAMPLE);
  assert.equal(scorerName(card), 'my-icp-v1');
  assert.equal(card.dims.reduce((s, d) => s + d.weight, 0), 100);
  assert.deepEqual(card.dims.map(d => d.key), ['fit', 'pain', 'intent', 'ability']);
  assert.ok(card.disq.length >= 1);
  for (const d of card.dims) assert.equal(d.rungs.length, 5);
});

test('every layer asks a ladder AND an evidence yes/no; disqualifiers ask yes/no', () => {
  const card = parseScorecard(EXAMPLE);
  const q = questionsFor(card);
  assert.equal(q.fit.type, 'score');
  assert.equal(q.fit.criteria.length, 5);
  assert.equal(q.ev_fit.type, 'noul');
  assert.equal(q[`dq_${card.disq[0].key}`].type, 'noul');
});

test('a scorecard that does not sum to 100, or misses evidence, is refused with the reason', () => {
  assert.throws(() => parseScorecard(EXAMPLE.replace('## fit · 30', '## fit · 31')), /sum to 101/);
  assert.throws(() => parseScorecard(EXAMPLE.replace(/^evidence: .*$/m, '')), /evidence/);
  assert.throws(() => parseScorecard(EXAMPLE.replace(/^scorer: .*$/m, '')), /scorer/);
});

test('expected rung is the points; no evidence is unknown; thin coverage stays near 50', () => {
  const card = parseScorecard(EXAMPLE);
  const answers = {
    fit: ladder(3.2, { 0: 0, 1: 0.15, 2: 0.09, 3: 0.15, 4: 0.61 }), ev_fit: yes(0.92),
    pain: ladder(0.8, { 0: 0.57, 1: 0.23, 2: 0.04, 3: 0.13, 4: 0.03 }), ev_pain: yes(0.2),
    intent: ladder(1.6, { 0: 0.23, 1: 0.15, 2: 0.35, 3: 0.24, 4: 0.03 }), ev_intent: yes(0.62),
    ability: ladder(3.5, { 3: 0.2, 4: 0.8 }), ev_ability: yes(0.3),
  };
  for (const d of card.disq) answers[`dq_${d.key}`] = yes(0.05);
  const r = combine(card, answers);
  // fit 30 + intent 20 known: raw = (30*0.8 + 20*0.4) / 50 = 64, pulled toward 50 by 50% coverage → 57
  assert.equal(r.coverage, 50);
  assert.equal(r.raw, 64);
  assert.equal(r.score, 57);
  assert.equal(r.tier, 'tier_3');
  assert.match(r.reason, /unknown: pain, ability/);
  assert.match(r.reason, /review: intent/);          // its top answer is only 35%
  assert.deepEqual(r.disqualified, []);
});

test('full evidence and strong answers reach Tier 1', () => {
  const card = parseScorecard(EXAMPLE);
  const answers = {};
  for (const d of card.dims) { answers[d.key] = ladder(3.8, { 4: 0.85, 3: 0.15 }); answers[`ev_${d.key}`] = yes(0.95); }
  for (const d of card.disq) answers[`dq_${d.key}`] = yes(0.02);
  const r = combine(card, answers);
  assert.equal(r.coverage, 100);
  assert.equal(r.score, 95);
  assert.equal(r.tier, 'tier_1');
});

test('a disqualifier caps only when Jev is sure enough', () => {
  const card = parseScorecard(EXAMPLE);
  const base = {};
  for (const d of card.dims) { base[d.key] = ladder(3.8, { 4: 0.85 }); base[`ev_${d.key}`] = yes(0.95); }
  const key = `dq_${card.disq[0].key}`;
  for (const d of card.disq) base[`dq_${d.key}`] = yes(0.02);

  assert.equal(combine(card, { ...base, [key]: yes(0.55) }).score, 95, 'below the 0.70 floor: no cap');
  const capped = combine(card, { ...base, [key]: yes(0.78) });
  assert.equal(capped.score, 15);
  assert.equal(capped.tier, 'not_icp');
  assert.match(capped.reason, /^Disqualified: /);
});

test('nothing known means no score at all, not a low one', () => {
  const card = parseScorecard(EXAMPLE);
  const answers = {};
  for (const d of card.dims) { answers[d.key] = ladder(0.5, { 0: 0.6 }); answers[`ev_${d.key}`] = yes(0.1); }
  for (const d of card.disq) answers[`dq_${d.key}`] = yes(0.1);
  const r = combine(card, answers);
  assert.equal(r.score, null);
  assert.equal(r.tier, null);
});
