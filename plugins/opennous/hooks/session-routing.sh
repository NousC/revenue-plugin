#!/usr/bin/env bash
# Nous — SessionStart hook. Injects the concise GTM routing instruction once per
# session (and again after a compaction, /clear, or resume). On exit 0, stdout is
# added to the agent's context — this is what makes the plugin ACTIVE: the agent
# reaches for Nous first and nudges a new user to onboard, without touching the
# user's own files. It reads one file in the plugin and nothing else.
set -uo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cat "${DIR}/routing.concise.txt"
exit 0
