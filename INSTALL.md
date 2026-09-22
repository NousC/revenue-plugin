# Install Nous

Nous is the revenue layer for your coding agent — an identity-resolved, ICP-scored account graph
you build and query from Claude Code. Install the plugin, sign in, then (optionally) onboard your
workspace.

## 1 — Install the plugin

```bash
/plugin marketplace add NousC/nous-plugin
/plugin install opennous@opennous
```

## 2 — Authenticate

The easiest way — browser sign-in, no hunting for a key:

```bash
/opennous:login
```

It signs you in and mints a workspace-scoped key saved to `~/.nous/config.json`; the plugin's MCP
server (`@opennous/mcp`, trimmed to the 9 primitives via `NOUS_SURFACE=plugin`) reads it live — no
paste, no restart.

**Manual alternative:** copy a key from **https://app.opennous.cloud/connect/api-keys**, run
`/plugin` → **opennous → configure**, and paste it into **"Nous API key"** (stored encrypted).

Then apply it:

```bash
/reload-plugins
```

If the tools still return `401 invalid_api_key` right after setting the key, fully quit and relaunch
Claude Code — a live MCP connection can cache the old header.

## 3 — The agent takes it from here (onboarding starts automatically)

That's your last manual step. The moment you're signed in, the agent **orients** (`whoami` + a
quick look at your graph) and, if your workspace is empty, **starts onboarding on its own** — it
detects the revenue tools you already have connected (Fireflies, Gmail, Calendar, HubSpot/Attio,
LinkedIn), backfills recent history onto the graph **on your own tokens**, and builds your pipeline
report. Extraction runs here in your agent — nothing is connected in our UI.

You don't have to type anything: `/opennous:login` hands straight to onboarding. (You *can* run
**`/opennous:onboard`** by hand, or say *"onboard my workspace,"* if you skipped it.) Once your
history is in, the day-to-day is **`/opennous:focus`**.

## What you get

**10 primitives:** `whoami` · `get_context` · `get_account` · `query` · `score` · `deals` · `record` ·
`record_insight` · `set_icp` · `record_closed_deals`

**Skills (20):**
- Setup — `onboard` · `status` · `sync` · `backfill`
- Daily — `focus` (your morning worklist) · `whats-changed` · `ask-nous`
- Accounts & deals — `build-record` · `plan-account` · `brief` · `reach-out` · `map-committee` ·
  `objection-prep`
- Pipeline & reporting — `review-pipeline` · `triage-leads` · `forecast` · `revenue-report` (the
  one report: it absorbed win-loss, market-read and team-report) · `role-report` (per seat)

**How it works:** you (this agent) extract facts and insights from calls/emails on your own tokens;
Nous does the identity resolution, ICP scoring, and memory — the part that compounds. Raw data stays
in your git; only the structured graph enters Nous.

Need help? → https://docs.opennous.cloud/mcp/introduction
