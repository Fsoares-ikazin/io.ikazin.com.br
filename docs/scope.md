# IKAZIN.IO — Scope

## Product
LMS for industrial automation education (virtual commissioning + digital twins). Built on LearnHouse fork.

Target audience: industrial automation professionals, students, factory engineers wanting hands-on PLC/SINAMICS/motion training without lab access.

Differentiator: Pedro's deep expertise in Siemens PLC/SINAMICS + virtual commissioning workflow.

## Tech Stack
- **Base:** LearnHouse open-source LMS (fork)
- **Frontend:** Next.js 14, Radix UI, Tailwind CSS, M3 tokens (HSL CSS vars)
- **Backend:** LearnHouse Python API (FastAPI)
- **Repo:** `/home/phtech/dev/io.ikazin.com.br`
- **Web app:** `apps/web`
- **Branch (active):** `dev-front`

## Tiers (USD)

| Tier | Price | Builds | Notes |
|------|-------|--------|-------|
| BASIC | $69 | 1–8 | Boolean logic, drives, sensors |
| ESSENTIALS | $119 | 9–13 | PID, packaging machines |
| ADVANCED | $159 | 14–18 | SINAMICS S120, motion |
| PREMIUM | $209 | 19–25 | SCARA, Delta, CNC G-code, SIMOTION D |
| PREMIUM PLUS | $1,229 / participant | All | In-person, min 8 ($9,832/class) |
| CUSTOMIZED | scoped | Build 26 | Per-client engagement |

## Revenue Plan (12 months)

- Gross target: $175,000
- Sales target: 1,902
- Traffic budget: $39,800
- ROAS: 4.4x

Phases:
- M1–M3: $21k
- M4–M6: $40k
- M7–M9: $65k
- M10–M12: $49k

## Build Modules (Course Content)

26 builds total. Mapped to tiers above. Each build = self-contained unit (theory + virtual rig + tasks).

## Routes Built

| Route | Component | Status |
|-------|-----------|--------|
| `/` | `_components/marketing/LandingClient.tsx` | ✅ |
| `/planos` | `_components/marketing/PlanosClient.tsx` | ✅ |
| `/planos/[slug]` | `_components/marketing/PlanoDetailClient.tsx` | ✅ |
| `/blog` | `_components/marketing/BlogClient.tsx` | ✅ |
| `/blog/[slug]` | `_components/marketing/BlogPostClient.tsx` | ✅ |

## Shared Marketing Components

- `_components/marketing/MarketingNav.tsx` — sticky nav, EN/PT toggle
- `_components/marketing/LanguageToggle.tsx` — `useMarketingLang` hook

## Proxy Bypass

`apps/web/proxy.ts`:
```ts
const standard_paths = ['/home', '/', '/planos', '/builds', '/blog', '/privacy', '/terms']
const standard_prefixes = ['/planos/', '/blog/']
```

Why: proxy rewrites all routes to `/orgs/${default_org}/` in single-org mode. Marketing must bypass.

## Status — Decisions (2026-04-25)

| Item | Decision |
|------|----------|
| LMS dashboard | LearnHouse default for now → must be customized to ikazin.io brand |
| Payments | **Stripe** (planned) |
| Analytics | **GA4** |
| Newsletter | **Zoho SMTP** |
| Video hosting | **TBD** — see `plans/PLAN-02-video-hosting.md` (recommended: YouTube unlisted MVP → Cloudflare R2 / Mux for premium) |
| Domain | **`io.ikazin.com.br`** (subdomain) |
| Auth | LearnHouse default (revisit if needed) |
| Branding | **New 3D logo** → lime + cyan + slate palette (see `brand-dna.md`) |

## Status — Open Questions

- [ ] Build 1–26 content — produced or only planned?
- [ ] Admin panel customizations — needed?
- [ ] Email transactional — Zoho SMTP also for receipts/password reset, or separate provider?
- [ ] Cohort vs evergreen — courses always-open or scheduled batches?
- [ ] Light mode — ever? (Currently dark-only)
