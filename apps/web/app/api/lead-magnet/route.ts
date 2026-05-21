import { NextRequest, NextResponse } from 'next/server'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const BACKEND_URL = (process.env.NEXT_PUBLIC_LEARNHOUSE_BACKEND_URL || 'http://localhost:1338/').replace(/\/+$/, '')

export async function POST(request: NextRequest) {
  let body: {
    email?: string
    lang?: string
    source?: string
    path?: string
    build_number?: number
    title?: string
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

  try {
    const response = await fetch(`${BACKEND_URL}/api/v1/ikazin/lead-magnet`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        lang: body.lang === 'en' ? 'en' : 'pt',
        source: body.source || 'blog',
        path: body.path || '',
        build_number: body.build_number || 14,
        title: body.title || 'SINAMICS S120',
      }),
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'Could not send lead magnet' }, { status: 502 })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Could not send lead magnet' }, { status: 502 })
  }
}
