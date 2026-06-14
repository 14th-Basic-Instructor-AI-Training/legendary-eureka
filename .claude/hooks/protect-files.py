#!/usr/bin/env python3
"""PreToolUse hook: protect sensitive / generated files from edits.

Frontend analog of the backend team's protect-files.py. Blocks Edit/Write/MultiEdit
against files that should not be hand-edited by the agent:
  - secrets:        .env, .env.*, *.pem, *.key
  - lockfiles:      package-lock.json, pnpm-lock.yaml, yarn.lock, bun.lockb
  - generated:      .next/, node_modules/, .heroui-docs/, next-env.d.ts
  - CI/infra:       anything the team flags below

Wired in .claude/settings.json under PreToolUse (matcher: Edit|Write|MultiEdit).
Exit 2 blocks and explains. Adjust PROTECTED to taste.
"""
import fnmatch
import json
import os
import sys

PROTECTED = [
    ".env",
    ".env.*",
    "*.pem",
    "*.key",
    "package-lock.json",
    "pnpm-lock.yaml",
    "yarn.lock",
    "bun.lockb",
    "next-env.d.ts",
    "*/.next/*",
    "*/node_modules/*",
    "*/.heroui-docs/*",
]


def matches(rel: str, basename: str) -> bool:
    for pat in PROTECTED:
        if fnmatch.fnmatch(basename, pat) or fnmatch.fnmatch(rel, pat) or fnmatch.fnmatch("/" + rel, pat):
            return True
    return False


def main() -> int:
    try:
        payload = json.load(sys.stdin)
    except (json.JSONDecodeError, ValueError):
        return 0

    if payload.get("tool_name") not in ("Edit", "Write", "MultiEdit"):
        return 0

    tool_input = payload.get("tool_input", {}) or {}
    path = tool_input.get("file_path") or tool_input.get("path") or ""
    if not path:
        return 0

    project = os.environ.get("CLAUDE_PROJECT_DIR", os.getcwd())
    rel = os.path.relpath(path, project)
    basename = os.path.basename(path)

    if matches(rel, basename):
        print(
            f"protect-files: '{rel}' is protected (secret, lockfile, or generated). "
            "Don't hand-edit it. For deps use the package manager; for secrets ask the "
            "user to edit it themselves.",
            file=sys.stderr,
        )
        return 2

    return 0


if __name__ == "__main__":
    sys.exit(main())
