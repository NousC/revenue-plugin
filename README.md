# Nous — the revenue plugin for revenue leaders inside coding agents

Nous unifies your team's conversations, meetings, and signals into one **revenue layer your agent
reads from** — a live, identity-resolved, ICP-scored account graph, extracted on your *own* agent's
tokens and filed to Nous. Your CRM lives where you already work: Claude Code, Codex, or any
MCP-capable agent.

- **You extract, we resolve.** Your agent reads a transcript, extracts the facts, signals, Intel,
  and insights, and files them through two write doors. Nous does the identity resolution, ICP
  scoring, and memory — the part that compounds.
- **Raw stays yours.** Full transcripts and briefs live in your git repo; Nous holds only the
  structured graph plus a pointer back to the raw.

## Install (Claude Code)

```bash
/plugin marketplace add NousC/nous-plugin
/plugin install opennous@opennous
```

Then sign in (browser, no copy-paste), and reload:

```bash
/opennous:login
/reload-plugins
```

`/opennous:login` mints a workspace-scoped key and helps you set it in the plugin config (stored
encrypted). Manual alternative: paste a key from app.opennous.cloud/connect/api-keys into
`/plugin` → opennous → configure. Full steps in [INSTALL.md](./INSTALL.md).

Confirm it works: ask the agent *"who am I on Nous?"* (it calls the `whoami` tool) → *"You are acting as … Role(s): …"*.

## What's inside

| Piece | What |
|---|---|
| `plugins/opennous/.claude-plugin/plugin.json` | runs the Nous MCP server (`npx @opennous/mcp`, `NOUS_SURFACE=plugin` → the 9 primitives only) and declares the `api_key` config |
| `plugins/opennous/commands/login.md` | `/opennous:login` — browser sign-in + key setup |
| `plugins/opennous/CLAUDE.md` | the router + house rules ("reach for Nous first"; raw → git; you observe, Nous derives) |
| `plugins/opennous/skills/` | the 20 skills — setup, daily (`focus`), accounts/deals, pipeline, and reporting |

### The 10 primitives

**Identity:** `whoami` (workspace · scope admin/member · GTM role[s] · setup state)
**Read:** `get_context` · `get_account` · `query` · `score` · `deals` (deal health + how likely each deal is to close, and why)
**Write:** `record` (contact facts, interactions, signals, Intel) · `record_insight` (learnings about your own product/positioning/market/buyer)
**Setup:** `set_icp` (establish the ICP scoring model — done in onboarding) · `record_closed_deals` (train that ICP on real won/lost outcomes — contrastive lift)

## Repo layout

```
.claude-plugin/marketplace.json     # this repo is a plugin marketplace
plugins/opennous/
  .claude-plugin/plugin.json        # the plugin manifest
  .mcp.json                         # MCP server (hosted Nous)
  CLAUDE.md                         # router / house rules
  skills/<name>/SKILL.md            # one folder per skill
```

## Status

Live. The MCP surface is exactly **10 primitives** (the seven data tools + `whoami` + `set_icp` + `record_closed_deals`), and all
**17 skills are shipped**: setup & ingestion (`onboard`, `status`, `sync`, `backfill`), daily
(`focus`), accounts & deals (`build-record`, `plan-account`, `brief`, `reach-out`, `map-committee`,
`objection-prep`), pipeline (`review-pipeline`, `forecast`, `whats-changed`, `triage-leads`), and
ask & reporting (`ask-nous`, `revenue-report` — the one report: what happened, what the CRM
missed, why deals are lost, the customer book, what the market says — and `role-report` per seat).

There is one MCP server and only one. Full plan, tool signatures, and the locked skill catalog:
[revenue-plugin overview](https://github.com/NousC/opennous/blob/main/docs/revenue-plugin/README.md).

---

## License

MIT — the skills, prompts, and config here are transparent and forkable. The Nous **engine**
(identity resolution, ICP scoring, memory) is the hosted, proprietary service they call.
