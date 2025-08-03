import * as SibApiV3Sdk from '@getbrevo/brevo'

// Initialize Brevo API client
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi()

// Configure API key
apiInstance.setApiKey(SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY!)

export { apiInstance }

// Email service functions
export const sendEmail = async ({
  to,
  subject,
  htmlContent,
  textContent,
  sender = { name: process.env.BREVO_SENDER_NAME || 'Club OS', email: process.env.BREVO_SENDER_EMAIL || 'noreply@clubos.com' }
}: {
  to: { email: string; name?: string }[]
  subject: string
  htmlContent: string
  textContent?: string
  sender?: { name: string; email: string }
}) => {
  try {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail()
    
    sendSmtpEmail.to = to
    sendSmtpEmail.subject = subject
    sendSmtpEmail.htmlContent = htmlContent
    if (textContent) {
      sendSmtpEmail.textContent = textContent
    }
    sendSmtpEmail.sender = sender

    const result = await apiInstance.sendTransacEmail(sendSmtpEmail)
    return { success: true, messageId: result.body?.messageId || 'sent' }
  } catch (error) {
    console.error('Error sending email:', error)
    return { success: false, error }
  }
}

// Template for welcome emails
export const sendWelcomeEmail = async (userEmail: string, userName: string) => {
  const htmlContent = `
    <html>
      <body>
        <h1>Welcome to Club OS, ${userName}!</h1>
        <p>Thank you for joining our platform. We're excited to have you on board!</p>
        <p>You can now:</p>
        <ul>
          <li>Create and manage your clubs</li>
          <li>Assign tasks to team members</li>
          <li>Organize events</li>
          <li>Communicate with your team</li>
        </ul>
        <p>If you have any questions, feel free to reach out to our support team.</p>
        <p>Best regards,<br>The Club OS Team</p>
      </body>
    </html>
  `

  return sendEmail({
    to: [{ email: userEmail, name: userName }],
    subject: 'Welcome to Club OS!',
    htmlContent,
    textContent: `Welcome to Club OS, ${userName}! Thank you for joining our platform.`
  })
}

// Template for task assignment emails
export const sendTaskAssignmentEmail = async (
  assigneeEmail: string,
  assigneeName: string,
  taskTitle: string,
  taskDescription: string,
  assignedBy: string
) => {
  const htmlContent = `
    <html>
      <body>
        <h1>New Task Assigned</h1>
        <p>Hello ${assigneeName},</p>
        <p>You have been assigned a new task by ${assignedBy}:</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3>${taskTitle}</h3>
          <p>${taskDescription}</p>
        </div>
        <p>Please log in to your Club OS dashboard to view the full details and update the task status.</p>
        <p>Best regards,<br>The Club OS Team</p>
      </body>
    </html>
  `

  return sendEmail({
    to: [{ email: assigneeEmail, name: assigneeName }],
    subject: `New Task Assigned: ${taskTitle}`,
    htmlContent,
    textContent: `Hello ${assigneeName}, you have been assigned a new task: ${taskTitle} by ${assignedBy}.`
  })
}

// Template for event invitation emails
export const sendEventInvitationEmail = async (
  attendeeEmail: string,
  attendeeName: string,
  eventTitle: string,
  eventDate: string,
  eventLocation?: string
) => {
  const htmlContent = `
    <html>
      <body>
        <h1>Event Invitation</h1>
        <p>Hello ${attendeeName},</p>
        <p>You're invited to attend:</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3>${eventTitle}</h3>
          <p><strong>Date:</strong> ${eventDate}</p>
          ${eventLocation ? `<p><strong>Location:</strong> ${eventLocation}</p>` : ''}
        </div>
        <p>Please log in to your Club OS dashboard to RSVP and get more details.</p>
        <p>Best regards,<br>The Club OS Team</p>
      </body>
    </html>
  `

  return sendEmail({
    to: [{ email: attendeeEmail, name: attendeeName }],
    subject: `Event Invitation: ${eventTitle}`,
    htmlContent,
    textContent: `Hello ${attendeeName}, you're invited to attend: ${eventTitle} on ${eventDate}.`
  })
}

// Template for member invitation emails
export const sendMemberInvitationEmail = async (
  inviteeEmail: string,
  inviteeName: string,
  clubName: string,
  inviterName: string,
  invitationToken: string
) => {
  const signupUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'}/auth/signup?token=${invitationToken}&club=${encodeURIComponent(clubName)}`
  
  const htmlContent = `
    <html>
      <body>
        <h1>You're Invited to Join ${clubName}!</h1>
        <p>Hello ${inviteeName},</p>
        <p>You have been invited by <strong>${inviterName}</strong> to join <strong>${clubName}</strong> on Club OS.</p>
        <p>As a member, you'll be able to:</p>
        <ul>
          <li>View and participate in club activities</li>
          <li>Communicate with other members</li>
          <li>Stay updated on club events</li>
          <li>Access club resources</li>
        </ul>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${signupUrl}" style="background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Accept Invitation & Join Club
          </a>
        </div>
        <p><strong>Important:</strong> This invitation link is unique to you. Please do not share it with others.</p>
        <p>If you have any questions, please contact ${inviterName} or the club administrator.</p>
        <p>Best regards,<br>The Club OS Team</p>
      </body>
    </html>
  `

  return sendEmail({
    to: [{ email: inviteeEmail, name: inviteeName }],
    subject: `Invitation to Join ${clubName} - Club OS`,
    htmlContent,
    textContent: `Hello ${inviteeName}, you've been invited by ${inviterName} to join ${clubName} on Club OS. Click here to accept: ${signupUrl}`
  })
} 