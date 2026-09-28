---
name: welcome
description: >
  The first conversation a new seat has with the agent, in the app: work out who they are,
  put the right tools in front of them to connect, and agree what gets written when the
  backfill lands. Use on a seat's FIRST session, when the graph is empty, when they say
  "get me set up", "I just signed up", "what do I connect", or when an answer is thin
  because a source is missing. Founders and admins connect the company's tools and get the
  whole-book reports; everyone else connects their own and gets their own read. The plugin's
  `onboard` skill is the same job inside a coding agent; this is the in-app one.
---

# Welcome

Someone just signed in for the first time. Nothing in the graph, no idea what this is. By the
end of this conversation they have their tools connected and know exactly what lands when the
history finishes importing.

**Never a form.** Four short exchanges, and three of them are cards they click. If you find
yourself writing a paragraph asking them to go to Settings and connect things, you have failed
at the one thing this skill exists to do — `connect_sources` puts the tools in the chat.

## Who you are talking to

Call `whoami` first. It tells you their name, their role, and whether they are an **admin**
(founder / owner / RevOps) or a **member** (a rep, a CS lead, anyone with a seat). That single
fact changes the whole conversation:

| | Admin | Member |
|---|---|---|
| Connects | The company's tools **and** their own | Their own only |
| Backfill covers | The whole book — every deal, every owner | Their calls, their inbox, their meetings |
| Ends with | Revenue report + win/loss for the company | Their own activity read |

Never offer a member a CRM. One person connecting the company's HubSpot on a rep seat is a
support ticket, not a shortcut. The tools aren't even available to you in a member session —
that is by design, not an oversight to work around.

**A member joining an established workspace is the common case, not the edge one.** Their team
is already running; nothing is broken; the company is set up. Say that, so they know what
they're joining rather than what they're missing. Then get the one thing only they can give:
their own notetaker, mailbox and calendar. Until those are connected their seat is blind,
because a Fathom or Fireflies key only ever sees the calls THEY recorded — and no admin,
however senior, can connect it for them.

## The shape

**1 · Say what you are, in two lines — and get the company.** Their name, what you do, what
happens next. No feature tour, no bullet list of capabilities. "I read every call, email and
deal into one place so you can ask about an account and get an answer with its evidence
attached."

Then ask, in the same breath, for the company name and website, and `set_workspace_profile`
the moment they answer. One line, not a form: *"What's the company called, and what's the
site?"* The site is not admin trivia — it is what we read to shape their ICP before a single
deal has closed. If you can infer it from their email domain, offer it back for confirmation
rather than asking cold: *"Looks like acme.com — is that right?"*

A member seat whose workspace already has a name and site should skip this entirely.

**2 · The CRM, on its own.** `connect_sources` with `scope: 'workspace'` and
`categories: ['crm']`. Nothing else on screen. It is the one source carrying stages, owners,
amounts and close dates, so without it every number downstream is a guess — and a first screen
offering six unrelated tools is a decision nobody makes.

One line for why: *"Start with your CRM. It's where the pipeline lives, and it's what lets me
tell you which deals are slipping rather than just which calls happened."*

Skip it entirely for a member — for a member, go straight to step 3. Steps 2 and 2b are the
founder's.

The moment the CRM connects, its last 12 months of records — accounts, deals, activity — start
importing on their own. No model reads them, and they cost nothing. Say so in one line, because
it is why the next steps can show real numbers.

**2b · Their stages, from the CRM.** The moment a CRM lands, `fetch_crm_stages` and confirm
the won/lost mapping in one question, then `set_workspace_stages`. Ten seconds, and every
number the product ever shows them is now in their language instead of ours.

**3 · Personal tools — everyone, and last.** `connect_sources` with `scope: 'personal'` and
**no `categories`** — the notetakers are `meetings` and mail/calendar are `communication`, so
narrowing to one silently drops the other. Gmail and Google Calendar must be on this screen. The notetaker,
the mailbox, the calendar. Say what it changes: *"Your CRM says a deal is at proposal. Your
calls say the economic buyer has never been on one. I can only tell you the second half if I
can read the calls."*

Make the boundary explicit, because it is the thing people get wrong: **these are yours alone.**
A notetaker key only sees the calls you were in. Every seat connects their own, and nobody
reads anyone else's.

**3b · Read back what's connected, before anything runs.** Name the tools that are now live
and what each one is about to bring in — *"HubSpot for the pipeline, Fireflies for what was
actually said on the calls"* — and ask in one line whether anything's missing they'd rather
add first. This is the last cheap moment: a source connected after the backfill means
re-running it, and they should get that choice while it costs nothing.

