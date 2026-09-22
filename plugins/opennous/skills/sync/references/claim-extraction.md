# Claim extraction (facts about the contact)

Ported from Nous's server-side extractor. Apply this to a transcript/email **yourself** — you are
the model. Produce the JSON, then write it via `record`. Extract about the EXTERNAL people (the
prospect/customer side), never about us.

## STEP 0 — identity attributes FIRST (before any Intel)

Before the Intel below, record the **structured attributes** for each external attendee. This is what
gives a person a name and a company on the record (without it they show as a bare email), AND it is
what lets identity resolution attach repeat meetings to the same record. Record these as
`kind:'state'` observations via `record` (NOT as intel notes):

**On the person** (`about:'person'`):
- `first_name`, `last_name` — the person's real name, from the transcript / attendee list / email
  signature. If you genuinely can't find it, skip it — never guess.
- `job_title`, `seniority` — only if actually stated (you'll often have these from the same lines that
  produced the `authority` intel).

**On their company** (`about:'company'`, focus = the person — the engine routes it to the company and
creates/links the company entity):
- `domain` — **derive from the work email** (`jack.cane@revenanas.com` → `revenanas.com`). This is the
  reliable key that identifies + creates the company. Record it whenever there's a work email.
- `company` — the company **name**, ONLY if you actually find it in the transcript/metadata
  (e.g. "Alibaba Cloud"). **Never use the person's name as the company.** If the name isn't stated,
  leave it empty — the `domain` alone lets the engine create the company; the name can be enriched later.

Do NOT record identity attributes for our own side (the operator/teammates — see the internal-domain
guard in the sync skill). Skip a free-email domain (gmail.com, outlook.com, …) as a company `domain`.

Everything below (the Intel) is recorded IN ADDITION to these attributes, not instead of them.

## Anchor: what WE sell (read once per run)

`get_context` on any account returns a **YOUR CONTEXT (ICP / product / positioning)** block. Read it
once before extracting: it is what WE sell, in our own words. The `competitor` category is judged
against it: a competitor is a product that does the job described there, and nothing else. The app's
extractor gets the same anchor from the workspace's Positioning document, so both land the same facts.

## What to record

For each external attendee, record facts drawn from what THEY reveal about themselves, their
company, needs, constraints, opinions, or plans. ALSO record facts about the RELATIONSHIP between
the attendee and us: how they found us or why they reached out (a video, post, referral, event),
anything they offered us or intros they can make, and any objection/critique they raised about our
product or how we differ from alternatives.

