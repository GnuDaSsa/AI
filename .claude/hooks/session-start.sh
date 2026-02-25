#!/bin/bash
set -eo pipefail

# Only run in remote (Claude Code on the web) environments
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

echo "Installing Python dependencies..."

# Try bulk install first; fall back to per-package on failure
if ! pip install -r "$CLAUDE_PROJECT_DIR/requirements.txt" --prefer-binary --quiet 2>&1; then
  echo "Bulk install failed, installing packages individually..."
  while IFS= read -r pkg || [ -n "$pkg" ]; do
    # Skip empty lines and comments
    [[ -z "$pkg" || "$pkg" == \#* ]] && continue
    pip install "$pkg" --prefer-binary --quiet 2>/dev/null || echo "Warning: Could not install $pkg"
  done < "$CLAUDE_PROJECT_DIR/requirements.txt"
fi

echo "Session start hook completed successfully."
