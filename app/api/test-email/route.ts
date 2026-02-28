import { NextRequest, NextResponse } from 'next/server'
import {
  sendBookingConfirmationToGuest,
  sendBookingNotificationToOwner,
} from '../../../lib/email'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({})) as any
    const to = body?.to

    const sample = {
      guestName: body?.guestName ?? 'Test Guest',
      guestEmail: to ?? process.env.RESEND_NOTIFY_TO ?? 'test@example.com',
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      timezone: 'Australia/Sydney',
      meetingLink: body?.meetingLink,
      googleEventId: body?.googleEventId,
      bookingId: body?.bookingId,
    }

    const guest = await sendBookingConfirmationToGuest(sample)
    const owner = await sendBookingNotificationToOwner(sample)

    return NextResponse.json({ guest, owner })
  } catch (err: any) {
    console.error('test-email error', err)
    return NextResponse.json({ error: String(err?.message ?? err) }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, message: 'POST to this endpoint to send test emails' })
}
