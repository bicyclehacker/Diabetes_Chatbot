"use client"

import { useEffect, useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Plus,
  CalendarIcon,
  Clock,
  Mail,
  Repeat,
  Edit,
  Trash2,
  CheckCircle2,
  Circle,
  Bell,
  Activity,
  Pill,
  Apple,
  Stethoscope,
  ClipboardList,
  Send,
} from "lucide-react"
import { format, isSameDay, isToday, addDays } from "date-fns"
import { api } from "@/lib/api"
import { DayProps } from "react-day-picker"

interface CalendarEvent {
  id: string
  title: string
  description?: string
  date: Date
  time?: string
  type: "medication" | "glucose" | "meal" | "appointment" | "task" | "reminder"
  isTask: boolean
  completed: boolean
  frequency: "once" | "daily" | "weekly" | "monthly"
  emailReminder: boolean
  value?: string
}

export function CalendarView() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([])

  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  const [newEvent, setNewEvent] = useState<Partial<CalendarEvent>>({
    title: "",
    description: "",
    date: selectedDate,
    time: "",
    type: "reminder",
    isTask: false,
    completed: false,
    frequency: "once",
    emailReminder: false,
  })

  useEffect(() => {
    if (selectedDate) {
      setNewEvent(prev => ({
        ...prev,
        date: selectedDate
      }));
    }
  }, [selectedDate]);

  // 🔹 Load events from backend
    useEffect(() => {
      const fetchReminders = async () => {
        try {
          const data = await api.getReminders()  // already JSON

          // Transform backend reminder -> CalendarEvent
          const mapped: CalendarEvent[] = data.map((r: any) => ({
            id: r._id,
            title: r.title,
            description: r.description,
            date: new Date(r.date),
            time: r.time,
            type: r.type.toLowerCase().replace(" ", "") as CalendarEvent["type"], // normalize
            isTask: r.isTask,
            completed: r.completed,
            frequency: r.frequency.toLowerCase() as CalendarEvent["frequency"],
            emailReminder: r.emailReminder,
            value: r.value,
          }))

          setEvents(mapped)
        } catch (err) {
          console.error("Failed to fetch reminders", err)
        }
      }

      fetchReminders()
    }, [])



  // 🔹 Add event (backend + frontend state)
