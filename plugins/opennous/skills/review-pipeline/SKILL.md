---
name: review-pipeline
description: Reviews the whole account portfolio from the Nous graph — stage distribution, deal health, ICP fit, what's slipping, competitive risk, and the deals worth re-engaging — and writes a pipeline briefing grounded in real numbers and named accounts. Use when the user asks to review the pipeline, analyze the funnel, find at-risk or re-engage deals, spot where deals are stalling, or asks "how's my pipeline / what should I work on".
---

# Pipeline review

Turn the portfolio into a briefing the user can act on in five minutes: the shape of the funnel, what's healthy, what's slipping, and who to touch next — always with numbers and names.

## Tools

You build the funnel from the graph with a few targeted `query` calls, then drill into the handful of accounts that matter. No single "pipeline" call — `query` is the funnel.

- `query` — the funnel and its slices:
  - **Stage shape** — `query(scope:{ kind:"state", property:"stage" }, return:"entities")` → read `rollups.by_value` for the count in each stage.
  - **Gone quiet / slipping** — `query(scope:{ property:"interaction", since_days:30 }, without:{ property:"interaction", since_days:7 }, return:"entities")` → accounts that were active in the last 30 days but silent in the last 7. Late-stage ones here are your slipping deals.
  - **No-reply** — `query(scope:{ property:"interaction.email_sent", since_days:14 }, without:{ property:"interaction.email_reply", since_days:14 }, return:"entities")`.
  - **Competitive risk** — `query(scope:{ facts:true }, question:"accounts with an active competitor or a live objection")` → semantic fact search over the graph's Intel.
- `get_account` — drill into an account the review surfaces: deal health, open objections, named competitor, last touch, days quiet.
- `score` — the ICP fit number for an account when you want to rank re-engagement by fit.
- `save_page` — file the finished document into Pages (see "Save it to Pages").

## Workflow

1. **Funnel shape** — run the stage query, read `rollups.by_value`, and name the biggest stage-to-stage drop. **If `by_value` is empty** (no `stage` claims — the workspace has no CRM or Stripe feeding stages), there is no funnel: skip the Funnel line and the $ figure entirely, say "no deal stages yet — connect a CRM or Stripe", and lead the review with recency + ICP fit + competitive risk instead. Never fabricate a funnel from meetings/emails.
2. **Slipping** — run the gone-quiet query. The late-stage entities in the result are the deals losing momentum.
3. **Competitive risk** — run the facts query for competitors/objections.
4. **Classify from what came back** into: Re-engage (high ICP fit + quiet), Competitive risk, Slipping (late stage + rising days-quiet).
5. **Add the concrete reason** — for the few accounts that actually matter in each bucket (not the whole list), `get_account` for the objection / competitor / last-touch, and `score` for ICP fit. Skip the ones that don't move the review.

## Output
```
# Pipeline review — <date>
**Funnel:** <stage: n> · <stage: n> · …   (biggest drop: <stage → stage>)
**Health mix:** <n healthy · n at-risk · n needs-attention>

**Re-engage now**
- <account> — ICP <score>, <days> quiet, <flag/reason>

**Competitive risk**
- <account> — <competitor> (<stance>)

**Slipping**
- <account> — <stage>, <days> quiet, <why>
```

## Artifact (Claude Code only)
After the briefing, render it as a **branded HTML artifact** and publish it — the shareable version of
the review. Copy **`../../references/artifact-template.html`** and follow
**`../../references/artifact-design.md`** exactly: the OpenNous look, `Generated for {name}, {company}`,
**every account and person linked to its app record by full entity UUID** (`/accounts/<uuid>`,
`/people/<uuid>` — never truncate the id), footnote source citations linking to the raw, sentence case,
no em dash or colon inside sentences, numerals, a mix of prose and bullets, and depth over surface
(explain the why, not just the number). Use a minimal funnel visual when stages exist; if `by_value`
is empty, drop the funnel and lead with recency, ICP fit, and competitive risk. The text briefing
stays the answer; the artifact is the presentation layer. Not on Claude Code? Skip the artifact.

## Save it to Pages

The finished pipeline review is filed in the workspace's **Pages**, where the team and every
agent can find it, versioned, with its sources. Not left only in the chat, and not written to the repo:
raw material (transcripts, emails) stays in git; the finished document lives in Pages.

- **In a coding agent:** call `save_page` once, at the end, with `kind: "report"`, a `title` named for the window, the `period` it covers, `generated_from`, `skill: "review-pipeline"`, the document as `markdown` with citations as [1], [2], and its `sources` in that same order (each with the `ref` the tools printed). Then give
  the operator one line: the finding, and the page link it returns.
- **In the app:** `present_document` with `kind: "report"` files it for you.

## Close the loop

The interventions you recommend coming out of the review are decisions. The review's findings are not; a finding nobody can act on is a summary.

Write the recommendation down before it is acted on (`decision.proposed` with a `decision_id`,
a `rationale`, and the `evidence_ids` you reasoned from), record what the user decided, and
stamp the same `decision_id` on the interaction when it fires. Full mechanic:
`../../references/decision-loop.md`.

Do not narrate this. It is bookkeeping, not part of the output.

## Rules
- **Attribute inline, don't quote.** A review naming a dozen accounts cannot carry a dozen block
  quotes. Use short attribution — *(per Taimoor, 16 Jun)* — and keep the full quote for a drill-in.
- Build the funnel from `query`; only `get_account` the accounts you're actually going to name.
- Frame re-engagement as the next send/touch, never "un-pause this".
- If the portfolio is small or empty, say so plainly and suggest running backfill or ingest first.
- **Stage & $ come only from a CRM or Stripe.** If `rollups.by_value` for stage is empty, there is no funnel and no open-pipeline number — say that and connect a CRM/Stripe, never manufacture one. Recency, ICP fit, and competitive risk still work without stages.
