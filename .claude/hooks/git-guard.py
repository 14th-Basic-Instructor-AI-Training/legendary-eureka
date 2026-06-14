#!/usr/bin/env python3
"""PreToolUse hook: guard dangerous git operations.

Frontend analog of the backend team's git-guard.py. Blocks Bash git commands that
are easy to fire by accident and hard to undo:
  - commits / pushes directly to a protected branch (main, master)
  - force pushes (--force / -f) to any branch
  - hard resets and clean -fd that nuke uncommitted work

Wired in .claude/settings.json under PreToolUse (matcher: Bash). Exit 2 blocks the
call and returns the message to Claude.
"""
import json
import re
import sys

PROTECTED = ("main", "master")


def is_git(cmd: str) -> bool:
    return bool(re.search(r"(^|[;&|]|\s)git\s", f" {cmd}"))


def main() -> int:
    try:
        payload = json.load(sys.stdin)
    except (json.JSONDecodeError, ValueError):
        return 0

    if payload.get("tool_name") != "Bash":
        return 0

    cmd = (payload.get("tool_input", {}) or {}).get("command", "") or ""
    if not is_git(cmd):
        return 0

    low = cmd.lower()

    # Force push.
    if re.search(r"git\s+push\b", low) and re.search(r"(--force(-with-lease)?|\s-f\b)", low):
        if "--force-with-lease" not in low:
            print(
                "git-guard: blocked a force push. Use --force-with-lease if you truly "
                "must, and confirm with the user first.",
                file=sys.stderr,
            )
            return 2

    # Commit/push to a protected branch (best-effort: explicit branch in command).
    if re.search(r"git\s+push\b", low):
        for b in PROTECTED:
            if re.search(rf"\borigin\s+{b}\b", low) or re.search(rf":\s*{b}\b", low):
                print(
                    f"git-guard: blocked push to protected branch '{b}'. Open a PR from a "
                    "feature branch instead.",
                    file=sys.stderr,
                )
                return 2

    # Destructive history/work loss.
    if re.search(r"git\s+reset\s+--hard", low):
        print(
            "git-guard: blocked 'git reset --hard' — it discards uncommitted work. "
            "Stash or confirm with the user first.",
            file=sys.stderr,
        )
        return 2
    if re.search(r"git\s+clean\s+-[a-z]*f[a-z]*d", low) or re.search(r"git\s+clean\s+-[a-z]*d[a-z]*f", low):
        print(
            "git-guard: blocked 'git clean -fd' — it deletes untracked files irreversibly. "
            "Confirm with the user first.",
            file=sys.stderr,
        )
        return 2

    return 0


if __name__ == "__main__":
    sys.exit(main())
