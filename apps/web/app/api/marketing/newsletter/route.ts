import { NextRequest, NextResponse } from 'next/server'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: NextRequest) {
  let body: {
    email?: string
    lang?: string
    source?: string
    path?: string
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const email = body.email?.trim().toLowerCase()
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
  }

  const payload = {
    email,
    lang: body.lang === 'en' ? 'en' : 'pt',
    source: body.source || 'blog',
    path: body.path || '',
    created_at: new Date().toISOString(),
  }

  const webhookUrl = process.env.MARKETING_NEWSLETTER_WEBHOOK_URL
  if (webhookUrl) {
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        return NextResponse.json({ error: 'Could not subscribe' }, { status: 502 })
      }
    } catch {
      return NextResponse.json({ error: 'Could not subscribe' }, { status: 502 })
    }
  }

  return NextResponse.json({
    ok: true,
    configured: Boolean(webhookUrl),
  })
}
