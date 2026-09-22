# Closing the loop on your own advice

Shared by every skill that recommends something. A recommendation is a data point only if it
is written down *before* anyone acts on it — advice that lives in chat scrollback and then
gets acted on teaches the engine nothing, because it looks identical to a thing that happened
out of nowhere.

**What counts as a decision:** something the user can say yes or no to and then *act* on. A
summary is not a decision. A list of five plays is five decisions. If no plausible action
follows, do not write one — a table full of rows that never resolve drags every rate toward
meaning nothing.

Three writes, all through `record`. None of them costs the user a round trip.

## 1. Write down what you proposed — at draft time, not after

```
record(focus: "dana@acme.io", observations: [{
  kind: "state",
  property: "decision.proposed",
  value: {
    decision_id: "cc-20260908-a41f",     // any unique string; reuse it for the next two writes
    proposal: "follow up naming the security review they raised on the 3rd",
    proposal_body: "<the exact draft you just handed over>",   // hashed, then discarded
    rationale: "the security review is the real blocker at this stage, not price",
    evidence_ids: ["<the claim/note id you actually reasoned from>"],
    recipient: "dana@acme.io",           // how the confirmation finds its way back
    action_type: "email_send",           // email_send | linkedin_message | campaign_add
    category: "outreach",
    surface: "plugin",
    agent: "claude-code"
  }
}])
```

**`proposal_body` is the draft itself, and it is not stored.** Nous hashes it and throws the
text away. That hash is the only way to tell later whether the human sent your draft or
rewrote it first — and the rewrite is the single most useful thing this loop learns, because
it is a person telling you your reasoning was off while the deal is still live. Omit it and
every decision you record reports as sent-verbatim, which is worse than recording nothing:
the number looks like praise.

**`proposal` is what you are doing. `rationale` is why you think it works.** Keep them apart.
The second is a claim that can turn out to be wrong, and separating it is what lets Nous grade
*reasoning* rather than only actions.

**`evidence_ids` are the facts you actually reasoned from** — the claim, note, or observation
ids behind the call. You are already citing them to the user (a fact is never shown unsourced);
pass the same references here. This is what makes "which kinds of evidence are worth acting on"
answerable at all. Without it we learn whether follow-ups work, but never whether *security
objections are worth reacting to* — and the second question is the more useful one.

Be honest about it: list what genuinely drove the recommendation, not everything you read. A
padded basis is worse than a thin one, because it teaches the engine that irrelevant evidence
predicts outcomes.

`recipient` matters more than it looks. When the send actually happens, a hook fires on the
send tool and reports it to Nous — but that hook has never heard of your `decision_id`. It
knows who the message went to. The recipient is what lets the two halves find each other.

## 2. Record what the human decided

Same `decision_id`, and the verdict is the property name so you cannot report one thing and
mean another:

```
property: "decision.accepted"   // they sent it as drafted
property: "decision.edited"     // they rewrote it first
property: "decision.rejected"   // value: { decision_id, verdict_note: "too pushy for this stage" }
```

### Say what the correction MEANT

You are the only party who heard it. A diff read back next week shows that a paragraph
vanished; you know they said "too pushy, cut the pricing." So the verdict carries three more
fields, and they are what make the correction reusable instead of archaeological.

```
value: {
  decision_id: "cc-20260908-a41f",
  interpretation: "cut the pricing paragraph, softened the ask",
  correction_kind:  "rule",       // rule | structure | claim | constraint | none
  correction_scope: "person"      // once | person | workspace | product
}
```

**`correction_kind` decides where it is stored, and getting it wrong is how learning quietly
fails:**

| They meant | kind | What happens |
|---|---|---|
| "write shorter" — judgment about how | `rule` | shapes future drafts |
| "the report needs a competitive-landscape section" | `structure` | edits the template |
| "she's the CTO, not the CFO" | `claim` | record it as a normal observation instead |
| "I never send breakup emails" | `constraint` | we stop generating them at all |
| a typo, a detail only they knew | `none` | nothing is stored |

**`none` is the right answer most of the time.** Most edits teach nothing — someone fixing a
name, adding a fact you could not have known, tightening a sentence on a whim. Recording those
as preferences fills the instruction block with noise that crowds out the signal. The bar is
the same one you use for a decision: if it would not change what you do next time, do not
write it down.

### Scope: ask once, and only when you cannot tell

Most of the time it is obvious. A one-sentence rewrite is `once`. "I never do X" is `person`
and permanent. When it is genuinely ambiguous — a section added to a report, a tone change
that might be about this account or about all of them — **ask, in one short question**:

> Just this one, or always?

That answer is worth more than the correction it qualifies. Do not guess it, and do not ask
twice about the same thing.

**`product` means they are telling you our default is wrong for everyone.** Record it, tell
them you have passed it on, and do not write it against them — one operator's taste must not
reshape what every other customer gets.

### Whenever you can see the final text, send it

**`sent_body` is not optional.** If the user rewrote the draft in the conversation, or pasted
back what they sent, or asked you to change it and you produced the new version — you are
holding both. Pass `drafted_body` and `sent_body` and Nous measures how much of your draft
survived, instead of recording your opinion of it.

This is the single most useful thing the loop collects, and it is the one that keeps failing.
A verdict of `edited` with no sent body is stored as **unverified**: it counts toward nothing,
and a workspace full of them reads as advice nobody ever corrected. Saying "they edited it"
without the text is the same as saying nothing.

If you genuinely cannot see the final version — they took the draft away and sent it from
their own mail client — then report the verdict without it and say so. That case is covered
elsewhere, by the mailbox itself. What is not covered is you having the text and not sending
it.

A rejection is not a failure to log. It is the label. Record it.

## 3. Stamp the decision on the action

When you log the send, carry the id:

```
record(focus: "dana@acme.io", observations: [{
  kind: "event",
  property: "interaction.email_sent",
  value: { description: "follow-up on the security review" },
  decision_id: "cc-20260908-a41f"
}])
```

Now whatever comes back — a reply, a booked meeting, a bounce, or silence — is attributed to
the recommendation that caused it. Without the stamp the send is an orphan: real, recorded,
and ungradeable.

## What you do not have to do

Do not try to detect whether the action succeeded, and do not ask the user to confirm it twice.
If they act through a connected tool the loop closes on its own, from the tool's own response
and from the provider's webhook. Your job is only to say what you recommended, why, and what
they said back.

And do not narrate any of this to the user. The three writes are bookkeeping; they belong in
the tool calls, not in the conversation.
