"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Bot,
  User,
  Send,
  Plus,
  MessageSquare,
  Trash2,
  Edit3,
  MoreHorizontal,
  Menu,
  Sparkles,
  Clock,
  Search,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface ChatSession {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
}

const quickSuggestions = [
  {
    icon: "🩺",
    title: "Blood Sugar Analysis",
    description: "Help me understand my glucose readings",
    prompt: "Can you help me analyze my recent blood sugar readings and provide insights?",
  },
  {
    icon: "🍎",
    title: "Meal Planning",
    description: "Create a diabetic-friendly meal plan",
    prompt: "Can you suggest a weekly meal plan that's suitable for managing diabetes?",
  },
  {
    icon: "💊",
    title: "Medication Guide",
    description: "Information about diabetes medications",
    prompt: "Can you explain different types of diabetes medications and how they work?",
  },
  {
    icon: "📊",
    title: "Trend Analysis",
    description: "Analyze my health data trends",
    prompt: "Help me understand trends in my diabetes management data",
  },
]

export function ChatbotInterface() {
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([
    {
      id: "1",
      title: "Diabetes Management Tips",
      messages: [
        {
          id: "1",
          role: "user",
          content: "What are some good tips for managing diabetes?",
          timestamp: new Date(Date.now() - 3600000),
        },
        {
          id: "2",
          role: "assistant",
          content:
            "Here are some essential diabetes management tips:\n\n1. **Monitor Blood Sugar Regularly**: Check your glucose levels as recommended by your healthcare provider\n2. **Follow a Balanced Diet**: Focus on whole grains, lean proteins, and vegetables\n3. **Stay Active**: Regular exercise helps control blood sugar levels\n4. **Take Medications as Prescribed**: Never skip doses without consulting your doctor\n5. **Stay Hydrated**: Drink plenty of water throughout the day\n\nWould you like me to elaborate on any of these points?",
          timestamp: new Date(Date.now() - 3590000),
        },
      ],
      createdAt: new Date(Date.now() - 86400000),
      updatedAt: new Date(Date.now() - 3590000),
    },
    {
      id: "2",
      title: "Blood Sugar Monitoring",
      messages: [
        {
          id: "3",
          role: "user",
          content: "How often should I check my blood sugar?",
          timestamp: new Date(Date.now() - 172800000),
        },
      ],
      createdAt: new Date(Date.now() - 172800000),
      updatedAt: new Date(Date.now() - 172800000),
    },
  ])

  const [currentSessionId, setCurrentSessionId] = useState<string>("1")
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [renameDialogOpen, setRenameDialogOpen] = useState(false)
  const [renamingSessionId, setRenamingSessionId] = useState<string>("")
  const [newTitle, setNewTitle] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const currentSession = chatSessions.find((session) => session.id === currentSessionId)
  const filteredSessions = chatSessions.filter((session) =>
    session.title.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [currentSession?.messages])

  const createNewChat = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: "New Chat",
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setChatSessions((prev) => [newSession, ...prev])
    setCurrentSessionId(newSession.id)
    setSidebarOpen(false)
  }

  const deleteChat = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setChatSessions((prev) => prev.filter((session) => session.id !== sessionId))
    if (currentSessionId === sessionId) {
      const remaining = chatSessions.filter((session) => session.id !== sessionId)
      if (remaining.length > 0) {
        setCurrentSessionId(remaining[0].id)
      } else {
        createNewChat()
      }
    }
  }

  const openRenameDialog = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const session = chatSessions.find((s) => s.id === sessionId)
    if (session) {
      setRenamingSessionId(sessionId)
      setNewTitle(session.title)
      setRenameDialogOpen(true)
    }
  }

  const handleRename = () => {
    if (newTitle.trim() && renamingSessionId) {
      setChatSessions((prev) =>
        prev.map((session) => (session.id === renamingSessionId ? { ...session, title: newTitle.trim() } : session)),
      )
      setRenameDialogOpen(false)
      setRenamingSessionId("")
      setNewTitle("")
    }
  }

  const sendMessage = async (messageContent: string) => {
    if (!messageContent.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageContent.trim(),
      timestamp: new Date(),
    }

    // Update current session with user message
    setChatSessions((prev) =>
      prev.map((session) => {
        if (session.id === currentSessionId) {
          const updatedMessages = [...session.messages, userMessage]
          return {
            ...session,
            messages: updatedMessages,
            title: session.title === "New Chat" ? messageContent.slice(0, 50) + "..." : session.title,
            updatedAt: new Date(),
          }
        }
        return session
      }),
    )

    setIsLoading(true)
    setInput("")

    try {
      // Here you would make the API call to your chatbot endpoint
      // const response = await fetch('/api/chat', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     message: messageContent,
      //     sessionId: currentSessionId,
      //     history: currentSession?.messages || []
      //   })
      // })
      // const data = await response.json()

      // Simulated response for now
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `I understand you're asking about: "${messageContent}". As your DiabetesAI assistant, I'm here to help with diabetes management, nutrition advice, medication information, and health monitoring. 

This is a simulated response. In the actual implementation, this would be replaced with your API response containing personalized diabetes management advice based on your query.

How else can I assist you with your diabetes management today?`,
        timestamp: new Date(),
      }

      setChatSessions((prev) =>
        prev.map((session) => {
          if (session.id === currentSessionId) {
            return {
              ...session,
              messages: [...session.messages, assistantMessage],
              updatedAt: new Date(),
            }
          }
          return session
        }),
      )
    } catch (error) {
      console.error("Error sending message:", error)
      // Handle error appropriately
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const handleSuggestionClick = (prompt: string) => {
    sendMessage(prompt)
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 48) return "Yesterday"
    return date.toLocaleDateString()
  }

  const formatMessageTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <Button
          onClick={createNewChat}
          className="w-full justify-start gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
        >
          <Plus className="h-4 w-4" />
          New Chat
        </Button>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-50 border-gray-200"
          />
        </div>
      </div>

      {/* Chat History */}
      <ScrollArea className="flex-1 p-2">
        <div className="space-y-1">
          {filteredSessions.map((session) => (
            <div
              key={session.id}
              className={`group relative flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                currentSessionId === session.id
                  ? "bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 shadow-sm"
                  : "hover:bg-white hover:shadow-sm border border-transparent"
              }`}
              onClick={() => {
                setCurrentSessionId(session.id)
                setSidebarOpen(false)
              }}
            >
              <div
                className={`p-2 rounded-lg ${
                  currentSessionId === session.id
                    ? "bg-gradient-to-r from-blue-600 to-purple-600"
                    : "bg-gray-200 group-hover:bg-gray-300"
                }`}
              >
                <MessageSquare
                  className={`h-4 w-4 ${currentSessionId === session.id ? "text-white" : "text-gray-600"}`}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div
                  className={`text-sm font-medium truncate ${
                    currentSessionId === session.id ? "text-gray-900" : "text-gray-700"
                  }`}
                >
                  {session.title}
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="h-3 w-3" />
                  {formatTime(session.updatedAt)}
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 h-8 w-8 p-0 hover:bg-gray-200"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem onClick={(e) => openRenameDialog(session.id, e)}>
                    <Edit3 className="h-4 w-4 mr-2" />
                    Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => deleteChat(session.id, e)}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">DiabetesAI</div>
            <div className="text-xs text-gray-600">Your health assistant</div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-white">
      {/* Rename Dialog */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rename Chat</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Enter new chat title..."
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleRename()
                }
              }}
              className="w-full"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRename} disabled={!newTitle.trim()}>
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-80 border-r border-gray-200">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-80 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-3">
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
            </Sheet>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900 truncate">{currentSession?.title || "New Chat"}</h1>
                <p className="text-sm text-gray-500">DiabetesAI Assistant</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-green-50 rounded-full border border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-700 font-medium">Online</span>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 py-6">
            {!currentSession?.messages.length ? (
              <div className="flex flex-col items-center justify-center h-full py-12">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
                  <Bot className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Welcome to DiabetesAI</h2>
                <p className="text-gray-600 text-center max-w-md mb-8 leading-relaxed">
                  Your personal diabetes management assistant. Ask me about blood sugar monitoring, nutrition,
                  medications, or any health-related questions.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
                  {quickSuggestions.map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="p-6 h-auto text-left justify-start hover:bg-white hover:shadow-md transition-all duration-200 border-gray-200 bg-white"
                      onClick={() => handleSuggestionClick(suggestion.prompt)}
                    >
                      <div className="flex items-start gap-4 w-full">
                        <span className="text-2xl flex-shrink-0">{suggestion.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-900 mb-1">{suggestion.title}</div>
                          <div className="text-sm text-gray-600 leading-relaxed">{suggestion.description}</div>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {currentSession.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-4 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`flex gap-4 max-w-[85%] sm:max-w-[75%] ${
                        message.role === "user" ? "flex-row-reverse" : "flex-row"
                      }`}
                    >
                      <Avatar className="h-10 w-10 flex-shrink-0 shadow-sm">
                        <AvatarFallback
                          className={`${
                            message.role === "user"
                              ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                              : "bg-white border border-gray-200"
                          }`}
                        >
                          {message.role === "user" ? (
                            <User className="h-5 w-5" />
                          ) : (
                            <Bot className="h-5 w-5 text-gray-600" />
                          )}
                        </AvatarFallback>
                      </Avatar>

                      <div className={`flex flex-col gap-1 ${message.role === "user" ? "items-end" : "items-start"}`}>
                        <div
                          className={`rounded-2xl px-4 py-3 shadow-sm ${
                            message.role === "user"
                              ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                              : "bg-white border border-gray-200 text-gray-900"
                          }`}
                        >
                          <div className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                            {message.content}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 px-2">{formatMessageTime(message.timestamp)}</div>
                      </div>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex gap-4 justify-start">
                    <Avatar className="h-10 w-10 shadow-sm">
                      <AvatarFallback className="bg-white border border-gray-200">
                        <Bot className="h-5 w-5 text-gray-600" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500">DiabetesAI is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t border-gray-200 bg-white p-4">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask DiabetesAI anything about diabetes management..."
                  className="pr-12 h-12 rounded-xl border-2 border-gray-200 focus:border-blue-500 transition-colors bg-gray-50 focus:bg-white"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  size="sm"
                  className="absolute right-2 top-2 h-8 w-8 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-300 shadow-sm"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="text-xs text-gray-500 text-center mt-3 leading-relaxed">
              DiabetesAI can make mistakes. Always verify important medical information with your healthcare provider.
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
