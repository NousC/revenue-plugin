---
name: focus
description: The morning command surface — what needs attention today. Mirrors the Studio homepage: upcoming meetings, accounts to focus on, who to follow up on, and open action items — ranked into a short worklist you can run every morning. On a member seat that is your own book; on an admin/founder seat it is the whole workspace, attributed by owner. Use when the user asks what to focus on today, what needs their attention, who to follow up on, what's on their plate, "my day", "my morning", or their action items. For the whole portfolio use `review-pipeline`; for the raw delta use `whats-changed`.
---

# Focus

The daily driver run every morning: the same command surface as the Studio homepage, in the
agent. Upcoming meetings, the accounts that need working, who to follow up on, and open action
items — ranked by what needs doing now.

## The engine owns the "what needs you" logic — read it, don't reinvent it
The Studio worklist (which accounts are flagged, when a follow-up is due, what's cooling) is
computed server-side by the engine. Read that curated worklist through `query`; do **not**
rebuild the follow-up logic from raw activity, or the skill drifts from what the app shows.

## Two reads come back. Check which one you got BEFORE you write a word.
The worklist response carries a `scope`. It is not decoration — it decides who the list belongs to.

- **`scope: "member"`** — the caller's own book. The engine filtered to accounts they own.
  Second person is correct: these meetings are theirs, these follow-ups are owed by them.
- **`scope: "workspace"`** — the **whole workspace**, returned on an admin/founder key because
  such a key has no bound member to filter by. Every row is real and every row is *somebody's* —
  but most of them belong to other reps. Each row carries an `owner`, and an `owners` roll-up
  gives the spread.

On a workspace read, **never use second person for a row the caller does not own.** A founder
handed 50 flags and 276 commitments across four reps and told "you have 50 unanswered replies,
that's where your next hour goes" has been told something false about their own day. The list is
right; the pronoun is the bug. Attribute every line, lead with the spread, and frame the read as
*the team's book* — what needs a decision, an unblock, or a nudge from them, not what they
personally owe.

The response also carries `totals`. The sections are capped server-side, so what you were handed
is a slice. Quote `totals` for any count, and say a section is truncated when it is — never state
a total by counting the rows you can see.

## Tools
- `whoami` — FIRST. The caller's identity and `scope` (ADMIN vs member). Confirms which of the
  two reads to expect before you ask for it.
- `query` — the curated Studio worklist: `scope: { attention: "mine" }` returns the sections the
  engine already assembled (upcoming meetings, accounts-to-focus-on / flags, follow-ups + replies
  due, open action items), plus `scope`, `totals`, and — on the workspace read — `owners` and a
  per-row `owner`. If that scope isn't available yet, fall back to assembling from `query` (recent
  replies/signals, gone-quiet via `without`) and say the list isn't the full engine-curated worklist.
- `get_context` — expand the top item into the concrete next move when the user wants to act.

## Workflow
1. **Establish the seat.** `whoami` → who the caller is and whether they are a member or an admin.
2. **Pull the worklist** with `query` (`attention: "mine"`). Keep the sections intact — they're
   already curated and ranked by the engine.
3. **Read `scope` on the response** and pick the output shape below. Trust the response over
   `whoami` if they ever disagree — the response describes the data you actually hold.
4. **Present the read**, most time-sensitive first: meetings today → who to follow up on (a
   cooling reply is urgent) → accounts to focus on → open action items.
5. **Give each item its one move**, and hand off: `brief` for a meeting, `reach-out` for a
   reply/follow-up, `plan-account` for a flagged account. On a workspace read the move usually
   belongs to the owner, so name them: "Kole's to send".

## Output — member read (`scope: "member"`)
```
# Today — <Name>

**Upcoming**
- <day> <time> — <meeting> with <person>, <account> → run `brief`

**Follow up on**
- <person>, <account> — <reply to answer / follow-up due> (<when>) → run `reach-out`

**Accounts to focus on**
- <account> — <why the engine flagged it> → <the move>

**Open action items**
- <task> — <due / context>
```

## Output — workspace read (`scope: "workspace"`)
Say whose book this is in the first line, and carry the owner on every row.
```
# <Workspace> today — whole workspace
<n> meetings · <n> follow-ups · <n> flagged, across <n> owners. This is the team's book, not yours.

**Where it sits**
- <owner> — <n> meetings · <n> follow-ups · <n> flagged

**Upcoming** (showing <x> of <total>)
- <day> <time> — <meeting> with <person>, <account> — <owner> → `brief`

**Follow up on** (showing <x> of <total>)
- <person>, <account> — <what's owed> (<when>) — <owner> → <owner>'s to send

**Accounts to focus on**
- <account> — <why the engine flagged it> — <owner> → <the move, and whose>
```
Close by naming what actually needs *the caller*: the calls they're personally on, and the one or
two accounts where a founder unblocks something nobody else can. Send the roll-up itself to
`review-pipeline` or `team-report` — those are built for it; this is a worklist.

## Close the loop

Every item you surface and the user then works is a decision. The ones they skip are data too: if
they explicitly pass on something, record it as `decision.rejected` with what they said.

Write the recommendation down before it is acted on (`decision.proposed` with a `decision_id`,
a `rationale`, and the `evidence_ids` you reasoned from), record what the user decided, and
stamp the same `decision_id` on the interaction when it fires. Full mechanic:
`../../references/decision-loop.md`.

Do not narrate this. It is bookkeeping, not part of the output.

## Rules
- **Branch on `scope` before you write.** Member read → second person. Workspace read → attribute
  every row to its owner and never say "you owe" about someone else's account.
- **Attribute inline, don't quote.** A worklist is scanned in seconds. Short attribution only.
- **Counts come from `totals`**, never from counting the rows you were handed — the sections are
  capped, and a total inferred off a slice is a number nobody can trace.
- **An unowned row says "unowned."** A missing `owner` is never the caller by default.
- **Read the engine's worklist**, don't recompute it — the follow-up/attention logic is the
  engine's, so the agent and the Studio homepage always agree.
- **Rank by what needs doing now**, and cap it — today is a handful of actions; the rest is
  `review-pipeline`.
- **Ground each item and its move** in the engine's worklist, not in raw activity.
