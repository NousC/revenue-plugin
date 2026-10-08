# Raw storage — where raw goes in git, and how (the locked convention)

Nous holds only structure; the **raw stays in the operator's git**. Every skill that files an
interaction (`sync`) writes the raw transcript/email/thread to a file and records a
`source_ref` pointer to it. This is that convention — one place, so every write lands the same and
`source_ref` always resolves.

## The folder layout — one folder per account
```
raw/<account-slug>/<YYYY-MM-DD>-<source>-<externalId>.md
```
- **`raw/`** — top of the raw tree, in the repo the agent is running in.
- **`<account-slug>`** — a folder **per account/person**: the account the item belongs to (the same
  `focus` you record against — the primary external attendee's company, else the person). Slugify:
  lowercase, spaces/punctuation → `-` (e.g. `acme-corp`, `jordan-lee`). Everything about one account
  lives in one folder, so a human can open it and read the whole relationship.
- **filename** — `<date>-<source>-<externalId>.md` (e.g. `2026-03-14-fireflies-ff_9182.md`). Date +
  source + the item's `externalId` make it unique and **deterministic**: the same item always maps to
  the same path, so a re-run overwrites in place — never a duplicate.

Prose briefs (not raw) go under `briefs/<account-slug>/…` — same per-account grouping.

## The file
Write the raw content verbatim (the transcript text, the email body/thread), with a tiny front-matter
header for provenance:
```
---
account: <account name>
source: <fireflies|gmail|granola|…>
external_id: <the item id>
occurred_at: <ISO>
---
<the raw transcript / email text, unaltered>
```

## The pointer (what Nous stores)
Nous never gets the raw. Each `record` observation from this item carries:
- `source_ref: git://<repo>/raw/<account-slug>/<file>.md`
- `content_hash: <sha256 of the file>`
So any agent can later fetch + hash-verify the exact raw behind a claim, without Nous storing it.

## Audit first — it depends on what's already there (idempotent)
Before writing, check state and only fill gaps — never re-create or re-push:
1. Does `raw/` exist? Does `.nous/raw.json` exist (the marker: `{ workspace_id, convention, repo }`)?
   If not, create them once.
2. Does `raw/<account-slug>/<date>-<source>-<externalId>.md` already exist? Then this item is already
   filed — skip the write (and the `record` dedups on `externalId` anyway). Re-runs are safe.
3. Never delete or rewrite another item's file; raw is append-only by new path.

## Ongoing (after onboarding) — optional
The steps above are the AGENT writing raw locally on your tokens; that's complete on its own. To also
have **new** raw flow in automatically (server-side, from webhooks), connect a repo in the app. Give
the user the direct link: **https://app.opennous.cloud/settings?section=repo** . That's the *last,
optional* step — onboarding and backfill work fully without it.
