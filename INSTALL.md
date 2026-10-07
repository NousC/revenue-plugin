# Install Nous

This guide covers Claude Code. In Claude (claude.ai and the desktop app), install **OpenNous** from
**Customize → Plugins** and sign in. For Codex, Cursor, Claude Desktop or any other MCP client, follow
[Use it with any agent](./README.md#use-it-with-any-agent) in the README.

In Claude Code this takes about two minutes. You install the plugin, sign in with your browser, and the agent
sets up your workspace from there.

## 1. Install the plugin

```bash
/plugin marketplace add NousC/revenue-plugin
/plugin install opennous@opennous
```

## 2. Sign in

```bash
/opennous:login
```

The plugin connects to the hosted OpenNous server, which signs in with your browser. If Claude Code
asks, run `/mcp`, pick **opennous** and choose **Authenticate**. Sign in, or sign up if you are new.
There is nothing to paste.

## 3. Let onboarding run

Signing in is your last manual step. The agent checks who you are and what is in your workspace, and
if the workspace is empty it starts onboarding on its own. It will:

1. Find the revenue tools you already have connected in Claude Code, such as Fireflies, Gmail,
   Google Calendar, HubSpot or Attio, and LinkedIn, and tell you if an important one is missing.
2. Import the last 6 months of history, in order, on your own tokens. You can stop it and run it
   again without creating duplicates.
3. Build your ICP from the deals you have already won and lost. If nothing has closed yet, it writes
   a starting ICP and labels it as a hypothesis.
4. Finish with a revenue report on how your pipeline moved and where it leaks.

If you skipped it, run `/opennous:onboard` or say *"onboard my workspace"*. From then on, start each
day with *"what should I focus on today?"*

## Check that it works

Ask *"who am I on Nous?"*. The agent calls `whoami` and answers with your name, your workspace and
your role. You can also run `/opennous:status` for a fuller check.

## Troubleshooting

**The tools return 401 right after you signed in.** Fully quit Claude Code, open it again, and run
`/mcp` → **opennous** → **Authenticate**.

**The agent answers account questions from general knowledge.** Run `/reload-plugins`, then start a
new session. The session-start hook is what tells the agent to use Nous first.

## Turn on automations (optional)

Run `/opennous:automate` to have the plugin work your calls without you. After every recorded call
it drafts the follow-up and writes a coaching review, and every Sunday it writes a coaching report.
It installs GitHub Actions in your repo, which need `NOUS_API_KEY` plus either a
`CLAUDE_CODE_OAUTH_TOKEN` (from `claude setup-token`, billed to your Claude subscription) or an
`ANTHROPIC_API_KEY` as repo secrets.

## Need help?

Docs are at [docs.opennous.cloud](https://docs.opennous.cloud/mcp/introduction). For anything else,
open an issue on this repo.
