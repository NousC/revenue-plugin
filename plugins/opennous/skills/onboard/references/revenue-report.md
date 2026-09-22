# The Revenue Report — the first-look retrospective

This is the payoff of onboarding: the **first time the user sees their whole revenue motion unified**.
Six months of activity that lived scattered across their CRM, meetings, and inbox — now one view they
have never had. The job of this report is the **"oh — I could never see this before"** moment.
Revelation first; the actions fall out of it.

**Save it to Pages with `save_page` (`kind: "report"`, `skill: "revenue-report"`) — NOT to the repo, and
never under `raw/`.** It's a deliverable the user and the team read, not raw data. Title it `# Revenue Report`. (Never "revenue
intelligence" — that phrase is retired; it's the *Revenue Report*.)

## Principles
- **Revelation, not inventory.** Never lead with "I imported 12 meetings." Lead with the *picture* of
  their revenue. Counts are a footnote.
- **Retrospective.** It's a review of what HAPPENED over the window — wins, losses, stalls, what was
  striking — not a to-do list. Implications come after the picture.
- **Every claim sourced.** Each fact ties to the raw (`source_ref`), so they can trust it. Say when
  something is thin or missing — honesty is the trust.
- **Honest about coverage.** One seat's backfill is one seat's slice. Say what's missing and what
  connecting more would reveal. Never imply the picture is complete when it isn't.
- **Built for a team from day one** (see §7): a revenue leader's real prize is the *team* view.

## The sections (in order)

**1. Executive summary.** A few sentences that land the "oh." The state of their revenue over the
window as a *picture*, not metrics. What a leader most needs to grasp in ten seconds.

**2. The 6-month story — what stood out.** The arc of the period, and above all what was **striking /
surprising** (the anomalies): a deal that went dark, a segment that over-indexed, an account nobody
owned. Name the notable, not the routine.

**3. Won / Lost / Stalled.** The outcomes and *why*:
- **Won** — deals that closed, and the signals/leads that led there (what a win looks like for them).
- **Lost** — deals that died, and the reason (objection, competitor, silence).
- **Stalled** — live-looking deals gone quiet, with how long and the likely cause.
- The pattern across them: what predicts a win vs a loss here.
- **What the ICP learned from these outcomes.** When there were closed deals, onboarding trained the ICP
  on them (`record_closed_deals`, contrastive lift). Carry that result here: the signals the model now
  weights up on wins and down on losses, so the reader sees the ICP move from *their stated theory* to
  *what actually closed revenue*. This is the win-loss analysis living inside the report — no second
  artifact at onboarding.
- **If there are no tracked outcomes** (no CRM stages, no Stripe): say so plainly and make it a finding
  — *"you have zero tracked deal outcomes; connect a CRM or Stripe to see wins and losses, and to grade
  the ICP against real revenue"* — never fabricate a funnel. The ICP stays a hypothesis until deals close.

**4. What you weren't tracking — the reveal.** The highest-value section. Surface what was INVISIBLE:
- **Leads/accounts that exist in conversations but were never in the CRM** — real relationships with
  signal that no system was holding.
- **Promised follow-ups that never happened** (from `commitment_made` events) — found revenue.
- Relationships that fell through the cracks (went dark after real interest).
This is where the leader says "oh shit."

**5. How your pipeline behaves.** The patterns in how they actually run revenue: where deals stall,
response/follow-up cadence, which channels or sources convert, recurring objections, the *shape* of
their motion. Observed behavior they can't see from inside any one tool.

**6. Market & positioning intelligence.** What the conversations taught them about their OWN business —
the `record_insight` output across **product · positioning · market · buyer**, distilled into the
sharpest recurring signals and framed as *decisions to make* (a positioning that isn't landing, a
competitor being displaced, an unmet ask, a pricing signal). This is the voice-of-market a founder
usually only feels; here it's evidenced and named.

**7. Team coverage.** This report is built for teams, so name the coverage explicitly even when only
one seat has run. Two layers ingest differently (`references/integrations-personal-vs-team.md`):
**team-shared** sources (CRM · Stripe · outbound) give the whole team's accounts + owners at once;
**personal** sources (notetaker · email) are this seat's conversation slice.
- **Whose view this is** and that the *conversation* layer is a slice — *"this is your book; your
  teammates' calls and emails aren't in here yet."*
- **Name what's hiding, precisely.** If a CRM is connected, you can see accounts **owned by a teammate
  who hasn't onboarded** — call them out: *"Account X is owned by [Jane] (from your CRM); her
  conversations aren't backfilled yet — it's the account shell without the story."* Without a CRM, say
  the conversation view is yours alone.
- **The fill-in** — invite the team (each runs backfill on their own tokens into the SAME shared graph;
  identity resolution merges accounts, so the team pipeline assembles seat by seat). Make the leader
  *want* the whole team in: *"here's one slice; now imagine this across all N reps."*

**8. Coverage + trust.** What's in, what's skipped, what to connect next, and the provenance note (raw
in their git, structured claims + `source_ref` + sha256, no transcript sent to Nous, group calls filed
into every participant's account).

## Voice
First person, direct, opinionated — a sharp analyst who read everything, not a dashboard. Specific:
real names, real numbers, real quotes. Lead each section with the insight, then the evidence.
