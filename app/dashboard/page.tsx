"use client"

import { useState, useEffect, useMemo } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Bell,
  CalendarIcon,
  CheckCircle2,
  FileText,
  Home,
  Menu,
  MessageSquare,
  Plus,
  Search,
  Settings,
  Users,
  BarChart3,
  Target,
  Star,
  Filter,
  MoreHorizontal,
  UserPlus,
  Send,
  LogOut,
  Building,
  Mail,
  AlertCircle,
  X,
  Edit,
  Paperclip,
  CheckCircle,
  LayoutDashboard,
  CheckSquare,
  ArrowLeft,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"

interface User {
  name: string
  email: string
  role: string
  club?: string
  id?: string
}

interface Task {
  id: number
  title: string
  description: string
  assignee: string
  status: string
  priority: string
  dueDate: string
  club: string
  subtasks?: SubTask[]
  comments?: Comment[]
  attachments?: Attachment[]
  tags?: string[]
  createdAt: string
  updatedAt: string
}

interface Attachment {
  id: number
  name: string
  size: string
  uploadedBy: string
  uploadedAt: string
  url: string
}

interface SubTask {
  id: number
  title: string
  completed: boolean
  assignee?: string
}

interface Comment {
  id: number
  author: string
  content: string
  timestamp: string
  avatar?: string
}

interface Member {
  id: number
  name: string
  role: string
  email: string
  avatar: string
  club: string
  status: "active" | "pending" | "invited"
}

interface Event {
  id: number
  title: string
  date: string
  attendees: number
  status: string
  club: string
}

interface TeamMember {
  id: string
  name: string
  email: string
  role: string
  status: "invited" | "active" | "pending"
  invitedAt?: Date
  canAssignTasks: boolean
}

interface Message {
  id: number;
  sender: string;
  content: string;
  timestamp: string;
  senderAvatar?: string;
  senderName?: string;
  chatId: string;
}

// Club-specific data - defined outside component to avoid hooks order issues
const clubData = {
  "Tech Club": {
    color: "bg-blue-500",
    memberCount: 3,
    tasks: [
      {
        id: 1,
        title: "Organize Tech Fest",
        description: "Plan and execute the annual technology festival including venue booking, speaker arrangements, and marketing materials.",
        assignee: "Rahul Kumar",
        status: "In Progress",
        priority: "High",
        dueDate: "2024-02-15",
        club: "Tech Club",
        subtasks: [
          { id: 1, title: "Book auditorium", completed: true, assignee: "Rahul Kumar" },
          { id: 2, title: "Contact speakers", completed: true, assignee: "Priya Sharma" },
          { id: 3, title: "Design posters", completed: false, assignee: "Amit Singh" },
          { id: 4, title: "Send invitations", completed: false, assignee: "Sneha Patel" }
        ],
        comments: [
          { id: 1, author: "Rahul Kumar", content: "Venue booking confirmed for March 15th", timestamp: "2024-01-20T10:30:00Z" },
          { id: 2, author: "Priya Sharma", content: "Speakers list finalized. Need to send confirmation emails.", timestamp: "2024-01-21T14:15:00Z" }
        ],
        tags: ["Event", "High Priority", "Marketing"],
        createdAt: "2024-01-15T09:00:00Z",
        updatedAt: "2024-01-21T14:15:00Z"
      },
      {
        id: 2,
        title: "Design Club Poster",
        description: "Create promotional materials for the upcoming club events including posters, social media graphics, and flyers.",
        assignee: "Priya Sharma",
        status: "Completed",
        priority: "Medium",
        dueDate: "2024-02-10",
        club: "Tech Club",
        subtasks: [
          { id: 1, title: "Create poster design", completed: true, assignee: "Priya Sharma" },
          { id: 2, title: "Get approval from committee", completed: true, assignee: "Rahul Kumar" },
          { id: 3, title: "Print posters", completed: true, assignee: "Amit Singh" }
        ],
        comments: [
          { id: 1, author: "Priya Sharma", content: "Design completed and ready for review", timestamp: "2024-01-25T16:45:00Z" },
          { id: 2, author: "Rahul Kumar", content: "Approved! Great work on the design.", timestamp: "2024-01-26T11:20:00Z" }
        ],
        tags: ["Design", "Marketing", "Completed"],
        createdAt: "2024-01-20T13:30:00Z",
        updatedAt: "2024-01-26T11:20:00Z"
      },
      {
        id: 3,
        title: "Book Auditorium",
        description: "Reserve the main auditorium for upcoming club events and coordinate with the facilities department.",
        assignee: "Amit Singh",
        status: "Pending",
        priority: "Low",
        dueDate: "2024-02-20",
        club: "Tech Club",
        subtasks: [
          { id: 1, title: "Check auditorium availability", completed: false, assignee: "Amit Singh" },
          { id: 2, title: "Submit booking request", completed: false, assignee: "Amit Singh" },
          { id: 3, title: "Confirm with facilities", completed: false, assignee: "Amit Singh" }
        ],
        comments: [
          { id: 1, author: "Amit Singh", content: "Need to check the auditorium schedule for February", timestamp: "2024-01-22T09:15:00Z" }
        ],
        tags: ["Venue", "Low Priority", "Pending"],
        createdAt: "2024-01-22T09:00:00Z",
        updatedAt: "2024-01-22T09:15:00Z"
      }
    ],
    members: [
      {
        id: 1,
        name: "Rahul Kumar",
        role: "President",
        email: "rahul@techclub.com",
        avatar: "/placeholder.svg?height=40&width=40",
        club: "Tech Club",
        status: "active" as const
      },
      {
        id: 2,
        name: "Priya Sharma",
        role: "Vice President",
        email: "priya@techclub.com",
        avatar: "/placeholder.svg?height=40&width=40",
        club: "Tech Club",
        status: "active" as const
      },
      {
        id: 3,
        name: "Amit Singh",
        role: "Secretary",
        email: "amit@techclub.com",
        avatar: "/placeholder.svg?height=40&width=40",
        club: "Tech Club",
        status: "active" as const
      }
    ],
    events: [
      { id: 1, title: "Annual Tech Symposium", date: "2024-03-15", attendees: 200, status: "Upcoming", club: "Tech Club" },
      { id: 2, title: "Hackathon 2024", date: "2024-04-20", attendees: 150, status: "Planning", club: "Tech Club" }
    ]
  },
  "Cultural Society": {
    color: "bg-purple-500",
    memberCount: 2,
    tasks: [
      {
        id: 4,
        title: "Cultural Night Preparation",
        assignee: "Priya Sharma",
        status: "In Progress",
        priority: "High",
        dueDate: "2024-02-25",
        club: "Cultural Society"
      },
      {
        id: 5,
        title: "Dance Competition",
        assignee: "Sneha Patel",
        status: "Completed",
        priority: "Medium",
        dueDate: "2024-02-12",
        club: "Cultural Society"
      }
    ],
    members: [
      {
        id: 4,
        name: "Priya Sharma",
        role: "President",
        email: "priya@cultural.com",
        avatar: "/placeholder.svg?height=40&width=40",
        club: "Cultural Society",
        status: "active" as const
      },
      {
        id: 5,
        name: "Sneha Patel",
        role: "Vice President",
        email: "sneha@cultural.com",
        avatar: "/placeholder.svg?height=40&width=40",
        club: "Cultural Society",
        status: "active" as const
      }
    ],
    events: [
      { id: 3, title: "Cultural Night", date: "2024-02-28", attendees: 150, status: "Planning", club: "Cultural Society" },
      { id: 4, title: "Dance Competition", date: "2024-03-10", attendees: 100, status: "Upcoming", club: "Cultural Society" }
    ]
  },
  "Sports Club": {
    color: "bg-green-500",
    memberCount: 2,
    tasks: [
      {
        id: 6,
        title: "Sports Tournament",
        assignee: "Amit Singh",
        status: "In Progress",
        priority: "High",
        dueDate: "2024-03-01",
        club: "Sports Club"
      },
      {
        id: 7,
        title: "Equipment Maintenance",
        assignee: "Rajesh Kumar",
        status: "Pending",
        priority: "Low",
        dueDate: "2024-02-18",
        club: "Sports Club"
      }
    ],
    members: [
      {
        id: 6,
        name: "Amit Singh",
        role: "President",
        email: "amit@sports.com",
        avatar: "/placeholder.svg?height=40&width=40",
        club: "Sports Club",
        status: "active" as const
      },
      {
        id: 7,
        name: "Rajesh Kumar",
        role: "Vice President",
        email: "rajesh@sports.com",
        avatar: "/placeholder.svg?height=40&width=40",
        club: "Sports Club",
        status: "active" as const
      }
    ],
    events: [
      { id: 5, title: "Sports Tournament", date: "2024-04-10", attendees: 300, status: "Upcoming", club: "Sports Club" },
      { id: 6, title: "Fitness Workshop", date: "2024-03-05", attendees: 50, status: "Planning", club: "Sports Club" }
    ]
  }
}

