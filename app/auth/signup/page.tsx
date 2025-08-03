"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft, Building } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { useEmail } from "@/hooks/use-email"
import { toast } from "sonner"

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    club: "",
    role: ""
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isInvited, setIsInvited] = useState(false)
  const [invitationToken, setInvitationToken] = useState("")
  const [emailStatus, setEmailStatus] = useState<"idle" | "checking" | "available" | "taken">("idle")
  const router = useRouter()
  const { login, isAuthenticated, logout } = useAuth()
  const { sendWelcomeEmail, loading: emailLoading } = useEmail()

  // Check for invitation parameters on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const token = urlParams.get('token')
    const club = urlParams.get('club')
    
    if (token && club) {
      setIsInvited(true)
      setInvitationToken(token)
      setFormData(prev => ({ ...prev, club: decodeURIComponent(club) }))
      
      // If user is already logged in, log them out to complete the invitation flow
      if (isAuthenticated) {
        logout()
        toast.info("Please complete the invitation signup process")
      }
    }
  }, [isAuthenticated, logout])



  const roles = [
    { id: "member", name: "Member", description: "Regular club member" },
    { id: "secretary", name: "Secretary", description: "Club secretary" },
    { id: "treasurer", name: "Treasurer", description: "Club treasurer" },
    { id: "vice-president", name: "Vice President", description: "Vice president" },
    { id: "president", name: "President", description: "Club president" },
  ]

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError("")
    
    // Check email availability when email field changes
    if (field === "email" && value) {
      checkEmailAvailability(value)
    } else if (field === "email" && !value) {
      setEmailStatus("idle")
    }
  }

  const checkEmailAvailability = async (email: string) => {
    if (!email || !email.includes('@')) return
    
    setEmailStatus("checking")
    
    try {
      const response = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email,
          invitationToken: isInvited ? invitationToken : undefined
        }),
      })

      const data = await response.json()
      setEmailStatus(data.exists ? "taken" : "available")
    } catch (error) {
      setEmailStatus("idle")
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long")
      setIsLoading(false)
      return
    }

    if (!formData.club.trim() || !formData.role) {
      setError("Please enter a club name and select a role")
      setIsLoading(false)
      return
    }

    // Check if email is already registered
    try {
      const response = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: formData.email,
          invitationToken: isInvited ? invitationToken : undefined
        }),
      })

      const data = await response.json()

      if (data.exists) {
        setError("This email is already registered. Please use a different email or try logging in.")
        setIsLoading(false)
        return
      }
    } catch (error) {
      console.error('Error checking email:', error)
      // Continue with signup if email check fails
    }

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Create user object
    const user = {
      name: formData.name,
      email: formData.email,
      role: formData.role,
      club: formData.club,
      id: Date.now().toString()
    }

    // If this is an invited user, update the invitation status
    if (isInvited && invitationToken) {
      try {
        const response = await fetch('/api/invitations/accept', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token: invitationToken,
            userEmail: formData.email,
            userName: formData.name
          }),
        })

        if (!response.ok) {
          console.warn('Failed to update invitation status')
        }
      } catch (error) {
        console.error('Error updating invitation:', error)
      }
    }

    // Use the auth context to login
    login(user)

    // Send welcome email
    try {
      const emailResult = await sendWelcomeEmail(formData.email, formData.name)
      if (emailResult.success) {
        toast.success("Welcome email sent! Check your inbox.")
      } else {
        console.warn("Failed to send welcome email:", emailResult.error)
        // Don't block the signup process if email fails
      }
    } catch (emailError) {
      console.error("Error sending welcome email:", emailError)
      // Don't block the signup process if email fails
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link href="/" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
        
        <Card className="shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Create Account</CardTitle>
            <CardDescription className="text-center">
              Join Club OS and connect with your community
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignup} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
                             <div className="space-y-2">
                 <Label htmlFor="email">Email</Label>
                 <div className="relative">
                   <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                   <Input
                     id="email"
                     type="email"
                     placeholder="Enter your email"
                     value={formData.email}
                     onChange={(e) => handleInputChange("email", e.target.value)}
                     className={`pl-10 ${
                       emailStatus === "taken" ? "border-red-500" : 
                       emailStatus === "available" ? "border-green-500" : ""
                     }`}
                     required
                   />
                   {emailStatus === "checking" && (
                     <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                       <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                     </div>
                   )}
                   {emailStatus === "available" && (
                     <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500">
                       ✓
                     </div>
                   )}
                   {emailStatus === "taken" && (
                     <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500">
                       ✗
                     </div>
                   )}
                 </div>
                 {emailStatus === "available" && (
                   <p className="text-sm text-green-600">✓ Email is available</p>
                 )}
                 {emailStatus === "taken" && (
                   <p className="text-sm text-red-600">✗ This email is already registered</p>
                 )}
               </div>
              
                             <div className="space-y-2">
                 <Label htmlFor="club">Club Name</Label>
                 <div className="relative">
                   <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                   <Input
                     id="club"
                     type="text"
                     placeholder={isInvited ? "Club name (pre-filled)" : "Enter your club name"}
                     value={formData.club}
                     onChange={(e) => handleInputChange("club", e.target.value)}
                     className="pl-10"
                     disabled={isInvited}
                     required
                   />
                 </div>
                 {isInvited && (
                   <p className="text-sm text-blue-600">
                     ✓ You're joining an existing club via invitation
                   </p>
                 )}
               </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">Role in Club</Label>
                <Select value={formData.role} onValueChange={(value) => handleInputChange("role", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{role.name}</span>
                          <span className="text-xs text-gray-500">{role.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoading || emailLoading}>
                {isLoading || emailLoading ? "Creating account..." : "Create account"}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link href="/auth/login" className="text-blue-600 hover:text-blue-800 font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 