# Insight extraction (learnings about OUR OWN business)

Ported from Nous's server-side insight extractor. The mirror of claim extraction: claims are about
the CONTACT; insights are what the call taught us about **US** — our product, positioning, market,
or buyer. Apply this yourself, then write via `record_insight`.

## First, anchor on WHO WE ARE
Before extracting, load our own company context (our product, positioning, ICP/buyer) — via
`get_context` on our own workspace, our ICP, or a workspace-context note. An insight may ONLY be
about US as described there. This anchor is what stops you filing the prospect's OWN business facts
(their buyers, their market, their pricing) as if they were ours.

**No context, no insights.** If you cannot load who we are (no ICP/positioning in YOUR CONTEXT),
skip insight extraction for the item and say so. The app skips it the same way, because mining a call
without the anchor files the prospect's own business as ours.

## Who is who
The EXTERNAL attendees (the prospect/customer side) are who we learn from. Everyone on our own side
is US. Judge from context if unlabeled.

## THE HARD RULE
An insight may ONLY be grounded in what an EXTERNAL attendee actually said. Our own side's statements
are our existing opinions, not learnings — NEVER turn something WE said into an insight, and NEVER
use one of our lines as the quote. If the prospect merely agreed ("yeah exactly") with a point WE
made, that's not their insight — skip it unless they said something substantive in their own words.
Every quote MUST be a verbatim line spoken by the prospect.

## CRITICAL ATTRIBUTION RULE
The prospect often runs their OWN business and will describe THEIR buyers, market, product, pricing,
economics. Those are facts about the prospect's company, NOT insights about us. An insight qualifies
ONLY if it maps to OUR company — how WE build/message/sell/target, or a thesis that validates or
challenges OUR bet about OUR market. When the prospect describes their own company, SKIP it, however
interesting — unless the same point is also directly true of OUR business.

## Capture (only from the prospect's own words, only when about US)
- Advice they gave us — what WE should build, how WE should message, who WE should sell to.
- A gap, objection, or friction they exposed in what WE do.
- A market shift, wedge, segment, or channel they revealed about OUR market (incl. why-now).
- The underlying pain that makes someone buy OUR offer.
- A thesis that validates or challenges OUR core bet — capture even when it just agrees with us;
  external validation is high-value and the most-missed kind. (Hunt for it.)

Do NOT capture: facts about the attendee/their company, the prospect's own buyers/market/economics,
logistics, pleasantries, or anything only WE said.

## The four bars — an insight qualifies ONLY if it passes ALL FOUR
1. **ABOUT US** — informs how we build/message/sell/target, or confirms/challenges our thesis.
2. **DURABLE** — useful weeks from now.
3. **SPECIFIC** — names the concrete mechanism/reason/number the prospect gave, not a generic
   product-spec restatement. "Converting warm replies into booked meetings is the real bottleneck",
   never "the system should generate value".
4. **OURS NOT THEIRS** — maps to our company, not the prospect's separate business.

## Categories (`category`, exactly one)
- `product` — what we should build/change in the product; a gap or feature the market wants.
- `positioning` — how we should message/frame/differentiate; language that lands or misfires.
- `market` — a shift, wedge, segment, channel, or why-now about our market.
- `buyer` — who buys and why; the pain, trigger, or economics behind the purchase.

## Fields
- `content` — ONE plain sentence stating what this means for US, MAX ~18 words. State it, don't
  sharpen it into a slogan: no aphorisms, no "X, not Y", no rule of three, no em dash as a
  connector. Hedge only when the prospect hedged. No preamble, no product-spec voice. These
  sentences are read back verbatim in the revenue report's market section and get reused in drafts, so a punchy one is a
  liability — write it the way you'd say it to a colleague.
  ❌ "Speed of reply is the real bottleneck, not lead volume."
  ✅ "Teams lose deals on slow replies even when lead volume is fine."
- `quote` — the single most telling fragment the PROSPECT said, verbatim, MAX ~20 words. Not our words.
- `speaker` — the NAME of the external person who said the quote. Just the name. "" only if unknown.

## Discipline
- Extract every insight that clears all four bars — no target number. A thin call yields zero.
- NEVER pad or restate. Keep content and quote SHORT. Hard ceiling 8.

## Output — ONLY the raw JSON array (no code fences, no commentary). Begin with `[` end with `]`:
```json
[{"category":"product|positioning|market|buyer","content":"...","quote":"...","speaker":"..."}]
```
If nothing meaningful: `[]`
