import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import Groq from 'groq-sdk'

const GROQ_MODEL = 'llama-3.3-70b-versatile'

// Call Groq with a structured DB_CONTEXT provided as a system message.
async function callGroqWithContext(prompt: string, dbContext: any) {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) throw new Error('GROQ_API_KEY not set')

  const groq = new Groq({ apiKey })

  const systemContent = `You are Momoyo Kataoka's digital twin. USE ONLY the structured DB_CONTEXT provided below. Do NOT use external knowledge or training data for personal facts. DB_CONTEXT:${JSON.stringify(
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
    console.log('Vapi webhook raw body:', raw)
    const body = raw ? JSON.parse(raw) : {}

    // Log top-level keys and commonly used fields for visibility
    try {
      console.log('Vapi webhook parsed keys:', Object.keys(body))
    } catch (e) {
      console.log('Vapi webhook parsed keys: <unserializable>')
    }

    try {
      console.log('Vapi webhook message field:', JSON.stringify(body?.message ?? null))
    } catch (e) {
      console.log('Vapi webhook message field: <unserializable>')
    }

    try {
      console.log('Vapi webhook user field:', JSON.stringify(body?.user ?? null))
    } catch (e) {
      console.log('Vapi webhook user field: <unserializable>')
    }

    // Log headers for debugging (collect into an object first)
    try {
      const hdrs: Record<string, string> = {}
      req.headers.forEach((v, k) => (hdrs[k] = v))
      console.log('Vapi webhook headers:', JSON.stringify(hdrs))
    } catch (e) {
      console.log('Vapi webhook headers: <failed to read>')
    }

    // Try common shapes for user's message
    const userMessage = body?.message?.content || body?.message?.text || body?.text || body?.user?.message || ''

    // Extract userId and query DB for that user only (server-side)
    const userId = body?.metadata?.userId || body?.user?.id || body?.caller?.id || body?.from || body?.userId || null
    console.log('webhook userId:', userId)

    if (!userId) {
      return NextResponse.json({ response: { message: { role: 'assistant', content: "I cannot find this information in the database." } } }, { status: 400 })
    }

    // Example Prisma queries (adjust field names if your schema differs):
    // const profile = await prisma.profile.findFirst({ where: { userId: String(userId) } })
    // const career = await prisma.resume.findMany({ where: { userId: String(userId) }, orderBy: { startDate: 'desc' } })
    // const skills = await prisma.skill.findMany({ where: { userId: String(userId) } })

    let profile = null
    let career: any[] = []
    let skills: any[] = []
    try {
      profile = await prisma.profile.findFirst({ where: { userId: String(userId) } })
      career = await prisma.resume.findMany({ where: { userId: String(userId) }, orderBy: { startDate: 'desc' } })
      skills = await prisma.skill.findMany({ where: { userId: String(userId) } })
    } catch (dbErr) {
      console.error('DB query failed', dbErr)
      return NextResponse.json({ response: { message: { role: 'assistant', content: "I'm sorry, I couldn't retrieve that information." } } }, { status: 500 })
    }

    const DB_CONTEXT = {
      profile: profile ?? null,
      career: career ?? [],
      skills: skills ?? [],
    }

    // If there's no data to answer, respond explicitly per rule
    if (!profile && career.length === 0 && skills.length === 0) {
      return NextResponse.json({ response: { message: { role: 'assistant', content: "I cannot find this information in the database." } } })
    }

    // Call LLM with strict DB_CONTEXT
    let replyText: string
    try {
      replyText = await callGroqWithContext(String(userMessage || ''), DB_CONTEXT)
    } catch (e) {
      console.error('Groq call failed in webhook', e)
      return NextResponse.json({ response: { message: { role: 'assistant', content: "I'm sorry, I couldn't retrieve that information." } } }, { status: 500 })
    }

    const responsePayload = { response: { message: { role: 'assistant', content: replyText } } }
    return NextResponse.json(responsePayload)
  } catch (err) {
    console.error('Vapi webhook error', err)
    return NextResponse.json({ response: { message: { role: 'assistant', content: "I'm sorry, I couldn't retrieve that information." } } }, { status: 500 })
  }
}

function generateReplyFromContext(message: string, context: string) {
  const lower = message.toLowerCase()
  if (lower.includes('skill') || lower.includes('skills')) {
    const m = context.match(/Skills: ([^\n]+)/)
    return m ? `Momoyo's key skills include: ${m[1]}.` : `I'm sorry, I couldn't retrieve that information.`
  }
  if (lower.includes('career') || lower.includes('work') || lower.includes('company')) {
    const m = context.match(/Career: ([^\n]+)/)
    return m ? `Recent roles: ${m[1]}.` : `I'm sorry, I couldn't retrieve that information.`
  }
  if (lower.includes('where') || lower.includes('based')) {
    return `I'm sorry, I couldn't retrieve that information.`
  }

  const prof = context.split('\n')[0] ?? ''
  return prof ? `${prof} Based on that, ${message}` : `I'm sorry, I couldn't retrieve that information.`
}
