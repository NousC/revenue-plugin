---
name: sync
description: >
  Processes a call transcript or email into the Nous graph — extracting the facts,
  Intel, buying signals, and insights, filing them, and (for a sales call) writing the call review
  that becomes its scorecard and Call page. Use when a meeting just finished, a
  new email/transcript is available, or the user says "file this call", "process
  this transcript", "catch me up on this meeting". You run the extraction yourself
  (on this agent's tokens); Nous resolves identities and scores. For importing MONTHS
  of history at once, use backfill instead.
---

# Nous sync — turn one call/email into graph

You are the extractor. Read the raw item, mine it for structure, and file it through `record` and
`record_insight`. Nous does identity resolution, ICP scoring, and memory — you never merge or
resolve entities, and you never overwrite (you observe; Nous derives the facts).

## Inputs you need
- The **FULL raw transcript** / complete email text — never a summary. Pull the entire word-for-word
  transcript from the connector (Fireflies: the full `transcript` / all `sentences`, NOT `summary`,
  `overview`, or `notes`; Granola: the full transcript, not the AI notes). A summary drops the pain,
  the objections, the exact numbers, and the buying signals — the whole point of extraction. If the
  connector call only returned a summary, fetch the full transcript before extracting; if the full
  transcript truly isn't available, say so and extract from what you have, flagging it as thin.
- Its **source** (e.g. `fireflies`, `gmail`), a **stable source id**, and the **date it occurred**.
- The **external attendees and their identifiers** — pull each person's **email** from the meeting's
  attendee list / calendar invite / email headers (the connector has these). Emails are what let you
  file each fact against the right person. Our own side (the operator and teammates) is not a subject.

## Steps

**1 — Stash the raw in git (never in Nous).**
Write the full transcript/email to `raw/<account-slug>/<YYYY-MM-DD>-<source>-<id>.md` — **one folder
per account** (the primary external attendee's company/person, from step 2). Full spec:
`references/raw-storage.md`. The path becomes the `source_ref`
(`git://<repo>/raw/<account-slug>/…`); sha256 of the file → `content_hash`. If that exact file
already exists, the item is already filed — skip the re-write.

**2 — Resolve the people first.**
Before recording anything, build the attendee → identifier map: each EXTERNAL attendee and their
precise `focus` (best first: **email** → **LinkedIn URL** → company **domain**; never a bare name).
Get emails from the meeting metadata, not by guessing. This map is what step 4 files facts against —
getting it right is the difference between a clean graph and every fact piled on one entity.

**2b — Record identity attributes (this is what gives a person a name + a company).**
For each external attendee, before the intel, record the structured attributes as `kind:'state'` —
`first_name`, `last_name`, `job_title`/`seniority` (about:'person'), plus `domain` (from their work
email) and `company` name IF found (about:'company') — per `references/claim-extraction.md` STEP 0.
The `domain` is what creates + links the company entity; the `company` name is best-effort (never the
person's name). Skip our own side and free-email domains.

**3 — Record the interaction.**
`record(focus=<the PRIMARY external attendee's email — never our own side>, observations=[{
  kind:'event', property:'interaction.meeting_held' (or 'interaction.email_received'/'..._reply'),
  value:{ summary:'<one line>', attendees:[...] },
  source:'<source>', method:'extraction',
  observed_at:'<ISO occurred_at>',
  external_id:'<id>:interaction',
  source_ref:'git://<repo>/raw/<account-slug>/<date>-<source>-<id>.md', content_hash:'<sha256>' }])`

**4 — Extract facts about the contacts.**
Follow `references/claim-extraction.md` exactly — the three bars, the 13 categories, the pronoun
rule, the verbatim `quote` + `speaker` on every fact, and the output JSON. Produce the facts array.

**5 — File each fact against the RIGHT person.**
This is the step that keeps the graph clean. A fact about "George" MUST land on George's record, not
on the meeting host or one catch-all entity. For every fact:
- Match it to the external attendee it names, and look up their `focus` from the step-2 map (email →
  LinkedIn URL → company domain). If the fact is `about:'company'`, focus the person and set
  `about:'company'` — the engine routes it to the company for you.
- Record it: `{ kind:'state', property:'intel', value:{ category, content, label, about, quote,
  speaker, entity?, stance?, status?, hardness? }, source:'<source>', method:'extraction',
  observed_at:'<ISO>', external_id:'<id>:intel:<index>', source_ref:'git://…' }`
- **Carry `quote` and `speaker` through verbatim.** They are the evidence shown to the user under
  the fact, and they are what makes it checkable rather than something to take on faith. Never drop
  them to save space, and never fill an empty one in yourself.
- **Batch by person** — all of ONE attendee's facts in a single `record` call, `focus` = that person.
- If you truly cannot resolve an identifier for an attendee, **skip their facts and note it** — never
  dump them onto the meeting owner or a random entity.

**6 — Extract insights about US.**
Follow `references/insight-extraction.md` — anchor on WHO WE ARE first, the four bars, the hard
attribution rule. Produce the insights array (product/positioning/market/buyer).

**7 — File the insights.**
`record_insight(insights=[...], source_label:'<account> — <call type>', occurred_at:'<ISO>')`.

**7b — Review the call (sales meetings only).**
For a meeting with a full transcript and an external attendee, follow `references/call-review.md`:
classify it, and if it is a **sales** call, score the rubric (1–10 per dimension, team graded, talk
time measured), write the summary / verdict / went well / improve, and send it with ONE `record` call
as a `call_review` observation. Nous stores the scorecard (Coaching) and files the **Call page** on
the account — the same page the app writes. Skip emails, internal calls and non-sales calls.

**8 — Write a one-line brief to git** at `briefs/<account>/<date>-<id>.md` (2–3 sentences) for your
own future reference. Do NOT send it to Nous.

**9 — Record the watermark** so the next run doesn't reprocess this item.

## Rules
- **Attribution over volume.** One fact filed on the right person beats ten piled on the wrong
  entity. Resolve `focus` per person (step 2) and file per person (step 5) — never a catch-all.
- **Retry, don't drop.** If a `record` / `record_insight` call fails with a transient error
  (connection closed, timeout, 5xx), retry up to 3 times with a brief pause before moving on. Only
  skip after retries fail, and say which item you skipped.
- **Idempotency:** always set `observed_at` (the real date) and a **distinct** `external_id` per
  observation (`<id>:<property>` / `<id>:intel:<index>`). Re-running this on the same item must be a
  no-op — interactions/facts dedup on `external_id`.
- **Full transcript, never a summary.** Extract from the complete word-for-word transcript, not the
  connector's AI summary/overview — summaries drop the pain, objections, numbers, and signals.
- **Raw → git, structure → Nous.** Never send a transcript or a full brief to Nous.
- **Never invent.** If the item is thin and nothing clears the bars, record just the interaction and
  stop. `[]` is a valid extraction result.
- **Never our own side.** Determine your own workspace's domain (from `whoami` / the operator's
  email) and treat any attendee on that domain — or any known teammate — as internal: no identity
  attributes, no facts, never a subject. Free-email domains (gmail/outlook/…) are people, not companies.
- **Identity resolution — one person, one record, across every meeting.** You never merge or create
  entities; the engine resolves each `focus` to an entity (exact match on email / LinkedIn URL /
  domain) and dedups. Your job is to make it land on the same record every time: key a person by the
  SAME identifier — **email first**, then LinkedIn URL, then domain — so five meetings with one email
  collapse into one record with five interactions. When you know more than one identifier for a
  person (email AND their LinkedIn URL), record both so the engine cross-links them — a later item
  that only carries the LinkedIn still resolves to the same person. `first_name`/`last_name` (step 2b)
  power the engine's name-fallback, which attaches a name-only item to the existing person instead of
  forking (it refuses to guess on ambiguity). Can't resolve any stable identifier for someone? Skip
  them and say so — never invent one, never pile them on a catch-all.
