"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Calendar, Activity, Pill, Apple, Plus } from "lucide-react"

interface CalendarEvent {
  id: string
  title: string
  type: "glucose" | "medication" | "meal" | "appointment" | "reminder"
  time: string
  date: string
  value?: string
  status?: "completed" | "pending" | "missed"
}

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const events: CalendarEvent[] = [
    {
      id: "1",
      title: "Morning Glucose Check",
      type: "glucose",
      time: "08:00",
      date: "2024-01-15",
      value: "128 mg/dL",
      status: "completed",
    },
    {
      id: "2",
      title: "Metformin",
      type: "medication",
      time: "08:30",
      date: "2024-01-15",
      status: "completed",
    },
    {
      id: "3",
      title: "Breakfast",
      type: "meal",
      time: "09:00",
      date: "2024-01-15",
      value: "45g carbs",
      status: "completed",
    },
    {
      id: "4",
      title: "Doctor Appointment",
      type: "appointment",
      time: "14:00",
      date: "2024-01-16",
      status: "pending",
    },
    {
      id: "5",
      title: "Evening Insulin",
      type: "medication",
      time: "22:00",
      date: "2024-01-15",
      status: "pending",
    },
  ]

  const getEventIcon = (type: string) => {
    const icons = {
      glucose: <Activity className="h-3 w-3" />,
      medication: <Pill className="h-3 w-3" />,
      meal: <Apple className="h-3 w-3" />,
      appointment: <Calendar className="h-3 w-3" />,
      reminder: <Plus className="h-3 w-3" />,
    }
    return icons[type as keyof typeof icons]
  }

  const getEventColor = (type: string, status?: string) => {
    if (status === "completed") return "bg-green-100 text-green-800 border-green-200"
    if (status === "missed") return "bg-red-100 text-red-800 border-red-200"

    const colors = {
      glucose: "bg-blue-100 text-blue-800 border-blue-200",
      medication: "bg-purple-100 text-purple-800 border-purple-200",
      meal: "bg-orange-100 text-orange-800 border-orange-200",
      appointment: "bg-indigo-100 text-indigo-800 border-indigo-200",
      reminder: "bg-gray-100 text-gray-800 border-gray-200",
    }
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800 border-gray-200"
  }

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const formatDate = (date: Date) => {
    return date.toISOString().split("T")[0]
  }

  const getEventsForDate = (dateStr: string) => {
    return events.filter((event) => event.date === dateStr)
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const daysInMonth = getDaysInMonth(currentDate)
  const firstDay = getFirstDayOfMonth(currentDate)
  const monthYear = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })

  const calendarDays = []

  // Empty cells for days before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null)
  }

  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-2 border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
                {monthYear}
              </CardTitle>
              <div className="flex gap-1 sm:gap-2">
                <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
                  <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
                  <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-2 sm:p-6">
            <div className="grid grid-cols-7 gap-1 mb-2 sm:mb-4">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="p-1 sm:p-2 text-center text-xs sm:text-sm font-medium text-gray-500">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => {
                if (day === null) {
                  return <div key={index} className="p-1 sm:p-2 h-16 sm:h-20"></div>
                }

                const dateStr = formatDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))
                const dayEvents = getEventsForDate(dateStr)
                const isSelected = selectedDate === dateStr
                const isToday = dateStr === formatDate(new Date())

                return (
                  <div
                    key={day}
                    className={`p-1 h-16 sm:h-20 border rounded cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-blue-50 border-blue-200"
                        : isToday
                          ? "bg-green-50 border-green-200"
                          : "hover:bg-gray-50"
                    }`}
                    onClick={() => setSelectedDate(dateStr)}
                  >
                    <div className="text-xs sm:text-sm font-medium mb-1">{day}</div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 2).map((event) => (
                        <div
                          key={event.id}
                          className={`text-xs px-1 py-0.5 rounded border ${getEventColor(event.type, event.status)}`}
                        >
                          <div className="flex items-center gap-1">
                            {getEventIcon(event.type)}
                            <span className="truncate text-xs">{event.title}</span>
                          </div>
                        </div>
                      ))}
                      {dayEvents.length > 2 && <div className="text-xs text-gray-500">+{dayEvents.length - 2}</div>}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Event Details */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>
              {selectedDate ? `Events for ${new Date(selectedDate).toLocaleDateString()}` : "Select a date"}
            </CardTitle>
            <CardDescription>
              {selectedDate ? "View and manage your health events" : "Click on a calendar date to view events"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedDate ? (
              <div className="space-y-3">
                {getEventsForDate(selectedDate).length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No events for this date</p>
                ) : (
                  getEventsForDate(selectedDate).map((event) => (
                    <div key={event.id} className="p-3 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getEventIcon(event.type)}
                          <span className="font-medium">{event.title}</span>
                        </div>
                        <Badge className={getEventColor(event.type, event.status)}>{event.status || event.type}</Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>Time: {event.time}</p>
                        {event.value && <p>Value: {event.value}</p>}
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a date to view events</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Events */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Upcoming Events</CardTitle>
          <CardDescription>Your next scheduled health activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {events
              .filter((event) => event.status === "pending")
              .sort((a, b) => new Date(a.date + " " + a.time).getTime() - new Date(b.date + " " + b.time).getTime())
              .slice(0, 5)
              .map((event) => (
                <div
                  key={event.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-3 border rounded-lg space-y-2 sm:space-y-0"
                >
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <div className={`p-1.5 sm:p-2 rounded-full ${getEventColor(event.type)}`}>
                      {getEventIcon(event.type)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm sm:text-base">{event.title}</p>
                      <p className="text-xs sm:text-sm text-gray-500">
                        {new Date(event.date).toLocaleDateString()} at {event.time}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="shrink-0 text-xs">
                    {event.status}
                  </Badge>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
