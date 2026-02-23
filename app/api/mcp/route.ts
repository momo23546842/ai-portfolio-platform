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

    const tool = body?.tool as ToolName | undefined
    if (!tool) {
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
      return NextResponse.json({ error: `unknown tool: ${tool}` }, { status: 400 })
    }

    // Stream the JSON response to allow chunked/streaming transports.
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(JSON.stringify({ result })))
        controller.close()
      },
    })

    return new Response(stream, {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('MCP route error', err)
    return NextResponse.json({ error: 'internal' }, { status: 500 })
  }
}

// Note: keep default (node) runtime so Prisma (server-only) can be used.
