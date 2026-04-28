import { ImageResponse } from 'next/og'
import { posts } from '../../../../_data/blog-posts'

export const runtime = 'edge'

const tagLabels: Record<string, string> = {
  vc: 'VIRTUAL COMMISSIONING',
  plc: 'PLC / TIA PORTAL',
  drives: 'DRIVES & MOTION',
  dt: 'DIGITAL TWIN',
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const post = posts.find((item) => item.slug.en === slug || item.slug.pt === slug)
  const lang = post?.slug.en === slug ? 'en' : 'pt'

  if (!post) {
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            background: '#07090d',
            color: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 56,
            fontWeight: 800,
          }}
        >
          IKAZIN.IO
        </div>
      ),
      { width: 1200, height: 630 }
    )
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#07090d',
          color: '#f8fafc',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 64,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            width: 360,
            height: '100%',
            background: 'linear-gradient(180deg, rgba(0, 229, 255, 0.16), rgba(187, 247, 55, 0.08))',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 64,
            right: 64,
            top: 154,
            height: 1,
            background: 'rgba(148, 163, 184, 0.28)',
          }}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 30, fontWeight: 900, letterSpacing: 1 }}>IKAZIN.IO</div>
          <div
            style={{
              border: '1px solid rgba(0, 229, 255, 0.45)',
              color: '#00e5ff',
              borderRadius: 999,
              padding: '10px 18px',
              fontSize: 18,
              fontWeight: 800,
            }}
          >
            {tagLabels[post.tag] || 'INDUSTRIAL AUTOMATION'}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 900 }}>
          <h1
            style={{
              fontSize: 66,
              lineHeight: 1,
              fontWeight: 900,
              margin: 0,
              letterSpacing: -1,
            }}
          >
            {post.title[lang]}
          </h1>
          <p style={{ fontSize: 28, lineHeight: 1.35, color: '#b8c0cc', margin: 0 }}>
            {post.excerpt[lang]}
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#93a4b7', fontSize: 22 }}>
          <span>{post.readMin} min</span>
          <span>{post.date}</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
