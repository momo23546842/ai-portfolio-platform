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
    let body: any = {}
    if (contentType.includes('application/json')) {
      body = await req.json()
    } else {
      const txt = await req.text()
      try {
        body = txt ? JSON.parse(txt) : {}
      } catch (e) {
        body = {}
      }
    }

    // Log incoming request for debugging
    console.log('MCP POST request body:', JSON.stringify(body))

    // Support multiple request shapes. Prefer explicit tool and toolCallId.
    const tool = (body?.tool as ToolName) || body?.toolCall?.tool || body?.toolCall?.toolName
    const toolCallId = body?.toolCallId || body?.toolCall?.id || body?.toolCall?.toolCallId || body?.id || body?.toolCall?.toolCallId || null

    if (!tool) {
      console.warn('MCP POST missing tool in body')
      return NextResponse.json({ error: 'tool required' }, { status: 400 })
    }

    let result: unknown
    if (tool === 'getProfile') {
      result = await getProfile()
    } else if (tool === 'getCareer') {
      result = await getCareer()
    } else if (tool === 'getSkills') {
      result = await getSkills()
    } else {
      console.warn('MCP POST unknown tool:', tool)
      return NextResponse.json({ error: `unknown tool: ${tool}` }, { status: 400 })
    }

    const resultStr = typeof result === 'string' ? result : JSON.stringify(result)

    const responsePayload = {
      results: [
        {
          toolCallId: toolCallId ?? 'generated-1',
          result: resultStr,
        },
      ],
    }

    console.log('MCP POST response payload:', JSON.stringify(responsePayload))

    // Return JSON response (not streaming) in MCP expected format
    return NextResponse.json(responsePayload)
  } catch (err) {
    console.error('MCP route error', err)
    return NextResponse.json({ error: 'internal' }, { status: 500 })
  }
}

// Note: keep default (node) runtime so Prisma (server-only) can be used.
