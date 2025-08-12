"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Bell, Clock, Pill, Activity, Apple, Calendar, Trash2, Edit } from "lucide-react"

import { api } from "@/lib/api"

type ReminderType = "Medication" | "Glucose Check" | "Meal" | "Appointment" | "Custom";
type FrequencyType = "Daily" | "Weekly" | "Monthly" | "Custom";

interface Reminder {
  _id: string;
  title: string;
  type: ReminderType;
  time: string;
  frequency: FrequencyType;
  days?: string[];
  enabled: boolean;
  description?: string;
  nextDue?: string;
}


export function Reminders() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false)

const [newReminder, setNewReminder] = useState<{
    title: string;
    type: ReminderType;
    time: string;
    frequency: FrequencyType;
    days: string[];
    enabled: boolean;
    description: string;
    nextDue: string;
  }>({
    title: "",
    type: "Medication", // default valid value
    time: "",
    frequency: "Daily",
    days: [],
    enabled: true,
    description: "",
    nextDue: "",
  });

  useEffect(() => {
    api.getReminders()
      .then(data => setReminders(data))
      .catch(err => console.error("Failed to load reminders:", err))
      .finally(() => setLoading(false));
  }, []);

function timeToNextDueISO(timeStr: string): string {
  const [hour, minute] = timeStr.split(':').map(Number);
  const now = new Date();
  const due = new Date(now);

  due.setHours(hour, minute, 0, 0);

  // If the time has already passed today, set to tomorrow
  if (due <= now) {
    due.setDate(due.getDate() + 1);
  }

  return due.toISOString();
}


  const handleAddReminder = async () => {
    if (!newReminder.title || !newReminder.type || !newReminder.time) return;

    try {
      const created = await api.addReminder({
        title: newReminder.title,
        type: newReminder.type,
        time: newReminder.time,
        frequency: newReminder.frequency,
        description: newReminder.description,
        enabled: newReminder.enabled,
        nextDue: timeToNextDueISO(newReminder.time),
      });
      setReminders(prev => [created, ...prev]);

      setNewReminder({
        title: '',
        type: 'Medication',
        time: '',
        frequency: 'Daily',
        days: [],
        enabled: true,
        description: '',
        nextDue: '',
      });
      setShowAddForm(false);
    } catch (error) {
      console.error('Failed to add reminder:', error);
    }
  };

  // Updated toggleReminder to call backend and update state
  const toggleReminder = async (id: string, currentEnabled: boolean) => {
    try {
      const updated = await api.updateReminder(id, {
        enabled: !currentEnabled,
        nextDue: !currentEnabled ? new Date().toISOString() : undefined,
      });
      setReminders(reminders.map(r => (r._id === id ? updated : r)));
    } catch (error) {
      console.error("Failed to toggle reminder:", error);
    }
  };

  const deleteReminder = async (id: string) => {
    try {
      await api.deleteReminder(id);
      setReminders(reminders.filter(r => r._id !== id));
    } catch (error) {
      console.error("Failed to delete reminder:", error);
    }
  };

  const getReminderIcon = (type: string) => {
    const icons = {
      medication: <Pill className="h-4 w-4 text-purple-500" />,
      glucose: <Activity className="h-4 w-4 text-blue-500" />,
      meal: <Apple className="h-4 w-4 text-orange-500" />,
      appointment: <Calendar className="h-4 w-4 text-green-500" />,
      custom: <Bell className="h-4 w-4 text-gray-500" />,
    }
    return icons[type as keyof typeof icons]
  }

  const getTypeLabel = (type: string) => {
    const labels = {
      medication: "Medication",
      glucose: "Glucose Check",
      meal: "Meal",
      appointment: "Appointment",
      custom: "Custom",
    }
    return labels[type as keyof typeof labels] || type
  }

  const getFrequencyLabel = (frequency: string) => {
    const labels = {
      daily: "Daily",
      weekly: "Weekly",
      monthly: "Monthly",
      custom: "Custom",
    }
    return labels[frequency as keyof typeof labels] || frequency
  }

  const activeReminders = reminders.filter((r) => r.enabled).length
  const totalReminders = reminders.length

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Reminders</CardTitle>
            <Bell className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{activeReminders}</div>
            <p className="text-xs text-gray-600">Currently enabled</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reminders</CardTitle>
            <Clock className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalReminders}</div>
            <p className="text-xs text-gray-600">All reminders</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg sm:col-span-2 xl:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Reminder</CardTitle>
            <Activity className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-xl font-bold text-orange-600">7:30 AM</div>
            <p className="text-xs text-gray-600">Check Blood Glucose</p>
          </CardContent>
        </Card>
      </div>

      {/* Reminders List */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-3 sm:pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base sm:text-lg">My Reminders</CardTitle>
              <CardDescription className="text-sm">Manage your health reminders and notifications</CardDescription>
            </div>
            <Button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {showAddForm && (
            <div className="p-3 sm:p-4 border rounded-lg bg-gray-50 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reminder-title" className="text-sm">
                    Reminder Title
                  </Label>
                  <Input
                    id="reminder-title"
                    placeholder="Enter reminder title"
                    value={newReminder.title}
                    onChange={(e) => setNewReminder({ ...newReminder, title: e.target.value })}
                    className="h-9 sm:h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reminder-type" className="text-sm">
                    Type
                  </Label>
                  <Select
                    value={newReminder.type}
                    onValueChange={(value) => setNewReminder({ ...newReminder, type: value as ReminderType })}
                  >
                    <SelectTrigger className="h-9 sm:h-10">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Medication">Medication</SelectItem>
                      <SelectItem value="Glucose Check">Glucose Check</SelectItem>
                      <SelectItem value="Meal">Meal</SelectItem>
                      <SelectItem value="Appointment">Appointment</SelectItem>
                      <SelectItem value="Custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reminder-time" className="text-sm">
                    Time
                  </Label>
                  <Input
                    id="reminder-time"
                    type="time"
                    value={newReminder.time}
                    onChange={(e) => setNewReminder({ ...newReminder, time: e.target.value })}
                    className="h-9 sm:h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reminder-frequency" className="text-sm">
                    Frequency
                  </Label>
                  <Select
                    value={newReminder.frequency}
                    onValueChange={(value) => setNewReminder({ ...newReminder, frequency: value as FrequencyType })}
                  >
                    <SelectTrigger className="h-9 sm:h-10">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Daily">Daily</SelectItem>
                      <SelectItem value="Weekly">Weekly</SelectItem>
                      <SelectItem value="Monthly">Monthly</SelectItem>
                      <SelectItem value="Custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reminder-description" className="text-sm">
                  Description (Optional)
                </Label>
                <Textarea
                  id="reminder-description"
                  placeholder="Add reminder description"
                  value={newReminder.description}
                  onChange={(e) => setNewReminder({ ...newReminder, description: e.target.value })}
                  className="min-h-[60px] sm:min-h-[80px]"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleAddReminder}
                  disabled={!newReminder.title || !newReminder.type || !newReminder.time}
                  size="sm"
                >
                  Add Reminder
                </Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)} size="sm">
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Reminders List */}
          <div className="space-y-3">
            {reminders.map((reminder) => (
              <div
                key={reminder._id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border rounded-lg bg-white space-y-3 sm:space-y-0"
              >
                <div className="flex items-start space-x-3 min-w-0 flex-1">
                  <div className="flex items-center space-x-2 shrink-0">
                        <Switch 
                          checked={reminder.enabled} 
                          onCheckedChange={() => toggleReminder(reminder._id, reminder.enabled)} 
                        />
                    {getReminderIcon(reminder.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2">
                      <h3 className="font-medium text-sm sm:text-base">{reminder.title}</h3>
                      <Badge variant="outline" className="text-xs w-fit mt-1 sm:mt-0">
                        {getTypeLabel(reminder.type)}
                      </Badge>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                      {reminder.time} • {getFrequencyLabel(reminder.frequency)}
                    </p>
                    {reminder.description && <p className="text-xs text-gray-600 mt-1">{reminder.description}</p>}
                    <p className="text-xs text-blue-600 mt-1">Next: {reminder.nextDue}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 self-end sm:self-center">
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                    onClick={() => deleteReminder(reminder._id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
