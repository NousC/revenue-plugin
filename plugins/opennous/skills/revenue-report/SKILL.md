---
name: revenue-report
description: THE revenue report — one document that shows a team what their conversations know that their CRM does not. Over a window (the backfill, or the last N months) it reconstructs how revenue moved, what the CRM missed, where pipeline leaks and what is still savable, why deals were lost as the path they took, which customers are at risk or asking for more, what the market keeps saying, what winning looks like, and what OpenNous would have done in the last 30 days. Use it after a backfill, when anyone asks for "the revenue report", "how did the last six months go", "what did we miss", "why do we lose", "who is at risk", "what are buyers telling us", or when onboarding reaches its payoff. It absorbed win-loss, market-read and team-report: run this. Produces ONE document.
---

# Revenue report

One document, ten sections, one story: **your conversations know things your CRM does not, here
is what they know, and here is what to do about it.** Every section is a headline that is a
conclusion, one visual, and the evidence under it — the names and the buyer's own words that make
the number believable.

**Diagnostic, not dashboard.** The difference between a report someone reads once and one they
act on:

> ❌ Stage 3 → Stage 4 conversion: 34%
>
> ✅ $481K of pipeline stalled between discovery and evaluation. 67% of those had no documented
> next step within 48 hours of the discovery call. Deals that closed averaged 1.3 days from
> discovery to the next scheduled interaction; the ones that stalled averaged 5.8.
> **Change: no discovery advances without a calendared next step.**

Every number earns its place by implying an action.

## Who you are writing it for

**Read the role block in your context before you decide what this report leads with.** It carries
the reader's objective, what to lead with, and what to leave out. The same window produces a
different document for a CRO (coverage against the number, forecast risk), a RevOps lead (where
the funnel leaks, with counts), a founder (what the market says, what to change) and a CS lead
(the customer sections first). The role decides ORDER and EMPHASIS, never the honesty: sourcing,
the `[n]` markers, and saying plainly what the data cannot support are the same for every seat.

- **The `Leave out` line is binding.**
- **No role block, or several roles?** Write the whole-book read in the order below.
- This is not the report for an SDR or an AE working today's list — that is `focus` or
  `review-pipeline`. Bending this document to those asks produces an approximation.

## The data, and where every number comes from

**You narrate; you never count.** Every figure is computed server-side by a tool and handed over
raw with a unit. A model computing a median across a hundred opportunities gets it wrong
confidently and differently each run. Read `supports` on every payload FIRST and never write a
section it marks false; carry `provenance.caveats` into section 02 verbatim.

| Tool | Call | What it carries |
|---|---|---|
| `revenue_report_data` | once, `{ months }` | headline · coverage · funnel · created-by-outcome · won-vs-not-won separators · velocity · leakage over the OPEN pipeline · recovery set · win/loss counts |
| `crm_coverage_data` | once, `{ since_days: 30 }` | activity by source (in the CRM vs not) · commitments still open · questions unanswered · risks said in conversation · going dark · close dates slipped · expansion unpitched |
| `win_loss_data` | once, `{ months }` | the closed cohort · the cause taxonomy with its unclassified bucket · objections that decided it · competitors · `paths` (the ordered steps lost deals took, beside the won rate) · `paths.traces` (lost deals traced, with quotes) · the rep's stated reason beside the evidence |
| `customer_success_data` | once | active customers and MRR · at risk with the strongest reason and quote · expansion with what they asked for · churned · how much came from conversations vs CRM fields |
| `insights` | once, no category | what the market told us: product, positioning, market, buyer — with mention counts and verbatim evidence |
| `metrics` | `{ measure: 'tasks_created', since_days: 30, group_by: 'source' }` and `{ measure: 'signals_raised', since_days: 30, group_by: 'kind' }` | what OpenNous DID with what it read in the last 30 days |
| `get_account` | ONCE, for the one account you reconstruct in section 10 | the dated events behind the timeline |
| `whoami` | once | whose company this is, for the title |
| `save_page` | once, at the end, in a coding agent | files the finished document into Pages (see "Save it to Pages") |

Call the five payload tools at the start, in one go, then `metrics` twice. **Each tool once** — the
payloads carry every name, quote and figure the sections need, and re-calling one costs a turn
the document needs at the end. Ten calls, then `present_document`. Then stop.

## The document

Ten sections, in this order. The order is the argument: what happened → how much of it we could
see → what the CRM missed → where it leaks and what is savable → why deals are lost → the customer
book → what the market says → what winning looks like → what OpenNous would have done → what to
do next. Each section opens with a **thesis** — one sentence stating what it found, which a
reader could disagree with — never a label.

