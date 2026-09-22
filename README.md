# OpenNous - Win more deals inside your terminal

**Give Claude, Codex, and any agent one source of truth about your deals, accounts, and activities.**

OpenNous unifies your team's conversations, meetings, and signals into one source of truth your
agents read and act from. Connect Claude, Codex, and any agent so they know every account you sell
to and can do the work around it, from the brief before a call to the follow-up after it.

In Claude Code, this repo installs as a plugin with 23 skills on top, so your agent also tells you
which deals need you today, forecasts what will close, and learns from what you actually send. In Codex, Cursor or any other MCP client, you connect the same tools directly.

**Claude Code**

```bash
/plugin marketplace add NousC/revenue-plugin
/plugin install opennous@opennous
/opennous:login
```

**Codex, Cursor and other agents:** see [Use it with any agent](#use-it-with-any-agent).

## What you can ask

Once you are signed in, you talk to Claude Code the way you would talk to a sharp sales ops person.
You never have to name a skill, because the plugin routes the request to the right one.

- *"What should I focus on today?"* gives you a ranked worklist of meetings, follow-ups and accounts
  that went quiet.
- *"Brief me before my call with Acme."* gives you the stage, who is involved, the open objections
  and what moves the deal.
- *"Draft the follow-up to that call."* writes it in your own voice, grounded in what the buyer said.
- *"Which deals are most likely to close this month?"* gives you the odds and the health of each
  deal, with the reasons.
- *"Why are we losing deals?"* reads what customers actually said across calls and email and splits
  the losses into the ones you control and the ones you don't.
- *"Score this list of 200 leads."* sorts them into tiers against your live ICP.

## Get started in Claude Code

**1. Install the plugin.**

```bash
/plugin marketplace add NousC/revenue-plugin
/plugin install opennous@opennous
```

**2. Sign in** with your browser. If you are new, this creates your workspace.

```bash
/opennous:login
/reload-plugins
```

**3. Let the agent take it from there.** On a new workspace, onboarding starts on its own. The agent
finds the revenue tools you already have connected in Claude Code (Fireflies, Gmail, Google
Calendar, HubSpot or Attio, LinkedIn), imports the last 6 months of history, builds your ICP from
the deals you have already won and lost, and finishes with a revenue report on where your pipeline
leaks. After that, your daily starting point is *"what should I focus on today?"*

To check it worked, ask *"who am I on Nous?"*. Step-by-step help and troubleshooting are in
[INSTALL.md](./INSTALL.md).

## Use it with any agent

Codex, Cursor, Claude Desktop and any other MCP client connect to the same tools and read the
same accounts as Claude Code. First sign in once from your terminal, which creates your workspace if
you are new and saves your key to `~/.nous/config.json`:

```bash
npx -y @opennous/cli login
```

Then add the Nous MCP server to your agent. It reads your key from that file, so there is nothing to
paste into the config.

**Codex** (`~/.codex/config.toml`)

```toml
[mcp_servers.opennous]
command = "npx"
args = ["-y", "@opennous/mcp"]
env = { NOUS_SURFACE = "plugin" }
```

**Cursor** (`.cursor/mcp.json`), **Claude Desktop** and other clients that use the `mcpServers` JSON
shape

```json
{
  "mcpServers": {
    "opennous": {
      "command": "npx",
      "args": ["-y", "@opennous/mcp"],
      "env": { "NOUS_SURFACE": "plugin" }
    }
  }
}
```

**Clients that connect over HTTP** can use the hosted server at `https://mcp.opennous.cloud/mcp`
with the header `Authorization: Bearer <your Nous API key>`. You can create a key at
[app.opennous.cloud/connect/api-keys](https://app.opennous.cloud/connect/api-keys).

Running `npx -y @opennous/cli init` in a project does the sign-in and writes a `.mcp.json` there for
you. The skills and hooks below are built for Claude Code. They are plain markdown, so in any other
agent you can open a skill in `plugins/opennous/skills/` and give it to your agent as instructions.

## Skills

The Claude Code plugin ships 23 skills, grouped by the job you are doing. Each one runs when you
describe the job, and you can also call it directly as `/opennous:<skill>`.

**Your day**

| Skill | What it does |
|---|---|
| `focus` | Your worklist for today: upcoming meetings, accounts to work, who to follow up with, open action items. |
| `whats-changed` | What moved since a given date: new meetings and replies, fresh buying signals, stage changes, accounts that went quiet. |
| `ask-nous` | Answers any plain question about your accounts, like "who mentioned budget this week". |

**Working an account**

| Skill | What it does |
|---|---|
| `brief` | A brief on one account shaped by your role. An SDR, an AE, CS and a founder each get a different read. |
| `meeting-prep` | The prep for one meeting: why it exists, everyone on the invite, what changed since the last call, the risks and the outcome to push for. |
| `plan-account` | A full strategic plan for one account: the committee, objections, competitors, ICP fit and next moves. |
| `reach-out` | A first touch or follow-up in your voice, built on a real hook from the record. It drafts, and you send. |
| `sales-page` | A personalized sales page for one lead, in your company's brand, built from what they told you. |
| `build-record` | Researches a person or company that is new to you and files them as a scored account. |

**Working a deal**

| Skill | What it does |
|---|---|
| `map-committee` | Who is on the deal, where each person stands, and which roles are missing. |
| `objection-prep` | The objections you will hear on this deal, hardest first, each with a counter from your own positioning. |
| `forecast` | How likely each deal is to close and how healthy it is, with the reasons. |
| `after-call` | Right after a call, drafts the follow-up in the channel the conversation lives in and reviews how the call went. |

**The whole pipeline**

| Skill | What it does |
|---|---|
| `review-pipeline` | A briefing on the full portfolio: stage spread, deal health, what is slipping and what to re-engage. |
| `triage-leads` | Scores a list of leads against your ICP in one batch and sorts them into priority tiers. |
| `revenue-report` | How revenue actually moved over a window, where deals die, and what to change, from your own data. |
| `win-loss` | Why you win and why you lose, read from what buyers said, cut by segment, competitor and stage. |

**Reporting for your seat and your team**

| Skill | What it does |
|---|---|
| `role-report` | The insights that matter to your role, like deal blockers for an AE or churn signals for CS. |
| `team-report` | For founders and admins, one pipeline across every rep with coverage and ownership per person. |
| `market-read` | What buyers are telling the whole company, grouped into product, positioning, market and buyer signals. |

**Setup and keeping it current**

| Skill | What it does |
|---|---|
| `onboard` | First-time setup, end to end. It runs automatically after you sign in to a new workspace. |
| `backfill` | Imports months of history in bulk. You can stop it and run it again safely. |
| `sync` | Files one call transcript or email you just finished. |
| `automate` | Turns on the automations: after every call a drafted follow-up and a coaching review, and every Sunday a coaching report. |
| `status` | Checks that you are connected and shows what is in your workspace. |

## Where your data lives

We designed the plugin so the raw material stays with you.

- **Transcripts and emails stay in your git repo.** The agent reads them on your machine and sends
  Nous only the structured facts it pulled out, each with a pointer back to the file it came from.
- **Extraction runs on your agent.** Reading a call and pulling out what matters happens in Claude
  Code on your own tokens, with the model you already use.
- **Nous does the part that compounds.** It matches people across tools, keeps each account's record
  current, scores accounts against your ICP, and learns from which recommendations worked.
- **Finished work is saved to your workspace's Pages.** Briefs, plans and reports your agent writes
  land where your team and every other agent can read them.

## What runs on your machine

The Claude Code plugin installs three things, and none of them edits your files.

- **The Nous MCP server** (`npx @opennous/mcp`), which gives the agent its OpenNous tools.
- **A session-start hook** that tells the agent to use Nous for revenue work and appends what your
  workspace has learned about which recommendations get accepted. If the API is slow or unreachable,
  it gives up after 4 seconds and prints nothing.
- **A send-confirmation hook** that fires after the agent uses a Gmail, LinkedIn, Unipile, Instantly,
  HeyReach or Smartlead tool. It reports the recipient and a hash of the message so Nous can tell
  whether you sent the draft as written or edited it. It never sends the message body, and it can
  never block or fail a send.

The automations from `/opennous:automate` are optional. They install GitHub Actions in your own
repo that run Claude Code headlessly on your own Claude credentials.

## Repo layout

```
.claude-plugin/marketplace.json      # makes this repo a plugin marketplace
plugins/opennous/
  .claude-plugin/plugin.json         # the plugin manifest and MCP server config
  CLAUDE.md                          # house rules the agent follows
  commands/login.md                  # /opennous:login
  hooks/                             # session-start routing and send confirmation
  references/                        # shared guidance the skills read
  skills/<name>/SKILL.md             # one folder per skill
```

## Help

Docs are at [docs.opennous.cloud](https://docs.opennous.cloud/mcp/introduction), and the product is
at [opennous.cloud](https://opennous.cloud). If something breaks, open an issue on this repo.

## License

The skills, prompts, hooks and config in this repo are MIT licensed, so you can read, change and
fork them. They call the hosted Nous service, which is proprietary and needs an account.
