---
name: revenue-report
description: THE Revenue Intelligence Review — one executive document, seven sections, built from the CRM, the conversation record and the customer base. It states what was analysed and what it cannot claim, then answers the questions a CRO asks: where revenue activity is happening, where revenue is at risk, where expansion is being missed, why opportunities close won or lost, what the CRM is failing to capture, and what to address next. Use it after a backfill, when anyone asks for "the revenue report", "how did the last six months go", "what did we miss", "why do we lose", "who is at risk", "what are buyers telling us", or when onboarding reaches its payoff. It absorbed win-loss, market-read and team-report: run this. Produces ONE document.
---

# Revenue Intelligence Review

One document a CRO can circulate without editing it first. It is an **intelligence product, not an
article**: neutral, quantified, sourced, and honest about what the data cannot support.

The reader must finish it thinking *"this system shows me what is true"* — never *"an AI wrote an
interesting analysis about my company."* That distinction decides every choice below.

## The voice

**Analyst, not journalist.** The number makes the argument; the sentence states it plainly.

| Do not write | Write |
|---|---|
| "A quarter of the base is at risk, and the label does not say so" | "9 of 34 customers carried an explicit risk signal. CRM health status reflected 2 of them." |
| "Wins close in 34 days and losses die in 76" | "Won opportunities closed in a median 34 days; closed-lost in 76." |
| "Customers named what they wanted, and it stopped at the edge of a pipeline nobody owns" | "90 expansion signals were identified across 39 accounts. None were associated with an open opportunity." |
| "So the acquisition motion is not under-recorded here. It is absent." | "No acquisition-stage calls were identified in the recorded conversation dataset." |

Rules that hold in every sentence of the document:

- **No bold inside a sentence.** Bold belongs to a heading or a table header. A bolded phrase
  mid-line is a presentation tic, not emphasis.
- **Neutral verbs only**: identified, observed, recorded, represented, captured, not reflected, not
  associated, inconsistent, unresolved, unavailable. Never *die, fail, collapse, bleed, nobody
  owns, quietly, the truth*.
- **Denominators everywhere.** "9 of 34 customers", not "9 customers". "90 signals across 39 of 112
  reviewed accounts", not "90 signals".
- **Observed and interpretation are separate sentences.** Observed: "90 expansion signals were
  identified across 39 accounts." Interpretation: "This suggests expansion demand is not
  consistently reaching the opportunity pipeline." Hedge the second, never the first.
- **Never claim more than the record supports.** Use: the evidence suggests, the observed pattern,
  this may indicate, within the analysed period, no evidence was identified of. Overclaiming works
  directly against the point of the document.
- **Name the CRM, never call it "the CRM".** `crm_coverage_data.crm` and `win_loss_data.crm`
  carry the provider's real name — write "HubSpot" everywhere, including source columns and
  table cells. A document that says "HubSpot" on one row and "CRM" on the next reads as two
  systems. Only when no CRM is connected does the generic phrase appear.
- **Never include a column you cannot fill.** Every breakdown carries its own counts
  (`by_category` has `count` and `accounts`); if a figure does not exist, the column does not
  exist. A column of dashes reads as missing data.
- **No product-internal terms.** Never a tool name, a category key, "claims", "the graph" or
  `record_closed_deals`. Write: historical won/lost outcomes, recorded conversations, risk signals.
- **Translate.** A quote in another language is given in English with the original after it and the
  language named: "I cannot see anything at all" (French original: "je ne vois rien de rien").
  Never leave a reader a sentence they cannot read.
- **No exclamation, no rhetorical question, no em dash as a dramatic pause, no rule of three.**

## The vocabulary a reader learns once

These six labels and no others, so the same thing is always called the same thing.

| Label | What goes under it |
|---|---|
| Key Finding | the section's conclusion, quantified |
| Evidence | the supporting figures, as a chart or a table |
| Customer Evidence | one representative verbatim quote, with speaker, account and date |
| Business Implication | what it means commercially, hedged, one or two sentences |
| Data Coverage Gap | what could not be analysed, and what that prevents |
| Recommended Action | what to review or change; specific, and never absolute |

## The data, and where every figure comes from

