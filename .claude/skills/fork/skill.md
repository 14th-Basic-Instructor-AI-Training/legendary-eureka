---
name: fork
description: >-
  Context handoff — summarizes everything important from the current conversation and passes it to a
  specialist agent so it can continue without starting cold. Use after a long chat when you want to
  move the work to a specialist (heroui-expert, authjs-expert, nextjs-developer, etc.).
---

# Fork — Context Handoff (Jalat)

The user has been chatting for a while and wants to hand off to a specialist agent WITHOUT losing
context. Your job is to:

1. **Synthesize the current conversation** into a tight handoff brief.
2. **Pick (or confirm) the target agent** from ARGUMENTS. If ARGUMENTS names an agent, use it. If
   ARGUMENTS is empty or vague, infer the best agent from what the conversation has been about
   (see routing table below).
3. **Spawn that agent** via the Agent tool with the handoff brief as its prompt — so it picks up
   exactly where this conversation left off.

---

## Step 1 — Build the handoff brief

Before spawning, extract these from the current conversation and write them out internally:

- **Goal**: what the user is ultimately trying to accomplish
- **Progress so far**: what has already been decided, built, or confirmed (files touched, approaches
  accepted, approaches rejected and why)
- **Current state**: the exact problem, file, or decision the conversation was in the middle of
- **Constraints & preferences**: anything the user corrected or confirmed during the chat
  (e.g. "don't use X", "keep it minimal", "follow the plan skill output")
- **Remaining work**: what still needs to happen

Format it as a self-contained briefing paragraph that a fresh agent can read without any prior
context. Make it dense but scannable — the agent must not need to re-ask anything already answered
in this conversation.

---

## Step 2 — Pick the target agent

If ARGUMENTS explicitly names an agent, use it. Otherwise match the conversation topic:

| Conversation has been about… | Agent |
|---|---|
| UI components, HeroUI, styling, Tailwind | `heroui-expert` |
| Auth, session, JWT, roles, login, agency upgrade | `authjs-expert` |
| API routes, server actions, data fetching | `api-routes-expert` |
| Zod schemas, forms, RHF, data shapes | `zod-schema-expert` |
| TypeScript errors, types, generics | `typescript-expert` |
| i18n, translations, KH/KR/ENG | `i18n-expert` |
| Tests, Vitest, RTL, Playwright | `tdd-guide` |
| Code review, correctness, HeroUI violations | `code-reviewer` |
| Security, permission leaks, role bypass | `security-auditor` |
| Full feature, routing, layouts, stores | `nextjs-developer` |

---

## Step 3 — Spawn with the handoff brief

Use the Agent tool. Pass the handoff brief as the full prompt. The brief must include:

```
You are picking up a conversation mid-way. Here is all the context you need:

**Goal:** <what the user wants to accomplish>

**What's been done:**
<bullet list of decisions made, files changed, approaches confirmed/rejected>

**Current state:**
<exactly where things stand right now — what file, what problem, what was the last thing discussed>

**Constraints:**
<anything the user corrected or insisted on during the chat>

**What to do next:**
<the remaining work, stated precisely>
```

Do NOT ask the user to repeat anything from the conversation — all of it should be in the brief.

---

## After the agent completes

Summarize the agent's output for the user in 2-3 sentences. If the agent needs a follow-up
decision from the user, surface it clearly.
