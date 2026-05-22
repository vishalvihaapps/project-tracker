---
name: example-agent
description: Example subagent — describe here WHEN this agent should be invoked so Claude can route to it automatically. Rename this file and edit the fields below.
tools: Read, Grep, Glob
model: inherit
---

You are a sample project-scoped subagent.

Replace this body with the system prompt that defines the agent's role, scope,
and how it should approach its tasks.

- `name`: the identifier used to invoke this agent.
- `description`: triggers automatic delegation — be specific about when to use it.
- `tools`: comma-separated allowlist; omit the field entirely to inherit all tools.
- `model`: `inherit`, or a specific model like `sonnet` / `opus` / `haiku`.
