# Call review (the scorecard + Call page)

Ported from Nous's server-side call review (`buildCallScorePrompt`). Apply it to a meeting transcript
**yourself** — you are the model — then send the result through `record` as a `call_review`
observation. Nous parses it against the workspace rubric and stores it exactly like a review the app
wrote: the call's host and team, `call_scorecards` (Coaching), and the **Call page** filed on the
account in Pages ("Call summary — <call> — <date>"). Nous does not run a model on it.

## When to review
- Only a **meeting with a full transcript** (≥200 characters) and at least one **external** attendee.
- Only a **sales** call — see step 1. Internal calls, investors, partners, recruiting: no review.
- In a **backfill, only meetings from the last 30 days** (a ruling: history reviews matter less than
  current ones). In `sync` (a just-finished call), always.

## Step 1 — classify the call
- `sales`: someone from our team talking with a prospect or customer about buying, using, renewing or
  expanding — discovery, demo, proposal, negotiation, close, a paid pilot or onboarding kickoff.
- `internal`: only people from our own team.
- `other`: anything else (investors, partners, recruiting, vendors, peer groups, personal).

If it is not `sales`, stop: do not send a review.

## Step 2 — know who was on the call
Use the attendee map from `sync` step 2 (emails + names from the meeting metadata). Split them:
- **Our team (the sellers):** our own side — the operator and teammates (our domain, members).
- **The buyer side:** everyone external, with their company.

Never invent a name, and never give anyone a job title the transcript does not state outright. When you
cannot tell who said a line, write "the buyer" or "the team", not a guessed name.

**Speaker labels:** a Granola transcript only marks lines as the recorder's microphone ("me") or
everyone else ("them"). Teammates on the call are inside "them" — tell them apart from what is said.
Fireflies, Fathom and Fellow name every speaker.

**Grade the team, not one person.** When more than one teammate is on the call, score how the team ran
it together and credit each good or weak moment to the teammate it belongs to, by name.

**Talk time — measure it, don't guess it.** With named speakers, count words per speaker and give the
team's share (e.g. "our team 62% — Aakash 45%, Bennet 17%; Collin 38%"). With a Granola me/them
transcript, use the recorder's share of speaking time. Grade Talk / listen on that number.

## Step 3 — score the rubric
The default rubric (the workspace may have its own — Nous rejects unknown keys and tells you which to use):

| key | Dimension | Weight | Good looks like |
|---|---|---|---|
| `discovery` | Discovery | 25 | Uncovered the real pain, why now, its business impact and who decides, and anchored it in numbers rather than surface interest. |
| `rapport` | Rapport | 10 | Built genuine trust: listened, used names correctly, kept it peer-to-peer rather than vendor-to-buyer. |
| `objection_handling` | Objection handling | 20 | Objection named, answered with proof, and confirmed it landed, not dodged or left hanging. |
| `demo` | Demo | 15 | Showed the product against this buyer's own pain and stack rather than a feature tour, and checked it landed. |
| `close` | Close & next steps | 20 | Asked for the commitment and left with a specific, dated next step with an owner, not "I'll send info". |
| `talk_listen` | Talk / listen | 10 | Let the buyer talk: the rep speaking roughly 45% or less, asking and listening rather than monologuing. |

Discovery also grades against the team's methodology (MEDDICC by default: metrics, economic buyer,
decision criteria, decision process, identify pain, champion, competition).

For EACH dimension:
- `score` — an integer **1–10** for how well the team did on it in THIS call. 5 is ordinary, 8 is strong, 10 is rare.
- `note` — 4–7 plain sentences: what was done, quoting at least two short verbatim lines in double
  quotes; exactly what was missed or left unasked; what a stronger rep would have done at that moment.
  No praise padding.
- `moment` — the single most representative verbatim line for the score, or `""`.

Every quote is copied verbatim from the transcript. Never compose one.

## Step 4 — write the page text
- `summary` — two paragraphs, 7–12 sentences. First: who the buyer is (company, the people on the call,
  what they run today, their size and situation), what they need and why now. Second: what was
  discussed or shown, the concerns and objections raised, what the deal now turns on, and exactly
  where it stands, including agreed next steps with owners and dates.
- `verdict` — 3–5 sentences: what the team did best, the biggest miss, and what that miss puts at risk.
- `went_well` — an array of 2–4 items, each one sentence naming a specific moment worth repeating.
- `improve` — an array of 2–4 items, each one concrete action (what to do differently, or before the next conversation).
- `next_step_secured` — true only if a specific, dated next step with an owner was agreed on the call.

## Step 5 — send it
One `record` call, `focus` = the primary external attendee's email:

```json
{ "kind": "state", "property": "call_review", "source": "<granola|fireflies|fathom|fellow>",
  "method": "extraction", "observed_at": "<meeting start, ISO>",
  "external_id": "<meeting id>:call_review",
  "value": {
    "source": "<granola|fireflies|fathom|fellow>",
    "meeting_id": "<the note-taker's meeting id>",
    "title": "<the meeting's own title>",
    "url": "<link to the call in the note-taker, if you have it>",
    "occurred_at": "<meeting start, ISO>",
    "attendees": [{ "email": "...", "name": "..." }],
    "organizer_email": "<who set up the meeting, if known>",
    "recorder_email": "<whose note-taker recorded it, if not you>",
    "named_speakers": true,
    "review": {
      "call_type": "sales",
      "summary": "...", "verdict": "...",
      "went_well": ["..."], "improve": ["..."],
      "dimensions": [{ "key": "discovery", "score": 7, "note": "...", "moment": "..." }],
      "next_step_secured": false
    }
  } }
```

`attendees` lists **everyone** you can identify on both sides — Nous uses it to find the team, credit
every teammate on Coaching, and file the page on the buyer's account. The meeting's own people must
already be recorded (sync step 2b), so their records exist.

**Read the reply.** `record` answers with one of:
- `Call review stored: 7.3/10 … Call page: <url>` — done; mention the page in your report.
- `not stored: … a <type> call` — you sent a non-sales call; nothing was written.
- `rejected: … Use these dimension keys: …` — the workspace has its own rubric; re-score with those keys.

If the reply shows none of these lines (an older connector), confirm with `get_account` on the buyer:
its **LAST CALL SCORE** block shows the stored review.

Re-sending a review for the same meeting replaces it (the Call page gets a new version). A review for a
call another teammate's note-taker already opened is merged into that call, not duplicated.
