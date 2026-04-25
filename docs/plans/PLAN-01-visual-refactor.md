# PLAN-01 — Visual Refactor (New Logo Palette)

**Status:** Steps 1–3 done · Step 4 partial (browser checks pending) · Step 5 in progress
**Owner:** solo dev (Claude Code)
**Created:** 2026-04-25
**Last update:** 2026-04-25
**Scope:** Marketing pages + LMS surfaces (incremental)

## Goal

Replace single-cyan brand with dual-accent (lime + cyan + slate) system derived from new 3D ring logo. Preserve dark mode. Apply via M3 tokens (no hardcoded hex).

## Out of Scope

- LearnHouse upstream code refactor (only consume tokens)
- New routes / features
- Course content production
- Backend / API changes

## Inputs

- New logo (3D isometric ring) — replaces `apps/web/public/logo.png`
- `docs/brand-dna.md` — updated palette
- Existing marketing components: `apps/web/app/_components/marketing/*`

## Steps

### 1. Token foundation (1–2h)

- [ ] Save new logo as `apps/web/public/logo.png` (1024×1024 transparent)
- [ ] Add lower-res variants: `logo-512.png`, `logo-256.png`, `favicon.ico`
- [ ] Locate Tailwind config + global CSS in `apps/web`
- [ ] Add CSS custom properties (HSL) for new tokens:
  - `--bg`, `--surface`, `--slate`, `--lime`, `--cyan`, `--text`, `--text-muted`, `--border`
- [ ] Extend Tailwind theme with named tokens (`bg-bg`, `bg-surface`, `text-lime`, `border-cyan`, etc.)
- [ ] Verify dark mode is the default (no light variant required yet)

### 2. Component sweep (3–4h)

- [ ] `MarketingNav.tsx` — swap logo image, apply lime/cyan tokens to CTA + active state
- [ ] `LandingClient.tsx`:
  - Hero: lime → cyan gradient on headline accent
  - Pain section: keep red tone (semantic error), accent border in slate
  - Pillars: each pillar gets lime OR cyan icon, alternating
  - Tier cards: primary CTA = lime, secondary = cyan outline
  - Tech strip: cyan icons
  - Final CTA: lime button with glow
- [ ] `PlanosClient.tsx` — pricing grid: featured tier in lime, others cyan accent
- [ ] `PlanoDetailClient.tsx` — builds list bullets in lime, demo video frame cyan glow
- [ ] `BlogClient.tsx` — featured card lime border, grid items cyan hover
- [ ] `BlogPostClient.tsx` — content links cyan, mid-CTA lime
- [ ] `LanguageToggle.tsx` — active state lime, inactive slate

### 3. Glow + depth pass (1–2h)

- [ ] Hero CTA glow: `box-shadow: 0 0 32px hsl(var(--lime) / 0.4)`
- [ ] Card hover: lift `translateY(-2px)` + cyan border fade-in
- [ ] Section dividers: thin slate gradient lines
- [ ] Logo treatment in nav: subtle drop shadow + rim glow

### 4. Verification (30min–1h)

- [ ] Run `pnpm dev` (or `npm run dev`) — visit all 5 marketing routes
- [ ] Mobile (Chrome DevTools 375px): no overflow, CTAs reachable
- [ ] Lighthouse mobile: ≥ 90 perf, ≥ 95 a11y
- [ ] Contrast check: lime on dark = AA min, cyan on dark = AA min
- [ ] Type check: `pnpm typecheck` (or equivalent)
- [ ] No raw hex in changed files: `grep -r "#[0-9a-fA-F]\{6\}" apps/web/app/_components/marketing/`

### 5. Commit + branch (15min)

- [ ] Branch: `feat/visual-refactor-new-logo`
- [ ] Commits granular (1 per component)
- [ ] PR description references this plan + before/after screenshots

## Risk / Rollback

- LearnHouse upstream uses different tokens — keep changes scoped to `_components/marketing/` + new globals
- If LMS surfaces break: tokens are additive, old hex literals (if any) untouched
- Rollback: `git revert` branch range

## Open Questions

- [ ] Light mode ever? (Currently no — confirm)
- [ ] Should LMS dashboard adopt new tokens now or later sprint?
- [ ] Any color-blind accessibility constraint? (lime + cyan distinguishable for most CB types — test deutan/protan)
- [ ] Logo file format — keep PNG or also SVG version?

## Estimate

~6–9 hours focused work for marketing surfaces only. LMS surfaces = separate plan.
