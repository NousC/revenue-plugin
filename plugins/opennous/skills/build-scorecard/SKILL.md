---
name: build-scorecard
description: Builds the user's own ICP scorecard (icp/scorecard.md) with them in a short conversation, then test-scores three of their real accounts so they can see it work before anything is written. The scorecard is what their own scorer (Jev, via /opennous:score-accounts) judges every account against. Use when the user says "build my scorecard", "set up my own ICP scoring", "score with my own model", "bring my own scorer", "make an ICP scoring model", or asks how to score accounts with their own criteria instead of Nous's.
---

# Build the scorecard

The user ends up with `icp/scorecard.md` in **their own repo**: four weighted layers (fit, pain, intent, ability),
a few disqualifiers, and plain-language answers Jev picks between. They never write the format by hand; you
draft, they react.

The format and every rule it follows are in `${CLAUDE_PLUGIN_ROOT}/scorer/scorecard.example.md`. Read it first.

## Phase 0 · Orient
1. `whoami`: signed in, which workspace.
2. Read what Nous already knows, so you draft instead of interrogate:
   - their written ICP: `query { scope: { foundation: 'icp' } }`
   - who closed, if anyone: `query { scope: { kind: 'state', property: 'stage' }, return: 'entities' }` and look
     at `closed_won` / `closed_lost`
3. If `icp/scorecard.md` already exists, this is an edit: read it, say what it holds, ask what to change, and
   bump `version` when you save.

## Phase 1 · Four questions, one at a time
Ask only what the ICP and deals didn't already answer. Offer your draft answer and let them correct it.
1. **Fit:** who exactly do you sell to? Role, company type, size, region.
2. **Pain:** what problem do they have when they buy? In their words, not yours.
3. **Intent:** what happens at a company right before they buy? (hiring, funding, a new tool, a launch)
4. **Ability:** who signs?
Then: **who is never a fit?** Each answer becomes a `## disqualify · …` section.

Default weights: fit 30 · pain 35 · intent 20 · ability 15. Stated pain is the strongest buying signal most
teams have. Change them only if the user has a reason.

## Phase 2 · Write it
Write `icp/scorecard.md` from the example's structure:
- `scorer:` a short name for their model (e.g. their company slug + `-icp`), `version: 1`.
- Each layer: one or two lines of what it means for THEM, an `evidence:` line, and five answers worst first,
  written so a stranger reading only the account record could pick one.
- Keep the example's floors (`evidence_floor`, `spread_floor`, `disqualify_floor`) unless asked.
- Never put engagement with them (replies, meetings) into a layer. The example says why.

Validate: `node ${CLAUDE_PLUGIN_ROOT}/scorer/nous-score.mjs check`. Fix what it names.

## Phase 3 · Test on three real accounts
Needs `OPENROUTER_API_KEY` (Jev runs on OpenRouter). If it isn't set, ask the user to create one at
https://openrouter.ai/keys and set it in their shell; never paste a key into the chat or a file.

Pick three accounts the user knows well: one they'd call a great fit, one a clear no, one in between. Run:
`node ${CLAUDE_PLUGIN_ROOT}/scorer/nous-score.mjs test <a> <b> <c>`

Show the three scores and reasons. Ask: does the ranking match your gut? Where it doesn't, find which layer's
wording misled Jev and rewrite that answer. Re-test. Nothing is written to Nous in this phase.

## Phase 4 · Hand off
Tell them, briefly:
- the file is theirs: edit it any time, bump `version`, and the next run scores with the new version (every
  score's trail shows which version made it);
- `/opennous:score-accounts` scores everyone and writes it to Nous;
- `/opennous:automate` keeps it current: re-scores after calls and every night.

Commit `icp/scorecard.md` to their repo.

## Rules
- Draft, don't interrogate. Every question comes with your proposed answer.
- Their words. Pain and fit are written the way their buyers talk.
- Unknown is not low. If the record can't answer a layer, Jev says so and the layer is left out.
- Nothing is written to Nous until `/opennous:score-accounts`.
