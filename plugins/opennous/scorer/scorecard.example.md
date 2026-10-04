---
scorer: my-icp
version: 1
tiers: { tier_1: 85, tier_2: 70, tier_3: 50 }
evidence_floor: 0.50    # below this, the record can't answer a layer: it is unknown, not low
spread_floor: 0.50      # Jev's top answer under this: counted, but flagged for review
disqualify_floor: 0.70  # a disqualifier fires only when Jev is at least this sure
disqualified_cap: 15
---

# ICP scorecard

One question: how likely is this person to become a customer? People are scored; a company takes its best
person's score.

Each `## name · weight` section is one layer. Jev answers two things about the account record for it: is there
evidence to judge it (`evidence:`), and where on the ladder it lands (answers worst first). A layer without
evidence is unknown, never low. Weights sum to 100. A `## disqualify · name` section answered yes caps the score.

Engagement with you (replies, meetings) is not in here on purpose: it measures warmth, not fit, and Nous already
tracks it as a separate intent score. Route on both.

## fit · 30
Who they are: their role, and their company's type, size and region.
Best fit: <the role you sell to, e.g. Head of RevOps> at <the company you sell to, e.g. a B2B SaaS of 20 to 200
people in North America or Europe>.
evidence: the record says what this person does, or the company's type and size
answers (worst first):
- 0: no relevant role and the wrong kind of company
- 1: an adjacent role, or the wrong size and region
- 2: the right role at the wrong kind of company, or the right company with an adjacent role
- 3: the right role at a company that matches most of the profile
- 4: the exact role at a company that matches the whole profile

## pain · 35
Evidence they feel the problem you solve: <describe the problem in the words your buyers use>.
evidence: the record shows anything about how they work today: their stack, posts, calls, or what they said
answers:
- 0: the evidence shows no such problem, or they are happy with how it works today
- 1: hinted at
- 2: stated once
- 3: stated repeatedly, or plainly visible in how they work
- 4: urgent: actively trying to fix it, or a blocker they raised with you

## intent · 20
Something is happening now that makes this the right time. Outside signals only: <e.g. hiring for the team you
serve, funding, a launch, changing tools>. Not their engagement with you.
evidence: the record has dated posts, hiring, funding, launches or tool changes
answers:
- 0: the evidence shows nothing current, or they are clearly not in market
- 1: one old signal (over 6 months)
- 2: one recent signal (last 90 days)
- 3: several recent signals
- 4: actively evaluating tools for this problem

## ability · 15
Can they decide and buy.
evidence: the record shows this person's seniority, or who decides at this company
answers:
- 0: no authority and no budget path
- 1: influencer only
- 2: can recommend to whoever buys
- 3: owns the budget or the tooling decision
- 4: decides and signs alone

## disqualify · not_b2b
yes: a consumer business, or an industry you never sell to
no: anything else

## disqualify · student
yes: a student or job-seeker with no operating role
no: holds an operating role, or runs their own company
