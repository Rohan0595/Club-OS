# Brevo Email Integration Setup Guide

This guide will help you set up Brevo (formerly Sendinblue) for sending emails in your Club OS application.

## Prerequisites

1. A Brevo account (sign up at [brevo.com](https://brevo.com))
2. A verified domain (optional but recommended for better deliverability)

## Step 1: Get Your Brevo API Key

1. Log in to your Brevo account
2. Go to **Settings** → **API Keys**
3. Click **Create a new API key**
4. Give it a name (e.g., "Club OS Email Service")
5. Select **Full Access** or **Restricted Access** with email permissions
6. Copy the generated API key

## Step 2: Configure Environment Variables

1. Create a `.env.local` file in your project root (if it doesn't exist)
2. Add your Brevo API key:

```env
BREVO_API_KEY=your_brevo_api_key_here
```

3. Optionally, add custom sender information:

```env
BREVO_SENDER_EMAIL=noreply@yourdomain.com
BREVO_SENDER_NAME=Club OS
```

## Step 3: Verify Your Domain (Recommended)

For better email deliverability and to avoid spam filters:

1. In Brevo dashboard, go to **Settings** → **Senders & IP**
2. Click **Add a new domain**
3. Follow the DNS configuration instructions
4. Wait for verification (usually takes a few minutes to 24 hours)

## Step 4: Test the Integration

You can test the email functionality using the provided API endpoints:

### Welcome Email
```bash
curl -X POST http://localhost:3002/api/email/welcome \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "John Doe"
  }'
```

### Task Assignment Email
```bash
curl -X POST http://localhost:3002/api/email/task-assignment \
  -H "Content-Type: application/json" \
  -d '{
    "assigneeEmail": "assignee@example.com",
    "assigneeName": "Jane Smith",
    "taskTitle": "Design new logo",
    "taskDescription": "Create a modern logo for the club",
    "assignedBy": "John Doe"
  }'
```

### Event Invitation Email
```bash
curl -X POST http://localhost:3002/api/email/event-invitation \
  -H "Content-Type: application/json" \
  -d '{
    "attendeeEmail": "attendee@example.com",
    "attendeeName": "Alice Johnson",
    "eventTitle": "Club Meeting",
    "eventDate": "2024-01-15 14:00",
    "eventLocation": "Main Hall"
  }'
```

## Step 5: Integration in Your Components

Use the `useEmail` hook in your React components:

```tsx
import { useEmail } from '@/hooks/use-email'

function SignupForm() {
  const { sendWelcomeEmail, loading, error } = useEmail()

  const handleSignup = async (email: string, name: string) => {
    // After successful user registration
    const result = await sendWelcomeEmail(email, name)
    
    if (result.success) {
      console.log('Welcome email sent!')
    } else {
      console.error('Failed to send email:', result.error)
    }
  }

  return (
    // Your form JSX
  )
}
```

## Step 6: Monitor Email Delivery

1. In Brevo dashboard, go to **Reports** → **Email Activity**
2. Monitor delivery rates, open rates, and click rates
3. Check for any bounces or spam complaints

## Troubleshooting

### Common Issues

1. **API Key Error**: Make sure your API key is correct and has the right permissions
2. **Domain Verification**: Unverified domains may have lower deliverability
3. **Rate Limits**: Brevo has rate limits based on your plan
4. **Spam Filters**: Use proper email templates and avoid spam trigger words

### Testing in Development

- Use real email addresses for testing
- Check your spam folder
- Monitor Brevo logs for delivery status

## Email Templates

The system includes three pre-built email templates:

1. **Welcome Email**: Sent to new users after registration
2. **Task Assignment Email**: Sent when a task is assigned to someone
3. **Event Invitation Email**: Sent for event invitations

You can customize these templates in `lib/brevo.ts`.

## Security Best Practices

1. Never expose your API key in client-side code
2. Use environment variables for sensitive data
3. Implement rate limiting for email endpoints
4. Validate email addresses before sending
5. Provide unsubscribe options for marketing emails

## Production Deployment

1. Set up proper environment variables in your hosting platform
2. Configure domain verification in Brevo
3. Set up email monitoring and alerts
4. Test email delivery in production environment
5. Monitor email metrics and adjust as needed

## Support

- [Brevo Documentation](https://developers.brevo.com/)
- [Brevo Support](https://www.brevo.com/support/)
- [Email Best Practices](https://www.brevo.com/email-marketing-best-practices/) 