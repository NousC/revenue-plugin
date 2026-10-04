---
name: score-accounts
description: Scores every person in the workspace (or a named few) against the user's own icp/scorecard.md with Jev, and writes the scores to Nous so get_context, the accounts list, tiers and focus all read them. Shows a ranked preview first and writes only after the user confirms. Use when the user says "score my accounts", "run my scorecard", "re-score everyone", "score these leads with my model", or after editing icp/scorecard.md.
---

# Score accounts with your scorecard

Runs the user's own scorer: `icp/scorecard.md` + Jev, outside Nous, through the public API.
No scorecard yet → run `/opennous:build-scorecard` first.

## Before
1. `icp/scorecard.md` exists and passes: `node ${CLAUDE_PLUGIN_ROOT}/scorer/nous-score.mjs check`
2. `OPENROUTER_API_KEY` is set in the shell (Jev). If not, ask the user to set it; never handle the key yourself.
3. The workspace scores with its own scorer. `run` checks this and, if not, prints the one command that switches
   it. Switching is the user's decision: show them the command, explain that Nous's own model stops scoring this
   workspace, and run it only if they say so.

## Preview, then write
1. Preview without writing:
   `node ${CLAUDE_PLUGIN_ROOT}/scorer/nous-score.mjs run --all --dry-run`
   (a few accounts instead: `run <email|domain|linkedin> …`).
2. Show the top 20 and bottom 20 with their reasons, the tier counts, and the Jev cost. Call out anything that
   looks wrong to you.
3. On the user's go, write:
   `node ${CLAUDE_PLUGIN_ROOT}/scorer/nous-score.mjs run --all`
4. Report what was written (new · updated · unchanged) and anything not written.

Each run costs about $0.0001 per person in Jev credits.

## Reading results
- **unknown: pain, intent** means the record holds no evidence for those layers. That's an enrichment gap, not a
  bad account. The score stays near 50 until there's evidence.
- **review: x** means Jev's answer on x was split. Worth a human look.
- **Disqualified: x** caps the score; the reason names which disqualifier fired.
- A score that looks wrong almost always traces to one layer's answer wording. Fix it in the scorecard, bump
  `version`, re-run.

## Rules
- Preview before every write.
- Never switch the workspace's scorer without the user's explicit yes.
- Never paste keys into the chat or a file.
