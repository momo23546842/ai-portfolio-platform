import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { prisma } from '@/lib/prisma'
import { profileChunks } from '@/lib/profile-data'
import {
  buildIndex, search, formatContext, sanitizeHistory, retrievalQuery, detectLanguage,
  MAX_MESSAGE_CHARS, type Chunk, type ChatTurn,
} from '@/lib/rag'

const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.1-8b-instant'
const TOP_K = 5

// The profile passages never change while the server runs, so they are indexed once.
const staticChunks = profileChunks()

/** Extra Q&A edited in the database (InterviewQA table) is searched together with the profile. */
async function databaseChunks(): Promise<Chunk[]> {
  try {
    const rows = await prisma.interviewQA.findMany({ orderBy: { sortOrder: 'asc' } })
    return rows.map((r: { id: number; question: string; answer: string }) => ({ id: `qa-db-${r.id}`, title: `Q&A: ${r.question}`, text: `${r.question}\n${r.answer}` }))
  } catch (err) {
    console.error('InterviewQA lookup failed; continuing with the profile only', err)
    return []
  }
}

function systemPrompt(context: string, lang: 'ja' | 'en') {
  return `You ARE Momoyo Kataoka (片岡 桃世), answering visitors to your portfolio site in the first person.

ANSWER ONLY FROM THE INFORMATION BELOW.
- Use only facts in the numbered passages. Never invent companies, dates, numbers, tools or results.
- If the passages don't cover the question, say honestly that you can't answer that here, and offer a meeting instead.
- Reply in ${lang === 'ja' ? 'Japanese (丁寧語, natural and warm)' : 'English'}, the language the visitor used.
- Keep it to 2–4 sentences unless the visitor asks for detail.

WHO YOU ARE (keep this framing):
- An IT student in Sydney with hands-on internship experience in generative AI / full-stack development. Never give yourself a senior or full-time engineering title.
- A Registered Dietitian licensed in Japan (not in Australia).
- Aiming to work as a generative AI engineer building LLM and RAG applications.

BOOKING: if the visitor wants to meet or talk, answer warmly and include the exact tag [BOOKING_LINK]; it becomes a button. Hours: Monday–Friday, 9:00–18:00 Sydney time.

INFORMATION:
${context}`
}

async function callGroq(messages: { role: 'system' | 'user' | 'assistant'; content: string }[]) {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) throw new Error('GROQ_API_KEY not set')
  const groq = new Groq({ apiKey })
  const response = await groq.chat.completions.create({ model: GROQ_MODEL, messages, temperature: 0.3 })
  return String(response?.choices?.[0]?.message?.content ?? '')
}

// A session id derived from the request, used only to group saved conversation turns.
function getSessionId(req: NextRequest): string {
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
  const str = ip + (req.headers.get('user-agent') || '')
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0
  return `session_${Math.abs(hash).toString(36)}`
}

// Best-effort limit so one visitor can't run up the Groq bill (per server instance).
const recentRequests = new Map<string, number[]>()
function rateLimited(sessionId: string, limit = 20, windowMs = 60_000) {
  const now = Date.now()
  const times = (recentRequests.get(sessionId) || []).filter((t) => now - t < windowMs)
  times.push(now)
  recentRequests.set(sessionId, times)
  return times.length > limit
}

async function saveConversation(sessionId: string, role: string, message: string, mode: string) {
  try {
    await prisma.conversation.create({ data: { sessionId, role, message, mode } })
  } catch (err) {
    console.error('Failed to save conversation:', err)
  }
}

/** When the LLM is unavailable, answer with the best passage itself rather than a canned line. */
function fallbackReply(message: string, hits: Chunk[], lang: 'ja' | 'en') {
  if (/book|schedule|meeting|meet|予約|面談|話したい/i.test(message)) {
    return lang === 'ja' ? 'ぜひお話ししましょう！こちらから日時を選んでください。[BOOKING_LINK]' : "I'd love to chat! Pick a date and time here. [BOOKING_LINK]"
  }
  if (!hits.length) {
    return lang === 'ja'
      ? 'すみません、その質問にはここではお答えできません。よければミーティングでお話ししましょう。[BOOKING_LINK]'
      : "Sorry, I can't answer that here. Happy to talk in a meeting! [BOOKING_LINK]"
  }
  const lines = hits[0].text.split('\n')
  const body = lang === 'ja' ? lines.filter((l) => /[぀-ヿ一-鿿]/.test(l)) : lines.filter((l) => !/[぀-ヿ一-鿿]/.test(l))
  const picked = body.length ? body : lines
  // Q&A passages start with the question itself; answer with what follows it.
  const isQA = hits[0].id.startsWith('faq-') || hits[0].id.startsWith('qa-db-')
  return (isQA && picked.length > 1 ? picked.slice(1) : picked).slice(0, 3).join(' ')
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const message = typeof body?.message === 'string' ? body.message.trim() : ''
    const mode: string = body?.mode === 'voice' ? 'voice' : 'chat'
    if (!message) return NextResponse.json({ error: 'message is required' }, { status: 400 })
    if (message.length > MAX_MESSAGE_CHARS) {
      return NextResponse.json({ error: `message must be ${MAX_MESSAGE_CHARS} characters or fewer` }, { status: 413 })
    }

    const sessionId = getSessionId(req)
    if (rateLimited(sessionId)) {
      return NextResponse.json({ reply: 'Too many messages in a short time. Please wait a minute and try again.' }, { status: 429 })
    }

    const history: ChatTurn[] = sanitizeHistory(body?.history)
    const lang = detectLanguage(message)

    // Retrieval: find the passages that answer this question (and the one before, for follow-ups).
    const index = buildIndex([...staticChunks, ...(await databaseChunks())])
    const hits = search(index, retrievalQuery(message, history), TOP_K)

    await saveConversation(sessionId, 'user', message, mode)

    let reply: string
    try {
      reply = await callGroq([
        { role: 'system', content: systemPrompt(formatContext(hits), lang) },
        ...history,
        { role: 'user', content: message },
      ])
      if (!reply.trim()) throw new Error('empty reply')
    } catch (e) {
      console.error('Groq call failed, answering from the retrieved passage', e)
      reply = fallbackReply(message, hits, lang)
    }

    await saveConversation(sessionId, 'assistant', reply, mode)
    return NextResponse.json({ reply, sources: hits.map((h) => ({ id: h.id, title: h.title })) })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ reply: "Sorry, I couldn't process that right now. Please try again!" }, { status: 500 })
  }
}
