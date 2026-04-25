# IKAZIN.IO — Brand DNA

**Updated:** 2026-04-25 — new logo (3D isometric ring) defines new palette.

NEVER deviate from these without explicit approval.

## Logo

- File: `apps/web/public/logo.png` (to be replaced with new 3D version)
- Style: 3D isometric, ring containment, glowing edges
- Letterforms: lime "i" (vertical) + cyan "K" + dark slate base bar
- Treatment: subtle drop shadow, rim light, soft glow

## Core Principles

1. **Dark mode primary** — always
2. **Dual accent system** — lime + cyan (not single cyan anymore)
3. **3D / depth feel** — subtle, not skeuomorphic
4. **M3 tokens only** — no hardcoded hex in components

## Palette

| Role | Token name | Approx hex | Use |
|------|-----------|-----------|-----|
| BG primary | `--bg` | `#0A0E14` | Page background |
| BG surface | `--surface` | `#161B22` | Cards, inputs |
| BG slate | `--slate` | `#3A4555` | Logo base bar tone, secondary surfaces |
| Accent lime | `--lime` | `#A8E063` | Primary CTAs, "i" letter, energy |
| Accent cyan | `--cyan` | `#3FB5BC` | Secondary CTAs, "K" letter, calm/tech |
| Text primary | `--text` | `#E6EDF3` | Body |
| Text muted | `--text-muted` | `#8B949E` | Captions, meta |
| Border | `--border` | `#21262D` | Subtle dividers |

All via HSL CSS custom properties (M3 token system).

### Lime (energy / action)
- Use for: primary CTAs, success states, progress, "Get started"
- Glow: `box-shadow: 0 0 24px hsl(var(--lime) / 0.4)`
- Hover: shift +5% lightness

### Cyan (tech / authority)
- Use for: secondary CTAs, links, info, technical terms
- Glow: `box-shadow: 0 0 24px hsl(var(--cyan) / 0.35)`
- Headlines accent / underlines

### Slate (structure)
- Use for: base bars, dividers in light blocks, secondary cards
- Pairs with lime/cyan to mirror logo structure

## Gradients

Logo-inspired gradients:
- **Hero gradient:** lime → cyan (135deg)
- **Ring effect:** radial lime glow with cyan inner ring
- **Card hover:** subtle lime/cyan border shift

## Typography

- Modern sans (Inter / Geist / Space Grotesk)
- Generous spacing (1.5–1.6 line-height)
- Headlines: tight tracking
- Code / technical: mono (JetBrains Mono / Geist Mono)

## Style Vocabulary

- **Glassmorphism** — backdrop blur on overlays, light
- **Soft shadows** — low opacity, large blur
- **Glow rims** — accents only, not overused
- **3D depth** — cards lift on hover, subtle elevation
- **Iconography** — thin stroke (1.5px), lime or cyan accent

## Reference Mix

UX patterns (not copy):
- **Rocketseat** — course UX, progress feedback
- **Alura** — content structure, learning paths
- **Netflix** — catalog cards, hover states
- **Vercel** — dark + accent + clean tech aesthetic

## Reference Assets

- Brand analysis: `/home/phtech/dev/build-ikazin.io/Análise de Identidade Visual - Ikazin.md`
- Section refs: `/home/phtech/dev/build-ikazin.io/{home,plataforma,blog,captura,newsletter,planos-detalhes}/`
- Presentation: `/home/phtech/Imagens/pura-tecnologia/IKAZIN_IO_Presentation_EN.pptx`

## Anti-Patterns

Don't:
- Use light mode as primary
- Hardcode hex — always use token
- Use ONLY cyan (old palette) — pair with lime
- Heavy gradients (rainbow look)
- Generic Bootstrap-look cards
- AI-generated stock illustrations
- Default Tailwind blue (`bg-blue-500`) — use cyan token
- Lime + cyan in same CTA (pick one role per element)
- Skeuomorphic 3D — keep it subtle
