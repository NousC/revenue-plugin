---
name: role-report
description: The reporting for YOUR seat — the insights routed to your GTM role(s), reframed for what you actually do. An AE sees deal blockers and the counters; an SDR sees early objections and talk tracks; CS sees churn/expansion signals; Product & Engineering sees the feature asks behind real revenue. Use when a rep asks "what should I know", "what's blocking my deals", "what are buyers objecting to", "my reporting", or for a start-of-week read on what matters to their role. A person with several roles gets all of them, union'd.
---

# Role report

Give the caller the insights that matter to *their seat*, reframed for their role — not the whole-company strategic view (that's section 07 of the founder's `revenue-report`). One person can hold several roles (AE + SDR + RevOps); show all of them.

## Tools
- `whoami` — the caller's identity, `scope`, and **GTM role(s)** (plural). This is what scopes the report. If it returns no role, ask which seat to report for (Account Executive · SDR/BDR · Customer Success · Product & Engineering · RevOps · Marketing · Sales), or default to `account_executive`.
- `query` — read the role-routed insights: `scope: { reporting: "role", role: "<role>" }`. The server routes each insight to the roles it matters to and reframes it (an objection is a "Deal blocker" to an AE, an "Early objection" to an SDR, a "Feature request" to Engineering) and returns handlers (objections/deal-blockers, with account counts) plus the themes relevant to that role. Founder scope returns all lenses.
- `get_account` — expand one account behind an insight when the caller drills in.

## Workflow
1. **Identify the seat.** `whoami` → the caller's role(s). Report for each role they hold; if founder/admin, offer any lens.
2. **Pull each role's feed** with `query` (`reporting: "role", role`). For a multi-role caller, run once per role and label each section — don't merge them into an undifferentiated list; the framing differs per seat.
3. **Within a role, lead with the sharpest:** deal blockers / objections ranked by how many accounts raise them, then the role's signals.
4. **Make each item actionable for that seat** — an AE gets the counter to have ready; an SDR gets how to handle it in outreach; CS gets which accounts to watch; Engineering gets the capability behind the revenue.
5. Offer to drill into any account (`get_account`) or hand a blocker to `plan-account` / `objection-prep`.

## Output
```
# Your report — <Role label>   (repeat per role held)
**Deal blockers**
- <objection> — raised across <n> accounts → <the move for this seat>

**Signals for you**
- <theme> — <n> mentions → <what it means for your work>

<if multiple roles: a second section per role, reframed for that seat>
```

## Rules
- **Attribute inline, don't quote.** Blockers carry account counts; a quote is for the drill-in.
- **Scope to the caller's role(s)** from `whoami` — never show the founder company view here (that's `revenue-report`); a rep sees only what's routed to their seat.
- **Reframe per seat.** The same underlying insight reads differently to an AE vs an SDR vs Engineering — use the role's framing, don't dump raw themes.
- **Union, labeled.** A multi-role person sees every role they hold, each in its own labeled section — never collapsed into one.
- Don't invent a blocker or inflate an account count.
