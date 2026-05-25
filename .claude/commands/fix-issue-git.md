---
description: Read a GitHub issue and propose a fix
argument-hint: <issue-url-or-number>
allowed-tools: Read, Grep, Glob, Bash(git:*), WebFetch
model: claude-sonnet-4-6
---

You are fixing GitHub issue: $1

## Context
Current branch: !`git branch --show-current`
Git remote: !`git remote get-url origin 2>/dev/null || echo "no remote"`

## Task
1. Determine the issue to fetch:
   - If "$1" is a full GitHub URL like `https://github.com/owner/repo/issues/N`:
     - Parse owner, repo, and issue number from the URL
     - Fetch the issue via WebFetch at `https://api.github.com/repos/<owner>/<repo>/issues/<number>`
   - If "$1" is just a number:
     - Get the repo from the git remote URL above
     - Fetch the issue via WebFetch at `https://api.github.com/repos/<owner>/<repo>/issues/$1`
2. Read the issue title and body to understand what needs fixing.
3. Locate the relevant files in this repo.
4. Propose a minimal patch — wait for the user to confirm before editing.
