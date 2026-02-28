import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import Groq from 'groq-sdk'

const GROQ_MODEL = 'llama-3.3-70b-versatile'

async function callGroq(message: string, systemPrompt: string) {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) throw new Error('GROQ_API_KEY not set')

  const groq = new Groq({ apiKey })

  const response = await groq.chat.completions.create({
    model: GROQ_MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message },
    ],
  })

  const reply = response?.choices?.[0]?.message?.content ?? JSON.stringify(response)
  return String(reply)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const message: string = body?.message || ''

    // Fetch data from the database to provide context
    const profile = await prisma?.profile?.findFirst?.() ?? null
    const resumes = await prisma?.resume?.findMany?.({ orderBy: { startDate: 'desc' } }) ?? []
    const skills = await prisma?.skill?.findMany?.() ?? []

    // Build a structured system prompt from DB data
    const parts: string[] = []
    if (profile) {
      parts.push(`Name: ${profile.name ?? ''}`)
      if (profile.catchphrase) parts.push(`Catchphrase: ${profile.catchphrase}`)
      if (profile.bio) parts.push(`Bio: ${profile.bio}`)
    }
    if (resumes.length) {
      const jobs = resumes
        .slice(0, 10)
        .map((r: any) => `${r.title ?? ''} at ${r.organization ?? ''} (${r.startDate ?? ''} - ${r.endDate ?? 'present'})`)
        .join('; ')
      parts.push(`Career: ${jobs}`)
    }
    if (skills.length) {
      parts.push(`Skills: ${skills.map((s: any) => s.name).join(', ')}`)
    }

    const systemPrompt = `You are Momoyo Kataoka's digital twin. Answer as Momoyo, using ONLY the factual data provided below. If the user asks something not covered by the data, reply that you don't know.

${parts.join('\n')}

IMPORTANT BOOKING INSTRUCTIONS:
When the user wants to schedule a meeting, book an appointment, make a reservation, or mentions wanting to talk/meet/connect with Momoyo:
1. If they say something like "I want to book a meeting" or "Can I schedule a call?" or "I'd like to meet" — respond with EXACTLY this format:
   "I'd love to set up a meeting! You can pick a date and time right here. [BOOKING_LINK]"
   The [BOOKING_LINK] tag is critical — it will be converted into a clickable button.
2. If the user provides specific details (like a date, time, name, email), include them naturally in your response and add [BOOKING_LINK] so they can proceed.
3. Always be enthusiastic about meeting requests — Momoyo loves connecting with people!
4. Available hours: Monday to Friday, 9:00-18:00 Sydney time (AEST/AEDT).`

    // Call Groq model
    let replyText: string
    try {
      const groqResp = await callGroq(message, systemPrompt)
      replyText = String(groqResp)
    } catch (e) {
      console.error('Groq call failed, falling back to local generator', e)
      replyText = generateReplyFromContext(message, parts.join('\n'))
    }

    return NextResponse.json({ reply: replyText })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ reply: "Sorry, I couldn't process that request." }, { status: 500 })
  }
}

function generateReplyFromContext(message: string, context: string) {
  const lower = message.toLowerCase()

  // Booking intent detection for fallback
  const bookingKeywords = ['book', 'schedule', 'meeting', 'appointment', 'reserve', 'call', 'meet', 'connect', 'talk to momoyo', 'chat with momoyo']
  if (bookingKeywords.some(k => lower.includes(k))) {
    return "I'd love to set up a meeting with you! You can pick a date and time right here. [BOOKING_LINK]"
  }

  if (lower.includes('skill') || lower.includes('skills')) {
    const m = context.match(/Skills: ([^\n]+)/)
    return m ? `Momoyo's key skills include: ${m[1]}.` : `Momoyo's skills include software development and health-science related expertise.`
  }
  if (lower.includes('career') || lower.includes('work') || lower.includes('company')) {
    const m = context.match(/Career: ([^\n]+)/)
    return m ? `Recent roles: ${m[1]}.` : `Momoyo has experience across development and health-technology roles.`
  }
  if (lower.includes('where') || lower.includes('based')) {
    return `Momoyo is based in Sydney.`
  }

  const prof = context.split('\n')[0] ?? ''
  return `${prof} Based on that, ${message}`
}
