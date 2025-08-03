import { NextRequest, NextResponse } from 'next/server'
import { sendEventInvitationEmail } from '@/lib/brevo'

export async function POST(request: NextRequest) {
  try {
    const { attendeeEmail, attendeeName, eventTitle, eventDate, eventLocation } = await request.json()

    if (!attendeeEmail || !attendeeName || !eventTitle || !eventDate) {
      return NextResponse.json(
        { error: 'Required fields: attendeeEmail, attendeeName, eventTitle, eventDate' },
        { status: 400 }
      )
    }

    const result = await sendEventInvitationEmail(
      attendeeEmail,
      attendeeName,
      eventTitle,
      eventDate,
      eventLocation
    )

    if (result.success) {
      return NextResponse.json(
        { message: 'Event invitation email sent successfully', messageId: result.messageId },
        { status: 200 }
      )
    } else {
      return NextResponse.json(
        { error: 'Failed to send event invitation email' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error in event invitation email API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 