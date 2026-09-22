---
name: meeting-prep
description: Preps you for ONE specific meeting — finds the meeting on the account, reads everyone on the invite (their side and ours), and writes the meeting brief — purpose and objective, deal overview, what changed since the last call, the attendees and who they are, the context to have in mind, open items, risks and signals, and the outcome to push for. Use when the user says "prep me for my meeting", "prep me for today's call with", "meeting prep", "brief me before the call", "who's on my call with", "what do I need to know before I meet", or names an upcoming meeting by time or title. For a general read on an account with no meeting in view, use `brief`.
---

# Meeting prep

One meeting, read before it happens. Not a brief on a company and not a dossier on a person: the
operator is about to sit down with specific people for a specific reason, and this document tells
them why the meeting exists, who will be there, where things stand, and what to walk out with.

## The meeting is on the account

Everything we know about a meeting is already on the account it belongs to. The calendar invite was
ingested onto the record, with every guest on it. **Never go to a calendar, an inbox or any live
source to find it.** Read the account.

## Tools

- `whoami` — the operator's role and name, so "our side" and the objective are written for them.
- `get_context` with `intent: "meeting_prep"` — **start here, once.** Its FIRST field is
  `meetings`: the account's NEXT meeting and its LAST one, each with every attendee on the invite
  (name or email, title, company, side, organizer, entity id), plus what else is coming up. After
  it come the deal, the buying group and what was last said.
- `get_account` — the compact record for each OTHER attendee: who they are, what they have said,
  their activity. Use it for attendees, not another `get_context`: a meeting_prep context is large,
  and one per attendee fills the room you need to write in.
- In the app, `calendar` lists meetings by time window, only when the operator names a meeting that
  is neither `meetings.next` nor in `meetings.upcoming`.

## Workflow

Three steps of tool calls, then the document. The agent has a fixed number of steps per answer,
and a prep that keeps searching never gets written.

1. **Find the meeting — one call.** `whoami` and `get_context` with `intent: "meeting_prep"`
   together, in the same step. Focus it on the most precise thing the operator gave: an attendee's
   email or entity id, then the company's domain, then a name. The meeting is `meetings.next`
   unless they named another: match on title or date against `next` and `upcoming`. **If
   `meetings` came back, you have the meeting and everyone on it — do not search, query or read a
   calendar for it.** If two meetings genuinely fit, ask once which one, in one line. If there is
   no upcoming meeting, say so and offer a `brief` instead of prepping a meeting that does not
   exist.
2. **Read the other attendees — one step.** `get_account` for every external attendee with an
   `entity_id` other than the one you already read, up to six, all in the SAME step. Our own people
   (`side: "internal"`) need no lookup: who ran the last call matters, their record does not. An
   external attendee with no `entity_id` is still in the meeting: list them by email and say we have
   nothing on them yet.
3. **Fill one gap, only if it changes the brief.** One `get_account` or `get_context` for a specific
   missing piece — the last call's objection, a commitment. Skip it when you have enough.
4. **Write the brief** in the structure below, then save it (see "Save it to Pages").

## A meeting with several companies

A group call — founders from three companies, a partner and a client together — has no single deal.
Read `company` on each external attendee. When they span more than one company:

- **Deal overview** becomes one or two lines PER COMPANY: where that relationship stands, stage and
  value where there is a deal, or "no deal on file" plainly.
- **Changes since the last call** and **Risks and signals** name the company each line is about.
- **Recommended outcome** is what to walk out with from the group, then one line per company where
  there is a specific ask.
- Save it on the company of the attendee the operator named first.

## The structure

Headings are in sentence case, exactly as written here. **Leave out any section with nothing real
behind it** rather than writing that there is nothing: an empty heading is worse than a missing
one.

**Title:** the meeting's own title, as invited. The first line under it: the date and time, and the
account. "Monday, September 14 · 1:00–2:00 PM · Autocorp"

