"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { useEmail } from "@/hooks/use-email"
import { toast } from "sonner"

export function EmailTest() {
  const { sendWelcomeEmail, sendTaskAssignmentEmail, sendEventInvitationEmail, loading, error } = useEmail()
  const [testType, setTestType] = useState<'welcome' | 'task' | 'event'>('welcome')
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    taskTitle: '',
    taskDescription: '',
    assignedBy: '',
    eventTitle: '',
    eventDate: '',
    eventLocation: ''
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleTestEmail = async () => {
    try {
      let result

      switch (testType) {
        case 'welcome':
          result = await sendWelcomeEmail(formData.email, formData.name)
          break
        case 'task':
          result = await sendTaskAssignmentEmail(
            formData.email,
            formData.name,
            formData.taskTitle,
            formData.taskDescription,
            formData.assignedBy
          )
          break
        case 'event':
          result = await sendEventInvitationEmail(
            formData.email,
            formData.name,
            formData.eventTitle,
            formData.eventDate,
            formData.eventLocation
          )
          break
      }

      if (result?.success) {
        toast.success(`Email sent successfully! Message ID: ${result.messageId}`)
      } else {
        toast.error(`Failed to send email: ${result?.error}`)
      }
    } catch (err) {
      toast.error('An error occurred while sending the email')
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Email Testing Tool</CardTitle>
        <CardDescription>
          Test the Brevo email integration with different email types
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex space-x-2">
          <Button
            variant={testType === 'welcome' ? 'default' : 'outline'}
            onClick={() => setTestType('welcome')}
          >
            Welcome Email
          </Button>
          <Button
            variant={testType === 'task' ? 'default' : 'outline'}
            onClick={() => setTestType('task')}
          >
            Task Assignment
          </Button>
          <Button
            variant={testType === 'event' ? 'default' : 'outline'}
            onClick={() => setTestType('event')}
          >
            Event Invitation
          </Button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="test@example.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
              />
            </div>
          </div>

          {testType === 'task' && (
            <>
              <div>
                <Label htmlFor="taskTitle">Task Title</Label>
                <Input
                  id="taskTitle"
                  type="text"
                  placeholder="Design new logo"
                  value={formData.taskTitle}
                  onChange={(e) => handleInputChange('taskTitle', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="taskDescription">Task Description</Label>
                <Textarea
                  id="taskDescription"
                  placeholder="Create a modern logo for the club"
                  value={formData.taskDescription}
                  onChange={(e) => handleInputChange('taskDescription', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="assignedBy">Assigned By</Label>
                <Input
                  id="assignedBy"
                  type="text"
                  placeholder="Jane Smith"
                  value={formData.assignedBy}
                  onChange={(e) => handleInputChange('assignedBy', e.target.value)}
                />
              </div>
            </>
          )}

          {testType === 'event' && (
            <>
              <div>
                <Label htmlFor="eventTitle">Event Title</Label>
                <Input
                  id="eventTitle"
                  type="text"
                  placeholder="Club Meeting"
                  value={formData.eventTitle}
                  onChange={(e) => handleInputChange('eventTitle', e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="eventDate">Event Date</Label>
                  <Input
                    id="eventDate"
                    type="datetime-local"
                    value={formData.eventDate}
                    onChange={(e) => handleInputChange('eventDate', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="eventLocation">Location (Optional)</Label>
                  <Input
                    id="eventLocation"
                    type="text"
                    placeholder="Main Hall"
                    value={formData.eventLocation}
                    onChange={(e) => handleInputChange('eventLocation', e.target.value)}
                  />
                </div>
              </div>
            </>
          )}
        </div>

        <Button 
          onClick={handleTestEmail} 
          disabled={loading || !formData.email || !formData.name}
          className="w-full"
        >
          {loading ? 'Sending...' : `Send ${testType} Email`}
        </Button>

        <div className="text-sm text-gray-600 space-y-2">
          <p><strong>Note:</strong> Make sure you have configured your Brevo API key in the environment variables.</p>
          <p><strong>Test Email:</strong> Use a real email address to test the functionality.</p>
          <p><strong>Check Spam:</strong> Test emails might go to your spam folder initially.</p>
        </div>
      </CardContent>
    </Card>
  )
} 