⛔ Never write a thesis as a negation followed by a correction ("it is not X, it is Y"). State the
finding once, positively, and stop.

**A section with no number, no series and no quote is not a section.** Cut it. **At most one
chart per section.** Lead with the visual, then say what it MEANS in two sentences — never restate
the numbers the reader can see. Under every chart or metric row that rests on conversations, an
**evidence** block: two to four rows of *account · their verbatim words · what it became*.

**01 — What happened.** The headline numbers: pipeline created, closed won, created→won rate, and
the leakage figure — then two sentences on what the window says, three to five takeaways, and the
priorities as a table (priority · why it matters · 30-day action).
*Data: `revenue_report_data.headline`, `.leakage.total`.* Blocks: `metrics` (4) · `prose` · `table`.

**02 — How much of this we could see.** The section that makes the rest believable; never cut it.
Sources, what was backfilled, the window each covers, what each was used for. Then how to read the
figures: an **observed fact** is in a source record; a **derived metric** is computed from observed
facts; an **inferred pattern** is an association across cohorts and is not proof of cause; a
**recommendation** is a repeated pattern plus current exposure. Name every gap — a source that is
not connected is a finding, not an omission — and carry every payload's `provenance.caveats` here.
*Data: `revenue_report_data.coverage`, `.provenance`; every other tool's `provenance.caveats`.*
Blocks: `metrics` · `table` of sources · `prose`.

**03 — What the CRM did not know.** The section that opens eyes. Lead with the share of recorded
conversations in the last 30 days that never reached the CRM, by source. Then the gaps, each with
its n and three named accounts: commitments made on calls and email still open in nobody's CRM,
buyer questions nobody answered, risks said in conversation that no CRM field can hold, accounts
with an open deal gone quiet, close dates the CRM moved more than once, expansion a customer asked
for with no deal open. Say plainly that CRM tasks are not synced, so "unfiled" means "not in the
graph as filed", never "we checked HubSpot".
*Data: `crm_coverage_data` — `activity_by_source`, `commitments_unfiled`, `questions_unanswered`,
`risks_in_conversation`, `going_dark`, `close_dates_slipped`, `expansion_unpitched`.*
Blocks: `metrics` (not-in-CRM %, commitments, questions, risks) · `chart` `bar` of the gaps by n ·
`evidence` (3 rows: the strongest quotes) · `prose`.

**04 — Where it leaks, and what is still savable.** One figure first — *potential revenue leakage
identified: $1.26M* — then the patterns with the pipeline each accounts for. ⚠️ These figures
**overlap and never sum**; say so. Then the recovery set: the OPEN deals carrying several failure
modes at once, named, with the intervention. ⛔ Never call the total "recoverable revenue".
Without deal values, run the same patterns on deal count and say dollars need a CRM or Stripe.
*Data: `revenue_report_data.leakage`, `.recovery` (the rows carry the names).*
Blocks: `chart` `bar` of `leakage.patterns` · `table` of the recovery set with `emphasis` on the
intervention · `prose` on the overlap.

**05 — Why deals are lost.** The path, not the dropdown. Lead with the most common ordered
sequence lost deals took and the share that took it — *"of 118 lost deals, 32% went: no economic
buyer → close date slipped → pricing objection → competitor named → went quiet"* — and the won
rate for the same path beside it, because a pattern both cohorts share is not a loss pattern.
Then the cause taxonomy with its unclassified bucket (a residual is a feature: it is the deals we
cannot explain, and saying so beats guessing), the objections that decided it, who we lose to
where a competitor resolved to a name, and the rep's stated reason beside the evidence — where the
two disagree, the disagreement is the finding. Close with one lost deal traced, with quotes.
*Data: `win_loss_data.paths` (`patterns[0]`, `steps`, `traces`), `.taxonomy`, `.objections`,
`.competitors`, `.rep_stated`.* If `supports.paths` is false, write the taxonomy and say the
paths need the close records. If `supports.report` is false (too few closed deals), keep this to
the counts and say so. Blocks: `path` · `table` of the taxonomy with `emphasis` on controllable ·
`chart` `grouped` won vs lost where the sample supports it · `evidence` (one traced deal) · `prose`.