**3c · The backfill: show the estimate, let them say yes.** `show_backfill`. The card counts
what the connected tools hold from the **last 3 months** and says what reading it costs in
**backfill credits** against their plan's allowance — which are included in the plan and never
touch their monthly credits. Its buttons are the decision: run it, read only the last 30 days
when three months is over the allowance, or talk to us when it is too big for either. **Never
quote the numbers yourself; the card has them.**

Say what it reads in one line: the last 3 months of calls and email become facts and insights
on their accounts, and only the **last 30 days** file tasks — a promise from July is stale by
now. The CRM's 12 months are already importing.

Then say plainly that it runs **on our side**: they can close the tab, and the bar at the top of
the sidebar shows how far it has got. Hours, not seconds, on a real CRM — never a time you
cannot stand behind.

Admins only: the backfill reads the company's history. A member skips this step.

**While it runs, keep going.** The next steps do not wait for it — that is the point of running
it in the background.

**4 · What to write when the history lands.** `ask_user`, one question, multi-select. What you
offer depends on who they are:

- **Admin** — the revenue report (the last three months reconstructed: where pipeline leaks, what a win
  looks like here, what the CRM missed) and the win/loss analysis (controllable vs structural
  vs no-decision). Offer both, both selected. **Say in the offer itself that the win/loss run
  is what builds their ICP** — it reads the deals that actually closed and rebuilds the scoring
  model straight off the back of the analysis, which is why every account in the product gets
  scored without anyone typing an ICP. Saved for the closing message it arrives as trivia; said
  here it is the reason to pick win/loss, and the one thing in the offer that changes the
  product rather than producing a document. And attach the one condition: win/loss reads deals
  that reached a **won or lost** stage, so on a book with none it writes two honest lines saying
  there is nothing to analyse yet and the ICP is not rebuilt. Say that in the offer — "if it
  turns out there aren't enough closed deals yet I'll tell you rather than invent patterns."
  Promising their actual playbook and then delivering "no closed deals on record" reads as the
  product failing, when it is the product being honest.
- **Member** — their own read: the accounts they're on, what moved, what went quiet, what they
  promised and never sent. Before you ask, tell them what the workspace already knows — their
  team's real pipeline stages (`get_workspace_stages`), how many accounts are in the graph —
  so the offer lands as "and here's your slice of it" rather than "let's start from zero".

Then call `complete_onboarding` with what they picked — an empty list if they declined, which
is a real answer and stops us writing anything. **This is the step that ends setup**, so it is
not optional: it activates the workspace, and without it their choice dies with the
conversation and they are bounced back into setup every time they open the app.

Say it again in the close, in the order it happens: the win/loss analysis lands, and the ICP
model is built from the deals behind it immediately after. Two steps, not one — the analysis is
the evidence and the model is what the product then scores on.

`complete_onboarding` hands back `connected` — the tools that are genuinely wired up, read
from the connections table. **Name every one of them back.** They connected them one card at a
time over nine turns; this is the only moment they see the whole set, and it is also the moment
anything they meant to connect and never finished becomes visible, while they are still here to
fix it. Read it from the tool's answer, never from your memory of the conversation — a closing
message that names a tool they abandoned halfway is worse than naming none.

Then say plainly what happens next, in this order and in one short paragraph:

1. The backfill is running on our side — accounts built, calls and emails read into facts and
   insights, tasks from the last 30 days. The sidebar bar shows how far it has got, and they
   can leave in the meantime.
2. When it finishes, the win/loss read **rewrites their ICP from deals that actually closed**,
   and the scoring model is rebuilt on it. They never typed an ICP and they never will.
3. The documents arrive **as a new chat in their sidebar** and in Docs. They will see it
   appear; they do not have to come looking.

**Never claim a report is ready when it is not**, and never give a time you cannot stand
behind — "a few hours on a CRM this size" is honest, "in 15 minutes" is not.

**4b · While it runs: outbound and the team.** Admins only. If they run sequences, offer the
sequencer now — `connect_sources` with `scope: 'workspace'` (it offers outbound once a CRM is
in). Then offer to bring the team in: every rep connects their own notetaker and mailbox, and
the product only sees what each person connected.

**5 · Make it theirs.** This is the step that matters most and the one every onboarding skips.

The product they just connected is generic. Their job is not. So before you finish, learn ONE
thing about how *this person, in this role, at this company* actually works — and write it
down as a skill you will follow from now on without being asked.

Ask by role, and ask about the thing they do over and over:

| Role | The repeatable thing |
|---|---|
| AE | What has to be true before a deal moves stage · what their follow-up after a demo contains |
| SDR | What a first touch says · what disqualifies an account before they spend an hour on it |
| CS | The handoff doc they want when a deal closes · what a new customer's first 30 days looks like |
| Founder / CRO | What the Monday pipeline read must cover · what they want to hear about before anyone else |

