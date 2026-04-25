# IKAZIN.IO — docs/

Project knowledge base. Read these before working.

## Index

- [scope.md](scope.md) — what we're building, current state, open questions
- [brand-dna.md](brand-dna.md) — Dark + Cyan + M3 + glassmorphism rules
- [roadmap.md](roadmap.md) — 12-month phased plan, $175k target
- [deploy.md](deploy.md) — deployment notes

## Folders

- `roles/` — persona prompts (dev, designer, marketer) for focused Claude Code sessions
- `plans/` — feature-level implementation plans (one file per feature)
- `decisions/` — ADRs (architectural decisions, dated)
- `sprints/` — sprint planning notes

## Workflow

1. New feature → write `plans/PLAN-XX-name.md` first
2. Major decision → write `decisions/NNNN-title.md` ADR
3. Each sprint → `sprints/SP-NN.md` with goals + retrospective
4. Switch hat → invoke role: "Read `docs/roles/dev.md` and act as that persona"

## Tickets

External: Linear or GitHub Issues (not in repo).

## Memory

Personal Claude Code memory at `~/.claude/projects/.../memory/MEMORY.md` — auto-managed, persists across sessions.
