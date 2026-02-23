import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import Groq from 'groq-sdk'

const GROQ_MODEL = 'llama-3.3-70b-versatile'

// Call Groq with a structured DB_CONTEXT provided as a system message.
async function callGroqWithContext(prompt: string, dbContext: any) {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) throw new Error('GROQ_API_KEY not set')

  const groq = new Groq({ apiKey })
  const systemContent = `You are Momoyo Kataoka's digital twin. Answer ONLY based on the DB_CONTEXT provided. Do not use any outside knowledge. If information is not in DB_CONTEXT, say 'I cannot find this information.'\nDB_CONTEXT:${JSON.stringify(
    dbContext
  )}`

  const response = await groq.chat.completions.create({
    model: GROQ_MODEL,
    messages: [
      { role: 'system', content: systemContent },
      { role: 'user', content: prompt },
    ],
  })

  const reply = response?.choices?.[0]?.message?.content ?? JSON.stringify(response)
  return String(reply)
}

export async function POST(req: NextRequest) {
  try {
    const raw = await req.text()
    const payload = raw ? JSON.parse(raw) : {}

    // Full payload logging for debugging
    try {
      console.log('FULL VAPI PAYLOAD:', JSON.stringify(payload, null, 2))
    } catch (e) {
      console.log('FULL VAPI PAYLOAD: <unserializable>')
    }

    // Improved userId extraction strategy (try fields in order)
    let userId: string | null =
      payload?.metadata?.userId ?? payload?.user?.id ?? payload?.caller?.id ?? payload?.from ?? payload?.phoneNumber ?? null

    // Determine source for logging
    let resolvedFrom: string | null = null
    if (payload?.metadata?.userId) resolvedFrom = 'metadata.userId'
    else if (payload?.user?.id) resolvedFrom = 'user.id'
    else if (payload?.caller?.id) resolvedFrom = 'caller.id'
    else if (payload?.from) resolvedFrom = 'from'
    else if (payload?.phoneNumber) resolvedFrom = 'phoneNumber'

    console.log('Resolved userId:', userId, 'source:', resolvedFrom)

    // TEMPORARY TEST MODE: fallback userId for debugging
    if (!userId) {
      userId = 'test-user-1'
      console.log('Using fallback test userId')
    }

    // Note: current Prisma schema stores Profile / Resume / Skill as global records
    // (no userId field). Use global queries accordingly.
    console.log('Resolved userId:', userId, 'typeof:', typeof userId)
    console.log('Profile lookup field used: <none - global Profile>')

    let profile = null
    let career: any[] = []
    let skills: any[] = []

    try {
      // Global profile (no user scoping in schema)
      profile = await prisma.profile.findFirst()
      career = await prisma.resume.findMany({ orderBy: { startDate: 'desc' } })
      skills = await prisma.skill.findMany()
    } catch (dbErr) {
      console.error('DB query failed', dbErr)
      return NextResponse.json({ response: { message: { role: 'assistant', content: 'I cannot find this information.' } } })
    }

    const DB_CONTEXT = {
      profile: profile ?? null,
      career: career ?? [],
      skills: skills ?? [],
    }

    // If there's no data to answer, respond explicitly per rule
    if (!profile && career.length === 0 && skills.length === 0) {
      return NextResponse.json({ response: { message: { role: 'assistant', content: 'I cannot find this information.' } } })
    }

    // Extract user's prompt from webhook payload
    const userMessage = payload?.message?.content || payload?.message?.text || payload?.text || payload?.user?.message || ''

    // Call LLM with strict DB_CONTEXT
    let replyText: string
    try {
      replyText = await callGroqWithContext(String(userMessage || ''), DB_CONTEXT)
    } catch (e) {
      console.error('Groq call failed in webhook', e)
      return NextResponse.json({ response: { message: { role: 'assistant', content: 'I cannot find this information.' } } })
    }

    const responsePayload = { response: { message: { role: 'assistant', content: replyText } } }
    return NextResponse.json(responsePayload)
  } catch (err) {
    console.error('Vapi webhook error', err)
    return NextResponse.json({ response: { message: { role: 'assistant', content: "I'm sorry, I couldn't retrieve that information." } } }, { status: 500 })
  }
}
