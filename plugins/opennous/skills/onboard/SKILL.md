---
name: onboard
description: >
  Onboards a new Nous workspace end-to-end inside the coding agent — detecting the
  revenue tools connected here, filling gaps, backfilling the last 6 months onto the
  graph (on this agent's tokens), and ending with a pipeline report. Use the FIRST time
  a user sets up Nous, or when they say "onboard me", "set up my workspace", "build my
  accounts", "import my history", or ask how to get started. Not for day-to-day work
  once set up — use sync, plan-account, or review-pipeline instead.
---

# Nous onboarding (strict SOP)

Stand up the user's Nous graph entirely inside this agent — no Nous UI, nothing connected to our
platform. You extract on THIS agent's tokens; Nous resolves identities and scores. Follow the
phases **in order**. Do not advance until a phase's **Exit** is met. Announce each phase to the
user in one short line.

## Phase 0 · Orient (fast) — and pick the right path
Call `whoami` — confirm you're signed in and see the workspace, your **scope** (admin vs member), and
your **role(s)**. If a tool returns `invalid_api_key`, stop and tell the user to run `/opennous:login`
first, then resume.

**"Onboarded" is per SEAT, not per workspace.** A populated graph does NOT mean *you* are set up — on
a team, a new member joins a workspace that is already full of the founder's accounts. So branch:
- **Empty graph** → the first seat (usually the founder). Run the full onboarding (Phases A–E).
- **Populated graph + this is your seat's own data already in** (you're the founder/admin who filled
  it, or `query(scope:{attention:"mine"})` shows accounts you own) → you're set up; hand to
  `/opennous:focus`. Don't re-onboard.
- **Populated graph + you're a new member with nothing of your own yet** (scope = member, and
  `query(scope:{attention:"mine"})` returns ~nothing) → **run the MEMBER onboarding**: you are adding
  *your* tools and *your* slice to an existing team graph, not rebuilding it. Skip ICP setup (the team
  already has one) and go A → B (member path) → C (your sources only) → D (score + your slice report).

**Exit:** signed in, and you've chosen: full onboarding (empty), member onboarding (new seat on a
populated workspace), or already-set-up (your own data is already in).

## Phase A · Discover
List the MCP servers / connectors available in this session and classify each into a Nous category:
- **Meetings** → Fireflies, Granola, Fathom, Otter
- **Email** → Gmail, Outlook
- **Calendar** → Google Calendar, Outlook Calendar
- **CRM** → HubSpot, Attio, Pipedrive, Salesforce
- **Messaging** → Slack
- **Social** → LinkedIn

**Exit:** you have a coverage map (which categories are present, which are missing).

## Phase B · Gap-check & recommend the backbone — STOP for a decision
Never silently jump to a thin backfill. This is a decision point: check the floor, then actively
recommend the account-creating sources that are missing, and **wait for the user to choose**.

**Sources split into team-shared vs personal — recommend by the caller's role** (`whoami` → scope; see
`references/integrations-personal-vs-team.md`). Team-shared (CRM · Stripe · outbound) is the
account/deal/revenue backbone an **admin/founder** connects once for the whole team; personal
(notetaker · email · calendar) is each member's own conversation layer.
- **Admin/founder:** recommend connecting the team-shared backbone (CRM + outbound) — it lights up the
  whole team's accounts + owners — plus their own personal sources.
- **Member (joining a populated workspace):** the team-shared sources are already connected by an
  admin — **inherit them, don't ask the member to connect the CRM / Stripe / outbound again.** Name
  what the team already has ("your team's CRM (Attio) and outbound (Instantly) are already connected"),
  then have them connect only their **personal** meetings + email and backfill *their* slice. **If a
  team-shared category is missing** (e.g. the team has a CRM but no outbound tool), surface it and ask
  once: *"your team hasn't connected an outbound tool — want to add one?"* — an admin/founder can
  connect it there; a plain member is told it's an admin action. Never silently skip the gap.