export default function Dashboard() {
  const { user, isAuthenticated, isLoading, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [date, setDate] = useState<Date | undefined>(new Date())

  // Team management state
  const [showAddMemberDialog, setShowAddMemberDialog] = useState(false)
  const [newMember, setNewMember] = useState({ name: "", email: "", role: "" })
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [isInviting, setIsInviting] = useState(false)
  const [showRemoveDialog, setShowRemoveDialog] = useState(false)
  const [memberToRemove, setMemberToRemove] = useState<TeamMember | null>(null)
  const [allMembers, setAllMembers] = useState<Member[]>([])
  const [showMemberSelectionDialog, setShowMemberSelectionDialog] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [selectedChat, setSelectedChat] = useState<"group" | number>("group")
  const [showNewMessageDialog, setShowNewMessageDialog] = useState(false)
  const [selectedRecipient, setSelectedRecipient] = useState<Member | null>(null)

  // Task management state
  const [taskView, setTaskView] = useState<"list" | "board" | "calendar">("list")
  const [showTaskDialog, setShowTaskDialog] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [showAttachmentDialog, setShowAttachmentDialog] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [newTask, setNewTask] = useState({
    title: "",
    assignee: "",
    priority: "Medium",
    dueDate: "",
    status: "Pending"
  })
  const [taskFilter, setTaskFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [tasks, setTasks] = useState<Task[]>([])

  // Event management state
  const [showEventDialog, setShowEventDialog] = useState(false)
  const [newEvent, setNewEvent] = useState({
    title: "",
    date: "",
    description: "",
    attendees: 0
  })

  // Memoized values - must be after all useState hooks
  const currentClub = user?.club || "Tech Club"
  const clubInfo = useMemo(() => clubData[currentClub as keyof typeof clubData], [currentClub])
  const isAdmin = user?.role === "admin" || user?.role === "president"

  // All useEffect hooks - must be after all other hooks
  useEffect(() => {
    if (user && clubInfo?.tasks && tasks.length === 0) {
      setTasks(clubInfo.tasks)
    }
  }, [currentClub, user, clubInfo, tasks.length])

  useEffect(() => {
    if (user && clubInfo?.members) {
      setAllMembers(clubInfo.members)
    }
  }, [currentClub, user, clubInfo])

  useEffect(() => {
    if (user) {
      setMessages([
        // Group chat messages
        {
          id: 1,
          content: "Welcome to the group chat! 🎉",
          sender: "system",
          senderName: "System",
          senderAvatar: "",
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          chatId: "group"
        },
        {
          id: 2,
          content: "Hey everyone! How's the project going?",
          sender: "John Doe",
          senderName: "John Doe",
          senderAvatar: "/placeholder-user.jpg",
          timestamp: new Date(Date.now() - 3000000).toISOString(),
          chatId: "group"
        },
        {
          id: 3,
          content: "Great! We're making good progress on the frontend.",
          sender: user.name,
          senderName: user.name,
          senderAvatar: user.avatar,
          timestamp: new Date(Date.now() - 2400000).toISOString(),
          chatId: "group"
        },
        {
          id: 4,
          content: "Alice joined the group",
          sender: "system",
          senderName: "System",
          senderAvatar: "",
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          chatId: "group"
        },
        {
          id: 5,
          content: "Hi everyone! Excited to be part of the team!",
          sender: "Alice Smith",
          senderName: "Alice Smith",
          senderAvatar: "/placeholder-user.jpg",
          timestamp: new Date(Date.now() - 1200000).toISOString(),
          chatId: "group"
        },
        {
          id: 6,
          content: "Welcome Alice! We're glad to have you here.",
          sender: user.name,
          senderName: user.name,
          senderAvatar: user.avatar,
          timestamp: new Date(Date.now() - 600000).toISOString(),
          chatId: "group"
        },
        
        // Individual chat messages with John Doe
        {
          id: 7,
          content: "Hey Rahul! Can we discuss the project timeline?",
          sender: "John Doe",
          senderName: "John Doe",
          senderAvatar: "/placeholder-user.jpg",
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          chatId: 1 // John Doe's member ID
        },
        {
          id: 8,
          content: "Sure John! What's on your mind?",
          sender: user.name,
          senderName: user.name,
          senderAvatar: user.avatar,
          timestamp: new Date(Date.now() - 1700000).toISOString(),
          chatId: 1
        },
        {
          id: 9,
          content: "I think we need to adjust the deadline for the backend integration.",
          sender: "John Doe",
          senderName: "John Doe",
          senderAvatar: "/placeholder-user.jpg",
          timestamp: new Date(Date.now() - 1600000).toISOString(),
          chatId: 1
        },
        
        // Individual chat messages with Alice Smith
        {
          id: 10,
          content: "Hi Rahul! I have some questions about the design system.",
          sender: "Alice Smith",
          senderName: "Alice Smith",
          senderAvatar: "/placeholder-user.jpg",
          timestamp: new Date(Date.now() - 900000).toISOString(),
          chatId: 2 // Alice Smith's member ID
        },
        {
          id: 11,
          content: "Of course Alice! What do you need help with?",
          sender: user.name,
          senderName: user.name,
          senderAvatar: user.avatar,
          timestamp: new Date(Date.now() - 800000).toISOString(),
          chatId: 2
        }
      ]);
    }
  }, [user]);

  // Real-time data updates
  useEffect(() => {
    // Update data every 30 seconds to simulate real-time updates
    const interval = setInterval(() => {
      // Simulate real-time updates
      if (user && clubInfo) {
        // Add new messages occasionally
        if (Math.random() > 0.7) {
          const sampleMessages = [
            "Great work on the project!",
            "Meeting reminder for tomorrow",
            "New task assigned",
            "Project milestone achieved! 🎉"
          ]
          const randomMessage = sampleMessages[Math.floor(Math.random() * sampleMessages.length)]
          const randomMember = allMembers[Math.floor(Math.random() * allMembers.length)]
          
          const newMessage: Message = {
            id: Date.now(),
            content: randomMessage,
            sender: randomMember.name,
            timestamp: new Date().toISOString(),
            senderAvatar: randomMember.avatar,
            senderName: randomMember.name,
            chatId: "group"
          }
          setMessages(prev => [...prev, newMessage])
        }
      }
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [user, clubInfo, allMembers])

  const handleLogout = () => {
    logout()
  }

  const handleAddTeamMember = async () => {
    if (!newMember.name || !newMember.email || !newMember.role) {
      toast.error("Please fill in all fields")
      return
    }

    if (teamMembers.length >= 15) {
      toast.error("Maximum 15 team members allowed")
      return
    }

    setIsInviting(true)

    try {
      // Simulate email sending
      await new Promise(resolve => setTimeout(resolve, 2000))

      const newTeamMember: TeamMember = {
        id: Date.now().toString(),
        name: newMember.name,
        email: newMember.email,
        role: newMember.role,
        status: "invited",
        invitedAt: new Date(),
        canAssignTasks: false // Default to false
      }

      setTeamMembers(prev => [...prev, newTeamMember])
      setNewMember({ name: "", email: "", role: "" })
      setShowAddMemberDialog(false)

      toast.success(`Invitation sent to ${newMember.email}`)
      
      // Log the email notification
      console.log(`📧 Email sent to ${newMember.email} from Club OS SRM:
        Subject: Welcome to ${currentClub} Team
        Content: You have been invited to join the ${currentClub} team on Club OS SRM. 
        Please check your email for login credentials and next steps.`)
      
    } catch (error) {
      toast.error("Failed to send invitation")
    } finally {
      setIsInviting(false)
    }
  }

  const handleRemoveTeamMember = (member: TeamMember) => {
    setMemberToRemove(member)
    setShowRemoveDialog(true)
  }

  const confirmRemoveMember = () => {
    if (!memberToRemove) return

    setTeamMembers(prev => prev.filter(m => m.id !== memberToRemove.id))
    setMemberToRemove(null)
    setShowRemoveDialog(false)
    toast.success(`${memberToRemove.name} removed from team.`)
  }

  const handleToggleTaskPermission = (memberId: number, canAssignTasks: boolean) => {
    if (canAssignTasks) {
      // Add to task team (if under 15 members)
      if (teamMembers.length >= 15) {
        toast.error("Task team is full (maximum 15 members)")
        return
      }
      
      const member = allMembers.find(m => m.id === memberId)
      if (member) {
        const newTeamMember: TeamMember = {
          id: member.id,
          name: member.name,
          email: member.email,
          role: member.role,
          avatar: member.avatar,
          status: "active",
          canAssignTasks: true
        }
        setTeamMembers(prev => [...prev, newTeamMember])
        toast.success(`${member.name} added to task team`)
      }
    } else {
      // Remove from task team
      const member = teamMembers.find(m => m.id === memberId)
      if (member) {
        setTeamMembers(prev => prev.filter(m => m.id !== memberId))
        toast.success(`${member.name} removed from task team`)
      }
    }
  }

  const isMemberInTaskTeam = (memberId: number) => {
    return teamMembers.some(m => m.id === memberId)
  }

  const handleSendMessage = () => {
    if (newMessage.trim() && user) {
      // Prevent sending messages to yourself in individual chats
      if (selectedChat !== "group") {
        const selectedMember = allMembers.find(m => m.id === selectedChat)
        if (selectedMember && selectedMember.email === user.email) {
          toast.error("You cannot send messages to yourself")
          return
        }
      }
      
      const message: Message = {
        id: Date.now(),
        content: newMessage.trim(),
        sender: user.name,
        timestamp: new Date().toISOString(),
        senderAvatar: user?.avatar,
        senderName: user?.name,
        chatId: selectedChat
      }
      setMessages(prev => [...prev, message])
      setNewMessage("")
    }
  }

  const handleStartIndividualChat = (member: any) => {
    // Prevent starting chat with yourself
    if (member.email === user?.email) {
      toast.error("You cannot start a chat with yourself")
      return
    }
    
    setSelectedRecipient(member);
    setSelectedChat(member.id);
    setShowNewMessageDialog(false);
  };

  const getChatTitle = () => {
    if (selectedChat === "group") {
      return `${currentClub} Group Chat`
    }
    const member = allMembers.find(m => m.id === selectedChat)
    return member ? `Chat with ${member.name}` : "Chat"
  }

  const getChatMessages = () => {
    return messages.filter(msg => msg.chatId === selectedChat)
  }

  const handleCreateTask = async () => {
    if (!newTask.title || !newTask.assignee) {
      toast.error("Please fill in title and assignee")
      return
    }

    const task: Task = {
      id: Date.now(),
      title: newTask.title,
      description: "", // Description is removed
      assignee: newTask.assignee,
      status: newTask.status,
      priority: newTask.priority,
      dueDate: newTask.dueDate,
      club: currentClub,
      subtasks: [],
      comments: [],
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // In a real app, you'd save this to your backend
    console.log("New task created:", task)
    setNewTask({
      title: "",
      assignee: "",
      priority: "Medium",
      dueDate: "",
      status: "Pending"
    })
    setShowTaskDialog(false)
    toast.success("Task created successfully!")
  }

  const handleUpdateTaskStatus = (taskId: number, newStatus: string) => {
    // In a real app, you'd update this in your backend
    console.log(`Task ${taskId} status updated to: ${newStatus}`)
    toast.success("Task status updated!")
  }

  const handleViewTask = (task: Task) => {
    setSelectedTask(task)
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
  }

  const handleSaveTask = () => {
    if (!editingTask) return

    // Update the task in the tasks array
    const updatedTasks = tasks.map(task => 
      task.id === editingTask.id ? editingTask : task
    )
    setTasks(updatedTasks)
    
    // Also update selectedTask if it's the same task
    if (selectedTask && selectedTask.id === editingTask.id) {
      setSelectedTask(editingTask)
    }

    // In a real app, you'd update this in your backend
    console.log("Task updated:", editingTask)
    setEditingTask(null)
    setSelectedTask(null)
    toast.success("Task updated successfully!")
  }

  const handleMarkAsDone = (taskId: number) => {
    // Update the task status to completed
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId 
          ? { ...task, status: "Completed" }
          : task
      )
    )
    
    // Update selected task if it's the one being marked as done
    if (selectedTask && selectedTask.id === taskId) {
      setSelectedTask({ ...selectedTask, status: "Completed" })
    }
    
    toast.success("Task marked as completed!")
  }

  const handleDeleteTask = (taskId: number) => {
    // In a real app, you'd delete this from your backend
    console.log(`Task ${taskId} deleted`)
    toast.success("Task deleted successfully!")
  }

  const handleFileUpload = (file: File) => {
    if (!selectedTask) return

    const attachment: Attachment = {
      id: Date.now(),
      name: file.name,
      size: `${(file.size / 1024).toFixed(1)} KB`,
      uploadedBy: user?.name || "Unknown",
      uploadedAt: new Date().toISOString(),
      url: URL.createObjectURL(file) // In real app, upload to server
    }

    const updatedTask = {
      ...selectedTask,
      attachments: [...(selectedTask.attachments || []), attachment]
    }

    setSelectedTask(updatedTask)
    setShowAttachmentDialog(false)
    setSelectedFile(null)
    toast.success("File uploaded successfully!")
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-500"
      case "Medium":
        return "bg-yellow-500"
      case "Low":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800"
      case "In Progress":
        return "bg-blue-100 text-blue-800"
      case "Pending":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getMemberStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "invited":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getFilteredTasks = () => {
    return tasks.filter(task => {
      const priorityMatch = priorityFilter === "all" || task.priority === priorityFilter
      const statusMatch = statusFilter === "all" || task.status === statusFilter
      return priorityMatch && statusMatch
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  // Initialize sidebar items with new features
  const sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "tasks", label: "Tasks", icon: CheckSquare },
    { id: "members", label: "Members", icon: Users },
    { id: "messages", label: "Messages", icon: MessageSquare },
    { id: "events", label: "Events", icon: CalendarIcon },
    { id: "settings", label: "Settings", icon: Settings },
  ]

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-center h-16 px-4 border-b">
          <h1 className="text-xl font-bold text-gray-800">CLUB OS</h1>
          <Badge variant="secondary" className="ml-2">
            {isAdmin ? "ADMIN" : currentClub}
          </Badge>
        </div>
        
        {/* User Info */}
        <div className="p-4 border-b">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage src="/placeholder.svg?height=32&width=32" />
              <AvatarFallback>{user.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user.role}</p>
            </div>
          </div>
        </div>

        <nav className="mt-4">
          {sidebarItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id)
                  setSidebarOpen(false)
                }}
                className={cn(
                  "flex items-center w-full px-4 py-3 text-left text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors",
                  activeTab === item.id && "bg-blue-50 text-blue-600 border-r-2 border-blue-600",
                )}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.label}
              </button>
            )
          })}
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-4 left-4 right-4">
          <Button variant="outline" onClick={handleLogout} className="w-full">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden mr-2"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <Menu className="h-6 w-6" />
              </Button>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input placeholder="Search tasks, members, events..." className="pl-10 w-64" />
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <Avatar>
                <AvatarImage src="/placeholder.svg?height=32&width=32" />
                <AvatarFallback>{user.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">
                    {isAdmin ? "Admin Dashboard" : `${currentClub} Dashboard`}
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Welcome back, {user.name}! Here's what's happening in your club.
                  </p>
                </div>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Task
                </Button>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Club Members</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{clubInfo?.memberCount || 0}</div>
                    <p className="text-xs text-muted-foreground">Total club members</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Task Team</CardTitle>
                    <UserPlus className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{teamMembers.length}/15</div>
                    <p className="text-xs text-muted-foreground">Can be assigned tasks</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{clubInfo?.tasks?.length || 0}</div>
                    <p className="text-xs text-muted-foreground">Tasks in progress</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
                    <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{clubInfo?.events?.length || 0}</div>
                    <p className="text-xs text-muted-foreground">Events this month</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Tasks */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Tasks</CardTitle>
                    <CardDescription>Latest task updates in {currentClub}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {clubInfo?.tasks?.slice(0, 3).map((task: Task) => (
                        <div key={task.id} className="flex items-center space-x-4">
                          <div className={cn("w-2 h-2 rounded-full", getPriorityColor(task.priority))} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                            <p className="text-sm text-gray-500">{task.assignee}</p>
                          </div>
                          <Badge variant="secondary" className={getStatusColor(task.status)}>
                            {task.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Team Members */}
                <Card>
                  <CardHeader>
                    <CardTitle>Task Team</CardTitle>
                    <CardDescription>Members who can be assigned tasks ({teamMembers.length}/15)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {teamMembers.length === 0 ? (
                        <div className="text-center py-8">
                          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500">No task team members yet</p>
                          {isAdmin && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="mt-2"
                              onClick={() => setShowAddMemberDialog(true)}
                            >
                              <UserPlus className="w-4 h-4 mr-2" />
                              Add Team Member
                            </Button>
                          )}
                        </div>
                      ) : (
                        <>
                          {teamMembers.slice(0, 3).map((member) => (
                            <div key={member.id} className="flex items-center space-x-3">
                              <Avatar className="w-8 h-8">
                                <AvatarFallback className="text-xs">
                                  {member.name.split(" ").map(n => n[0]).join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{member.name}</p>
                                <p className="text-xs text-gray-500">{member.role}</p>
                              </div>
                              <Badge variant="secondary" className={getMemberStatusColor(member.status)}>
                                {member.status}
                              </Badge>
                            </div>
                          ))}
                          {teamMembers.length > 3 && (
                            <p className="text-xs text-gray-500 text-center">
                              +{teamMembers.length - 3} more team members
                            </p>
                          )}
                          {isAdmin && teamMembers.length < 15 && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full mt-2"
                              onClick={() => setShowAddMemberDialog(true)}
                            >
                              <UserPlus className="w-4 h-4 mr-2" />
                              Add More Members
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === "tasks" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Tasks</h2>
                {isAdmin && (
                  <Button onClick={() => setShowTaskDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Task
                  </Button>
                )}
              </div>

              {/* Filter Section */}
              <div className="bg-white p-4 rounded-lg border shadow-sm">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Priority Filter */}
                  <div className="flex-1">
                    <Label htmlFor="priority-filter" className="text-sm font-medium text-gray-700 mb-2 block">
                      Priority
                    </Label>
                    <select
                      id="priority-filter"
                      value={priorityFilter}
                      onChange={(e) => setPriorityFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Priorities</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div className="flex-1">
                    <Label htmlFor="status-filter" className="text-sm font-medium text-gray-700 mb-2 block">
                      Status
                    </Label>
                    <select
                      id="status-filter"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Status</option>
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>

                  {/* Clear Filters */}
                  <div className="flex items-end">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setPriorityFilter("all")
                        setStatusFilter("all")
                      }}
                      className="px-4 py-2"
                    >
                      Clear Filters
                    </Button>
                  </div>
                </div>

                {/* Active Filters Display */}
                {(priorityFilter !== "all" || statusFilter !== "all") && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {priorityFilter !== "all" && (
                      <Badge variant="secondary" className="px-2 py-1">
                        Priority: {priorityFilter}
                        <button
                          onClick={() => setPriorityFilter("all")}
                          className="ml-1 text-gray-500 hover:text-gray-700"
                        >
                          ×
                        </button>
                      </Badge>
                    )}
                    {statusFilter !== "all" && (
                      <Badge variant="secondary" className="px-2 py-1">
                        Status: {statusFilter}
                        <button
                          onClick={() => setStatusFilter("all")}
                          className="ml-1 text-gray-500 hover:text-gray-700"
                        >
                          ×
                        </button>
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              {/* Task Count */}
              <div className="text-sm text-gray-600">
                Showing {getFilteredTasks().length} of {tasks.length} tasks
              </div>

              {/* Add Task Dialog */}
              <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Create New Task</DialogTitle>
                    <DialogDescription>
                      Add a new task for your team members.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="task-title">Task Title</Label>
                      <Input
                        id="task-title"
                        value={newTask.title}
                        onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="What needs to be done?"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="task-assignee">Assign to</Label>
                      <select
                        id="task-assignee"
                        value={newTask.assignee}
                        onChange={(e) => setNewTask(prev => ({ ...prev, assignee: e.target.value }))}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="">Choose team member</option>
                        {teamMembers.map(member => (
                          <option key={member.id} value={member.name}>{member.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="task-due-date">Due Date</Label>
                        <Input
                          id="task-due-date"
                          type="date"
                          value={newTask.dueDate}
                          onChange={(e) => setNewTask(prev => ({ ...prev, dueDate: e.target.value }))}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="task-priority">Priority</Label>
                        <select
                          id="task-priority"
                          value={newTask.priority}
                          onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.target.value }))}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setShowTaskDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleCreateTask}>
                      Create Task
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Simple Task List */}
              <div className="space-y-4">
                {getFilteredTasks().map((task: Task) => (
                  <Card key={task.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{task.title}</CardTitle>
                        <Badge variant={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                      </div>
                      <CardDescription>
                        Assigned to {task.assignee} • Due {new Date(task.dueDate).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <Badge variant={getStatusColor(task.status)}>
                          {task.status}
                        </Badge>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleViewTask(task)}>
                            View
                          </Button>
                          {isAdmin && (
                            <>
                              <Button variant="outline" size="sm" onClick={() => handleEditTask(task)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleMarkAsDone(task.id)}
                                disabled={task.status === "Completed"}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === "members" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">Members</h2>
                  <p className="text-gray-600 mt-1">
                    {allMembers.length} total members • {teamMembers.length}/15 task team members
                  </p>
                </div>
                {isAdmin && (
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline"
                      onClick={() => setShowMemberSelectionDialog(true)}
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Manage Task Team
                    </Button>
                    <Dialog open={showAddMemberDialog} onOpenChange={setShowAddMemberDialog}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Member
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Add New Member</DialogTitle>
                          <DialogDescription>
                            Add a new member to your club. They will receive an email invitation.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor="member-name">Full Name</Label>
                            <Input
                              id="member-name"
                              value={newMember.name}
                              onChange={(e) => setNewMember(prev => ({ ...prev, name: e.target.value }))}
                              placeholder="Enter full name"
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="member-email">Email</Label>
                            <Input
                              id="member-email"
                              type="email"
                              value={newMember.email}
                              onChange={(e) => setNewMember(prev => ({ ...prev, email: e.target.value }))}
                              placeholder="Enter email address"
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="member-role">Role</Label>
                            <select
                              id="member-role"
                              value={newMember.role}
                              onChange={(e) => setNewMember(prev => ({ ...prev, role: e.target.value }))}
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <option value="">Select role</option>
                              <option value="member">Member</option>
                              <option value="coordinator">Coordinator</option>
                              <option value="treasurer">Treasurer</option>
                              <option value="secretary">Secretary</option>
                            </select>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button 
                            variant="outline" 
                            onClick={() => setShowAddMemberDialog(false)}
                          >
                            Cancel
                          </Button>
                          <Button onClick={handleAddTeamMember}>
                            Add Member
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}
              </div>

              {/* Task Team Summary */}
              {teamMembers.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span>Task Team ({teamMembers.length}/15)</span>
                    </CardTitle>
                    <CardDescription>
                      Members who can be assigned tasks
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {teamMembers.map((member) => (
                        <div key={member.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={member.avatar} />
                            <AvatarFallback>{member.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{member.name}</p>
                            <p className="text-xs text-gray-500">{member.role}</p>
                          </div>
                          {isAdmin && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleTaskPermission(member.id, false)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* All Members */}
              <Card>
                <CardHeader>
                  <CardTitle>All Club Members</CardTitle>
                  <CardDescription>
                    Complete list of club members. Admins can select who can be assigned tasks.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {allMembers?.map((member: Member) => (
                      <Card key={member.id}>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-4">
                              <Avatar>
                                <AvatarImage src={member.avatar} />
                                <AvatarFallback>
                                  {member.name.split(" ").map(n => n[0]).join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h4 className="font-medium">{member.name}</h4>
                                <p className="text-sm text-gray-500">{member.email}</p>
                                <p className="text-sm text-gray-400">{member.role}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant="secondary" className={getMemberStatusColor(member.status)}>
                                {member.status}
                              </Badge>
                              {isMemberInTaskTeam(member.id) && (
                                <Badge variant="default" className="bg-green-100 text-green-800">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Task Team
                                </Badge>
                              )}
                              {isAdmin && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleToggleTaskPermission(member.id, !isMemberInTaskTeam(member.id))}
                                  className={cn(
                                    isMemberInTaskTeam(member.id) 
                                      ? "text-red-600 hover:text-red-700" 
                                      : "text-green-600 hover:text-green-700"
                                  )}
                                >
                                  {isMemberInTaskTeam(member.id) ? (
                                    <X className="w-4 h-4" />
                                  ) : (
                                    <CheckCircle className="w-4 h-4" />
                                  )}
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "messages" && (
            <div className="h-screen bg-gray-50 flex flex-col">
              {/* Header */}
              <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <h2 className="text-xl font-semibold text-gray-900">Messages</h2>
                    <div className="flex space-x-2">
                      <Button 
                        variant={selectedChat === "group" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedChat("group")}
                        className="text-sm font-medium"
                      >
                        <Users className="w-4 h-4 mr-2" />
                        Group Chat
                      </Button>
                    </div>
                  </div>
                  <Dialog open={showNewMessageDialog} onOpenChange={setShowNewMessageDialog}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="font-medium">
                        <Plus className="w-4 h-4 mr-2" />
                        New Chat
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>Start New Chat</DialogTitle>
                        <DialogDescription>
                          Choose a member to start an individual conversation.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        {allMembers.filter(member => member.email !== user?.email).map((member) => (
                          <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors duration-200" onClick={() => handleStartIndividualChat(member)}>
                            <div className="flex items-center space-x-3">
                              <Avatar className="w-10 h-10 shadow-sm">
                                <AvatarImage src={member.avatar} />
                                <AvatarFallback className="bg-green-500 text-white font-medium">{member.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-sm text-gray-900">{member.name}</p>
                                <p className="text-xs text-gray-500">{member.email} • {member.role}</p>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600">
                              <MessageSquare className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {/* Main Chat Area */}
              <div className="flex-1 flex">
                {/* Chat Messages */}
                <div className="flex-1 flex flex-col bg-gray-50">
                  {/* Chat Header */}
                  <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {selectedChat !== "group" && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setSelectedChat("group")}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                          >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                          </Button>
                        )}
                        <Avatar className="w-10 h-10 shadow-sm">
                          <AvatarImage src={selectedChat !== "group" ? allMembers.find(m => m.id === selectedChat)?.avatar : undefined} />
                          <AvatarFallback className="bg-green-500 text-white font-medium">
                            {selectedChat !== "group" 
                              ? allMembers.find(m => m.id === selectedChat)?.name.split(" ").map(n => n[0]).join("")
                              : "GC"
                            }
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-gray-900">{getChatTitle()}</h3>
                          <p className="text-sm text-gray-500">
                            {selectedChat === "group" ? `${allMembers.length} members` : "Online"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-gray-50 to-white">
                    {getChatMessages().map(msg => (
                      <div key={msg.id} className={cn(
                        "flex items-end space-x-3",
                        msg.sender === user?.name && "flex-row-reverse space-x-reverse",
                        msg.sender === "system" && "justify-center"
                      )}>
                        {msg.sender !== "system" && (
                          <Avatar className="w-8 h-8 flex-shrink-0 shadow-sm">
                            <AvatarImage src={msg.senderAvatar} />
                            <AvatarFallback className="bg-green-500 text-white text-xs font-medium">
                              {msg.senderName?.split(" ").map(n => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div className={cn(
                          "max-w-xs lg:max-w-md",
                          msg.sender === user?.name && "text-right",
                          msg.sender === "system" && "text-center max-w-md"
                        )}>
                          <div className={cn(
                            "inline-block px-4 py-3 rounded-2xl shadow-sm",
                            msg.sender === user?.name 
                              ? "bg-green-500 text-white rounded-br-md shadow-md" 
                              : msg.sender === "system"
                              ? "bg-gray-100 text-gray-600 rounded-full shadow-sm border border-gray-200"
                              : "bg-white text-gray-900 rounded-bl-md border border-gray-200 shadow-sm"
                          )}>
                            <p className="text-sm leading-relaxed font-medium">{msg.content}</p>
                          </div>
                          {msg.sender !== "system" && (
                            <p className={cn(
                              "text-xs text-gray-500 mt-2 px-2 font-medium",
                              msg.sender === user?.name && "text-right"
                            )}>
                              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Message Input */}
                  <div className="bg-white border-t border-gray-200 p-4">
                    <div className="flex items-center space-x-3 max-w-4xl mx-auto">
                      <div className="flex-1 relative">
                        <div className="bg-gray-100 rounded-2xl px-4 py-3 shadow-sm border border-gray-200 focus-within:border-green-400 focus-within:ring-2 focus-within:ring-green-100 transition-all duration-200">
                          <Input
                            placeholder="Type a message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleSendMessage();
                              }
                            }}
                            className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-gray-900 placeholder-gray-500 text-sm"
                          />
                        </div>
                      </div>
                      <Button 
                        onClick={handleSendMessage}
                        className="rounded-full w-12 h-12 p-0 bg-green-500 hover:bg-green-600 shadow-lg hover:shadow-xl transition-all duration-200 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!newMessage.trim()}
                      >
                        <Send className="w-5 h-5 text-white" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Member List Sidebar */}
                <div className="w-80 bg-white border-l border-gray-200 flex flex-col shadow-lg">
                  <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <h3 className="font-semibold text-gray-900">Chats</h3>
                    <p className="text-sm text-gray-500">Click to switch between chats</p>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    {/* Group Chat */}
                    <div 
                      className={cn(
                        "flex items-center space-x-3 p-4 cursor-pointer hover:bg-gray-50 border-b border-gray-100 transition-colors duration-200",
                        selectedChat === "group" && "bg-green-50 border-green-200"
                      )}
                      onClick={() => setSelectedChat("group")}
                    >
                      <Avatar className="w-12 h-12 shadow-sm">
                        <AvatarFallback className="bg-blue-500 text-white font-medium">
                          GC
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{currentClub} Group Chat</p>
                        <p className="text-sm text-gray-500 truncate">{allMembers.length} members</p>
                      </div>
                      <div className="w-2 h-2 bg-green-500 rounded-full shadow-sm"></div>
                    </div>
                    
                    {/* Individual Member Chats */}
                    {allMembers.filter(member => member.email !== user?.email).map((member) => (
                      <div 
                        key={member.id} 
                        className={cn(
                          "flex items-center space-x-3 p-4 cursor-pointer hover:bg-gray-50 border-b border-gray-100 transition-colors duration-200",
                          selectedChat === member.id && "bg-green-50 border-green-200"
                        )}
                        onClick={() => setSelectedChat(member.id)}
                      >
                        <Avatar className="w-12 h-12 shadow-sm">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback className="bg-green-500 text-white font-medium">
                            {member.name.split(" ").map(n => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{member.name}</p>
                          <p className="text-sm text-gray-500 truncate">{member.role}</p>
                        </div>
                        <div className="w-2 h-2 bg-green-500 rounded-full shadow-sm"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Other tabs can be implemented similarly */}
          {activeTab === "analytics" && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-900">Analytics</h2>
              <p className="text-gray-600">Analytics dashboard for {currentClub}</p>
            </div>
          )}

          {activeTab === "files" && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-900">Files & Documents</h2>
              <p className="text-gray-600">File management for {currentClub}</p>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-900">Settings</h2>
              <p className="text-gray-600">Settings for {currentClub}</p>
            </div>
          )}

          {/* Events Tab */}
          {activeTab === "events" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Events</h2>
                <Button onClick={() => setShowEventDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Event
                </Button>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {clubInfo?.events?.map((event) => (
                  <Card key={event.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg">{event.title}</CardTitle>
                      <CardDescription>
                        {new Date(event.date).toLocaleDateString()} • {event.attendees} attendees
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <Badge variant={event.status === "Upcoming" ? "default" : "secondary"}>
                          {event.status}
                        </Badge>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Calendar View */}
              <Card>
                <CardHeader>
                  <CardTitle>Event Calendar</CardTitle>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md border"
                  />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Profile Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Settings</CardTitle>
                    <CardDescription>Manage your account information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={user?.avatar} />
                        <AvatarFallback className="bg-green-500 text-white text-lg font-medium">
                          {user?.name?.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user?.name}</p>
                        <p className="text-sm text-gray-500">{user?.email}</p>
                        <p className="text-sm text-gray-500">{user?.role} • {user?.club}</p>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full">
                      Edit Profile
                    </Button>
                  </CardContent>
                </Card>

                {/* Club Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle>Club Settings</CardTitle>
                    <CardDescription>Manage club preferences and permissions</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Club Name</Label>
                      <Input value={currentClub} disabled />
                    </div>
                    <div className="space-y-2">
                      <Label>Member Count</Label>
                      <Input value={`${allMembers.length} members`} disabled />
                    </div>
                    <div className="space-y-2">
                      <Label>Task Team Size</Label>
                      <Input value={`${teamMembers.length}/15 members`} disabled />
                    </div>
                    {isAdmin && (
                      <Button variant="outline" className="w-full">
                        Manage Club
                      </Button>
                    )}
                  </CardContent>
                </Card>

                {/* Notification Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle>Notifications</CardTitle>
                    <CardDescription>Configure your notification preferences</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Email Notifications</p>
                        <p className="text-sm text-gray-500">Receive updates via email</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Task Updates</p>
                        <p className="text-sm text-gray-500">Get notified about task changes</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">New Messages</p>
                        <p className="text-sm text-gray-500">Notify about new messages</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Event Reminders</p>
                        <p className="text-sm text-gray-500">Get reminded about upcoming events</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </CardContent>
                </Card>

                {/* Security Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle>Security</CardTitle>
                    <CardDescription>Manage your account security</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button variant="outline" className="w-full">
                      Change Password
                    </Button>
                    <Button variant="outline" className="w-full">
                      Two-Factor Authentication
                    </Button>
                    <Button variant="outline" className="w-full">
                      Login History
                    </Button>
                    <Button variant="destructive" className="w-full" onClick={handleLogout}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Remove Member Confirmation Dialog */}
      <Dialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Remove Team Member</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove {memberToRemove?.name} from the task team? They will no longer be able to be assigned to tasks.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowRemoveDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={confirmRemoveMember}
            >
              Remove Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Task Detail Dialog */}
      <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
        <DialogContent className="sm:max-w-[600px]">
          {selectedTask && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <DialogTitle className="text-xl">{selectedTask.title}</DialogTitle>
                    <div className="flex items-center space-x-4 mt-2">
                      <Badge className={getStatusColor(selectedTask.status)}>{selectedTask.status}</Badge>
                      <Badge variant="secondary" className={getPriorityColor(selectedTask.priority)}>
                        {selectedTask.priority} Priority
                      </Badge>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setSelectedTask(null)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Assignee</label>
                    <p className="text-sm text-gray-900">{selectedTask.assignee}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Due Date</label>
                    <p className="text-sm text-gray-900">{new Date(selectedTask.dueDate).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Description</label>
                  <p className="text-sm text-gray-900 mt-1">{selectedTask.description}</p>
                </div>



                {/* Subtasks */}
                {selectedTask.subtasks && selectedTask.subtasks.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Subtasks</label>
                    <div className="space-y-2 mt-2">
                      {selectedTask.subtasks.map(subtask => (
                        <div key={subtask.id} className="flex items-center space-x-3 p-2 border rounded">
                          <input
                            type="checkbox"
                            checked={subtask.completed}
                            className="rounded"
                            readOnly
                          />
                          <span className={subtask.completed ? "line-through text-gray-500" : "text-sm"}>
                            {subtask.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Comments */}
                {selectedTask.comments && selectedTask.comments.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Comments</label>
                    <div className="space-y-3 mt-2">
                      {selectedTask.comments.map(comment => (
                        <div key={comment.id} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-sm">{comment.author}</span>
                            <span className="text-xs text-gray-500">
                              {new Date(comment.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{comment.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Attachments */}
                {selectedTask.attachments && selectedTask.attachments.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Attachments</label>
                    <div className="mt-2 space-y-2">
                      {selectedTask.attachments.map(attachment => (
                        <div key={attachment.id} className="flex items-center justify-between p-2 bg-blue-50 rounded-md">
                          <div className="flex items-center space-x-2">
                            <Paperclip className="w-4 h-4 text-blue-600" />
                            <a href={attachment.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-800 hover:underline">
                              {attachment.name} ({attachment.size})
                            </a>
                          </div>
                          <span className="text-xs text-gray-500">
                            by {attachment.uploadedBy}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex space-x-2 pt-4 border-t">
                  {isAdmin ? (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleEditTask(selectedTask)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Task
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => setShowAttachmentDialog(true)}
                      >
                        <Paperclip className="w-4 h-4 mr-2" />
                        Add File
                      </Button>
                      {selectedTask.status !== "Completed" && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleMarkAsDone(selectedTask.id)}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Mark as Done
                        </Button>
                      )}
                    </>
                  ) : (
                    <Button variant="outline" size="sm" className="flex-1">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Add Comment
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog open={!!editingTask} onOpenChange={() => setEditingTask(null)}>
        <DialogContent className="sm:max-w-[500px]">
          {editingTask && (
            <>
              <DialogHeader>
                <DialogTitle>Edit Task</DialogTitle>
                <DialogDescription>
                  Update task details and assign to team members.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-task-title">Task Title</Label>
                  <Input
                    id="edit-task-title"
                    value={editingTask.title}
                    onChange={(e) => setEditingTask(prev => prev ? { ...prev, title: e.target.value } : null)}
                    placeholder="What needs to be done?"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-task-assignee">Assign to</Label>
                  <select
                    id="edit-task-assignee"
                    value={editingTask.assignee}
                    onChange={(e) => setEditingTask(prev => prev ? { ...prev, assignee: e.target.value } : null)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Choose team member</option>
                    {teamMembers.map(member => (
                      <option key={member.id} value={member.name}>{member.name}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-task-due-date">Due Date</Label>
                    <Input
                      id="edit-task-due-date"
                      type="date"
                      value={editingTask.dueDate}
                      onChange={(e) => setEditingTask(prev => prev ? { ...prev, dueDate: e.target.value } : null)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-task-priority">Priority</Label>
                    <select
                      id="edit-task-priority"
                      value={editingTask.priority}
                      onChange={(e) => setEditingTask(prev => prev ? { ...prev, priority: e.target.value } : null)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-task-status">Status</Label>
                  <select
                    id="edit-task-status"
                    value={editingTask.status}
                    onChange={(e) => setEditingTask(prev => prev ? { ...prev, status: e.target.value } : null)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setEditingTask(null)}
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveTask}>
                  Save Changes
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* File Upload Dialog */}
      <Dialog open={showAttachmentDialog} onOpenChange={setShowAttachmentDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Attachment</DialogTitle>
            <DialogDescription>
              Upload a file to attach to this task.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="file-upload">Choose File</Label>
              <Input
                id="file-upload"
                type="file"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
              />
              <p className="text-xs text-gray-500">
                Supported formats: PDF, DOC, DOCX, TXT, JPG, PNG, GIF (Max 10MB)
              </p>
            </div>
            {selectedFile && (
              <div className="p-3 bg-blue-50 rounded-md">
                <div className="flex items-center space-x-2">
                  <Paperclip className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium">{selectedFile.name}</span>
                  <span className="text-xs text-gray-500">
                    ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowAttachmentDialog(false)
                setSelectedFile(null)
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => selectedFile && handleFileUpload(selectedFile)}
              disabled={!selectedFile}
            >
              Upload File
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Member Selection Dialog */}
      <Dialog open={showMemberSelectionDialog} onOpenChange={setShowMemberSelectionDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Manage Task Team</DialogTitle>
            <DialogDescription>
              Select which members can be assigned tasks. Maximum 15 members allowed.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {allMembers.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={member.avatar} />
                    <AvatarFallback>{member.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{member.name}</p>
                    <p className="text-xs text-gray-500">{member.email} • {member.role}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {isMemberInTaskTeam(member.id) && (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Task Team
                    </Badge>
                  )}
                  <Button
                    variant={isMemberInTaskTeam(member.id) ? "outline" : "default"}
                    size="sm"
                    onClick={() => handleToggleTaskPermission(member.id, !isMemberInTaskTeam(member.id))}
                    disabled={!isMemberInTaskTeam(member.id) && teamMembers.length >= 15}
                  >
                    {isMemberInTaskTeam(member.id) ? "Remove" : "Add to Task Team"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button onClick={() => setShowMemberSelectionDialog(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 