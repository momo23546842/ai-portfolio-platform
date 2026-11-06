import { NextResponse } from 'next/server'

// The assistant's spoken replies are cut to ~150 characters before they reach this route,
// so anything much longer is not from the site. The cap stops the route being used as a
// free text-to-speech service on my ElevenLabs credits.
const MAX_TTS_CHARS = 600

// Best-effort limit per visitor (per server instance), like the chat API.
const recentRequests = new Map<string, number[]>()
function rateLimited(key: string, limit = 20, windowMs = 60_000) {
  const now = Date.now()
  const times = (recentRequests.get(key) || []).filter((t) => now - t < windowMs)
  times.push(now)
  recentRequests.set(key, times)
  return times.length > limit
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const text = typeof body?.text === 'string' ? body.text.trim() : ''
    if (!text) return new NextResponse('Missing text', { status: 400 })
    if (text.length > MAX_TTS_CHARS) return new NextResponse('Text too long', { status: 413 })

    const visitor = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    if (rateLimited(visitor)) return new NextResponse('Too many requests', { status: 429 })

    const key = process.env.ELEVENLABS_API_KEY
    // Only my own voice: the voice id is never taken from the request.
    const voiceId = process.env.VOICE_ID
    if (!key || !voiceId) return new NextResponse('Voice is not configured', { status: 500 })

    const resp = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'xi-api-key': key },
      body: JSON.stringify({ text }),
    })

    if (!resp.ok) {
      console.error('ElevenLabs error', resp.status, await resp.text())
      return new NextResponse('Voice service error', { status: 502 })
    }

    const arrayBuffer = await resp.arrayBuffer()
    const contentType = resp.headers.get('content-type') || 'audio/mpeg'
    return new NextResponse(arrayBuffer, { headers: { 'Content-Type': contentType } })
  } catch (err) {
    console.error('elevenlabs proxy error', err)
    return new NextResponse('error', { status: 500 })
  }
}
