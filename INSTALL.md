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

## 3. Set up your workspace in the app

If your workspace is new, open **Get started** at
[app.opennous.cloud](https://app.opennous.cloud/?getstarted=1). Connect your CRM, your email and
meeting notes, and start the backfill. From then on, start each day with *"what should I focus on
today?"*

## Check that it works

Ask *"who am I on Nous?"*. The agent calls `whoami` and answers with your name, your workspace and
your role.

## Troubleshooting

**The tools return 401 right after you signed in.** Fully quit Claude Code, open it again, and run
`/mcp` → **opennous** → **Authenticate**.

**The agent answers account questions from general knowledge.** Run `/reload-plugins`, then start a
new session. The session-start hook is what tells the agent to use Nous first.

## Need help?

Docs are at [docs.opennous.cloud](https://docs.opennous.cloud/mcp/introduction). For anything else,
open an issue on this repo.