**You narrate; you never count.** Every figure is computed server-side and handed over raw with a
unit. Read `supports` on every payload first and never write a section it marks false. Carry
`provenance.caveats` into the Scope section or the Data Notes.

| Tool | Call | What it carries |
|---|---|---|
| `revenue_report_data` | once, `{ months }` | headline, coverage, funnel, created-by-outcome, won-vs-not-won separators, velocity, leakage over open pipeline, recovery set, win/loss counts |
| `crm_coverage_data` | once, `{ since_days: 30 }` | activity by source, commitments open, questions unanswered, risks in conversation, going dark, close dates slipped, expansion unpitched. **Check `supports.coverage_share_is_the_finding`**: when false, almost everything was logged in the CRM and a near-zero "not in CRM" share is true and misleading. Lead instead with the structured signal the CRM stores as text and cannot query. |
| `win_loss_data` | once, `{ months }` | closed cohort, cause taxonomy with its unclassified bucket, objections, competitors, `paths` (ordered steps with the won rate beside the lost), `paths.traces`, the rep's stated reason |
| `customer_success_data` | once | active customers and MRR, at risk with the strongest reason and quote, expansion with the product asked for, churned, the conversation-versus-CRM evidence split |
| `insights` | once, no category | product, positioning, market and buyer themes with mention counts and verbatim evidence |
| `metrics` | `{ measure: 'tasks_created', since_days: 30, group_by: 'owner' }` and `{ measure: 'signals_raised', since_days: 30, group_by: 'kind' }` | what the system produced from the same record in the last 30 days |
| `get_account` | once, for the single account examined in section 05 | the dated record behind that example |
| `whoami` | once | the company name, for the title |

**Budget: each tool once.** `load_skill`, `whoami`, five payloads, two `metrics`, one `get_account`,
then `present_document`. Never re-call a payload; they carry every name, quote and figure.

## Structure

Every section follows the same grammar, varied by what the section is about. A section with no
chart does not invent one; a section whose finding needs two tables does not force a quote in.

```
Section title        formal, descriptive        "Customer Health and Retention Risk"
Insight headline     the quantified finding     "9 of 34 customers carry an explicit risk signal"
Opening paragraph    two sentences: what this section examines, on what basis
Primary visual       one chart, table, path or pair of columns
Key figures          2 to 4, each with its denominator
Interpretation       two or three sentences, hedged, separated from the observation
Customer Evidence    one representative quote, sourced
```

**Recommendations appear only in section 07.** A section ends with its Business Implication, never
with a takeaway list, so a reader can act from one page at the end rather than from seven.

## The document: seven sections

Title it "Revenue Intelligence Review" with the company name from `whoami`. Beneath it one metadata
line: the analysis period, its length in days, and the date generated.

**00 · Scope and Coverage.** Before any finding, so the reader knows what the document can claim.
The period; the sources and what each contributed, named as real products — HubSpot, Gmail and
Fellow — with one sentence stating that these three are the entire basis, so nothing else is
assumed to have been read; the counts (opportunities, accounts, conversations by type, people); and
the gaps as a Data Coverage Gap phrased as what they prevent. Close with one short paragraph
distinguishing an observed fact from a derived metric from an interpretation.
*Data: `revenue_report_data.coverage` and `.provenance`, every payload's `provenance.caveats`,
`crm_coverage_data.activity_by_source`.* Blocks: `metrics` (4 counts) · `table` of sources ·
`callout` titled "Data Coverage Gap" · `prose`.

**01 · Executive Summary.** The state of the period in four figures, then the four or five findings
the rest of the document supports, each quantified with its denominator, as a `bullets` block headed
"Key Findings". No scene-setting and no recommendations here.
*Data: `revenue_report_data.headline` plus the leading figure of each section below.*
Blocks: `metrics` (4) · `bullets` "Key Findings" · `prose` (two sentences).

**02 · Revenue Activity and Coverage.** Where revenue activity is recorded and where it is not: the
funnel read from stage history in the team's own stage names, created pipeline by outcome, velocity,
and the share of conversations with the installed base versus new business. Name an absence if there
is one.
*Data: `revenue_report_data.funnel`, `.created_by_outcome`, `.velocity`; `crm_coverage_data.activity_by_source`.*
Blocks: `chart` bar of the funnel · `table` with `emphasis` on conversion · `metrics` · `prose`.

