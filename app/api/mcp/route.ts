import { NextResponse } from 'next/server'
import { profile, timeline, works, skills, certifications, profileChunks } from '@/lib/profile-data'
import { buildIndex, search } from '@/lib/rag'

// MCP tools exposing my profile to AI agents (for example a voice agent). They read the same
// data as the site and the chat (lib/profile-data.ts), so every channel gives the same answer.
const toolsList = [
  {
    name: 'getProfile',
    description: "Returns Momoyo Kataoka's profile, summary and career goal. Call this when asked who she is.",
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'getCareer',
    description: "Returns Momoyo Kataoka's work history and education, newest first.",
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'getSkills',
    description: "Returns Momoyo Kataoka's skills, certifications and portfolio projects.",
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'searchProfile',
    description: 'Searches everything about Momoyo Kataoka (career, projects, skills, Q&A) and returns the most relevant passages. Use for specific questions, in Japanese or English.',
    inputSchema: {
      type: 'object',
      properties: { query: { type: 'string', description: 'The question or keywords' } },
      required: ['query'],
    },
  },
]

export const runtime = 'nodejs'

// GET: simple handshake for tooling / browser checks
export async function GET() {
  return NextResponse.json({ name: 'momoyo-ai-mcp', version: '1.1.0', tools: toolsList })
}

const index = buildIndex(profileChunks())

function runTool(name: string, args: Record<string, unknown>) {
  switch (name) {
    case 'getProfile':
      return profile
    case 'getCareer':
      return timeline
    case 'getSkills':
      return { skills, certifications, works }
    case 'searchProfile': {
      const query = typeof args.query === 'string' ? args.query.slice(0, 500) : ''
      if (!query) return { error: 'query is required' }
      return search(index, query, 5).map(({ title, text, score }) => ({ title, text, score: Math.round(score * 100) / 100 }))
    }
    default:
      return { error: `unknown tool: ${name}` }
  }
}

// POST: JSON-RPC 2.0 MCP support (initialize, tools/list, tools/call)
export async function POST(req: Request) {
  try {
    const raw = await req.text()

    let payload: any = {}
    try {
      payload = raw ? JSON.parse(raw) : {}
    } catch (e) {
      console.warn('MCP JSON-RPC failed to parse JSON:', String(e))
      return NextResponse.json({ error: 'invalid json' }, { status: 400 })
    }


    const { method, params, id, jsonrpc } = payload || {}

    if (jsonrpc && jsonrpc !== '2.0') {
      console.warn('MCP JSON-RPC unexpected version:', jsonrpc)
    }

    const rpcResponse = (resultBody: any) => NextResponse.json({ jsonrpc: '2.0', id: id ?? null, result: resultBody })

    if (method === 'initialize') {
      const handshake = {
        name: 'momoyo-ai-mcp',
        version: '1.1.0',
        tools: toolsList,
      }
      console.log('MCP initialize ->', handshake)
      return rpcResponse(handshake)
    }

    if (method === 'tools/list') {
      console.log('MCP tools/list ->', toolsList)
      return rpcResponse({ tools: toolsList })
    }

    if (method === 'tools/call') {
      // Accept either params.message.toolCallList or params.toolCallList or a single toolCall in params
      const toolCallList: any[] = params?.message?.toolCallList || params?.toolCallList || (params ? [params] : [])

      if (!Array.isArray(toolCallList) || toolCallList.length === 0) {
        console.warn('MCP tools/call missing toolCallList')
        return NextResponse.json({ jsonrpc: '2.0', id: id ?? null, error: { code: -32602, message: 'invalid params' } }, { status: 400 })
      }

      // Execute each call and gather content entries
      const content: Array<{ type: 'text'; text: string }> = []

      for (const call of toolCallList) {
        const fnName: string | undefined = call?.function?.name || call?.functionName || call?.name || params?.name
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

        console.log('MCP tools/call received:', fnName, args)

        if (!fnName) {
          content.push({ type: 'text', text: JSON.stringify({ error: 'missing function name' }) })
          continue
        }

        let toolResult: unknown
        try {
          toolResult = runTool(fnName, args && typeof args === 'object' ? args : {})
        } catch (e) {
          console.error('MCP tool execution error', e)
          toolResult = { error: 'tool execution error', details: String(e) }
        }

        const text = typeof toolResult === 'string' ? toolResult : JSON.stringify(toolResult)
        content.push({ type: 'text', text })
      }

      const resultPayload = { content }
      return rpcResponse(resultPayload)
    }

    console.warn('MCP JSON-RPC unknown method:', method)
    return NextResponse.json({ jsonrpc: '2.0', id: id ?? null, error: { code: -32601, message: 'method not found' } }, { status: 404 })
  } catch (err) {
    console.error('MCP JSON-RPC route error', err)
    return NextResponse.json({ error: 'internal' }, { status: 500 })
  }
}