### Purpose and objective
Two bullets.
- **Purpose:** why this meeting exists, from the record: the demo promised on the last call, a
  renewal review, a first intro. Name where it came from.
- **Objective:** what we want out of it, stated as an outcome the operator could check afterwards.
  "Agree a two-week pilot with Collin as owner", never "build rapport".

### Deal overview
Two or three sentences: stage, value, health and the direction it is moving, and the one thing the
deal currently hinges on. Blunt. A healthy label on a stalled deal is worse than no label.

### Changes since the last call
Dated bullets, newest first: replies, stage and health moves, new people on the thread, signals,
commitments that were met or missed. Open with when the last call was and who was on it. On a first
meeting, leave the section out.

### Attendees
A `table`, their side first, then ours:

| Name | Company | Title | Role in the deal | Last contact |
|---|---|---|---|---|

- **Role in the deal:** decision maker, champion, technical evaluator, blocker, end user, new
  contact, or for our side what they did ("led the first call").
- **Last contact:** the date we last spoke with them, or "None" for someone we have never met.
- An attendee with no record keeps their email as the name and "Unknown" where we know nothing.

Below the table, one line on anything the invite itself tells you: a new face nobody has met, a
decision maker joining for the first time, someone from the last call who is not on this one.

### Attendee profiles
A short paragraph for each external attendee we know something about: their background and remit,
what they care about, and what they have said to us, quoted with the date. Someone with no record
gets one line saying so and what would be worth finding out.

### Key context
Five to ten bullets: the facts worth having in mind in the room, each cited. Their stack, their
constraints, a number they gave, a competitor they mentioned, a requirement they stated. Facts, not
advice.

### Open items
Commitments on both sides, overdue first: what was promised, by whom, when, and whether it happened.
An overdue promise of ours is the first line.

### Risks and signals
Bullets grouped under the categories that apply, in this order: **Deal**, **Relationship**,
**Technical**, **Commercial**, **Timeline**. Every objection is quoted with the date it was raised
and whether it has been answered. Positive signals belong here too. Skip a category with nothing in
it.

### Recommended outcome
Three lines.
- **Push for:** the one outcome that moves the deal.
- **Ask for:** the concrete next step to propose before the call ends, with a person and a date.
- **Fallback:** what to settle for if they won't commit.

## Save it to Pages

The finished brief is filed in the workspace's **Pages** on the account, where the team and every
agent can find it, with its sources. Raw material (transcripts, emails) stays where it is; the
finished document lives in Pages.

- **In a coding agent:** call `save_page` once, at the end, with `kind: "meeting_brief"`, the
  `account`, `skill: "meeting-prep"`, the title set to the meeting's title, the document as
  `markdown` (the attendees as a markdown table) with citations as [1], [2], and its `sources` in
  that same order (each with the `ref` the tools printed). Then give the operator one line: the
  objective, and the page link it returns.
- **In the app:** `present_document` with `kind: "meeting_brief"`, `focus` = the account, `title` =
  the meeting's title, and one section per heading above. The date line goes in `headline`. The
  Attendees section is a `table` block; every other section is `body` prose or bullets. Then one
  line in the chat: the objective for the call.

## Rules

- **Find, don't ask — and don't search.** The meeting, its attendees and the deal are all on the
  record, and `get_context` hands over the meeting first. Ask the operator only when two meetings
  genuinely fit.
- **Everyone on the invite is in the brief.** A guest we have no record of is a finding, often the
  most important one: a new person in the room changes the meeting.
- **Show the evidence.** Every fact carries its date and, where there is one, the speaker's own
  words. Never invent a quote to fill a section.
- **Written for this meeting.** Every line should change what the operator says or asks in the
  room. Account history that does not bear on this call stays out.
- **Say what's missing.** No decision maker on the invite, no answer to their last objection, no
  contact with an attendee since July. The gaps are the part a summary leaves out.
- **Plain register.** Follow `../../references/language.md`: numbers and names in every line,
  absolute dates for what is scheduled, no filler.
