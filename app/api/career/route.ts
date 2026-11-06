import { NextResponse } from 'next/server'
import { timeline } from '@/lib/profile-data'

// Same data the site and the chat use (lib/profile-data.ts).
export async function GET() {
  return NextResponse.json(timeline)
}
