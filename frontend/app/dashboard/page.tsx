"use client"

import { useState, useEffect } from "react"
import { useChat } from "@ai-sdk/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Bot,
  User,
  Send,
  BarChart3,
  Heart,
  Activity,
  TrendingUp,
  Pill,
  Apple,
  Home,
  MessageCircle,
  Settings,
  Calendar,
  FileText,
  Bell,
} from "lucide-react"
import Link from "next/link"
import { GlucoseChart } from "@/components/glucose-chart"
import { WeeklyOverview } from "@/components/weekly-overview"
import { MedicationChart } from "@/components/medication-chart"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"

import { GlucoseLog } from "@/components/glucose-log"
import { Medications } from "@/components/medications"
import { Meals } from "@/components/meals"
import { CalendarView } from "@/components/calendar-view"
import { Reports } from "@/components/reports"
import { Reminders } from "@/components/reminders"
import { Settings as SettingsComponent } from "@/components/settings"

export default function Dashboard() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat()
  const [activeView, setActiveView] = useState("overview")

  const navigationItems = [
    {
      title: "Dashboard",
      items: [
        { title: "Overview", icon: BarChart3, id: "overview" },
        { title: "AI Assistant", icon: MessageCircle, id: "chat" },
      ],
    },
    {
      title: "Health",
      items: [
        { title: "Glucose Log", icon: Heart, id: "glucose" },
        { title: "Medications", icon: Pill, id: "medications" },
        { title: "Meals", icon: Apple, id: "meals" },
      ],
    },
    {
      title: "Tools",
      items: [
        { title: "Calendar", icon: Calendar, id: "calendar" },
        { title: "Reports", icon: FileText, id: "reports" },
        { title: "Reminders", icon: Bell, id: "reminders" },
        { title: "Settings", icon: Settings, id: "settings" },
      ],
    },
  ]


  const [currentUser, setCurrentUser] = useState(null)

    useEffect(() => {
      const fetchUser = async () => {
        try {
          const res = await fetch("http://localhost:5000/api/auth/me", {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          })

          if (!res.ok) throw new Error("Failed to fetch user")

          const data = await res.json()
          setCurrentUser(data.name)
        } catch (error) {
          console.error("Error fetching user:", error)
        }
      }

      fetchUser()
    }, []);

  const AppSidebar = () => {
    const { setOpenMobile } = useSidebar()

    const handleMenuItemClick = (viewId: string) => {
      setActiveView(viewId)
      // Close sidebar on mobile after selection
      setOpenMobile(false)
    }

    return (
      <Sidebar variant="inset">
        <SidebarHeader>
          <div className="flex items-center space-x-2 px-2 py-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                DiabetesAI
              </span>
              <p className="text-xs text-gray-500">Dashboard</p>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          {navigationItems.map((group) => (
            <SidebarGroup key={group.title}>
              <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        onClick={() => handleMenuItemClick(item.id)}
                        isActive={activeView === item.id}
                        className="w-full"
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <Link href="/">
              <SidebarMenuButton className="w-full">
                <Home className="h-4 w-4" />
                <span>Back to Home</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenu>
          <div className="px-2 py-2">
            <div className="flex items-center space-x-2 p-2 bg-green-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs text-green-700">
                 {currentUser ? currentUser : "Loading..."}
              </span>
            </div>
          </div>
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>
    )
  }

  const renderContent = () => {
    switch (activeView) {
      case "overview":
        return (
          <div className="space-y-4 sm:space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
              <Card className="border-0 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Current Glucose</CardTitle>
                  <Activity className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold text-green-600">128 mg/dL</div>
                  <p className="text-xs text-gray-600">Normal range</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Weekly Average</CardTitle>
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold text-blue-600">142 mg/dL</div>
                  <p className="text-xs text-gray-600">↓ 8% from last week</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Medications</CardTitle>
                  <Pill className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold text-purple-600">95%</div>
                  <p className="text-xs text-gray-600">Adherence rate</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Meals Logged</CardTitle>
                  <Apple className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold text-orange-600">18</div>
                  <p className="text-xs text-gray-600">This week</p>
                </CardContent>
              </Card>
            </div>

            {/* Analytics Charts */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
              <GlucoseChart />
              <MedicationChart />
            </div>

            {/* Weekly Overview */}
            <WeeklyOverview />
          </div>
        )

      case "chat":
        return (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
            <Card className="xl:col-span-2 border-0 shadow-lg">
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Bot className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                  DiabetesAI Assistant
                </CardTitle>
                <CardDescription className="text-sm">
                  Ask me anything about diabetes management, nutrition, or your health data.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ScrollArea className="h-[40vh] sm:h-[50vh] lg:h-[400px] w-full border rounded-lg p-3 sm:p-4 bg-gray-50">
                  <div className="space-y-4">
                    {messages.length === 0 && (
                      <div className="text-center text-gray-500 py-6 sm:py-8">
                        <Bot className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-blue-500" />
                        <p className="text-base sm:text-lg font-medium mb-2">Hello! I'm your DiabetesAI Assistant</p>
                        <p className="text-sm">
                          Ask me about diabetes management, nutrition tips, or any health-related questions.
                        </p>
                      </div>
                    )}
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-2 sm:gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`flex gap-2 sm:gap-3 max-w-[90%] sm:max-w-[85%] ${
                            message.role === "user" ? "flex-row-reverse" : "flex-row"
                          }`}
                        >
                          <Avatar className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0">
                            <AvatarFallback
                              className={
                                message.role === "user" ? "bg-blue-500 text-white" : "bg-purple-500 text-white"
                              }
                            >
                              {message.role === "user" ? (
                                <User className="h-3 w-3 sm:h-4 sm:w-4" />
                              ) : (
                                <Bot className="h-3 w-3 sm:h-4 sm:w-4" />
                              )}
                            </AvatarFallback>
                          </Avatar>
                          <div
                            className={`rounded-lg px-3 py-2 sm:px-4 sm:py-2 ${
                              message.role === "user" ? "bg-blue-500 text-white" : "bg-white border shadow-sm"
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex gap-2 sm:gap-3 justify-start">
                        <Avatar className="h-6 w-6 sm:h-8 sm:w-8">
                          <AvatarFallback className="bg-purple-500 text-white">
                            <Bot className="h-3 w-3 sm:h-4 sm:w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="bg-white border shadow-sm rounded-lg px-3 py-2 sm:px-4 sm:py-2">
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
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <Input
                    value={input}
                    onChange={handleInputChange}
                    placeholder="Ask about diabetes management..."
                    className="flex-1 h-9 sm:h-10"
                    disabled={isLoading}
                  />
                  <Button type="submit" disabled={isLoading || !input.trim()} size="sm">
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="text-base sm:text-lg">Quick Questions</CardTitle>
                <CardDescription className="text-sm">Try asking about these topics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  "What should my blood sugar be?",
                  "Best foods for diabetes",
                  "Exercise recommendations",
                  "Managing stress with diabetes",
                  "Medication side effects",
                ].map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-left h-auto py-2 px-3 bg-transparent text-xs sm:text-sm"
                    onClick={() => {
                      const syntheticEvent = {
                        preventDefault: () => {},
                        target: { elements: { prompt: { value: question } } },
                      } as any
                      handleInputChange({ target: { value: question } } as any)
                      setTimeout(() => handleSubmit(syntheticEvent), 100)
                    }}
                  >
                    {question}
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>
        )

      case "glucose":
        return <GlucoseLog />

      case "medications":
        return <Medications />

      case "meals":
        return <Meals />

      case "calendar":
        return <CalendarView />

      case "reports":
        return <Reports />

      case "reminders":
        return <Reminders />

      case "settings":
        return <SettingsComponent />

      default:
        return (
          <div className="flex items-center justify-center h-[50vh]">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                <Settings className="h-8 w-8 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Coming Soon</h3>
                <p className="text-gray-500">This feature is under development.</p>
              </div>
            </div>
          </div>
        )
    }
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <AppSidebar />
        <SidebarInset className="flex-1">
          {/* Mobile Header */}
          <header className="flex h-14 sm:h-16 shrink-0 items-center gap-2 border-b bg-white/80 backdrop-blur-md px-3 sm:px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex items-center space-x-2 flex-1 min-w-0">
              <div className="min-w-0 flex-1">
                <h1 className="text-base sm:text-xl font-semibold truncate">Dashboard</h1>
                <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">Welcome back,  {currentUser ? currentUser : "Loading..."}!</p>
              </div>
            </div>
            <Badge className="bg-green-100 text-green-700 hidden md:inline-flex text-xs">Online</Badge>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-3 sm:p-4 lg:p-6">{renderContent()}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
