import { NextRequest, NextResponse } from 'next/server'
import { sendWelcomeEmail } from '@/lib/brevo'

export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json()

    if (!email || !name) {
      return NextResponse.json(
        { error: 'Email and name are required' },
        { status: 400 }
      )
    }

    const result = await sendWelcomeEmail(email, name)

    if (result.success) {
      return NextResponse.json(
        { message: 'Welcome email sent successfully', messageId: result.messageId },
        { status: 200 }
      )
    } else {
      return NextResponse.json(
        { error: 'Failed to send welcome email' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error in welcome email API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 