---
name: whats-changed
description: Reports what has changed across the book of accounts (or one account) since a given time — new meetings and replies, fresh buying signals, stage moves, and accounts that have gone quiet. Use when the user asks what's new, what changed, what happened this week, who replied, who went dark, or for a catch-up on recent movement.
---

# What's changed

Give the user the delta, not the whole graph: what moved since they last looked, ranked by what deserves a response. Cover both new activity and the absence of it (accounts going quiet).

## Tools
- `query` — recent activity by time window (`since_days`, or `from`/`to`), grouped with `return: "entities"`. Use the `without` subtraction to find gone-quiet accounts (e.g. "activity in 30d MINUS activity in 5d" = cooled). Also the source for what's waiting on a response — query for replies and buying signals in the window.
- `get_account` — expand one account the summary surfaces.

## Workflow
1. Set the window from the request (default: last 7 days). Scope to one account if the user named one.
2. Pull the movement with `query`:
   - New meetings / calls, and new replies.
   - Fresh buying signals (`scope.property: "signal"`) and stage changes.
3. Find what went quiet: subtract recent activity from earlier activity with `without` — accounts that were live and have now cooled.
4. Rank by what needs a response: a reply or buying signal waiting on the user outranks a routine sync.

## Output
```
# What's changed — last <window>
**Needs a response**
- <account/person> — <what happened> (<when>) → <suggested next step>

**Moved forward**
- <account> — <signal or stage change>

**Gone quiet**
- <account> — last touch <when>, was <stage>
```

## Rules
- **Attribute inline, don't quote.** Short attribution — *(per Priya, 16 Jun)* — so the delta
  stays scannable. The full quote belongs in `brief` or `plan-account`.
- Lead with what's waiting on the user (replies, buying signals), not raw chronology.
- Include the gone-quiet section even when activity looks busy — silence is a signal.
