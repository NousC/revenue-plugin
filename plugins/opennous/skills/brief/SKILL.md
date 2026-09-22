---
name: brief
description: Briefs you on an account — shaped by YOUR job. Opens with the at-a-glance read (stage, last touch, last meeting, who's involved, the decision maker), then: an SDR gets why this account, who to contact and what to say; an AE gets the deal, the committee, the risks and what moves it; CS gets adoption, health, commitments and the renewal; a founder or head of sales reading someone else's account gets whether it's real, whether it's moving, and where to help. Use when the user says "brief me", "brief me on", "account brief for", "catch me up on", or "what do I need to know about" an account. This is the working read on one account; for a specific upcoming meeting ("prep me for my call with", "meeting prep") use `meeting-prep`, and for the full strategic plan use `plan-account`.
---

# Brief

One account, read for the job the operator actually does. An SDR and an AE looking at the same
company need different briefs — not the same brief at different lengths. The SDR is trying to
CREATE the opportunity, the AE to CLOSE it, CS to keep and grow it, and a manager to decide
whether to spend an hour on it. Write the one they need.

## First: an account is a COMPANY

An account brief is about the account — the company — even when the operator names a person.
"Brief me on 7xGTM" and "brief me on Taimoor" are usually the same request: the deal lives at
the company, the people are how you reach it.

So: **resolve to the company and write the company's brief.** Name its people inside, in
"Who's involved" and the committee, where they belong.

The one exception is when they clearly want the PERSON — prepping for a call with them, or a
question about that individual. When it's genuinely ambiguous, don't guess and don't write the
wrong one: use `ask_user` with two options, the company first, and one line each on what they'd
get. Ask ONCE, offer the answer you'd have picked as the default, and never ask when the
account is a company already.

## Next: whose brief is this

Call `whoami`. It returns the operator's GTM role(s), and that decides the shape before you read
a thing about the account.

| Role | Shape |
|---|---|
| `sdr`, `bdr` | **Prospecting brief** — why this account, who to contact, what to say |
| `account_executive`, `sales` | **Deal brief** — where the deal stands, who decides, what could kill it |
| `customer_success` | **Customer brief** — value delivered, health, commitments, renewal |
| `founder`, `revops`, `manager` **on someone else's account** | **Leadership brief** — is this real, is it moving, does the rep need me |
| several roles | The one the ACCOUNT calls for (below) |
| nothing on file | Let the account decide (below) |

**A leader working their OWN account is not a leader, they're the seller.** `whoami` returns
`scope` as well as roles: an admin reading an account someone else owns wants the oversight
read; the same person on a deal they run themselves wants the deal brief. A solo founder is
always the seller — if there's nobody else in the workspace, never write them the leadership
brief.

**When the role doesn't decide it, the account does.** A founder does all three jobs in a week,
so read where this account actually is: no meeting held yet → prospecting brief; live deal →
deal brief; closed-won or an existing customer → customer brief. Ask the operator only when the
record is genuinely ambiguous, and ask in one line ("Working this as an SDR or an AE?") — never
open with a question you could have answered from `whoami` or the stage.

## Tools
- `get_context` — `intent: "meeting_prep"` for a call, `"account_review"` otherwise. The headline
  tool: the task-shaped read, each fact carrying its speaker and verbatim quote.
- `get_account` — the full record when the brief needs a thread `get_context` didn't surface: a
  specific objection, a commitment made two calls ago, the buying committee.
- `score` — ICP fit and intent, where the brief turns on whether this account is worth the time.
- `save_page` — file the finished document into Pages (see "Save it to Pages").

## The shapes

Cover what the record supports. **Skip any section with nothing real behind it** — an empty
heading is worse than a missing one, and "No data available" is not a section. They're in
priority order: with material for only three, write those three.

### At a glance — every brief opens with it

Four to six bullets, before any prose, so the operator knows where they are before they read a
word. Facts with dates, no sentences of analysis, no bullet that says "unknown":

- **Stage and health** — or the lifecycle position: prospect, live deal, customer.
- **Last touch** — when, which channel, who moved last. "Aug 10, LinkedIn, we messaged — no
  reply since" says more than a date.
- **Last meeting** — when, who was on it, what it was for.
- **Who's involved** — the people on the record at this account, and which of them we've
  actually spoken to.
- **Primary decision maker** — named, with their title. If we haven't identified one, say that
  outright: it's usually the most important line in the brief.
- **ICP fit** — the score and what it means, where it changes whether to spend time here.
- **Open commitments** — how many, and whether any are ours and overdue.

Then the shape below.

### Prospecting brief (SDR)

Answers: *why should I contact this account, who, and what do I say?*

- **The account** — what they do, size, market, and whatever about their setup matters to us.
- **Why this account** — ICP fit in a sentence, with the score. If they're a weak fit say so
  plainly and say what would change it; a brief that talks an SDR into a bad account costs them
  a week.
- **What's happening there** — the triggers: hiring, funding, a launch, a leadership change, a
  post, a site visit. This is the reason to reach out NOW rather than next quarter.
- **Who to contact** — the likely buyer, plus the champion or entry point if they differ. Name
  them, name the title, and say why that person rather than the obvious one.
- **What we know about them** — what they've said publicly or to us. Their words, not a summary.
- **The angle** — the strongest specific reason THIS account should talk to us, in a line the
  operator could nearly send as-is.
- **Where we've been** — every prior touch and what came back: replies, clicks, silence, a
  sequence that bounced. Never pitch into a thread that already went cold without naming it.
- **The move** — one action with a person attached: "message the VP Sales about X", not
  "consider outreach".

### Deal brief (AE)

Answers: *how do I move this toward a close, what's missing, and what kills it?*

- **The deal** — stage, value, expected close, what they're actually buying.
- **Health** — healthy, slipping or stalled, and why: days quiet, a passed commitment, a stage
  that hasn't moved. Be blunt. A green light on a dead deal is worse than no light.
- **The problem they're solving** — in their words, with the cost of leaving it alone.
- **What good looks like to them** — the outcome they said they want, not the feature they asked
  about.
- **The committee** — champion, economic buyer, blocker, and the ones we haven't met. For each:
  what they care about and where they stand. Name who is MISSING — single-threaded is a risk,
  not a gap.
- **What they've said** — the quotes that matter, dated. Objections, requirements, hesitation.
- **Risks** — pricing, timing, authority, a competitor, a technical requirement, an unanswered
  security question. Say which one you'd bet kills it.
- **Commitments** — what each side promised and whether it happened. An overdue promise of OURS
  is the first thing to fix.
- **Open questions** — what we'd still need to know to forecast this honestly.
- **The move** — the next step that advances the stage, and who it's on.

### Customer brief (CS)

Answers: *are they getting value, will they stay, will they grow?*

- **What they bought** — package, seats, term, renewal date.
- **Why they bought** — the original pain and the outcome they were promised. That's the bar.
- **What sales promised** — commitments made in the deal, especially any still outstanding. The
  handoff is where value quietly dies.
- **Where the rollout is** — onboarding, integrations, migration: done, in flight, or stuck.
- **Adoption** — who's actually using it, and the direction of travel. A flat line is a signal.
- **The people** — champion, admin, sponsor, and who's gone quiet. A champion leaving is the
  highest-signal event on an account; if it happened, lead with it.
- **How they feel** — sentiment from what they actually said, with the quote.
- **Open issues** — bugs, blockers, missing pieces, and how long they've been open.
- **Health and renewal** — the honest read, the date, and what has to be true to renew.
- **Expansion** — a new team, a new use case, rising usage. Only where the record shows it.
- **The move** — the one thing to do this week.

### Leadership brief (founder, head of sales, manager — on a rep's account)

Answers: *is this deal real, is it moving, and does my rep need me?* A manager is not going to
work this account today. They're deciding where to spend an hour of their own time.

- **The call** — is this real and will it land in the quarter it's forecast for. Lead with your
  answer, not with the data.
- **Who owns it** — the rep, and how long they've had it.
- **Movement** — stage changes, or the absence of them. "Discovery for 41 days, no stage change
  since Jul 2" is the whole story on most stalled deals.
- **The risk** — the single thing most likely to kill it, and whether the rep has it covered.
- **Coverage** — who we're connected to versus who decides. Single-threaded deals are where a
  manager's help matters most, and they're invisible in a pipeline report.
- **What the rep is doing about it** — the commitments and next steps already on the record.
- **Where you'd help** — an exec-to-exec intro, a pricing call, a second thread into the
  economic buyer. Name the specific intervention, or say plainly that it doesn't need one.

Never turn this into a rep scorecard. It's a read on a deal, not on a person.

## Save it to Pages

The finished brief is filed in the workspace's **Pages** on the account it is about, where the team and every
agent can find it, versioned, with its sources. Not left only in the chat, and not written to the repo:
raw material (transcripts, emails) stays in git; the finished document lives in Pages.

- **In a coding agent:** call `save_page` once, at the end, with `kind: "brief"`, the `account`, `skill: "brief"`, the document as `markdown` with citations as [1], [2], and its `sources` in that same order (each with the `ref` the tools printed). Then give
  the operator one line: the finding, and the page link it returns.
- **In the app:** `present_brief` files it for you.

## Close the loop

The things you tell them to do are decisions. Write the recommendation down before it's acted on
(`decision.proposed` with a `decision_id`, a `rationale`, and the `evidence_ids` you reasoned
from), record what they decided, and stamp the same `decision_id` on the interaction when it
fires. Full mechanic: `../../references/decision-loop.md`.

Do not narrate this. It's bookkeeping, not part of the output.

## Rules

- **Show the evidence.** Every fact carries its speaker and verbatim quote from `get_context`.
  The quote IS the value — the operator walks in knowing the actual words, not a paraphrase of
  them. Never invent one to fill a gap.
- **A brief manages the account, it doesn't summarise it.** Every section should change what the
  operator does next. If a line wouldn't alter a single decision, cut it.
- **Say what's missing.** "No economic buyer identified", "no reply since Aug 10", "we never
  answered their security question". The gaps are the actionable part, and they're the thing a
  summary always leaves out.
- **Never pad.** Three sections of substance beat nine with filler. They're reading this between
  meetings.
- **Write in paragraphs where the substance needs them.** A section is not a bullet quota: two
  or three short paragraphs read better than six fragments, and a single line is right when
  there's a single thing to say. Bullets are for genuine lists — the committee, commitments,
  the at-a-glance vitals. Prose is for anything with a because in it.
- **The document is titled by the ACCOUNT.** A brief headed with one person's name reads like a
  dossier on them; it's a read on the company they work at, and the operator files it that way.
