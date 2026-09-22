---
name: forecast
description: Says how likely deals are to close and how healthy they are, with the reasons — "which deals are most likely to close in the next 30 days", "what will close this month", "how likely is Acme to close", "what's the deal health on Acme". Use whenever the user asks about a deal's odds, its health, or what is likely to close soon. Per deal, never a revenue roll-up.
---

# Forecast

Two questions, one tool: **which deals are most likely to close soon**, and **how likely is this deal to close, and how healthy is it**. Every percentage carries its reasons, and a number that rests on assumptions says so.

## Tools
- `deals` — the read this skill runs on.
  - No `account` → the open deals ranked by chance to close within `within_days` (default 30), each with its overall chance to win, its health, and the facts that moved its odds.
  - `account` (email, domain, LinkedIn URL, entity id, or name) → one deal: health in full, chance to close overall, within the window and within 90 days, the stage-only baseline, every fact moving the odds, AND why the account carries its ICP score (which signals fired, or which inputs are missing when none did).
- `get_account` — only when the user drills into the evidence behind a reason (the objection itself, who raised it).
- `save_page` — file the finished document into Pages (see "Save it to Pages").

## Workflow
1. **Read the question.** A named account → `deals` with `account`. "Most likely to close", "what will close this month / in N days" → `deals` without it. Set `within_days` from the request: "this month" is the days left in the month, "this quarter" the days left in the quarter, otherwise 30.
2. **Answer first**, in one line: the top deals and their odds, or this deal's odds and health.
3. **Give the why** from the returned `why` lines and health signals, in plain words. Never add a reason the tool did not return.
4. **Say what the numbers rest on.** Pass on a NOTE when the weights are defaults or the stage rates are assumed. When a window is `unknown`, say the timing can't be judged yet and give the overall chance instead.
5. **One move**, when the answer points at one: the change that would move the odds most (the biggest negative reason, or the worst health signal).

## Output

Ranked:
```
<One line: the window, how many open deals, what they are ranked by.>

1. <Account> — <x>% within <N> days · <y>% to win · health <score> <band>
   Why: <the biggest reasons, in plain words>
   Watch: <the health signal that is not fine, if any>
2. <…>

<The note on what the numbers rest on, if one came back.>
```

One account:
```
**<Account>** — <y>% likely to close (<x>% within <N> days, <z>% within 90) · health <score>/100 <band> · <stage>, <d> days in

**Why the odds are where they are**
- <reason, in plain words> (<+/-> <pts> pts)
- <…>
On stage alone it would be <s>%.

**Health**
- Competitive risk <level>: <reason>
- Blockers <level>: <reason>
- Buyer urgency <level>: <reason>
- Decision-maker buy-in <level>: <reason>
- Engagement: <last response, trend, threading>

**The move that changes the odds**
→ <one action, tied to the biggest negative reason or signal>
```

An account that is already won, closed, or has no open deal: say so in one line (the tool's `note`), then its health.

## Save it to Pages

The finished forecast is filed in the workspace's **Pages**, where the team and every
agent can find it, versioned, with its sources. Not left only in the chat, and not written to the repo:
raw material (transcripts, emails) stays in git; the finished document lives in Pages.

- **In a coding agent:** call `save_page` once, at the end, with `kind: "report"`, a `title` named for the window, the `period` it covers, `generated_from`, `skill: "forecast"`, the document as `markdown` with citations as [1], [2], and its `sources` in that same order (each with the `ref` the tools printed). Then give
  the operator one line: the finding, and the page link it returns.
- **In the app:** `present_document` with `kind: "report"` files it for you.

## Close the loop

The odds are not a decision; the move you recommend is. Record it before it is acted on (`decision.proposed` with a `decision_id`, a `rationale`, and the `evidence_ids` you reasoned from), record what the user decided, and stamp the same `decision_id` on the interaction when it fires. Full mechanic: `../../references/decision-loop.md`.

Do not narrate this. It is bookkeeping, not part of the output.

## Rules
- **Per deal, never a roll-up.** No commit or best-case totals, no revenue sum. Asked "will we hit the number", answer with the deals most likely to close and their odds, and don't add them up.
- **The numbers come from `deals`, not from judgment.** Don't nudge a percentage because a deal feels hot. If the record is missing something that would change the odds, name it as a gap to record.
- **Unknown is not zero.** A window with no timing history can't be judged; say that.
- **Say what the health score does NOT know.** A signal marked Unknown means nothing was ever recorded (no competitor named, no objection raised), not that the deal is clean. When `health.evidence.note` comes back, pass it on — and when the ICP block says no signal matched, say the score is the model's baseline and name the missing inputs rather than treating it as a verdict on fit.
- **Be honest about the basis, once.** Default weights make the percentages a ranking, not a promise. Say it once per answer, not on every line.
- Don't invent a close date or a deal value.