**03 · Customer Health and Retention Risk.** How many customers carry an explicit risk signal, what
the CRM's own health label says about those accounts, and the size of the disagreement. State the
disagreement as a count.
*Data: `customer_success_data.at_risk`, `.counts`, `.supports`; `crm_coverage_data.risks_in_conversation`.*
Blocks: `metrics` (use `text` for a ratio: "9 / 34") · `table` or `columns` · `evidence` (ONE
quote) · `prose` Business Implication.

**04 · Expansion and Adoption.** What customers asked to buy, how much of it is represented as an
opportunity, what the CRM has priced but recorded as never discussed, and the adoption barriers
customers named.
*Data: `customer_success_data.expansion`; `crm_coverage_data.expansion_unpitched`; `insights`.*
Blocks: `chart` or `table` of asks by product · `metrics` · `evidence` (ONE quote) · `prose`.

**05 · Why Opportunities Close Won or Lost.** Say which half of the record each finding rests on:
the stage history, close dates and stated loss reasons come from HubSpot; the separators, the
ordered sequences and the account timeline combine that history with what was said in the
recorded conversations. A reader who cannot tell the two apart cannot check either.
 The separators between won and not-won with cohort
sizes; the ordered sequence lost opportunities followed, with the won rate beside it; the recorded
loss reasons against the evidence, and the size of the unclassified bucket. Then **one account
examined in full**: the dated record of what happened and where the CRM and the conversations
diverge. One account in depth, never three in outline, and say how many other accounts show the
same pattern.
*Data: `win_loss_data.paths`, `.taxonomy`, `.rep_stated`, `.objections`, `.competitors`;
`revenue_report_data.separators`; `get_account` for the example.*
Blocks: `path` · `chart` grouped won vs not-won · `table` of causes with `emphasis` on controllable ·
`timeline` of the single account · `prose`.

**06 · What HubSpot Does Not Capture.** (Title it with the provider's name from
`crm_coverage_data.crm`.) The structured signal inside recorded conversations that no
CRM field holds: risks, outstanding commitments, unanswered questions, expansion asks, close-date
history. Then what the system produced from the same record in the last 30 days — tasks created and
who they are for, signals raised by kind, accounts affected — as the demonstration. State plainly
that nothing was written to the CRM.
*Data: `crm_coverage_data` (all of it; honour `supports.coverage_share_is_the_finding`);
`metrics` tasks_created by owner and signals_raised by kind.*
Blocks: `metrics` · `chart` bar of signals by kind · `table` of tasks by owner · `evidence` (ONE
quote) · `prose`.

**07 · Recommended Actions.** The only section carrying recommendations. A short summary paragraph,
then three or four grouped findings each with two to four bullets, then the priority table:

| Priority | Finding | Recommended action | Owner |
|---|---|---|---|
| High | 9 of 34 customers carry an explicit risk signal | Review renewal exposure on those accounts before the next cycle | Customer Success |

Every action is specific and non-absolute: "Review the 11 accounts with conflicting health
indicators before the next renewal cycle", never "Fix your health scoring".
*Data: every section above.* Blocks: `prose` · `bullets` per grouped finding · `table`.

**Data Notes.** Last and small: the window, the sources, how a figure was computed, what it
refreshes from, and the limits. Limits describe what the record does not contain — an unrecorded
loss reason, a source connected part-way through the period, a pipeline not synced — never our own
implementation.

## Output

One document via `present_document`, `kind: "report"`. Pass `generated_from` with the real product
names. Set each section's `kicker` to the formal title ("Customer Health and Retention Risk") and
its `label` to the insight headline: the quantified finding in one line.

Then one line in the chat: the single finding you would lead with, and what you would do about it.

## Rules

- Named accounts and real figures, or cut the line.
- Say "associated with", never "caused".
- A pattern drawn from four records says so, with the four.
- One representative quote per finding, translated, with speaker, account and date.
- The stated loss reason is reported beside the evidence, never as the finding.
- Where no outcomes are tracked, state it as a Data Coverage Gap and say what it prevents.
- Nothing was written to the CRM; section 06 says so.
