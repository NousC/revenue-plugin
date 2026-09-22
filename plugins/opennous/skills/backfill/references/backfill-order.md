# Backfill order — the staged SOP (why the sequence is the whole game)

A backfill is not "loop over every connected tool." The **order** decides whether you end up with
a clean account graph or a pile of duplicates. This file is the canonical strategy; the `backfill`
skill runs it stage by stage.

## The one law

**Account-*creating* sources run before account-*enriching* sources, and structured-stage sources
run before free-text ones.** Every later stage *matches into* the identity graph the earlier stages
built — it never forks it. Establish a person as early as possible (CRM row → outbound reply →
meeting attendee) so that when a later source mentions them, the engine resolves to the existing
record instead of creating a second one.

Corollaries:
- **Creators before enrichers.** CRM, outbound, and meeting notetakers *create* accounts. Gmail,
  Calendar, and Stripe mostly *enrich* what already exists.
- **Structured stage before free text.** A CRM/Stripe stage is ground truth; an email is a hint.
- **Enrich-only sources NEVER spawn accounts.** Gmail especially — otherwise every newsletter,
  vendor, and personal thread becomes a fake account.
- **Stage & closed/won come only from CRM or Stripe.** With neither, accounts stay stage-unknown —
  that is correct, not a gap. These are also the *only* source of the `closed_won` / `closed_lost`
  cohorts that train the ICP on real outcomes in the final pass — no CRM/Stripe means the ICP stays a
  stated hypothesis, never graded against revenue.

## Stage 0 — Ask: is there a CRM?

Before anything, ask the user whether a CRM is connected (HubSpot / Attio / Pipedrive / Salesforce).
The answer changes the run: with a CRM you get the account backbone + pipeline stage for free; without
one, Stripe (Stage 5) becomes the way to learn what's actually closed.

## Stage 1 — CRM: the account backbone (creates accounts)

**If the app's CRM sync has already imported the CRM, skip this stage.** The app imports companies,
contacts, deals, owners and subscriptions for free; pulling tens of thousands of CRM rows through a
Claude Code session costs hours and usage limits for no gain. Check with `query` (accounts carrying
`deal.stage`). Everything below still matches into those accounts.

Otherwise, if a CRM is connected, import it first. It is the only source besides Stripe that carries **deal
stage**, and it gives you the canonical account set + contacts + owners in one structured pass.
- Import companies → accounts, contacts → people (keyed by email/domain), deals → `deal.stage`,
  `deal.value`, and the relationship owner.
- Everything downstream matches into these accounts.
- **Populates:** accounts, contacts, pipeline stage, deal value, owner.

## Stage 2 — Outbound tools: replies become contacts (creates accounts)

Instantly / HeyReach / Smartlead / Lemlist / EmailBison. These are creators because a **reply is a
real person** and the tool logs it. Run before meetings so that a person who later shows up in a
meeting is *matched*, not duplicated.
- Import contacted leads and, above all, **logged responses** — each reply → create/match the
  contact, record the interaction, and record `discovery` (how the relationship began: which campaign
  / channel).
- **Populates:** new contacts from replies, first-touch interactions, discovery source.

## Stage 3 — Meetings: notetaker + calendar (notetaker creates, calendar corroborates)

Two connectors, one block:
- **Notetaker** (Fireflies / Granola / Fathom) is the creator. For each transcript, run the full
  per-item procedure (see the `sync` skill): resolve external attendees by email, record identity
  attributes, record the interaction, extract claims/intel, extract insights, stash raw → git.
- **Calendar** (Google Calendar / Calendly / Cal.com) corroborates: it supplies the real meeting
  **date/time**, confirms attendee emails, and fills meetings the notetaker missed. Treat calendar as
  enrichment of the notetaker's meetings — create a contact from a calendar-only external attendee
  only when it's clearly a real external meeting.
- **Match first, create second.** An attendee already in the graph (from CRM / outbound) must resolve
  to that record.
- **Call reviews:** for meetings from the **last 30 days** that are sales calls, write the review and
  `record` it as a `call_review` (`../../sync/references/call-review.md`) — it becomes the scorecard and
  the Call page, exactly as the app writes them. Older meetings: facts and insights only.
- **Populates:** claims, intel, insights, accurate meeting timeline, call scorecards + Call pages (last 30 days).

## Stage 4 — Gmail: enrich-only, NEVER create

