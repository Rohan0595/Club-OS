import { useState } from 'react'

interface EmailResponse {
  success: boolean
  message?: string
  error?: string
  messageId?: string
}

export const useEmail = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sendWelcomeEmail = async (email: string, name: string): Promise<EmailResponse> => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/email/welcome', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, name }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send welcome email')
      }

      return { success: true, message: data.message, messageId: data.messageId }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const sendTaskAssignmentEmail = async (
    assigneeEmail: string,
    assigneeName: string,
    taskTitle: string,
    taskDescription: string,
    assignedBy: string
  ): Promise<EmailResponse> => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/email/task-assignment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assigneeEmail,
          assigneeName,
          taskTitle,
          taskDescription,
          assignedBy,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send task assignment email')
      }

      return { success: true, message: data.message, messageId: data.messageId }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const sendEventInvitationEmail = async (
    attendeeEmail: string,
    attendeeName: string,
    eventTitle: string,
    eventDate: string,
    eventLocation?: string
  ): Promise<EmailResponse> => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/email/event-invitation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          attendeeEmail,
          attendeeName,
          eventTitle,
          eventDate,
          eventLocation,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send event invitation email')
      }

      return { success: true, message: data.message, messageId: data.messageId }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const sendMemberInvitationEmail = async (
    inviteeEmail: string,
    inviteeName: string,
    clubName: string,
    inviterName: string
  ): Promise<EmailResponse> => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/email/member-invitation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inviteeEmail,
          inviteeName,
          clubName,
          inviterName,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send member invitation email')
      }

      return { success: true, message: data.message, messageId: data.messageId, token: data.token }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const clearError = () => {
    setError(null)
  }

  return {
    loading,
    error,
    sendWelcomeEmail,
    sendTaskAssignmentEmail,
    sendEventInvitationEmail,
    sendMemberInvitationEmail,
    clearError,
  }
} 