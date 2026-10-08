---
description: Sign in to OpenNous, check who you are and what is set up, then show what needs you today
---

Sign the user in, then **immediately orient and act** — don't stop at "you're signed in."
The plugin connects to the hosted OpenNous server (`https://mcp.opennous.cloud/mcp`), which signs
in with OAuth in the browser. No key to paste.

## Steps

1. **Browser sign-in.** First call `whoami`. If it returns, the user is already signed in — skip to
   step 2. If the OpenNous tools are missing or return 401, tell the user, in one line, how to
   connect where they are:
   - **Claude.ai or the desktop app:** *"Click **Connect** on OpenNous (or go to Customize →
     Connectors → OpenNous → Connect), sign in or sign up, click **Allow**, then come back."*
   - **Claude Code:** *"Run `/mcp`, pick **opennous** and choose **Authenticate**. Sign in (or sign
     up) in the browser, then come back."*

   Wait for them, then call `whoami` again.

2. **Orient — one call.** Call `whoami`. It returns identity/scope/role AND `setup` —
   `setup.accounts` (how many accounts exist), `setup.onboarded`, and `setup.has_icp`. That account
   count is how you know whether the graph is empty; no extra query is needed (and don't put
   `return`/`limit` inside `scope` — `scope` is strict and will reject them).

3. **Then act — no "next steps" menu.**
   - **Workspace is empty (no accounts yet):** say, in one line, *"You're connected as <name> ·
     <workspace>. Setup happens in the OpenNous app: open Get started at
     https://app.opennous.cloud/?getstarted=1 to connect your CRM, email and meeting notes."*
     Then stop and wait.
   - **Workspace has accounts:** say *"You're connected as <name> · <workspace> — here's what
     needs you today,"* then **immediately invoke the `focus` skill.**

## Fallbacks
- If the tools still return 401 after signing in, have the user fully quit and reopen Claude Code,
  then run `/mcp` → **opennous** → **Authenticate** again.
- The key is **workspace-scoped** — it acts as one workspace + identity, which `whoami` reports.
