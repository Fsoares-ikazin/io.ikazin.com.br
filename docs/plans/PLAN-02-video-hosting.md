# PLAN-02 — Video Hosting Strategy

**Status:** Draft
**Owner:** solo dev (decision pending)
**Created:** 2026-04-25
**Scope:** Course video delivery (free tier MVP → paid tier scale)

## Goal

Pick + integrate video hosting that:
1. Costs $0 in MVP / pre-revenue phase
2. Survives 1k+ paying users without re-platforming
3. Plays cleanly on mobile + desktop, multiple bitrates (HLS preferred)
4. Allows access control for paid tiers (signed URLs / token gating)
5. Doesn't expose original files publicly when paywalled

## Options compared

| Option | Free tier | Paid breakpoint | HLS auto | Access control | Branding |
|--------|-----------|-----------------|----------|----------------|----------|
| **YouTube unlisted** | Unlimited | n/a (always free) | Yes | Weak (URL = open) | YT logo + suggested videos |
| **Cloudflare R2 + HTML5 `<video>`** | 10 GB storage, egress free | $0.015/GB after 10GB | No (manual transcode) | Strong (signed URL) | None |
| **Backblaze B2 + Cloudflare CDN** | 10 GB free | $0.006/GB after | No | Medium | None |
| **Vimeo Basic** | 500 MB/week, 5 GB total | $7+/mo Plus | Yes | Medium | Vimeo branding |
| **Mux free** | 10 GB storage, 1k stream-min/mo | $5/1k min after | Yes | Strong (signed playback) | None |
| **Cloudflare Stream** | None ($5/1k min) | n/a (paid only) | Yes | Strong | None |
| **Internet Archive** | Unlimited | n/a | Partial | None (always public) | IA branding |
| **PeerTube self-host** | Server cost only | scales with VPS | Yes | Medium | Customizable |

## Recommended path (3 phases)

### Phase A — MVP (M1–M3)

**Strategy:** Free previews on YouTube unlisted + paid lessons on Cloudflare R2 with signed URLs.

- YouTube unlisted for:
  - Hero video on landing
  - Tier preview clips (build trailers)
  - Free blog post embeds
- Cloudflare R2 for:
  - Full paid lessons (BASIC tier first)
  - Use signed URLs (R2 supports presigned, expire after N minutes)
  - Workers script for token verification

Cost: $0 (under R2 10GB free tier with first 8 builds)

### Phase B — Scale (M4–M9)

**Strategy:** Migrate paid content to Mux for HLS + analytics + better player.

- Mux Free → Mux Pay-as-you-go ($5 per 1k min stream)
- Keep YouTube for top-of-funnel
- Use Mux signed playback IDs for paywall
- Build a custom React player (Mux Player or HLS.js)

Cost: ~$50–200/mo depending on watched minutes

### Phase C — Mature (M10–12+)

**Strategy:** Hybrid based on usage data.

- High-volume content → Mux or Cloudflare Stream
- Long-tail / rarely watched → R2 + simple HTML5 player
- Live / cohort sessions → Cloudflare Stream Live or Mux Live

## Implementation tasks (Phase A)

### A.1 — YouTube channel setup (1h)
- [ ] Create channel `ikazin.io` (or use Pedro's existing if any)
- [ ] Branding: dark + lime/cyan banner, intro/outro 3s
- [ ] Upload first preview clips as **unlisted**
- [ ] Note video IDs for embed in marketing pages

### A.2 — Cloudflare account + R2 (1h)
- [ ] Cloudflare account
- [ ] Create R2 bucket: `ikazin-courses-prod`
- [ ] Generate API token (S3-compatible)
- [ ] Test upload via `aws s3 cp` or `rclone`

### A.3 — Encoding pipeline (2–3h)
- [ ] Local script: `ffmpeg` → 720p MP4 (H.264 + AAC, CRF 23)
- [ ] Multiple bitrates manual: 1080p, 720p, 480p
- [ ] Naming: `builds/{tier}/{slug}/{quality}.mp4`
- [ ] Optional: HLS segmenting (`ffmpeg -hls_time 6 ...`)

### A.4 — Signed URL Worker (3–4h)
- [ ] Cloudflare Worker route: `/video/:slug`
- [ ] Verify Stripe customer / paid tier (via Supabase / LH user table)
- [ ] Return presigned R2 URL with 5min expiry
- [ ] Player includes URL refresh on expiry

### A.5 — Player component (2–3h)
- [ ] Next.js component: `<CourseVideoPlayer videoSlug=... />`
- [ ] HTML5 `<video>` with HLS.js fallback
- [ ] Resume position localStorage
- [ ] Speed selector (0.5x → 2x)
- [ ] Captions (.vtt) support

### A.6 — Marketing embeds (1h)
- [ ] Replace `<video src="/video-hero.mp4">` with YouTube `<iframe>` for hero
- [ ] Tier card preview clicks → modal with YouTube embed
- [ ] Privacy mode (`youtube-nocookie.com`)

## Decisions needed

- [ ] Confirm: YouTube channel + R2 = OK for MVP?
- [ ] Worker hosting account (Cloudflare free worker is 100k req/day — enough)
- [ ] Auth source — LearnHouse user table or separate Stripe customer mapping?
- [ ] Captions: auto-generated (Whisper) or manual?
- [ ] Subtitle languages: PT-BR + EN?

## Risk

- **YouTube unlisted leakage** — URLs can be shared. Mitigation: short clips only, full content on R2.
- **R2 egress at scale** — free egress under Bandwidth Alliance, but watch dashboards monthly.
- **Worker rate limits** — 100k req/day = ~3.3k req/min sustained. Should cover early growth.
- **Encoding time** — long videos take hours. Run async, queue uploads.

## Out of scope

- Live streaming (Phase C)
- DRM / Widevine (only consider if piracy becomes a real problem)
- Analytics beyond simple play count (use Mux for proper engagement metrics later)
