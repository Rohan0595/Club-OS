import { NextRequest, NextResponse } from 'next/server'
import { sendTaskAssignmentEmail } from '@/lib/brevo'

export async function POST(request: NextRequest) {
  try {
    const { assigneeEmail, assigneeName, taskTitle, taskDescription, assignedBy } = await request.json()

    if (!assigneeEmail || !assigneeName || !taskTitle || !taskDescription || !assignedBy) {
      return NextResponse.json(
        { error: 'All fields are required: assigneeEmail, assigneeName, taskTitle, taskDescription, assignedBy' },
        { status: 400 }
      )
    }

    const result = await sendTaskAssignmentEmail(
      assigneeEmail,
      assigneeName,
      taskTitle,
      taskDescription,
      assignedBy
    )

    if (result.success) {
      return NextResponse.json(
        { message: 'Task assignment email sent successfully', messageId: result.messageId },
        { status: 200 }
      )
    } else {
      return NextResponse.json(
        { error: 'Failed to send task assignment email' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error in task assignment email API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 