Do NOT turn OUR OWN questions or statements into facts about them (if we asked "what's behind your
product?", that is not a fact that they're interested in our product). But an offer, an intro, a
critique, or a reason-for-reaching-out that they genuinely voice IS a fact and must be recorded.

## The three bars — a fact qualifies ONLY if it passes ALL THREE

1. **DURABLE** — still true weeks or months from now. A meeting time, availability, or reschedule is
   NOT durable. EXCEPTION: a buying signal (asked for the agreement/contract, accepted/agreed to
   pricing, gave a verbal commit, asked to start/onboard) is decision-critical the instant it
   happens — record it as `buying_signal` even though it's momentary.
2. **DECISION-RELEVANT** — it would change how someone sells to or works with them: their budget,
   authority, pain, goals, stack, or buying timeline — OR how the relationship should be worked (how
   they found us, what they offered, the objection they raised).
3. **SPECIFIC** — carries the concrete detail or the WHY, not a vague label. "Evaluating Clay vs
   Apollo because Apollo's data went stale", not "looking at tools".

## NEVER record (noise, or it lives elsewhere)
- Meeting logistics: scheduling, availability, reschedules, "has a call on X", invites.
- Generic sentiment, small talk, greetings, pleasantries.
- Anything true today but meaningless next week.

## Categories — tag each fact with exactly one `category`

- `status_quo` — how they work today (tools, vendor, process, stack). **Every tool in their stack that does something OTHER than what we sell belongs here** — their CRM, call recorder, meeting-notes or agenda tool, data vendor, automation tool — including one they plan to replace. e.g. "Acme runs outbound on Apollo and Instantly today."
- `goal` — an initiative, priority, or outcome they're chasing. e.g. "Wants to consolidate enrichment vendors before end of Q3."
- `pain` — a stated problem/frustration with the concrete reason. e.g. "Clay's list-building is bottlenecked by manual work."
- `objection` — a concern/pushback/challenge to us (price, security, timing, switching cost, competitor loyalty, "how are you different"). e.g. "Questioned how we differ from Fireflies that already syncs notes to the CRM."
- `authority` — buying role and decision power (champion, blocker, economic buyer, end user). e.g. "Owns the GTM-tooling budget; spend over $50k needs VP sign-off."
- `budget` — budget size, procurement, or a commercial constraint. e.g. "Has roughly $30k a year earmarked for GTM data tooling."
- `timeline` — a buying/project timeline tied to a business reason (never a meeting time). e.g. "Evaluating vendors this quarter, driven by a budget review."
- `buying_signal` — explicit deal-progression: asked for the agreement/contract, accepted pricing, verbal commit, asked to start/onboard. e.g. "Asked us to send the agreement and confirmed they'll prepay $2.5k to start."
- `preference` — how to work with them (channel, cadence, style, format). e.g. "Strongly prefers tools with a native API over no-code builders."
- `competitor` — a product that does **the job WE sell** (per YOUR CONTEXT): an alternative to us they use, are evaluating, compared us with, or tried and dropped — why, and how loyal they are. **Never a tool in their stack that does something else** (that is `status_quo`). A person on the call explicitly calling something our competitor counts. e.g. "Evaluating Gong forecasting alongside us, but says its price rules it out."
- `discovery` — how the relationship began (content/channel/post/referral/event) and why they reached out; always from THEIR side. e.g. "Priya found us through our YouTube video on open-source GTM and reached out on LinkedIn."
- `relationship` — a durable connection (reports-to, referred-by, mutual connection, community, or an offer to introduce). e.g. "Offered to introduce us to seed- and YC-stage founders in his network."
- `general` — durable, decision-relevant context fitting none of the above. e.g. "Plans to hire 2 SDRs once the team passes $50k MRR."

## Categorization discipline (read before you tag)
- **Use ONLY these exact category keys** — copy them verbatim, never a synonym:
  `status_quo · goal · pain · objection · authority · budget · timeline · buying_signal · preference · competitor · discovery · relationship · general`.
  It is `timeline`, NOT "timing". A wrong key silently breaks reporting.
- **Pick the MOST SPECIFIC category. `general` is a LAST RESORT**, not a default. Before you ever
  write `general`, check the fact against each of these first — they are the ones most often missed:
  - Do they describe how they work today, their current tool/vendor/process? → **`status_quo`**
  - Does a tool they mention do what WE sell, or is it just part of their stack? Only the first is
    **`competitor`**. Their CRM, call recorder, notes/agenda tool, data vendor = **`status_quo`**,
    even when they dislike it or plan to switch off it. (We learned this the hard way: Fellow,
    JustCall and ZoomInfo were filed as competitors of a revenue-intelligence product.)
  - Is it a problem, friction, or frustration (with the why)? → **`pain`**
  - Is it something they want to achieve / an initiative? → **`goal`**
  - Is it how they like to be worked (channel, cadence, format, API-vs-nocode)? → **`preference`**
  - How the relationship began / why they reached out? → **`discovery`**
  - A durable tie / referral / intro offer? → **`relationship`**
- Most facts from a real sales call are `status_quo`, `pain`, `goal`, `competitor`, or `budget`. If
  more than a third of a meeting's facts landed in `general`, you under-categorized — re-read and
  reassign them. A rich founder call should surface several `pain` and `status_quo` facts.
- Only use `general` when the fact is genuinely durable + decision-relevant but fits NONE of the 12.

## Field rules
- Each fact is ONE self-contained sentence that **names its subject explicitly at least once, and
  carries no ambiguous pronoun** (never "you/your", never speak as them with "I/my"). Once the
  person is named, a later "they" in the same sentence is fine and reads better than repeating the
  name. "us/our/we" for our own side is fine. The rule exists so the fact resolves to one person
  standing alone — not to force stilted third-person prose, which then leaks into every draft
  built on it.
  ❌ "Jack Cane stated that Jack Cane's team evaluated Clay before Jack Cane chose Apollo."
  ✅ "Jack Cane's team evaluated Clay and chose Apollo because they needed a native API."
- `about` = "person" (about the attendee) or "company" (about their company; inherited by the whole account).
- `label` = a 2–4 word Title Case tag naming the SUBSTANCE (not the person's name). For a competitor
  use the vendor name ("Pearl Lemon"); for an objection name it ("Outbound intent doubts"); for a
  pain/goal name it ("Stale Apollo data").
- Context tags (only for the category that carries them):
  - `competitor`: `entity` = the vendor name; `stance` ∈ evaluating (a live alternative they're weighing against us) | incumbent (they use it FOR THE JOB WE SELL) | past_failure (tried it for that job and it failed — an opening) | mentioned.
  - `objection`: `status` ∈ open | resolved | addressed; `hardness` ∈ hard | soft.

### `quote` and `speaker` — the evidence. Every fact carries them.
A fact without its evidence is an assertion the user has to take on faith. These two fields are what
make it checkable, and they are shown to the user under every fact.

- `quote` — **the verbatim line from the transcript or email that produced this fact.** Copy it
  exactly, word for word, including the way they actually said it. Max ~30 words: take the most
  telling fragment, not the whole paragraph. **Never reconstruct, paraphrase, clean up, or compose
  it.** If you cannot point at real words that produced the fact, the fact did not clear the bars —
  drop the fact, don't invent the quote.
- `speaker` — the NAME of the person who said it. Just the name.
- If the fact comes from something with no quotable line (a calendar attendee list, an email
  signature, a CRM field), leave both `""`. An empty quote is honest. A manufactured one is the
  worst thing you can put in the graph, because it looks like proof.

The rule is the same one `insight-extraction.md` already applies to insights. A quote is something
they said, never something you wrote.

**Worked example.** From a line in the transcript:

> **Taimoor:** yeah honestly I don't trust Clay is gonna be around in two years, so we're pulling
> reporting and invoicing into Claude Code instead

```json
{"content":"Taimoor Ali is moving 7xGTM's reporting and invoicing off Clay into Claude Code because he doubts Clay's longevity.",
 "label":"Clay Displacement","category":"status_quo","about":"company",
 "quote":"I don't trust Clay is gonna be around in two years, so we're pulling reporting and invoicing into Claude Code instead",
 "speaker":"Taimoor Ali"}
```

Note the `content` is a clean third-person sentence and the `quote` is exactly what he said, filler
and all. Do not tidy the quote to match the content.

## Discipline
- Extract EVERY fact that clears all three bars — no target number. A thin message yields none or
  one; a rich meeting yields many. NEVER pad, NEVER split one fact into several, NEVER restate one
  fact in different words. Quality over quantity. If nothing clears the bar, return `[]`.
- Hard ceiling ~12 facts for a meeting (a safety limit, not a goal).

## Output — ONLY valid JSON
```json
[{"content":"...","label":"2-4 word tag","category":"<key>","about":"person|company","quote":"<verbatim line that produced this fact, or \"\">","speaker":"<who said it, or \"\">","entity":"<competitor only>","stance":"<competitor only>","status":"<objection only>","hardness":"<objection only>"}]
```
If nothing meaningful: `[]`