**06 — The customer book: who is at risk, who is asking for more.** Expansion and churn are both
visible before the outcome. Lead with active customers and MRR, then two columns side by side:
**at risk** (strongest reason first — a cancellation date, their own churn model, paying with
nobody logging in, or what they said, with the quote) and **asking for more** (an ask in their own
words with the product, a priced upgrade never discussed). Say how many rows rest on a conversation
rather than a CRM field. A declined product is never pitched back. An account is at risk on one
tier-1 reason or two independent tier-2 ones; do not put an invoice complaint on the list alone.
*Data: `customer_success_data` — `counts`, `totals`, `at_risk`, `expansion`, `churned`,
`supports`.* Blocks: `metrics` (active, MRR, at risk, expansion) · `columns` (at risk `bad` ·
asking for more `good`, 4 cards each with quotes) · `prose`.

**07 — What the market keeps telling you.** The company-level voice of market: the four themes —
product, positioning, market, buyer — with mention counts and one verbatim line each, ranked by
how many accounts raised it. The section says what *we* should change about the product and the
story; a theme with one mention is a remark, not a theme.
*Data: `insights` (all categories).* Blocks: `chart` `bar` of themes by accounts · `evidence`
(4 rows, one per category) · `prose`.

**08 — What winning looks like here.** Built from their own closed-won deals against the ones that
did not close: stakeholders engaged, hours to follow up, whether an economic buyer ever appeared,
days idle — with cohort sizes beside every figure and the word **observed**, never proven. Fold
the ICP cut in as one extra table where the sample supports it.
*Data: `revenue_report_data.separators`, `.cohorts`, `.velocity`; `score` for the ICP cut.*
Blocks: `chart` `grouped` won `good` vs not-won `bad` · `table` · `prose` with the n's.

**09 — What OpenNous would have done in the last 30 days.** The value, made concrete. In the last
30 days it read N conversations and from them filed N tasks (by source: "23 from 14 Fellow calls,
9 from Gmail"), raised N signals (objections, competitors, risk, expansion, staff changes), flagged
N customers, and would have proposed N field updates. Then a table of the tasks it filed — account,
the commitment, who owes it, from which call — and the write-back it would have made, marked as a
preview: nothing was written to the CRM. Everything older than 30 days is history; a task filed
late is not a task.
*Data: `metrics` `tasks_created` by source and by owner, `signals_raised` by kind;
`crm_coverage_data.commitments_unfiled.rows` for the table; `customer_success_data.at_risk.n`.*
Blocks: `metrics` (conversations read, tasks filed, signals raised, customers flagged) · `table`
of tasks · `evidence` (3 rows: signal → what it became) · `prose`.

**10 — The next 30 days.** Five to ten operating changes, each built on a figure above, as a
table: change · trigger · owner · success measure. Then, in one short block, how to use OpenNous
from here: what to ask it each morning, which lists to open, what it watches continuously. Close
with **one account reconstructed** — a dated timeline of what happened and what it meant — and a
short table of how this report was generated: when, over what window, from which sources, how a
figure is computed, what it refreshes from, and the limits in plain words.
*Data: every section above; `get_account` once, for the traced account.* Blocks: `table` · `prose` ·
`timeline` · `table`.

## Output

Hand it over as ONE document with `present_document`, titled **"Revenue Report — <company name>"**
from `whoami` and the window it covers. Never the word demo. Pass `generated_from` with the real
product names behind the sources ("HubSpot", "Gmail", "Fellow"), never internal keys. Then one line
in the chat: the finding you would lead with if you had ten seconds, and what you would do about it.

## Save it to Pages

The finished report is filed in the workspace's **Pages**, where the team and every agent can find
it, versioned, with its sources. Not left only in the chat, and not written to the repo: raw
material (transcripts, emails) stays in git; the finished document lives in Pages.

- **In a coding agent:** call `save_page` once, at the end, with `kind: "report"`, a `title` named
  for the window, the `period` it covers, `generated_from`, `skill: "revenue-report"`, the document
  as `markdown` with citations as [1], [2], and its `sources` in that same order (each with the
  `ref` the tools printed). Then give the operator one line: the finding, and the page link.
- **In the app:** `present_document` files it as a page on its own.

## Rules

- **Named accounts and real numbers, or cut the line.** "Several deals stalled" is not a finding.
- **Say "associated with", never "caused".** You are reading correlation in one team's history.
- **Admit thin samples.** A pattern drawn from four deals says so.
- **Their words, not yours.** Where a buyer said the thing, quote them, with the date, in an
  `evidence` block. Never paraphrase inside a quote.
- **The rep's reason is testimony, never the finding.** Show it beside the evidence.
- **No tracked outcomes means say so.** No CRM stages and no Stripe: make it a finding, note that
  the ICP stays a hypothesis until deals close, and never invent revenue nobody recorded.
- **Nothing was written to the CRM.** Section 09 is a preview; say so in the section.
