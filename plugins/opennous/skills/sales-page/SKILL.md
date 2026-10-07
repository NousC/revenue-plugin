---
name: sales-page
description: >
  Turns a follow-up into a personalized, on-brand SALES PAGE you can send a lead — a hosted web page
  that sells the next step, built from what you actually know about them (their pain, goals,
  objections, what was said on the call) and rendered in the user's own company brand. Use when the
  user says "make a sales page for [account]", "build a follow-up page for this deal", "turn this into
  a page I can send", or after a strong call when a plain email isn't enough. On-demand, one lead at a
  time. Not a generic landing page — every line is grounded in the graph.
---

# Sales page — a page for this ONE lead, in your brand

Build a web page that sells the next step to a specific lead. Two things make it work and nothing
else does: it is **on the user's brand** (never a generic template) and it is **personalized from the
graph** (never invented). If you can't ground a claim in the record, cut it. The page is a
presentation of what we already know, made persuasive — not marketing fiction.

## Phase 0 · Brand first (once per company)
The page renders in the **user's company brand**, so that has to exist before you design anything.
Read `.nous/brand.json`. If it's missing, create it WITH the user (copy `templates/brand.json`, then
ask the 4–5 things you can't infer): company name, logo (URL or a file in the repo), primary +
accent colours, heading/body fonts, and the voice (how they write). Save it. This is the design
memory every page reads — set once, reused for every lead. Never guess a brand; a wrong logo or
colour is worse than asking.

## Phase 1 · Know the lead (personalize from the graph)
`get_context` / `get_account` on the lead. Pull the material the page is built from:
- **their pain** and goals (in their words — keep the quotes),
- **what was discussed / promised** on the last call (read the coaching review + the call if present),
- **their objections** (so the page pre-empts them),
- **their ICP fit + stage** (so the offer matches where they are).
If the record is thin, the page is short and honest — do not pad it with generic B2B copy.

## Phase 2 · Structure (consistent skeleton, always these sections)
Every sales page uses the same spine so it reads like a real page, not a random layout. Fill each
section from Phase 1; drop a section only if there's genuinely nothing real to put in it:
1. **Hero** — their pain, in their language, and the outcome you deliver. Not "Welcome" — the thing
   they actually said hurts.
2. **The shift** — what changes for them (before → after), concretely.
3. **How it works** — your solution tied to *their* situation, not a feature list.
4. **Proof** — the most relevant case study / result / social proof you have on file. Real only.
5. **The offer** — the specific next step for THIS lead (the thing you discussed), not a generic demo.
6. **One CTA** — a single clear action (book the call / reply / start), repeated once.

## Phase 3 · Copy (humanize it)
The copy is the pitch, so it must not read like AI wrote it. Follow the plugin's voice rules AND do a
humanizer pass: no consultant verbs (leverage, unlock, streamline, empower, seamless, robust), no
"X, not Y", no three-item rhythm, no em-dash-as-drama, no hollow superlatives. Short, plain, specific.
Say the real thing. Second person to the lead. Ground every claim; quote them where it lands.

## Phase 4 · Design (on-brand, anti-slop)
Render one clean HTML page. Follow `../../references/artifact-design.md` for the craft, but this is
the user's brand, not the OpenNous look: use `brand.json`'s palette, fonts, and logo throughout.
Anti-slop check before you commit: if it looks like the default AI landing page (cream + serif +
terracotta, a purple gradient hero, centered everything, `rounded-lg` on every card, emoji section
markers), redo it — pick a direction that fits THIS company's brand. One bold move, everything else
quiet. Self-contained HTML (inline CSS, embedded/linked brand assets), responsive, both light/dark
only if the brand calls for it.

## Phase 5 · Host it (the user's Vercel — never OpenNous)
Write the page to the repo (`pages/<lead-slug>/index.html`) and deploy it to the **user's own Vercel**
so it's shareable:
- If the repo is linked to a Vercel project (git integration), committing the file deploys it — return
  the resulting URL.
- Else use the Vercel target in `brand.json` (`vercel.project` + a token the user set): `npx vercel
  deploy --prod` and return the URL.
- Optional password: if `brand.json.vercel.password_protect` is set, note that the user turns on
  Vercel deployment protection (we don't store their gate).
OpenNous never hosts the page. If no Vercel is set up, still write the HTML to the repo and hand the
user the file + the one-time Vercel-connect step.

## Output
Give the user the **shareable URL** and the file path, and one line on what the page leads with and
what the CTA asks for. Don't paste the HTML.

## Rules
- **On-brand or don't ship.** No generic template. If `brand.json` is missing, set it up first.
- **Grounded only.** Every claim, quote, and number comes from the graph. A thin record = a short page.
- **One lead, one page.** Personalized to this account; never a reusable generic page.
- **The user hosts.** Their Vercel, their domain, their optional password — OpenNous never hosts.
- **Draft, don't send.** You produce the page + link; the user sends it.
