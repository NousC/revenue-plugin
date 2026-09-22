---
name: objection-prep
description: Preps the objections you'll hear on a specific deal and the answer to each — drawn from the objections already recorded on that account, ordered by how hard and how unaddressed they are, with the counter grounded in your own positioning and proof. Use when the user asks what objections they'll face, to handle pushback on a deal, what the account is worried about, or to prep for a tough conversation. For the cross-account objection battlecard, that's `role-report`.
---

# Objection prep

The objections on THIS deal and how to answer them — pulled from what's actually been recorded on the account, not a generic list. One deal; the real concerns.

## Tools
- `get_account` — the recorded objection Intel (category `objection`, with `status` open/resolved and `hardness` hard/soft), plus competitors in play and their stance.
- `get_context` — pass `intent: "account_review"` to pull the deal state and our relevant positioning when the account record is large.
- `save_page` — file the finished document into Pages (see "Save it to Pages").

## Workflow
1. **Resolve the account** and `get_account`; collect the objection Intel, competitors, and deal stage.
2. **Filter to what matters:** open objections first (resolved ones are context), hard before soft.
3. **Answer each** with the specific feature, proof, or positioning that addresses it, and one line on how to phrase it — grounded in our real story, never invented. If we have no strong answer on file, say so plainly (that's a real finding to fix, not a gap to paper over).
4. **Order by risk** — hardest, most deal-blocking, still-open first.

## Output
```
# Objection prep — <Account>
**Stage:** <stage> · **Competitors:** <in play, if any>

1. "<what they'll say>"  — <hard/soft · open>
   → **Counter:** <the answer, grounded in our positioning/proof>
   → **Proof:** <the single most specific thing to point to>

2. "<next objection>" …

**No strong answer yet:** <any objection we can't currently counter>
```

## If the user asks for the exact words
The prep itself is a report and stays in Nous's register (see CLAUDE.md, "How you write"). But when
the user asks for the literal line to say — "give me the words", "how do I phrase that" — that line
is spoken by them to a prospect, so it is drafted in THEIR voice, per the voice contract in
`../../references/language.md` §3. The counter, the ordering, and the risk framing around it stay in
register. Only the quoted line changes voice.

## Save it to Pages

The finished objection prep is filed in the workspace's **Pages** on the account it is about, where the team and every
agent can find it, versioned, with its sources. Not left only in the chat, and not written to the repo:
raw material (transcripts, emails) stays in git; the finished document lives in Pages.

- **In a coding agent:** call `save_page` once, at the end, with `kind: "objection_prep"`, the `account`, `skill: "objection-prep"`, the document as `markdown` with citations as [1], [2], and its `sources` in that same order (each with the `ref` the tools printed). Then give
  the operator one line: the finding, and the page link it returns.
- **In the app:** `save_note` with `category: "objection_prep"` files it for you.

## Close the loop

Each counter you hand over is a decision, and the objection it answers is its evidence. Whether the rep used your wording or their own is the label worth having.

Write the recommendation down before it is acted on (`decision.proposed` with a `decision_id`,
a `rationale`, and the `evidence_ids` you reasoned from), record what the user decided, and
stamp the same `decision_id` on the interaction when it fires. Full mechanic:
`../../references/decision-loop.md`.

Do not narrate this. It is bookkeeping, not part of the output.

## Rules
- **Quote the objection.** Show what they actually said, verbatim, with who said it. A counter
  written against a paraphrase misses what the person was really worried about.
- **Only real objections** — pull from what's recorded on the account; don't manufacture pushback that hasn't been raised.
- **Flag the unanswerable.** Where our positioning genuinely doesn't counter it, say so — an honest gap beats a hollow answer.
- **Tie every counter to our actual story** (feature, proof, positioning), not a generic rebuttal.
- Order by hardness + open status, so the user preps the deal-breaker first.
