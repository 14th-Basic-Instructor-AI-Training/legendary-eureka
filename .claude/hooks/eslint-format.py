#!/usr/bin/env python3
"""PostToolUse hook: lint & format an edited JS/TS file.

Frontend analog of the backend team's java-lint.py. Runs ESLint (--fix) and
Prettier on the single file that was just edited, so style stays consistent
without a manual pass. Non-blocking — reports remaining lint errors as feedback.

Wired in .claude/settings.json under PostToolUse (matcher: Edit|Write|MultiEdit).
No-ops until the app is scaffolded with eslint/prettier available.
"""
import json
import os
import subprocess
import sys

LINT_EXTS = (".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs")


def run(cmd, cwd):
    try:
        return subprocess.run(cmd, cwd=cwd, capture_output=True, text=True, timeout=90)
    except (FileNotFoundError, subprocess.TimeoutExpired):
        return None


def main() -> int:
    try:
        payload = json.load(sys.stdin)
    except (json.JSONDecodeError, ValueError):
        return 0

    tool_input = payload.get("tool_input", {}) or {}
    path = tool_input.get("file_path") or tool_input.get("path") or ""
    if not path.endswith(LINT_EXTS):
        return 0

    project = os.environ.get("CLAUDE_PROJECT_DIR", os.getcwd())
    if not os.path.exists(os.path.join(project, "package.json")):
        return 0

    # Auto-fix formatting first (best-effort), then auto-fixable lint issues.
    run(["npx", "--no-install", "prettier", "--write", path], project)
    eslint = run(["npx", "--no-install", "eslint", "--fix", path], project)

    if eslint is not None and eslint.returncode != 0:
        out = (eslint.stdout or "") + (eslint.stderr or "")
        rel = os.path.relpath(path, project)
        print(
            f"ESLint reported issues in {rel} that couldn't be auto-fixed:\n"
            + "\n".join(out.splitlines()[:40]),
            file=sys.stderr,
        )
        return 2

    return 0


if __name__ == "__main__":
    sys.exit(main())