const addEvent = async () => {
  if (!newEvent.title || !newEvent.date || !newEvent.time) {
    alert("Please provide a title, date, and time.");
    return;
  }

  try {

    const datePart = newEvent.date;
    const timePart = newEvent.time;

    const [hours, minutes] = timePart.split(':').map(Number);

    const  combinedDate = new Date(datePart);
    combinedDate.setHours(hours, minutes, 0, 0); // Set H, M, S, MS

    const saved = await api.addReminder({
      title: newEvent.title!,
      description: newEvent.description,
      date: combinedDate,
      time: newEvent.time,
      type: newEvent.type || "reminder",
      frequency: newEvent.frequency || "once",
      emailReminder: newEvent.emailReminder,
      isTask: newEvent.isTask,
      completed: false,
      value: newEvent.value,
    });

    const event: CalendarEvent = {
      id: saved._id,  // ✅ works now
      title: saved.title,
      description: saved.description,
      date: new Date(saved.date),
      time: saved.time,
      type: saved.type.toLowerCase().replace(" ", "") as CalendarEvent["type"],
      isTask: saved.isTask,
      completed: saved.completed,
      frequency: saved.frequency.toLowerCase() as CalendarEvent["frequency"],
      emailReminder: saved.emailReminder,
      value: saved.value,
    };

    setEvents([...events, event]);
    setNewEvent({
      title: "",
      description: "",
      date: selectedDate,
      time: "",
      type: "reminder",
      isTask: false,
      completed: false,
      frequency: "once",
      emailReminder: false,
    });
    setShowAddDialog(false);
  } catch (err) {
    console.error("Failed to add reminder", err);
  }
};


  // 🔹 Update event
  const updateEvent = async () => {
    if (!editingEvent || !editingEvent.date || !editingEvent.time) return

    const datePart = editingEvent.date;
    const timePart = editingEvent.time;

    const [hours, minutes] = timePart.split(':').map(Number);

    const  combinedDate = new Date(datePart);
    combinedDate.setHours(hours, minutes, 0, 0); // Set H, M, S, MS
    

    try {
      await api.updateReminder(editingEvent.id, {
        title: editingEvent.title,
        description: editingEvent.description,
        date: combinedDate,
        time: editingEvent.time,
        type: editingEvent.type,
        frequency: editingEvent.frequency,
        emailReminder: editingEvent.emailReminder,
        isTask: editingEvent.isTask,
        completed: editingEvent.completed,
        value: editingEvent.value,
        enabled: true,
      })

       // Update the local state
    const updatedEventInState = {
        ...editingEvent,
        date: combinedDate,
        enabled: true, // Also update it in the local state
    };

      setEvents(events.map((event) => (event.id === editingEvent.id ? editingEvent : event)))
      setEditingEvent(null)
    } catch (err) {
      console.error("Failed to update reminder", err)
    }
  }

  // 🔹 Delete event
  const deleteEvent = async (eventId: string) => {
    try {
      await api.deleteReminder(eventId)
      setEvents(events.filter((event) => event.id !== eventId))
    } catch (err) {
      console.error("Failed to delete reminder", err)
    }
  }

  const getEventIcon = (type: CalendarEvent["type"]) => {
    switch (type) {
      case "medication":
        return <Pill className="h-3 w-3" />
      case "glucose":
        return <Activity className="h-3 w-3" />
      case "meal":
        return <Apple className="h-3 w-3" />
      case "appointment":
        return <Stethoscope className="h-3 w-3" />
      case "task":
        return <ClipboardList className="h-3 w-3" />
      default:
        return <Bell className="h-3 w-3" />
    }
  }

  const getEventColor = (type: CalendarEvent["type"]) => {
    switch (type) {
      case "medication":
        return "bg-purple-100 text-purple-700 border-purple-200"
      case "glucose":
        return "bg-red-100 text-red-700 border-red-200"
      case "meal":
        return "bg-green-100 text-green-700 border-green-200"
      case "appointment":
        return "bg-blue-100 text-blue-700 border-blue-200"
      case "task":
        return "bg-orange-100 text-orange-700 border-orange-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  
  // 🔹 Toggle completion
  const toggleTaskCompletion = async (eventId: string) => {
      const event = events.find((e) => e.id === eventId)
      if (!event) return
      
      const updated = { ...event, completed: !event.completed }
      await updateEventCompletion(updated)
    }
    
    const updateEventCompletion = async (event: CalendarEvent) => {
        try {
            await api.updateReminder(event.id, { completed: event.completed })
            setEvents(events.map((e) => (e.id === event.id ? event : e)))
        } catch (err) {
            console.error("Failed to toggle completion", err)
        }
    }

    const getEventsForDate = (date: Date) => {
      return events.filter((event) => isSameDay(event.date, date))
    }
    
  const sendEmailReminder = (eventId: string) => {
    // Simulate sending email reminder
    const event = events.find((e) => e.id === eventId)
    if (event) {
      alert(`Email reminder sent for: ${event.title}`)
    }
  }

  const todaysTasks = events.filter((event) => isToday(event.date) && event.isTask)
  const completedTasks = todaysTasks.filter((task) => task.completed)
  const activeReminders = events.filter((event) => event.frequency !== "once").length
  const emailReminders = events.filter((event) => event.emailReminder).length

  const upcomingEvents = events
    .filter((event) => event.date >= new Date())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Tasks</p>
                <p className="text-2xl font-bold text-blue-600">
                  {completedTasks.length}/{todaysTasks.length}
                </p>
                <p className="text-xs text-gray-500">Completed</p>
              </div>
              <ClipboardList className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Reminders</p>
                <p className="text-2xl font-bold text-purple-600">{activeReminders}</p>
                <p className="text-xs text-gray-500">Recurring</p>
              </div>
              <Repeat className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Email Reminders</p>
                <p className="text-2xl font-bold text-green-600">{emailReminders}</p>
                <p className="text-xs text-gray-500">Enabled</p>
              </div>
              <Mail className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Week</p>
                <p className="text-2xl font-bold text-orange-600">{events.length}</p>
                <p className="text-xs text-gray-500">Total Events</p>
              </div>
              <CalendarIcon className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-2 border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Health Calendar</CardTitle>
              <CardDescription>Click on any date to view and manage your health events</CardDescription>
            </div>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Event
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Event</DialogTitle>
                  <DialogDescription>Create a new health event, task, or reminder</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                      placeholder="Enter event title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newEvent.description}
                      onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                      placeholder="Add details..."
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="type">Type</Label>
                      <Select
                        value={newEvent.type}
                        onValueChange={(value: CalendarEvent["type"]) => setNewEvent({ ...newEvent, type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="medication">Medication</SelectItem>
                          <SelectItem value="glucose">Glucose Check</SelectItem>
                          <SelectItem value="meal">Meal</SelectItem>
                          <SelectItem value="appointment">Appointment</SelectItem>
                          <SelectItem value="task">Task</SelectItem>
                          <SelectItem value="reminder">Reminder</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="time">Time</Label>
                      <Input
                        id="time"
                        type="time"
                        value={newEvent.time}
                        onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="frequency">Frequency</Label>
                    <Select
                      value={newEvent.frequency}
                      onValueChange={(value: CalendarEvent["frequency"]) =>
                        setNewEvent({ ...newEvent, frequency: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="once">Once</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isTask"
                        checked={newEvent.isTask}
                        onCheckedChange={(checked) => setNewEvent({ ...newEvent, isTask: checked as boolean })}
                      />
                      <Label htmlFor="isTask">Make it a task</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="emailReminder"
                        checked={newEvent.emailReminder}
                        onCheckedChange={(checked) => setNewEvent({ ...newEvent, emailReminder: checked })}
                      />
                      <Label htmlFor="emailReminder">Email reminder</Label>
                    </div>
                  </div>
                  <Button onClick={addEvent} className="w-full">
                    Add Event
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  if (date && (!selectedDate || !isSameDay(selectedDate, date))) {
                    setSelectedDate(date);
                  }
                }}
                showOutsideDays={false}
                className="rounded-md border p-3"
                classNames={{
                  day: "h-24 w-full p-1 text-left align-top",
                  day_selected:
                    "bg-primary text-primary-foreground rounded-md hover:bg-primary            hover:text-primary-foreground focus:bg-primary         focus:text-primary-foreground",
                  day_today: "bg-accent rounded-md",
                }}
                components={{
                  DayContent: ({ date }) => {
                    const dayEvents = getEventsForDate(date);
                
                    return (
                      // Use a React Fragment to avoid adding extra styling
                      <>
                        <div className="text-sm font-medium mb-1">{format(date,            "d")}</div>
                        <ScrollArea className="h-16">
                          <div className="space-y-1">
                            {dayEvents.slice(0, 3).map((event) => (
                              <div
                                key={event.id}
                                className={`text-xs p-1 rounded border $           {getEventColor(
                                  event.type
                                )} flex items-center gap-1`}
                              >
                                {event.isTask && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleTaskCompletion(event.id);
                                    }}
                                    className="flex-shrink-0"
                                  >
                                    {event.completed ? (
                                      <CheckCircle2 className="h-3 w-3         text-green-600" />
                                    ) : (
                                      <Circle className="h-3 w-3" />
                                    )}
                                  </button>
                                )}
                                {getEventIcon(event.type)}
                                <span
                                  className={`truncate ${
                                    event.completed ? "line-through text-gray-500"         : ""
                                  }`}
                                >
                                  {event.title}
                                </span>
                                {event.emailReminder && <Mail className="h-2 w-2           ml-auto" />}
                                {event.frequency !== "once" && <Repeat         className="h-2 w-2 ml-auto" />}
                              </div>
                            ))}
                            {dayEvents.length > 3 && (
                              <div className="text-xs text-gray-500 text-center">
                                +{dayEvents.length - 3} more
                              </div>
                            )}
                          </div>
                        </ScrollArea>
                      </>
                    );
                  },
                }}
              />
            </CardContent>

        </Card>

        {/* Events for Selected Date & Upcoming Events */}
        <div className="space-y-6">
          {/* Selected Date Events */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">{format(selectedDate, "MMMM d, yyyy")}</CardTitle>
              <CardDescription>Events and tasks for this date</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-3">
                  {getEventsForDate(selectedDate).length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <CalendarIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No events for this date</p>
                    </div>
                  ) : (
                    getEventsForDate(selectedDate).map((event) => (
                      <div key={event.id} className={`p-3 rounded-lg border ${getEventColor(event.type)}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-2 flex-1">
                            {event.isTask && (
                              <button onClick={() => toggleTaskCompletion(event.id)} className="mt-0.5">
                                {event.completed ? (
                                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                                ) : (
                                  <Circle className="h-4 w-4" />
                                )}
                              </button>
                            )}
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                {getEventIcon(event.type)}
                                <h4 className={`font-medium text-sm ${event.completed ? "line-through" : ""}`}>
                                  {event.title}
                                </h4>
                              </div>
                              {event.time && (
                                <div className="flex items-center gap-1 mt-1">
                                  <Clock className="h-3 w-3" />
                                  <span className="text-xs">{event.time}</span>
                                </div>
                              )}
                              {event.description && <p className="text-xs mt-1 opacity-80">{event.description}</p>}
                              <div className="flex items-center gap-2 mt-2">
                                {event.frequency !== "once" && (
                                  <Badge variant="secondary" className="text-xs">
                                    <Repeat className="h-2 w-2 mr-1" />
                                    {event.frequency}
                                  </Badge>
                                )}
                                {event.emailReminder && (
                                  <Badge variant="secondary" className="text-xs">
                                    <Mail className="h-2 w-2 mr-1" />
                                    Email
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {event.emailReminder && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => sendEmailReminder(event.id)}
                                className="h-6 w-6 p-0"
                              >
                                <Send className="h-3 w-3" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingEvent(event)}
                              className="h-6 w-6 p-0"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteEvent(event.id)}
                              className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Upcoming Events</CardTitle>
              <CardDescription>Next 5 events and tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-3">
                  {upcomingEvents.map((event) => (
                    <div key={event.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                      {event.isTask && (
                        <button onClick={() => toggleTaskCompletion(event.id)}>
                          {event.completed ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          ) : (
                            <Circle className="h-4 w-4" />
                          )}
                        </button>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {getEventIcon(event.type)}
                          <span className={`text-sm font-medium ${event.completed ? "line-through" : ""}`}>
                            {event.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500">{format(event.date, "MMM d")}</span>
                          {event.time && (
                            <>
                              <span className="text-xs text-gray-400">•</span>
                              <span className="text-xs text-gray-500">{event.time}</span>
                            </>
                          )}
                          {event.frequency !== "once" && (
                            <>
                              <span className="text-xs text-gray-400">•</span>
                              <span className="text-xs text-gray-500">{event.frequency}</span>
                            </>
                          )}
                        </div>
                      </div>
                      {event.emailReminder && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => sendEmailReminder(event.id)}
                          className="h-6 w-6 p-0"
                        >
                          <Send className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Event Dialog */}
      {editingEvent && (
        <Dialog open={!!editingEvent} onOpenChange={() => setEditingEvent(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Event</DialogTitle>
              <DialogDescription>Update your health event details</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={editingEvent.title}
                  onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editingEvent.description}
                  onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-type">Type</Label>
                  <Select
                    value={editingEvent.type}
                    onValueChange={(value: CalendarEvent["type"]) => setEditingEvent({ ...editingEvent, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="medication">Medication</SelectItem>
                      <SelectItem value="glucose">Glucose Check</SelectItem>
                      <SelectItem value="meal">Meal</SelectItem>
                      <SelectItem value="appointment">Appointment</SelectItem>
                      <SelectItem value="task">Task</SelectItem>
                      <SelectItem value="reminder">Reminder</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-time">Time</Label>
                  <Input
                    id="edit-time"
                    type="time"
                    value={editingEvent.time}
                    onChange={(e) => setEditingEvent({ ...editingEvent, time: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-frequency">Frequency</Label>
                <Select
                  value={editingEvent.frequency}
                  onValueChange={(value: CalendarEvent["frequency"]) =>
                    setEditingEvent({ ...editingEvent, frequency: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="once">Once</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-isTask"
                    checked={editingEvent.isTask}
                    onCheckedChange={(checked) => setEditingEvent({ ...editingEvent, isTask: checked as boolean })}
                  />
                  <Label htmlFor="edit-isTask">Make it a task</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit-emailReminder"
                    checked={editingEvent.emailReminder}
                    onCheckedChange={(checked) => setEditingEvent({ ...editingEvent, emailReminder: checked })}
                  />
                  <Label htmlFor="edit-emailReminder">Email reminder</Label>
                </div>
              </div>
              <Button onClick={updateEvent} className="w-full">
                Update Event
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

