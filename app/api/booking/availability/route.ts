import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'

const SYDNEY_TZ = 'Australia/Sydney'
const WORK_START = 9
const WORK_END = 18

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

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const dateStr = url.searchParams.get('date') // YYYY-MM-DD

    if (!dateStr) {
      return NextResponse.json({ error: 'date required' }, { status: 400 })
    }

    const auth = getServiceAccountAuth()
    const calendar = google.calendar({ version: 'v3', auth })

    // Get start and end of the day in Sydney time
    const dayStart = new Date(`${dateStr}T${String(WORK_START).padStart(2, '0')}:00:00+11:00`)
    const dayEnd = new Date(`${dateStr}T${String(WORK_END).padStart(2, '0')}:00:00+11:00`)

    const eventsRes = await calendar.events.list({
      calendarId: process.env.GOOGLE_CALENDAR_ID!,
      timeMin: dayStart.toISOString(),
      timeMax: dayEnd.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    })

    const busyTimes = (eventsRes.data.items || []).map(event => ({
      start: event.start?.dateTime,
      end: event.end?.dateTime,
    }))

    // Generate 1-hour slots from 9:00 to 18:00
    const slots = []
    for (let hour = WORK_START; hour < WORK_END; hour++) {
      const slotStart = new Date(`${dateStr}T${String(hour).padStart(2, '0')}:00:00+11:00`)
      const slotEnd = new Date(`${dateStr}T${String(hour + 1).padStart(2, '0')}:00:00+11:00`)

      const isBusy = busyTimes.some(busy => {
        if (!busy.start || !busy.end) return false
        const busyStart = new Date(busy.start)
        const busyEnd = new Date(busy.end)
        return slotStart < busyEnd && slotEnd > busyStart
      })

      slots.push({
        start: slotStart.toISOString(),
        end: slotEnd.toISOString(),
        label: `${String(hour).padStart(2, '0')}:00 - ${String(hour + 1).padStart(2, '0')}:00`,
        available: !isBusy,
      })
    }

    return NextResponse.json({ slots })
  } catch (err) {
    console.error('Availability error:', err)
    return NextResponse.json({ error: 'Failed to fetch availability' }, { status: 500 })
  }
}
