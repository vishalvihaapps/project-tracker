# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Status

This workspace is newly initialized and does not yet contain application code.
Re-run `/init` once source files are added to generate real architecture documentation.

## Project-scoped Claude Code configuration

- `.claude/settings.json` — shared project settings (permissions, env, hooks); committed.
- `.claude/settings.local.json` — personal overrides; not committed (gitignored).
- `.claude/commands/` — custom slash commands (filename becomes the command name).
- `.claude/agents/` — custom subagents (the `description` field drives auto-delegation).
- `.claude/skills/` — custom skills (one folder per skill, each with a `SKILL.md`).
- `.mcp.json` — project-scoped MCP servers shared with anyone who works in this repo.

## Conventions

Add project-specific rules, coding conventions, and constraints here as the project grows.
This section is the "rules" Claude Code follows for every task in this repository.

## Rules

Detailed, single-topic rules live in `.claude/rules/` and are imported below so
Claude Code loads them automatically. Add a matching `@` line for each new rule file.

@.claude/rules/example-rule.md
