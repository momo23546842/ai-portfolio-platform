import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'

function getServiceAccountAuth() {
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\n/g, '\n')
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/calendar'],
  })
  return auth
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, start, end, message } = body

    if (!name || !email || !start || !end) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const auth = getServiceAccountAuth()
    const calendar = google.calendar({ version: 'v3', auth })

    const event = await calendar.events.insert({
      calendarId: process.env.GOOGLE_CALENDAR_ID!,
      requestBody: {
        summary: `Meeting with ${name}`,
        description: `Email: ${email}\n${message ? `Message: ${message}` : ''}`,
        start: { dateTime: start, timeZone: 'Australia/Sydney' },
        end: { dateTime: end, timeZone: 'Australia/Sydney' },
        attendees: [{ email }],
      },
    })

    return NextResponse.json({ success: true, eventId: event.data.id })
  } catch (err) {
    console.error('Booking error:', err)
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
  }
}
