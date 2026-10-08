---
name: automate
description: >
  Turns on the built-in automations that work your calls while you sleep — after every call, draft
  the follow-up and coach it; every Sunday, a coaching report. Installs the GitHub Actions that run
  the plugin headlessly on your own tokens, in your connected repo. Use when the user says "turn on
  automations", "automate my follow-ups", "set up the after-call automation", "make it run after
  every call", or asks how the automations in Settings actually run. One-time setup; idempotent.
---

# Automate — install the built-in automations

The built-in automations (Settings → Automations) run in **your** connected repo's GitHub Actions,
on **your** Anthropic + Nous keys. This skill installs the machinery once: the workflow files, a
self-contained copy of the routines, the config, and the two repo secrets. After this, a call ending
fires the after-call run with no one touching anything.

Install into the user's **own** connected repo (Phase 0 picks it). Write the files straight into it and
commit. Idempotent — re-running reconciles (overwrites the installed files, never duplicates).

## Phase 0 · Orient and pick the target repo — the user's OWN repo, always
Call `whoami` (must be signed in). Then pick where to install. **The automations live in the user's
OWN repo — the one already connected in Settings → Repo, where their raw already flows. NEVER a
NousC / OpenNous org repo, and never a repo you invent when one is already connected.** A user's call
transcripts must never land in our org.

Decide the target in this order:
1. **A repo is already connected in the app** (Settings → Repo) → **that IS the target.** Install into
   it. If you're not sitting in it locally, clone/pull it first. Do not create anything new. Done.
2. **Nothing connected — check the repo you're in** (`git remote -v`):
   - **Has a remote under the user's own account** → use it, then tell the user to connect it in
     Settings → Repo.
   - **Has a remote under an org that is NOT the user's personal account** (e.g. NousC, or any org) →
     **STOP and warn.** Do not push there. Ask the user which of *their own* repos/accounts to use.
   - **No remote at all** → offer to create a **PRIVATE** repo under the user's **personal GitHub
     account**. Resolve that account with `gh api user --jq .login`; **if that login is an org, do NOT
     use it — ask the user for their personal account.** Confirm the repo name with the user, create it
     private, add it as `origin`, push, then have them connect it in Settings → Repo.
3. If you cannot identify a **user-owned** target, stop and ask — never fall back to an org `gh` happens
   to be authed to.

**Guardrail:** before any `gh repo create` or `git push` to a new remote, state the exact
`owner/name` you're about to use and confirm it is the user's own. If the owner is NousC or any
OpenNous org, that is always wrong — stop.

## Phase 1 · Install the machinery (write + commit)
Write these into the repo, then commit them:
1. **The workflows** — copy `templates/nous-after-call.yml` → `.github/workflows/nous-after-call.yml`,
   and `templates/nous-weekly.yml` → `.github/workflows/nous-weekly.yml`.
2. **The runnable routines** — the CI runs headless with no plugin installed, so it reads the routine
   from the repo. Write a self-contained copy of the **after-call** routine to
   `.nous/skills/after-call.md` (distil this plugin's `after-call` skill into a direct instruction:
   read the scored call from `get_account` on the payload's `entity_id`, write the coaching review to
   `coaching/<date>-<account>.md` and the channel-aware follow-up draft to
   `drafts/<account>/<date>-follow-up.md`, never send). Same for `weekly-coaching` →
   `.nous/skills/weekly-coaching.md` when the user wants the weekly report.
3. **The config** — copy `templates/automation.json` → `.nous/automation.json` (set `after_call.enabled`
   / `weekly_coaching.enabled` to what the user asked for).
Commit with a clear message (e.g. `chore: install Nous automations`).

## Phase 2 · Set the secrets — NOUS_API_KEY + one Claude credential
The headless run needs `NOUS_API_KEY` (workspace-scoped, for the plugin's MCP) **plus ONE** way to run
`claude`:
- **`CLAUDE_CODE_OAUTH_TOKEN`** — from `claude setup-token`, uses the user's **Claude subscription**
  (Max/Pro), no API credits. Prefer this if they have a subscription. The workflow uses it when set.
- **`ANTHROPIC_API_KEY`** — API billing, needs credits. Use if they pay per-token.
Ask which the user has, and set only that one (plus `NOUS_API_KEY`).
- **If `gh` is available and authed:** always use the `--body` form (the interactive prompt is
  unreliable). Ask the user to create a key at https://app.opennous.cloud/connect/api-keys and
  paste it, then: `gh secret set NOUS_API_KEY --repo <owner>/<name> --body "<the key they pasted>"`.
  Never read a key from the user's machine.
  Then the Claude credential with `--body`: `gh secret set CLAUDE_CODE_OAUTH_TOKEN --repo <owner>/<name> --body "sk-ant-oat01-…"` (from `claude setup-token`), OR
  `gh secret set ANTHROPIC_API_KEY --repo <owner>/<name> --body "sk-ant-…"`. The `--body` value is
  the user's to paste — never invent or echo one. Confirm with `gh secret list --repo <owner>/<name>`.
- **Otherwise guide once:** print the secret names + the link
  `https://github.com/<owner>/<repo>/settings/secrets/actions`; the user pastes them. Never put a key
  in the chat or a file.

## Phase 3 · Arm it
The dispatch that triggers the after-call run is gated by the app toggle. Tell the user to switch
**After every call** on at https://app.opennous.cloud/settings?section=sequences (Settings →
Automations) — or confirm it's already on. That flag is what makes Nous fire the workflow when a
call ends.

## Phase 4 · Confirm
Tell the user, in a couple of lines: what's now installed, what will happen on the next call (the
after-call run drafts the follow-up + writes the coaching review into `drafts/` and `coaching/`),
that they can run it by hand from the repo's **Actions** tab (`workflow_dispatch`), and how to turn
it off (toggle in Settings → Automations, or delete the workflow files). Offer to open a test run.

## Rules
- **Their repo, their tokens.** Everything runs in the user's own GitHub Actions on their keys. Nous
  never runs the generative work.
- **Secrets are pointers, never content.** Set them via `gh` or the GitHub UI; never write a key into
  a file or the chat.
- **Idempotent.** Re-running overwrites the installed files and reconciles the config; it never
  duplicates workflows or double-commits unchanged files.
- **Draft, never send.** The installed routines only write files; sending stays the user's call.
