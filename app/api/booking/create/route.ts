import { NextRequest, NextResponse } from 'next/server'
<<<<<<< HEAD
=======
import { google } from 'googleapis'
import { prisma } from '../../../../lib/prisma'
import {
  sendBookingConfirmationToGuest,
  sendBookingNotificationToOwner,
} from '../../../../lib/email'
>>>>>>> 4c97723 (feat: add Resend email notifications for booking)

async function getAccessToken(): Promise<string> {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const rawKey = process.env.GOOGLE_PRIVATE_KEY

  if (!clientEmail || !rawKey) {
    throw new Error(`Missing env: email=${!!clientEmail}, key=${!!rawKey}`)
  }

  const privateKey = rawKey.replace(/\\n/g, '\n')

  const header = { alg: 'RS256', typ: 'JWT' }
  const now = Math.floor(Date.now() / 1000)
  const payload = {
    iss: clientEmail,
    scope: 'https://www.googleapis.com/auth/calendar',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  }

  const encode = (obj: any) =>
    Buffer.from(JSON.stringify(obj)).toString('base64url')

  const headerB64 = encode(header)
  const payloadB64 = encode(payload)
  const signInput = `${headerB64}.${payloadB64}`

  const crypto = await import('crypto')
  const sign = crypto.createSign('RSA-SHA256')
  sign.update(signInput)
  const signature = sign.sign(privateKey, 'base64url')

  const jwt = `${signInput}.${signature}`

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  })

  if (!tokenRes.ok) {
    const errText = await tokenRes.text()
    throw new Error(`Token exchange failed: ${tokenRes.status} ${errText}`)
  }

  const tokenData = await tokenRes.json()
  return tokenData.access_token
}

export async function POST(req: NextRequest) {
  try {
    // Safely parse JSON body to avoid "Unexpected end of JSON input"
    const text = await req.text()
    let body: any = {}
    try {
      body = text ? JSON.parse(text) : {}
    } catch (err) {
      console.error('Invalid JSON body:', { text })
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const { name, email, start, end, message } = body

    if (!name || !email || !start || !end) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const calendarId = process.env.GOOGLE_CALENDAR_ID
    if (!calendarId) {
      return NextResponse.json({ error: 'GOOGLE_CALENDAR_ID not set' }, { status: 500 })
    }

<<<<<<< HEAD
    const accessToken = await getAccessToken()

    // Note: attendees removed to avoid 403 on free Google accounts
    // The attendee's email is stored in the description instead
    const event = {
      summary: `Meeting with ${name}`,
      description: `Booked by: ${name}\nEmail: ${email}${message ? `\nMessage: ${message}` : ''}`,
      start: { dateTime: start, timeZone: 'Australia/Sydney' },
      end: { dateTime: end, timeZone: 'Australia/Sydney' },
    }

    const calRes = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      }
    )

    if (!calRes.ok) {
      const errText = await calRes.text()
      console.error('Calendar insert error:', calRes.status, errText)
      return NextResponse.json(
        { error: `Calendar error ${calRes.status}: ${errText.slice(0, 300)}` },
        { status: 500 }
      )
    }

    const calData = await calRes.json()
    return NextResponse.json({ success: true, eventId: calData.id })
  } catch (err: any) {
    console.error('Booking error:', err?.message || err)
    return NextResponse.json(
      { error: `Failed to create booking: ${err?.message || 'Unknown'}` },
      { status: 500 }
    )
=======
    // Try creating event with attendees; if service account cannot invite attendees
    // retry without attendees (common when Domain-Wide Delegation isn't configured).
    let event: any
    try {
      event = await calendar.events.insert({
        calendarId: process.env.GOOGLE_CALENDAR_ID!,
        requestBody: {
          summary: `Meeting with ${name}`,
          description: `Email: ${email}\n${message ? `Message: ${message}` : ''}`,
          start: { dateTime: start, timeZone: 'Australia/Sydney' },
          end: { dateTime: end, timeZone: 'Australia/Sydney' },
          attendees: [{ email }],
        },
      })
    } catch (err: any) {
      console.error('Calendar insert error (first attempt):', err?.message ?? err)
      const message = String(err?.message ?? '')
      if (message.includes('Service accounts cannot invite attendees')) {
        // Retry without attendees
        try {
          console.warn('Retrying calendar insert without attendees')
          event = await calendar.events.insert({
            calendarId: process.env.GOOGLE_CALENDAR_ID!,
            requestBody: {
              summary: `Meeting with ${name}`,
              description: `Email: ${email}\n${message ? `Message: ${message}` : ''}`,
              start: { dateTime: start, timeZone: 'Australia/Sydney' },
              end: { dateTime: end, timeZone: 'Australia/Sydney' },
            },
          })
        } catch (err2: any) {
          console.error('Calendar insert error (retry without attendees):', err2)
          throw err2
        }
      } else {
        throw err
      }
    }

    const eventId = event.data?.id

    // Save booking in database
    const booking = await prisma.booking.create({
      data: {
        name,
        email,
        startTime: new Date(start),
        endTime: new Date(end),
        googleEventId: eventId ?? undefined,
      },
    })

    // Send emails (do not fail booking if email sending fails)
    const guestEmailRes = await sendBookingConfirmationToGuest({
      guestName: name,
      guestEmail: email,
      startTime: start,
      endTime: end,
      timezone: 'Australia/Sydney',
      meetingLink: undefined,
      googleEventId: eventId,
      bookingId: booking.id,
    })

    const ownerEmailRes = await sendBookingNotificationToOwner({
      guestName: name,
      guestEmail: email,
      startTime: start,
      endTime: end,
      timezone: 'Australia/Sydney',
      meetingLink: undefined,
      googleEventId: eventId,
      bookingId: booking.id,
    })

    const emailStatus = {
      guest: guestEmailRes.ok ? 'sent' : 'failed',
      owner: ownerEmailRes.ok ? 'sent' : ownerEmailRes.error === 'RESEND_NOTIFY_TO not set' ? 'skipped' : 'failed',
    }

    return NextResponse.json({ success: true, eventId, booking, emailStatus })
  } catch (err) {
    console.error('Booking error:', err)
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
>>>>>>> 4c97723 (feat: add Resend email notifications for booking)
  }
}