Your inbox is mostly noise for a revenue graph — newsletters, vendors, receipts, recruiters,
personal mail. If Gmail *created* accounts, every sender would become a fake one. So Gmail only
enriches people and accounts **already in the graph** from Stages 1–3. That is the entire reason it
runs fourth: the creators define "known," and Gmail fills known. It never touches stage or
closed/won (that is CRM / Stripe).

**The mechanic — match, don't crawl:**

1. **Build the known set first.** Before touching Gmail, pull what already exists with `query`:
   every person's email and every account's company **domain**. That list is the allowlist —
   nothing outside it gets an account.
2. **Search per known contact/domain, not the whole inbox.** Drive from the known set with the
   Gmail connector: `from:<email> OR to:<email>`, or by domain `from:@<domain>`, bounded to the
   window. This is far cheaper than reading the inbox and it filters the noise for free. Do NOT walk
   every thread and then decide.
3. **For each matching thread, enrich the person it belongs to** (the per-item procedure, email
   variant): `record` the interaction (`interaction.email_sent` / `email_received` / `email_reply`,
   `observed_at` = the email's real date, `external_id` = the Gmail **message id**), `record` any
   durable intel from the body (objection, pricing discussion, commitment, next step), and
   `record_insight` if the thread taught something about US. Stash the raw email → `raw/<account-slug>/…`.
4. **The one allowed "new" — a new person at a KNOWN company.** An email from a *new address on a
   domain you already have* (a colleague of an existing contact) is a new **contact on an existing
   account** — record it; the domain links them to that account via `works_at`. A sender on an
   **unknown** domain is a would-be new account, so **skip it**. The line is exact: new contact at a
   known company yes, brand-new company no.

**Guards (drop these):**
- **Internal** — your own domain and teammates are never subjects.
- **Automated** — `noreply@`, notifications, marketing blasts, receipts.
- **Free-mailbox** — gmail.com / outlook.com is a person, never a company domain (but an
  already-known person on a free mailbox still gets their threads enriched).
- **Idempotent** — the message-id `external_id` means a re-run never double-files.

**Populates:** interaction history + recency (this is what powers "who's gone quiet"), written-thread
intel that calls miss, and confirmed who-talks-to-whom — all onto accounts that already exist. Never
new accounts.

## Stage 5 — Stripe: the revenue truth (optional, last)

If there's no CRM (or to confirm one), ask the user to connect Stripe as the final, optional step.
Stripe tells you who actually **paid / closed-won** and the real amount, so accounts that had no
stage get one.
- **Populates:** closed/won stage, real deal amounts — especially when Stage 1 was skipped.

## Final pass — enrich, train on outcomes, then score (this fills "not ICP'd, not enriched")

Ingestion order alone never scores accounts. After the stages, run one closing pass:
1. **Enrich firmographics** so accounts become *scoreable* — resolve each company's domain →
   industry / employee_count / etc. (whatever enrichment is available). An unenriched account has no
   features to score.
2. **Train the ICP on real closed deals — if there are any (admin/founder only).** Stages 1 and 5
   are the point where `closed_won` and `closed_lost` land on the graph. Now use them: pull the two
   cohorts with `query` (`scope.property:"stage"`, `return:"entities"` — the accounts at `closed_won`
   and at `closed_lost`, **closed in the last 12 months**) and feed their domains to the **`record_closed_deals`** tool (carry
   `deal.value` → `amount` and the close date → `closed_at` where the CRM/Stripe records have them).
   The engine runs contrastive lift (the signals that separate wins from losses), links the contacts
   already at each company, resolves their open predictions with the real outcome, and re-scores every
   open account. This is what turns the ICP from the *hypothesis* `set_icp` wrote into an
   *outcome-graded* model. **Gate it:** the ICP is the one company model, so admin/founder only (a
   member inherits it, never trains it); and it needs closed deals — no CRM/Stripe, or nothing closed
   in the window, means there is nothing to train on, so skip it and keep the hypothesis ICP. One-sided
   (only won, or only lost) is directional only — note that. The signals it returns feed the Win/Loss
   section of the Revenue Report.
3. **Score against the ICP** — `score` every materialized account against the ICP model (now
   outcome-graded if step 2 ran). This is what produces ICP fit + reasoning. If no ICP exists yet, say
   so and skip — don't block the report.

Scoring is last because it needs both an ICP model AND enriched features. Training sits between the
two: it needs the enriched closed domains, and it sharpens the model that scoring then reads.

## Graceful degradation

Run only the stages whose source is actually connected (onboarding's Phase A discovered them). Skip
an absent stage and say so in the report ("no CRM connected — stages came from meetings + Gmail;
deal stages unknown without a CRM or Stripe"). Never invent a connector.