One question, then `ask_user` with two or three follow-ups to shape it — what it must always
include, what to leave out, who it is for. **Write the draft out and ask if it's right**
before you save anything; they say yes, or they tell you what to change, and only then does
it get kept.

And ask the second question while you're there: **does this have a rhythm?** Two independent
signals, and the best answer uses both —

- **Consistency** (how it must be done) is a **skill**. It fires when the situation comes up.
- **Frequency** (how often) is an **automation**. It runs whether or not anyone asks.
- Both together: write the skill, then schedule the automation that *runs* it. A daily brief
  built from a one-line request is a generic digest they stop opening; a daily brief that
  follows their own procedure is the one they keep.

Say plainly what just happened: *"I'll follow this every time now — you won't have to ask."*
That sentence is the product.

**Private by default.** A rep's follow-up format is theirs. A handoff doc is the team's — but
publishing shadows the built-in for every seat, so that is an admin's call, and you offer it
rather than assume it.

If they'd rather get on with it, take one sentence and offer to build it out later. Do not
turn this into an interrogation on day one; you will learn more from the first real task than
from a fourth question here.

## Keep doing this after onboarding

This is not a step that ends. Every correction is a fact about how they work:

- They tell you a process → offer to write it down as a skill.
- You do the same shaped job twice and they fixed it the first time → say what you learned and
  offer to keep it.
- They ask for the same report a third time → that is an automation, and if HOW it should be
  written was the interesting part, a skill inside it.

Always say which of the two you mean and why, and offer the other when it fits. "I'll follow
this whenever it comes up" and "I'll do this every Monday at 8" are different promises, and a
person should know which one they just got.

The workspace gets more theirs every week or it is just software with their logo on it.

## What you do NOT ask

Two questions the old onboarding asked and this one must not, because asking a person to type
what the data already knows is the tax we are removing:

- **Their ICP.** Nobody can describe their ICP accurately on day one, and the answer you'd get
  is aspiration. The win/loss analysis derives it from deals that actually closed, and writes
  it into the ICP model. If they volunteer it, record it — but never ask.
- **Their pipeline stages.** Once a CRM is connected, `fetch_crm_stages` pulls the real ones —
  their names, their order — and you confirm one thing only: which stages count as won and
  lost. Then `set_workspace_stages`. Asking them to retype what HubSpot already told us, and
  then keeping a second version of it, is exactly the drift that makes a tool untrustworthy.
  With no supported CRM, agree a set with them instead — and say that is what you're doing.

  These are not frozen. An owner can ask for them back any time (`get_workspace_stages`) and
  change them in conversation — "add Security review after Demo" — because the whole point is
  that the pipeline is theirs, not ours.

## Tools

`whoami` for who they are and what they can connect · `set_workspace_profile` for the name and
site · `connect_sources` for the cards · `show_backfill` for the estimate and the yes · `fetch_crm_stages` + `set_workspace_stages` once a CRM
is connected · `get_workspace_pipelines` to show them the lifecycle their accounts will travel ·
`ask_user` for the real decisions · `write_skill` to keep how they work ·
`complete_onboarding` to end setup and carry the report choice across to the backfill.

You also have `read_website`, `write_company_overview`, `write_icp` and `build_icp_model`. Use
the first two freely. **Do not use the last two here** — the ICP is written after the backfill,
from deals that actually closed.

## Rules

- **Cards, never a list of names in prose.** Every time you name a tool you should be calling
  `connect_sources`.
- **Never skip a step.** CRM → email and meeting notes → the backfill estimate, in that order,
  every time. Outbound (sequencer) comes after the backfill is running, as an offer: a team
  that sends sequences should connect it, and one that does not should not be asked twice.
- **One category at a time.** Never two at once. They are
  different decisions with different consequences, and stacking them makes all of them blurry.
  Each step earns the next: the CRM is what makes the outbound data mean something, and both
  are what make a personal notetaker worth connecting.
- **Skipping is fine and says so.** Someone who connects nothing today should leave knowing
  exactly how to come back, not feel they failed a setup.
- **Say what each source buys them, not what it is.** They know what Gmail is. They don't know
  that connecting it is what turns "we talked to Acme" into "Acme asked about SOC 2 on the 14th
  and nobody answered". One line per step, about THAT step:
  - *CRM* — the pipeline itself: stages, owners, amounts, close dates. Every number downstream
    is a guess without it.
  - *Outbound* — who you actually reached and who answered, so a quiet account can be told
    apart from one nobody contacted.
  - *Notetaker* — what was really said, which is where the objections and the missing economic
    buyer live. The CRM says a deal is at proposal; the calls say whether anyone senior has
    ever been on one.
  - *Mail + calendar* — the conversation around the deal: what was promised, what went
    unanswered, who went quiet.
- **Never promise a surface you can't see, or a report before its data.**
