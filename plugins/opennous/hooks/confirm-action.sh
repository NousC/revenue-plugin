#!/usr/bin/env bash
# OpenNous — PostToolUse hook. The confirmation lane of the decision loop.
#
# Why a hook and not a tool call: an agent reports what it MEANT to do. This fires because a
# send tool actually returned, carrying the provider's own message id. It cannot be forgotten
# by a skill, it cannot be embellished, and it is the same id the provider's reply webhook
# will carry later — which is how "we recommended X → they replied" closes without trusting
# anyone's narration.
#
# Contract with the rest of the system:
#   - We send the RECIPIENT and a HASH of what went out. Never the body. Raw stays in the
#     operator's git; the server compares our hash to the drafted one to label the send
#     accepted vs edited, and that is all the content it ever needs.
#   - We FAIL OPEN, always. The message has already gone out by the time this runs. Nous
#     being down, slow, or unconfigured must never colour a send that succeeded, so every
#     path here exits 0 and the network call is detached and capped.
set -uo pipefail

INPUT="$(cat)"
API="${NOUS_API_URL:-https://api.opennous.cloud}"

# The key the plugin already holds. No key = no loop, silently: a user who has not signed in
# is not someone we should be nagging from inside an unrelated tool call.
KEY="${NOUS_API_KEY:-}"
if [ -z "$KEY" ] && [ -f "$HOME/.nous/config.json" ]; then
  KEY="$(sed -n 's/.*"api_\{0,1\}[kK]ey"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' "$HOME/.nous/config.json" | head -1)"
fi
[ -z "$KEY" ] && exit 0
command -v jq >/dev/null 2>&1 || exit 0

TOOL="$(printf '%s' "$INPUT" | jq -r '.tool_name // ""')"
[ -z "$TOOL" ] && exit 0

# Which tools we recognise, what to call the provider, and — the distinction that matters —
# whether this was an ACTION or merely CONSENT to one.
#
# Creating a draft is not sending. The human said yes to the recommendation at that moment,
# which is a verdict worth recording; the message itself may go out an hour later, or never.
# Reporting a draft as a send would put email in the dataset that never left the building,
# and would hide the case we most want to see: advice accepted and then quietly dropped.
# The real send arrives on the ingest lane instead (Gmail's own webhook), where it belongs.
#
# Matched loosely on purpose: the same Gmail send is `mcp__claude_ai_Gmail__send_message` for
# one user and `mcp__gmail__send_email` for the next, and a hook that only knew one spelling
# would go quietly blind for everyone else.
STAGE="sent"
case "$TOOL" in
  *[Gg]mail*draft*|*draft*[Gg]mail*)                     PROVIDER="gmail";    ACTION="email_send"; STAGE="drafted" ;;
  *[Gg]mail*send*|*gmail*reply*|*[Gg]mail*forward*)      PROVIDER="gmail";    ACTION="email_send" ;;
  *linkedin*send*|*unipile*send*|*linkedin*message*)     PROVIDER="unipile";  ACTION="linkedin_message" ;;
  *instantly*)                                           PROVIDER="instantly";ACTION="campaign_add" ;;
  *heyreach*)                                            PROVIDER="heyreach"; ACTION="campaign_add" ;;
  *smartlead*)                                           PROVIDER="smartlead";ACTION="campaign_add" ;;
  *)                                                     exit 0 ;;
esac

# A tool that errored is not an action. Confirming it would put a send in the dataset that
# never left the building — the exact failure mode this hook exists to catch.
IS_ERR="$(printf '%s' "$INPUT" | jq -r '(.tool_response.is_error // .tool_response.isError // false) | tostring')"
[ "$IS_ERR" = "true" ] && exit 0

# The recipient is the join key the server matches on. Providers spell it a dozen ways.
RECIPIENT="$(printf '%s' "$INPUT" | jq -r '
  .tool_input as $i |
  ( $i.to // $i.To // $i.recipient // $i.email // $i.to_email // $i.recipient_email //
    (if ($i.to | type) == "array" then $i.to[0] else null end) //
    $i.linkedin_url // $i.profile_url // "" ) | tostring' 2>/dev/null)"
RECIPIENT="$(printf '%s' "$RECIPIENT" | tr '[:upper:]' '[:lower:]' | sed 's/.*<//;s/>.*//' | xargs 2>/dev/null || true)"
[ -z "$RECIPIENT" ] || [ "$RECIPIENT" = "null" ] && exit 0

# The provider's own id for what it just sent — later carried by the reply webhook.
MSG_ID="$(printf '%s' "$INPUT" | jq -r '
  .tool_response as $r |
  ( $r.id // $r.message_id // $r.messageId // $r.threadId // $r.thread_id //
    ($r.content? // empty | if type == "array" then (.[0].text? // "") else . end | tostring | capture("(?<id>[0-9a-f]{12,})") .id? ) // "" ) | tostring' 2>/dev/null)"

# A hash of the body that actually went out. The server holds the hash of what we drafted;
# equal means sent verbatim, different means the human rewrote it. That single comparison is
# the accept-vs-edit label, and it costs us nothing and reveals no content.
# NOTE: this normalization must stay byte-identical to hashBody() in
# apps/api/src/lib/decisions.mjs — collapse whitespace runs to one space, trim, lowercase.
# If the two ever drift, every verbatim send hashes differently from its draft and the whole
# corpus silently labels itself 'edited'.
SENT_HASH="$(printf '%s' "$INPUT" | jq -r '.tool_input | (.body // .message // .text // .html // "") | tostring' 2>/dev/null \
  | tr '[:upper:]' '[:lower:]' | tr -s '[:space:]' ' ' | sed 's/^ //; s/ $//' | tr -d '\n' \
  | shasum -a 256 2>/dev/null | cut -d' ' -f1)"

PAYLOAD="$(jq -nc \
  --arg recipient "$RECIPIENT" --arg provider "$PROVIDER" --arg mid "$MSG_ID" \
  --arg hash "$SENT_HASH" --arg action "$ACTION" --arg stage "$STAGE" \
  --arg at "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
  '{recipient:$recipient, provider:$provider, provider_message_id:(if $mid=="" then null else $mid end),
    sent_hash:(if $hash=="" then null else $hash end), action_type:$action, stage:$stage, sent_at:$at}')"

# Support hatch: NOUS_HOOK_DEBUG=1 prints exactly what would be sent (to stderr, which the
# hook framework shows) instead of guessing why a decision never got confirmed.
if [ "${NOUS_HOOK_DEBUG:-}" = "1" ]; then
  printf 'nous-hook %s -> %s\n' "$TOOL" "$PAYLOAD" >&2
fi

# Detached, capped, and swallowed. Bookkeeping never delays the session.
( curl -sS -m 5 -X POST "$API/v2/decisions/confirm-by-action" \
    -H "Authorization: Bearer $KEY" -H 'Content-Type: application/json' \
    -H 'X-Nous-Client: plugin-hook' -d "$PAYLOAD" >/dev/null 2>&1 & ) >/dev/null 2>&1

exit 0
