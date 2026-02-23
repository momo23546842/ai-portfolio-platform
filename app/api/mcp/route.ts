import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Simple MCP-like route that supports a handshake (GET) and tool calls (POST).
// This implementation provides three tools backed by Prisma:
// - getProfile
// - getCareer
// - getSkills
// For production-grade MCP integration you can wire the official
// StreamableHTTPServerTransport from '@modelcontextprotocol/sdk'.

export async function GET() {
  const handshake = {
    name: 'momoyo-ai-mcp',
    version: '1.0.0',
    tools: [
      {
        name: 'getProfile',
        description: 'Returns the profile information from database',
        input: null,
      },
      {
        name: 'getCareer',
        description: 'Returns resume / career entries',
        input: null,
      },
      {
        name: 'getSkills',
        description: 'Returns skill list',
        input: null,
      },
    ],
  }

  return NextResponse.json(handshake)
}

type ToolName = 'getProfile' | 'getCareer' | 'getSkills'

async function getProfile() {
  const p = await prisma.profile.findFirst()
  return p
}

async function getCareer() {
  const rows = await prisma.resume.findMany({ orderBy: { startDate: 'desc' } })
  return rows
}

async function getSkills() {
  const rows = await prisma.skill.findMany({ orderBy: { category: 'asc' } })
  return rows
}

// POST /api/mcp — accept JSON body { tool: string, params?: any }
// and return a streamable JSON result. This is intentionally simple so it
// works without requiring the MCP SDK; the SDK can be integrated later.
export async function POST(req: Request) {
  try {
    const contentType = req.headers.get('content-type') || ''

    // Always read raw text so we can log exactly what Vapi sends.
    const raw = await req.text()
    console.log('MCP POST raw request text:', raw)

    let body: any = {}
    if (contentType.includes('application/json')) {
      try {
        body = raw ? JSON.parse(raw) : {}
      } catch (e) {
        // Fallback to req.json() if parsing failed
        try {
          body = await req.json()
        } catch (e2) {
          body = {}
        }
      }
    } else {
      try {
        body = raw ? JSON.parse(raw) : {}
      } catch (e) {
        body = {}
      }
    }

    console.log('MCP POST parsed body:', JSON.stringify(body))

    // Vapi sends tool calls under message.toolCallList
    const toolCallList: any[] = body?.message?.toolCallList || body?.toolCallList || body?.toolCalls || []

    // Backcompat: if there's a single tool provided at top-level, convert to list
    if (!toolCallList.length) {
      const tool = body?.tool || body?.toolCall?.tool || body?.function?.name
      const id = body?.toolCallId || body?.toolCall?.id || body?.id || 'generated-1'
      if (tool) {
        // normalize
        toolCallList.push({ id, function: { name: tool, arguments: body?.arguments || '{}' } })
      }
    }

    if (!toolCallList.length) {
      console.warn('MCP POST missing toolCallList in body')
      return NextResponse.json({ error: 'toolCallList required' }, { status: 400 })
    }

    const results: Array<{ toolCallId: string; result: string }> = []

    for (const call of toolCallList) {
      const id = call?.id || call?.toolCallId || 'generated-1'
      const fnName: string | undefined = call?.function?.name || call?.functionName || call?.name
      const argsRaw = call?.function?.arguments ?? call?.arguments ?? '{}'
      let args: any = {}
      if (typeof argsRaw === 'string') {
        try {
          args = argsRaw ? JSON.parse(argsRaw) : {}
        } catch (e) {
          args = {}
        }
      } else {
        args = argsRaw
      }

      console.log('MCP tool call:', { id, fnName, args })

      if (!fnName) {
        results.push({ toolCallId: id, result: JSON.stringify({ error: 'missing function name' }) })
        continue
      }

      let toolResult: unknown
      try {
        if (fnName === 'getProfile') {
          toolResult = await getProfile()
        } else if (fnName === 'getCareer') {
          toolResult = await getCareer()
        } else if (fnName === 'getSkills') {
          toolResult = await getSkills()
        } else {
          toolResult = { error: `unknown tool: ${fnName}` }
        }
      } catch (e) {
        toolResult = { error: 'tool execution error', details: String(e) }
      }

      const toolResultStr = typeof toolResult === 'string' ? toolResult : JSON.stringify(toolResult)
      results.push({ toolCallId: id, result: toolResultStr })
    }

    const responsePayload = { results }
    console.log('MCP POST response payload:', JSON.stringify(responsePayload))
    return NextResponse.json(responsePayload)
  } catch (err) {
    console.error('MCP route error', err)
    return NextResponse.json({ error: 'internal' }, { status: 500 })
  }
}

// Note: keep default (node) runtime so Prisma (server-only) can be used.
