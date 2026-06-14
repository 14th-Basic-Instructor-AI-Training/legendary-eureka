#!/usr/bin/env python3
"""PostToolUse hook: scan edited frontend files for security smells.

Frontend analog of the backend team's security-scan.py. After an Edit/Write/MultiEdit
to a JS/TS/JSX/TSX file, scans the file for high-signal frontend risks and reports them
back to Claude (non-blocking feedback, exit 2):

  - hardcoded secrets / API keys / tokens shipped to the client
  - dangerouslySetInnerHTML (XSS)
  - eval / new Function
  - http:// (non-TLS) endpoints
  - NEXT_PUBLIC_* used for something that looks secret

Patterns are also catalogued in .claude/security-patterns.json. Wired in
.claude/settings.json under PostToolUse (matcher: Edit|Write|MultiEdit).
"""
import json
import os
import re
import sys

SCAN_EXTS = (".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs")

RULES = [
    (r"dangerouslySetInnerHTML", "dangerouslySetInnerHTML — XSS risk; sanitize or avoid raw HTML."),
    (r"\beval\s*\(", "eval() — avoid; it executes arbitrary code."),
    (r"new\s+Function\s*\(", "new Function() — dynamic code execution; avoid."),
    (r"(?i)(api[_-]?key|secret|password|token)\s*[:=]\s*['\"][A-Za-z0-9_\-]{12,}['\"]",
     "Looks like a hardcoded secret/credential in client code."),
    (r"(?i)NEXT_PUBLIC_[A-Z0-9_]*(SECRET|KEY|TOKEN|PASSWORD)",
     "NEXT_PUBLIC_* is exposed to the browser — never put secrets behind it."),
    (r"https?://[^'\"\s]*:[^'\"\s]*@", "Credentials embedded in a URL."),
    (r"http://(?!localhost|127\.0\.0\.1)", "Non-TLS http:// endpoint to a remote host."),
]
COMPILED = [(re.compile(p), msg) for p, msg in RULES]


def main() -> int:
    try:
        payload = json.load(sys.stdin)
    except (json.JSONDecodeError, ValueError):
        return 0

    if payload.get("tool_name") not in ("Edit", "Write", "MultiEdit"):
        return 0

    tool_input = payload.get("tool_input", {}) or {}
    path = tool_input.get("file_path") or tool_input.get("path") or ""
    if not path.endswith(SCAN_EXTS) or not os.path.isfile(path):
        return 0

    try:
        with open(path, "r", encoding="utf-8", errors="replace") as fh:
            lines = fh.readlines()
    except OSError:
        return 0

    findings = []
    for i, line in enumerate(lines, start=1):
        for rx, msg in COMPILED:
            if rx.search(line):
                findings.append(f"  L{i}: {msg}")

    if findings:
        project = os.environ.get("CLAUDE_PROJECT_DIR", os.getcwd())
        rel = os.path.relpath(path, project)
        print(
            f"security-scan flagged {rel}:\n" + "\n".join(findings[:30]) +
            "\nReview before continuing.",
            file=sys.stderr,
        )
        return 2

    return 0


if __name__ == "__main__":
    sys.exit(main())
