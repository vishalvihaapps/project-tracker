# Example Rule

Replace this with a focused, single-topic rule — e.g. a coding convention,
a naming standard, or a workflow constraint.

Keep each file in `.claude/rules/` scoped to one concern so rules stay easy to
maintain and review. This file is loaded into Claude Code's context only because
`CLAUDE.md` imports it with an `@` reference.

To add another rule: create a new `.md` file in this folder and add a matching
`@.claude/rules/<file>.md` line to the Rules section of `CLAUDE.md`.
