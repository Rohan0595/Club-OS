import { EmailTest } from "@/components/email-test"

export default function TestEmailPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Email Testing Page</h1>
          <p className="text-gray-600">
            Test the Brevo email integration with different email templates
          </p>
        </div>
        
        <EmailTest />
        
        <div className="mt-8 p-6 bg-white rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Setup Instructions</h2>
          <div className="space-y-3 text-sm text-gray-700">
            <p>1. <strong>Get Brevo API Key:</strong> Sign up at brevo.com and create an API key</p>
            <p>2. <strong>Environment Variables:</strong> Add <code className="bg-gray-100 px-1 rounded">BREVO_API_KEY=your_api_key</code> to your <code className="bg-gray-100 px-1 rounded">.env.local</code> file</p>
            <p>3. <strong>Test Emails:</strong> Use real email addresses to test the functionality</p>
            <p>4. <strong>Check Spam:</strong> Test emails might go to your spam folder initially</p>
          </div>
        </div>
      </div>
    </div>
  )
} 