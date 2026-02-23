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
    const raw = await req.text()
    console.log('Vapi webhook raw body:', raw)
    const body = raw ? JSON.parse(raw) : {}

    // Try common shapes for user's message
    const userMessage = body?.message?.content || body?.message?.text || body?.text || body?.user?.message || ''

    // Fetch DB data
    const profile = await prisma?.profile?.findFirst?.() ?? null
    const resumes = await prisma?.resume?.findMany?.({ orderBy: { startDate: 'desc' } }) ?? []
    const skills = await prisma?.skill?.findMany?.() ?? []

    // Build context
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

    const systemPrompt = `You are Momoyo Kataoka's digital twin. Answer only using the provided factual data below. If the user asks about something not covered, say you couldn't retrieve that information.\n\n${parts.join('\n')}`

    let replyText: string
    try {
      replyText = await callGroq(String(userMessage || ''), systemPrompt)
    } catch (e) {
      console.error('Groq call failed in webhook', e)
      // fallback
      replyText = generateReplyFromContext(String(userMessage || ''), parts.join('\n'))
    }

    const responsePayload = {
      response: {
        message: {
          role: 'assistant',
          content: replyText,
        },
      },
    }

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