**Required (block if missing):** Meetings + Email — the floor for building accounts. If either is
missing, tell the user exactly what to connect ("Connect a meeting-notes tool — Fireflies or
Granola") and wait. Never invent a connector that isn't present.

**Recommend the account-creating backbone — then STOP.** Meetings + Email alone build a *thin* graph:
people and conversations, but **no deal stages, no pipeline $, and no contacts from outbound replies.**
Before backfilling, recommend the missing CREATORS. **CRM and outbound are BOTH strongly recommended,
with EQUAL weight — neither is secondary, neither is "first."** Recommend whichever the user is
missing, each as its own first-class option, with the concrete tradeoff:
- **No CRM? (recommended)** Connect one (HubSpot / Attio / Pipedrive / Salesforce). The backbone —
  canonical accounts, the **pipeline stages**, deal values, and owners. Only a CRM or Stripe carries
  stage, so without one there is no funnel and no pipeline $.
- **No outbound tool? (recommended, equally)** If they run outbound, connect it (Instantly / HeyReach
  / Smartlead / Lemlist / EmailBison). It creates contacts from **logged replies** plus the discovery
  source that meetings and email never capture — the top of the funnel.
- **No Stripe? (optional)** The fallback for closed/won when there's no CRM.

**The recommended path is to connect BOTH a CRM and an outbound tool** — that's the strongest setup,
not one or the other. Make **"connect both" the first, recommended option**; then each one
individually (both still recommended); then Stripe as the optional fallback; then "proceed with
what's connected." Do NOT mark only CRM as recommended — CRM and outbound are recommended together.
Then **wait** — do NOT proceed until they answer. Frame it like: *"For the full picture I'd connect
BOTH a CRM and an outbound tool before I backfill (that's the strongest setup): the CRM gives accounts
+ stages + pipeline $, the outbound tool gives reply-sourced contacts + discovery. Connect both, just
one, or proceed with meetings + email?"* An example menu shape:
1. **Connect both a CRM and an outbound tool (recommended)** — the full backbone
2. Connect a CRM (HubSpot / Attio / Pipedrive / Salesforce)
3. Connect an outbound tool (Instantly / HeyReach / Smartlead / Lemlist / EmailBison)
4. Connect Stripe (optional — closed/won only)
5. Proceed with meetings + email (no stages, no pipeline $)

**Exit:** the user has either connected a recommended source (then re-run Phase A to pick it up) or
**explicitly** chosen to proceed with what's connected, knowing the tradeoff.

## Phase C · Backfill (last 6 months) — raw lands in git as it goes
**Audit raw storage first (idempotent):** ensure `raw/` and a `.nous/raw.json` marker
(`{ workspace_id, convention, repo }`) exist in this repo — create them once if missing, leave them
if present. Raw is filed per the locked convention — **one folder per account**,
`raw/<account-slug>/<date>-<source>-<externalId>.md`. Full spec: `../sync/references/raw-storage.md`.

Then run the **`backfill`** skill over the connected sources (default window: 6 months). It pulls
history through the connectors, extracts on the user's tokens, **writes each item's raw into its
account folder**, and files structure via `record` / `record_insight` carrying a `source_ref` git
pointer to that raw. Idempotent and resumable — accounts and their raw folders materialize as it
goes; a re-run overwrites the same paths, never duplicates. Report progress as it runs.

**Exit:** the 6-month window is fully processed for every required source (backfill reports done),
with each item's raw written under `raw/<account-slug>/`.

## Phase D · Set up the ICP, then materialize & report
Once backfill is drained:
1. **Build the ICP from the deals that actually closed. Do not ask them for it.**

   Nobody can describe their ICP accurately on day one — the answer you get is aspiration, and
   it then scores every account in the product. The app agent is held to exactly this rule, and
   you are held to it here, so the two surfaces cannot teach a user two different things about
   where their ICP comes from.

   You are in a **better** position than the app to obey it: the backfill has already drained,
   so the closed cohorts are in the graph *right now* rather than hours away. So do the thing
   the app has to wait for.

   **Admin/founder, closed deals present — the default path.** Pull `closed_won` and
   `closed_lost` with `query` (`scope.property:"stage"`, `return:"entities"`) and feed their
   domains to **`record_closed_deals`** (carry `amount` / `closed_at` where the records have
   them). It runs contrastive lift, links known contacts, resolves predictions against the real
   outcome, re-scores open accounts, and returns the signals the model learned. That IS the ICP
   — outcome-graded, not a hypothesis. Report what it weighted and why. One-sided (only won, or
   only lost) is directional; say so.

   **No closed deals — the honest fallback.** No CRM or Stripe, or nothing closed in the
   window, means there are no outcomes to learn from. Then, and only then, write a *hypothesis*
   ICP with `set_icp`, drafted from the backfilled accounts, the company insights and their
   site — reusing their canonical `context/nous/icp/icp.md` verbatim if they have one
   (reconcile, never invent a second). Full shape: `references/icp-authoring.md`. **Label it a
   hypothesis every time you mention it**, and tell them it gets rewritten from real outcomes
   the moment deals close. A guess presented as a model is worse than no model.

   **Member seat:** never. The ICP is the one company model — a member inherits it, never
   trains it or writes it. Read it, say whose it is, move on.

   **Whichever path ran, stamp the workspace as set up.** Both surfaces share one finish line,
   and a workspace you fully onboarded here must not push the user back into the app's welcome
   flow. This feeds the Win/Loss section of the report below.
2. `score` the newly materialized accounts against the resulting model. Never score before it exists.
3. **Write the Revenue Report — the payoff of onboarding.** This is the first time the user sees their
   whole revenue motion unified, so it's a **retrospective revelation, not a to-do list**: the state of
   their revenue over the window, what stood out, deals won/lost/stalled, the leads and follow-ups
   nobody was tracking, how their pipeline behaves, the market/positioning intelligence from the calls,
   and honest team-coverage (this is one seat's slice — drive them to invite the team). **If `record_closed_deals` ran in step 1, the report's Win/Loss section carries the actual win-loss analysis** — why deals
   turned, the recurring objection and top competitor on losses, and *what the ICP now weights
   differently* (the signals `record_closed_deals` returned). Onboarding produces **one artifact** — the
   win-loss lives as section 05 of the Revenue Report — the paths lost deals took, the cause
   taxonomy, the rep's reason beside the evidence — not a second file. Run the **`revenue-report`** skill — it owns the
   sections, the principles and the voice, and it is the same report the app produces, so
   onboarding and a later "give me the revenue report" can never drift into two documents. On this
   surface write its output to **`reports/revenue-report-<YYYY-MM-DD>.md`** (in the working dir,
   NOT under `raw/`); the full spec it follows is **`references/revenue-report.md`**. Every claim sourced; honest about what's missing; pipeline $ only
   if a CRM/Stripe fed it (else make "no tracked outcomes" a finding, and note the ICP stays a hypothesis
   until deals close).
4. **Render the branded artifact (Claude Code only).** After the markdown is written, render a branded
   HTML report from the SAME content and publish it as an artifact — this is the shareable payoff.
   Copy **`../../references/artifact-template.html`** and swap in the report's real content; follow
   **`../../references/artifact-design.md`** exactly (the OpenNous look, "Generated for {name},
   {company}", footnote source citations linking to the raw in their git, sentence case, no em dash or
   colon in sentences, numerals, prose + bullets, rule number one = make it valuable). The markdown in
   `reports/` stays the source of truth; the artifact is the presentation layer. Not on Claude Code?
   Skip the artifact and hand over the markdown.
5. Show the user the **executive summary** inline (a few sentences that land the "oh") + the report
   path and the artifact link. Don't paste the whole report — the summary plus "full Revenue Report at
   <path>" and the shareable artifact.

**Exit:** the ICP came from closed deals where there were any (`record_closed_deals`, admin/founder)
and is labelled a hypothesis where there were none, accounts are scored, the Revenue Report is written
to `reports/` with its Win/Loss section, its branded artifact is published (on Claude Code), and the
executive summary is shown.

## Phase E · Handoff + one optional last step
Tell the user their history is in and they can work now. Offer a couple of openers **as plain things
they can just say — never tell them to type a skill command.** You know the skills; you route the
intent yourself. Ground the openers in their real data, e.g. *"want me to plan the WindSeeker AI
account?"* or *"ask 'who's gone quiet?' and Taimoor will come up."* — not "run `/opennous:plan-account`".

Then, as the FINAL and OPTIONAL step: **"Connect a repo in OpenNous to keep raw flowing ongoingly."**
Everything above already works without it — the backfill's raw is already in this repo. This wires the
*ongoing, server-side* push (new meetings/emails auto-filed to the same repo, so the raw stays
complete without anyone running anything). **Give the user the direct link and tell them to connect it
there:** https://app.opennous.cloud/settings?section=repo . Audit first: if a repo is already
connected, say so and skip it. If not, offer to pre-fill the repo you detected from `git remote` —
they paste a fine-grained GitHub token on that page once (a secret they create; it's stored
encrypted, so it belongs in the app, not this chat).

**Exit:** the optional connect-repo step is offered (and done, or knowingly deferred). Stop.

## Rules
- **No tool connected to our platform in this flow, and no UI** — everything happens here.
- **Backfill runs on the user's tokens** — by design.
- **Idempotent + resumable** — if onboarding is interrupted, re-running continues from the watermark
  and never double-files (see `backfill`).
- **You never merge/resolve identities** — the engine materializes accounts from what you record.
- Keep phase announcements to one line each; save the detail for the closing report.
