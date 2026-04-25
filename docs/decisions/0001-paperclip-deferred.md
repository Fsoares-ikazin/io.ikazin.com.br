# ADR-0001: Defer Paperclip orchestration

**Date:** 2026-04-25
**Status:** Accepted

## Context

Evaluated paperclip (open-source multi-agent orchestrator) as dev workflow tool for building IKAZIN.IO solo.

Setup completed at `/home/phtech/.paperclip/` with CEO agent (claude_local + sonnet-4-6). Server runs at `127.0.0.1:3100`.

## Decision

**Defer paperclip use for now.** Continue with Claude Code direct + `docs/` structure + GitHub/Linear for tickets.

## Rationale

- Solo dev + 1 product → orchestration overhead exceeds productivity gain
- Each agent turn costs LLM tokens; CEO + CTO + 4 reports can burn budget without delivering
- Paperclip approval flow adds friction vs direct Claude Code edits
- Brand DNA + scope already encoded in `docs/` — Claude Code reads it directly per session
- Auto-memory persists user/project context across sessions natively

## When to revisit

- IKAZIN.IO has 3+ active projects in parallel
- Want background agents (heartbeat) for ops tasks (analytics report, content drafts)
- Hire human team and need CEO-style coordination layer

## Alternatives considered

- **Linear/GitHub Issues** — adopted for tickets
- **Notion workspace** — not needed; `docs/` in repo is enough
- **Paperclip full setup with CTO + dev team** — rejected (cost + ceremony)

## Reversal

Server can be killed: `pkill -f paperclipai`
Data preserved: `~/.paperclip/instances/default/`
Restart: `npx paperclipai run`
