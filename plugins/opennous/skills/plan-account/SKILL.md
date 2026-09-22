---
name: plan-account
description: Builds a strategic account plan for one company or person from the Nous graph — who they are, the buying committee, open objections and competitors, deal health, ICP fit, and the recommended next moves. Use when the user asks to plan, brief, strategize, or prep an account or meeting, or asks what the plan is for an account or to get up to speed on one.
---

# Account plan

Turn one account's record into a plan the user can act on. You read the graph; you do not guess — if the record is thin, say so rather than inventing.

## Tools
- `get_account` — the full record: facts, Intel, buying committee, timeline, ICP.
- `deals` with `account` — deal health (all four signals, marked Unknown where nothing has been recorded), how likely the deal is to close with the facts moving the odds, and why the account carries its ICP score.
- `get_context` — pass `intent: "account_review"` (or `meeting_prep`) for a task-shaped read when the account is large.
- `score` — the live ICP fit + intent if the record doesn't already carry it.
- `save_page` — file the finished document into Pages (see "Save it to Pages").

## Workflow
1. Resolve the account: call `get_account` with the email, domain, or entity id the user gave. If a name is ambiguous, ask which one from the candidates it returns. Then call `deals` with the same account for its health and close odds.
2. Read the record for: who they are and their role; the buying committee and who's engaged; open objections and their hardness; competitors in play and stance; deal health and stage; ICP fit and intent; the most recent meaningful activity.
3. Identify the gaps that matter — a missing economic buyer, an unaddressed hard objection, a live competitor, a stalled stage, no next step booked.
4. Decide the next moves: the single most important action, then 2-3 supporting ones, each tied to a fact in the record (not generic advice).

## Output
Lead with a two-line situation summary, then use this shape (adapt to what the record holds):

```
# <Account> — account plan
**Health:** <score> <band> · **Close:** <x>% (<y>% within 30 days) · **ICP:** <score>/100 <tier> · **Stage:** <stage>

**Where it stands**
<2-3 sentences: the real state of the relationship and deal>

**Buying committee**
- <name> — <role>, <engaged / not yet> <champion/blocker if known>

**Open risks**
- <objection or competitor> — <why it matters, hard/soft>

**Next moves**
1. <the one thing to do next, and why — grounded in a fact>
2. <supporting move>
```

## Save it to Pages

The finished account plan is filed in the workspace's **Pages** on the account it is about, where the team and every
agent can find it, versioned, with its sources. Not left only in the chat, and not written to the repo:
raw material (transcripts, emails) stays in git; the finished document lives in Pages.

- **In a coding agent:** call `save_page` once, at the end, with `kind: "plan"`, the `account`, `skill: "plan-account"`, the document as `markdown` with citations as [1], [2], and its `sources` in that same order (each with the `ref` the tools printed). Then give
  the operator one line: the finding, and the page link it returns.
- **In the app:** `present_document` with `kind: "plan"` files it for you.

## Close the loop

Each play in the plan is one decision — not the plan as a whole. Record them as you lay them out, with the account fact each play answers to in `evidence_ids`.

Write the recommendation down before it is acted on (`decision.proposed` with a `decision_id`,
a `rationale`, and the `evidence_ids` you reasoned from), record what the user decided, and
stamp the same `decision_id` on the interaction when it fires. Full mechanic:
`../../references/decision-loop.md`.

Do not narrate this. It is bookkeeping, not part of the output.

## Rules
- If ICP fit, committee, or health is missing, name it as a gap to fill, not a number to fabricate.
- **Show the evidence** on the facts that carry the plan — the open risks, the objections, the
  committee stance. Speaker plus their verbatim quote, so a claim driving a next move can be
  checked. Facts with no quote on file are stated as such, never dressed up.
- Keep it to what changes the next action — this is a plan, not a data dump.
