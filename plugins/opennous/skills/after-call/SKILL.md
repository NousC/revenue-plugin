---
name: after-call
description: >
  Runs right after a call ends — drafts the follow-up in the channel the conversation lives in
  (email or LinkedIn) and writes a coaching review of how the call went. Normally fired
  automatically by the after-call GitHub Action (the automation layer) the moment a meeting is
  recorded, but you can also run it by hand: "review my last call with [account]", "draft the
  follow-up for that meeting", "how did that call go". One account, one just-ended call.
---

# After-call — draft the follow-up, coach the call

The moment a call ends, do the two things a good operator does before they forget: get the
follow-up drafted while it's fresh, and honestly review how it went. You produce **drafts and
notes as files** — you never send anything.

**The division of labour (read this first).** OpenNous is the brain: it extracts the call, scores it
against the team's rubric, stores the scorecard, and accrues the trend over time — the valuable
structured coaching that persists and is presented in the app's Coaching page. **This skill is the
scribe and the hands:** after the call is processed, you READ that structured coaching out of the app
and WRITE it into the rep's git as a readable review, plus draft the follow-up. You do not re-extract
and you do not re-score — you turn what the app knows into a document a human reads and an action they
can send. Same call, two ends: the app is where coaching accrues and is seen; the git is where the
written review and the draft land.

## Where the trigger comes from
This skill is the payload of the **after-call workflow** (see the `automate` skill). When a meeting
is recorded, Nous fires a GitHub `repository_dispatch` and the workflow runs you headlessly with a
`client_payload`: `{ workspace_id, event_type, entity_id, occurred_at, source }`. Use `entity_id`
and `occurred_at` to find the exact call. Run by hand and you resolve the account from what the user
named instead.

## Scope guard (important for teams — but ONLY for members)
The dispatch fans out to every automation-enabled seat, so on a **team** you don't want three reps
drafting the same call. Check `whoami`:
- **Admin / founder scope → always proceed.** An admin owns the whole workspace, so a strict
  "is this account on my worklist" check would stop *every* call on a solo admin seat, forever,
  silently. Never gate an admin.
- **Member scope → keep the check.** If the account isn't in `query(scope:{attention:"mine"})`, stop
  quietly — another seat owns it and will handle it.

## Workflow
1. **Load the call — read, don't re-extract or re-score.** The server already extracted this call's
   claims, objections, competitors, and intel AND scored it against the rubric when it was ingested
   (both run server-side on every plan, the moment the meeting lands). So **call opennous to GET them**
   — `get_account` (or `get_context`) on `entity_id`. The response carries a **`LAST CALL SCORE`**
   block: the overall, whether a next step was secured, and each rubric dimension with its score, a
   one-line note, and the exact moment quote. That block IS your coaching — do not recompute it. Read
   the raw transcript from the repo (`raw/<account-slug>/<date>-*-*.md`) only for extra *nuance* the
   score doesn't spell out (tone, a specific line to quote back). Find the just-held meeting by
   `occurred_at`.
2. **Pick the channel.** Read the account's recent interactions: if the live thread is **email**,
   draft an email; if it's **LinkedIn**, draft a LinkedIn message; if both, prefer the one the last
   inbound came on. Honour `channel` in `.nous/automation.json` when the user pinned one.
3. **Draft the follow-up — in the user's voice.** Reference what was actually said (a real next step,
   an answer you promised, the objection you're resolving). Follow the drafting-voice rules (the
   message body goes out as the user, in their voice — see `reach-out`). Write it to
   `drafts/<account-slug>/<YYYY-MM-DD>-follow-up.md` with a one-line header naming the channel and
   the recipient. **Never send it** — it's a draft the user reviews. Then **flag it for review**:
   `record` on the account a state signal `property:'signal.follow_up_ready'` with
   `value:{draft_path, channel, drafted_at}` — that is the "you have a follow-up to review and send"
   item that surfaces on the Custom-plan worklist (the draft prose stays in git; this is only the
   signal). One per call.
4. **Write the call review — the document version of the app's coaching.** The valuable structured
   coaching lives in OpenNous: the server scores the call against the team's rubric and stores the
   scorecard (discovery, talk ratio, objection handling, next-step secured, methodology adherence),
   the objections, and the moments. You do not compute the score — you **read it and write it out** as
   the readable review a human actually opens. Pull the scorecard for this call from OpenNous, then
   write `coaching/<YYYY-MM-DD>-<account-slug>.md`:
   - where the deal stands now and how the call went, framed around the rubric scores,
   - for each weak dimension, the **exact moment** (quote) that pulled it down — the "here's the
     sentence" that makes it coachable, not just a number,
   - the objections that came up and how they were handled (and any left open),
   - whether a dated next step was secured (owner + date) — the single biggest predictor,
   - one or two specific things to do differently next time, tied to the weakest dimension.
   Ground every line in the app's data and the transcript; no invented quotes, no filler praise. (If
   the app hasn't scored the call yet, write the review from the extracted objections + next-step and
   note the scorecard is pending — never invent scores.)
5. **Record only what's genuinely new — don't re-extract.** The objections, competitors, and intel
   from this call were already pulled out by the server's ongoing extraction when the meeting landed,
   and they already feed the app's **Coaching page** (the objection library) and role reporting. So do
   NOT re-record them. Record only a coaching-specific signal that extraction doesn't produce — above
   all **whether a dated next step was secured** — and `record_insight` anything the call taught us
   about our own product/positioning. Idempotent `external_id`s. (This is the division of labour:
   OpenNous extracts and aggregates; the skill reads that and adds the per-call judgement + the draft.)
6. **Sales page (optional).** If `automation.page` is on, hand off to the `sales-page` skill for this
   account — it builds a personalized, on-brand page from the same context and hosts it on the user's
   Vercel. Skip it otherwise — the draft + coaching are the core.

## Output back to the user
When run by hand, show a tight summary inline: the deal's state in a sentence, the one thing to fix,
the next step (or that none was secured), and the draft path. Don't paste the whole draft. When run
headlessly, the workflow commits the files — say nothing to a human.

## Where it's saved (git vs app — the division of labour)
The per-call artifacts this skill GENERATES are call-specific judgement, not something OpenNous
stores — so they live in the **user's own git**, in fixed locations:
- follow-up draft → `drafts/<account-slug>/<YYYY-MM-DD>-follow-up.md`
- coaching review → `coaching/<YYYY-MM-DD>-<account-slug>.md`
- weekly rollups (the `weekly-coaching` skill) → `coaching/weekly/<week>.md`

The **structured facts** the review is built from — the objections, competitors, and intel — are
NOT saved here; they already live in OpenNous (the server extracted them on ingest) and surface in
the app's Coaching page and role reporting. So one call produces two complementary things: the
aggregate stays in the app (auto, server-side), and the per-call narrative + draft land in the
user's git (this skill). The user reads the app for "what objections keep coming up", and their git
for "how did THIS call go and what do I send."

## Rules
- **Draft, never send.** Every output is a file. Sending is always the user's call.
- **One seat's call.** Respect the `attention:"mine"` scope guard so fan-out never double-drafts.
- **Grounded only.** Real quotes from the transcript or none. A thin call yields a thin review — say so.
- **The next step is the headline.** Whether a dated next step was secured is the most important
  line in the coaching review; lead the "do differently" with it when it's missing.
