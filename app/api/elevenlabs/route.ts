import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const text: string = String(body?.text || '')
    if (!text) return new NextResponse('Missing text', { status: 400 })

    const key = process.env.ELEVENLABS_API_KEY
    const voiceId = process.env.VOICE_ID || body?.voiceId
    if (!key) return new NextResponse('Missing ELEVENLABS_API_KEY', { status: 500 })
    if (!voiceId) return new NextResponse('Missing voice id', { status: 500 })

    // Call ElevenLabs TTS
    const resp = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': key,
      },
      body: JSON.stringify({ text }),
    })

    if (!resp.ok) {
      const txt = await resp.text()
      return new NextResponse(txt || 'ElevenLabs error', { status: resp.status })
    }

    const arrayBuffer = await resp.arrayBuffer()
    const contentType = resp.headers.get('content-type') || 'audio/mpeg'

    return new NextResponse(arrayBuffer, { headers: { 'Content-Type': contentType } })
  } catch (err: any) {
    console.error('elevenlabs proxy error', err)
    return new NextResponse(String(err?.message || 'error'), { status: 500 })
  }
}
