---
description: Sign in to OpenNous in your browser, then start onboarding automatically
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

3. **Then ACT immediately — this is the point of the flow. Do NOT print a "next steps" list or ask
   permission.** Your very next action is a skill, not a suggestion:
   - **Graph is EMPTY (fresh workspace):** say ONE line — *"You're connected as <name> · <workspace>
     · <role>. Your graph is empty — building it from your history now."* — then **immediately invoke
     the `onboard` skill.** Do not stop, do not offer options, do not wait for a "yes". Onboarding is
     the whole reason they connected; just start it.
   - **Graph already has accounts (returning user):** say *"You're connected — here's what needs you
     today,"* then **immediately invoke the `focus` skill.**

   Presenting a menu ("Natural next steps: /opennous:onboard …") instead of running the skill is a
   failure of this command. Run it.

## Fallbacks
- If the tools still return 401 after signing in, have the user fully quit and reopen Claude Code,
  then run `/mcp` → **opennous** → **Authenticate** again.
- The key is **workspace-scoped** — it acts as one workspace + identity, which `whoami` reports.
