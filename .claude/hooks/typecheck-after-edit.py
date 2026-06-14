#!/usr/bin/env python3
"""PostToolUse hook: type-check after a TS/TSX file is edited.

Frontend analog of the backend team's compile-after-edit.py. Runs `tsc --noEmit`
when an Edit/Write/MultiEdit touches a TypeScript file, and surfaces errors back
to Claude (non-blocking: reported, not enforced).

Wired in .claude/settings.json under PostToolUse (matcher: Edit|Write|MultiEdit).
No-ops cleanly until the Next.js app is scaffolded (no package.json / tsc).
"""
import json
import os
import subprocess
import sys

TS_EXTS = (".ts", ".tsx", ".mts", ".cts")


def main() -> int:
    try:
        payload = json.load(sys.stdin)
    except (json.JSONDecodeError, ValueError):
        return 0  # nothing to do

    tool_input = payload.get("tool_input", {}) or {}
    path = tool_input.get("file_path") or tool_input.get("path") or ""
    if not path.endswith(TS_EXTS):
        return 0

    project = os.environ.get("CLAUDE_PROJECT_DIR", os.getcwd())

    # Skip silently if the project isn't scaffolded yet.
    if not os.path.exists(os.path.join(project, "package.json")):
        return 0

    cmd = ["npx", "--no-install", "tsc", "--noEmit", "--pretty", "false"]
    try:
        result = subprocess.run(
            cmd, cwd=project, capture_output=True, text=True, timeout=120
        )
    except FileNotFoundError:
        return 0  # tsc/npx not available
    except subprocess.TimeoutExpired:
        print("typecheck-after-edit: tsc timed out (120s)", file=sys.stderr)
        return 0

    if result.returncode != 0:
        out = (result.stdout or "") + (result.stderr or "")
        # Show only lines mentioning the edited file to keep the signal tight.
        rel = os.path.relpath(path, project)
        relevant = [ln for ln in out.splitlines() if rel in ln] or out.splitlines()
        msg = "\n".join(relevant[:40])
        print(f"TypeScript errors after editing {rel}:\n{msg}", file=sys.stderr)
        return 2  # surface to Claude as feedback

    return 0


if __name__ == "__main__":
    sys.exit(main())
