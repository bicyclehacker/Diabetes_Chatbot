"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Activity, Clock, TrendingUp, TrendingDown } from "lucide-react"

interface GlucoseReading {
  id: string
  value: number
  time: string
  date: string
  type: "fasting" | "before-meal" | "after-meal" | "bedtime" | "random"
  notes?: string
}

export function GlucoseLog() {
  const [readings, setReadings] = useState<GlucoseReading[]>([
    {
      id: "1",
      value: 128,
      time: "08:30",
      date: "2024-01-15",
      type: "fasting",
      notes: "Morning reading",
    },
    {
      id: "2",
      value: 165,
      time: "13:45",
      date: "2024-01-15",
      type: "after-meal",
      notes: "After lunch",
    },
    {
      id: "3",
      value: 142,
      time: "19:20",
      date: "2024-01-15",
      type: "before-meal",
      notes: "Before dinner",
    },
  ])

  const [newReading, setNewReading] = useState({
    value: "",
    type: "",
    notes: "",
  })

  const [showAddForm, setShowAddForm] = useState(false)

  const handleAddReading = () => {
    if (newReading.value && newReading.type) {
      const now = new Date()
      const reading: GlucoseReading = {
        id: Date.now().toString(),
        value: Number.parseInt(newReading.value),
        time: now.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit" }),
        date: now.toISOString().split("T")[0],
        type: newReading.type as GlucoseReading["type"],
        notes: newReading.notes,
      }
      setReadings([reading, ...readings])
      setNewReading({ value: "", type: "", notes: "" })
      setShowAddForm(false)
    }
  }

  const getReadingColor = (value: number, type: string) => {
    if (type === "fasting") {
      if (value < 70) return "text-red-600 bg-red-50"
      if (value <= 100) return "text-green-600 bg-green-50"
      if (value <= 125) return "text-yellow-600 bg-yellow-50"
      return "text-red-600 bg-red-50"
    } else {
      if (value < 70) return "text-red-600 bg-red-50"
      if (value <= 140) return "text-green-600 bg-green-50"
      if (value <= 180) return "text-yellow-600 bg-yellow-50"
      return "text-red-600 bg-red-50"
    }
  }

  const getTypeLabel = (type: string) => {
    const labels = {
      fasting: "Fasting",
      "before-meal": "Before Meal",
      "after-meal": "After Meal",
      bedtime: "Bedtime",
      random: "Random",
    }
    return labels[type as keyof typeof labels] || type
  }

  const averageReading =
    readings.length > 0 ? Math.round(readings.reduce((sum, reading) => sum + reading.value, 0) / readings.length) : 0

  const trend = readings.length >= 2 ? readings[0].value - readings[1].value : 0

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Latest Reading</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {readings.length > 0 ? `${readings[0].value} mg/dL` : "No data"}
            </div>
            <p className="text-xs text-gray-600">
              {readings.length > 0
                ? `${readings[0].time} - ${getTypeLabel(readings[0].type)}`
                : "Add your first reading"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average (7 days)</CardTitle>
            <Clock className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{averageReading} mg/dL</div>
            <p className="text-xs text-gray-600">Based on {readings.length} readings</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trend</CardTitle>
            {trend >= 0 ? (
              <TrendingUp className="h-4 w-4 text-red-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-green-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${trend >= 0 ? "text-red-600" : "text-green-600"}`}>
              {trend >= 0 ? "+" : ""}
              {trend} mg/dL
            </div>
            <p className="text-xs text-gray-600">From previous reading</p>
          </CardContent>
        </Card>
      </div>

      {/* Add Reading Form */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Glucose Readings</CardTitle>
              <CardDescription>Track your blood glucose levels throughout the day</CardDescription>
            </div>
            <Button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Reading
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {showAddForm && (
            <div className="p-4 border rounded-lg bg-gray-50 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="glucose-value">Glucose Level (mg/dL)</Label>
                  <Input
                    id="glucose-value"
                    type="number"
                    placeholder="Enter value"
                    value={newReading.value}
                    onChange={(e) => setNewReading({ ...newReading, value: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reading-type">Reading Type</Label>
                  <Select
                    value={newReading.type}
                    onValueChange={(value) => setNewReading({ ...newReading, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fasting">Fasting</SelectItem>
                      <SelectItem value="before-meal">Before Meal</SelectItem>
                      <SelectItem value="after-meal">After Meal</SelectItem>
                      <SelectItem value="bedtime">Bedtime</SelectItem>
                      <SelectItem value="random">Random</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 sm:col-span-2 xl:col-span-1">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Input
                    id="notes"
                    placeholder="Add notes"
                    value={newReading.notes}
                    onChange={(e) => setNewReading({ ...newReading, notes: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddReading} disabled={!newReading.value || !newReading.type}>
                  Save Reading
                </Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Readings List */}
          <div className="space-y-3">
            {readings.map((reading) => (
              <div
                key={reading.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border rounded-lg bg-white space-y-2 sm:space-y-0"
              >
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div
                    className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${getReadingColor(reading.value, reading.type)}`}
                  >
                    {reading.value} mg/dL
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm sm:text-base">{getTypeLabel(reading.type)}</p>
                    <p className="text-xs sm:text-sm text-gray-500">
                      {reading.date} at {reading.time}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end sm:text-right space-x-2">
                  {reading.notes && (
                    <p className="text-xs sm:text-sm text-gray-600 max-w-xs truncate flex-1 sm:flex-none">
                      {reading.notes}
                    </p>
                  )}
                  <Badge variant="outline" className="text-xs shrink-0">
                    {reading.type}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
