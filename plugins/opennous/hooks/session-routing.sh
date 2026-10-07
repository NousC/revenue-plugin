#!/usr/bin/env bash
# Nous — SessionStart hook. Injects the concise GTM routing instruction once per
# session (and again after a compaction, /clear, or resume). On exit 0, stdout is
# added to the agent's context — this is what makes the plugin ACTIVE: the agent
# reaches for Nous first and nudges a new user to onboard, without touching the
# user's own files.
set -uo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cat "${DIR}/routing.concise.txt"

# What this workspace has LEARNED, appended live.
#
# This is what makes the plugin improve without anyone re-prompting it. The skill files are
# byte-identical from one month to the next; the guidance the agent starts with is not,
# because the engine has watched which recommendations were taken, rewritten or ignored and
# what came back. The agent does not learn. Its context changes.
#
# Fails silently and completely. This block is an enhancement to a session that already works,
# so a slow or unreachable API must cost the user nothing — no error, no delay, no partial text.
API="${NOUS_API_URL:-https://api.opennous.cloud}"
KEY="${NOUS_API_KEY:-}"
if [ -z "$KEY" ] && [ -f "$HOME/.nous/config.json" ]; then
  KEY="$(sed -n 's/.*"api_\{0,1\}[kK]ey"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' "$HOME/.nous/config.json" | head -1)"
fi
if [ -n "$KEY" ]; then
  LEARNED="$(curl -sS -m 4 "${API}/v2/decisions/instructions?format=text" \
    -H "Authorization: Bearer ${KEY}" -H 'X-Nous-Client: plugin-hook' 2>/dev/null)"
  # Only print a real block. An error page or a stray body must never reach the agent's
  # context as though it were guidance.
  case "$LEARNED" in
    "WHAT THIS WORKSPACE HAS LEARNED"*) printf '\n%s\n' "$LEARNED" ;;
  esac
fi

exit 0
