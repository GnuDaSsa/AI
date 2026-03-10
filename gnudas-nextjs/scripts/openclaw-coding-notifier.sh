#!/bin/zsh
set -euo pipefail

STATE_FILE="/tmp/openclaw-coding-notifier.state"
LOCK_DIR="/tmp/openclaw-coding-notifier.lockdir"

if ! mkdir "$LOCK_DIR" 2>/dev/null; then
  exit 0
fi
trap 'rmdir "$LOCK_DIR" >/dev/null 2>&1 || true' EXIT

if pgrep -fl 'openclaw|codex|claude|next dev|npm run dev' >/dev/null 2>&1; then
  now=1
else
  now=0
fi

prev=0
if [[ -f "$STATE_FILE" ]]; then
  prev=$(cat "$STATE_FILE" 2>/dev/null || echo 0)
fi

if [[ "$now" == "1" && "$prev" != "1" ]]; then
  osascript -e 'display notification "에이전트들이 업무 시작했어." with title "OpenClaw Live Coding" subtitle "로컬 코딩 작업 감지" sound name "Glass"'

  # 작은 모니터 창 오픈 (Safari)
  osascript <<'OSA'
  tell application "Safari"
    activate
    set monitorFound to false
    repeat with w in windows
      try
        if (URL of current tab of w) contains "localhost:3000/monitor" then
          set monitorFound to true
          set index of w to 1
          set bounds of w to {1000, 90, 1410, 500}
          exit repeat
        end if
      end try
    end repeat

    if monitorFound is false then
      make new document with properties {URL:"http://localhost:3000/monitor"}
      delay 0.2
      set bounds of front window to {1000, 90, 1410, 500}
    end if
  end tell
OSA
fi

echo "$now" > "$STATE_FILE"
