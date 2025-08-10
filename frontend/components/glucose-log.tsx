"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Activity, Clock, TrendingUp, TrendingDown, TrashIcon } from "lucide-react"

import { api } from "@/lib/api"


export interface GlucoseReading {
  _id: string
  level: number
  readingType: 'fasting' | 'before-meal' | 'after-meal' | 'bedtime' | 'random'
  notes?: string
  recordedAt: string 
}


export function GlucoseLog() {
  const [readings, setReadings] = useState<GlucoseReading[]>([])
  const [loading, setLoading] = useState(true)

  const [newReading, setNewReading] = useState({
    value: "",
    type: "",
    notes: "",
  })

  const [showAddForm, setShowAddForm] = useState(false)

   useEffect(() => {
    api.getGlucoseReadings()
      .then(data => {
        // store whatever you get into readings state
        setReadings(data)
      })
      .catch(err => console.error("Failed to load readings:", err))
      .finally(() => setLoading(false))
  }, [])

   const handleAddReading = async () => {
    try {
      const created = await api.addGlucoseReading({
        level: Number(newReading.value),
        readingType: newReading.type,
        notes: newReading.notes || undefined,
        recordedAt: new Date(),
      })

      // If backend returns full reading object, use that
      setReadings(prev => [created, ...prev])

      // Clear form
      setNewReading({ value: "", type: "", notes: "" })
      setShowAddForm(false)
    } catch (err) {
      console.error("Failed to add reading:", err)
    }
  }

  const handleDeleteReading = async (id: string) => {
  try {
    await api.deleteGlucoseReading(id)
    setReadings((prev) => prev.filter((r) => r._id !== id))
  } catch (err) {
    console.error("Failed to delete reading:", err)
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
    readings.length > 0 ? Math.round(readings.reduce((sum, reading) => sum + reading.level, 0) / readings.length) : 0

  const trend = readings.length >= 2 ? readings[0].level - readings[1].level : 0

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
              {readings.length > 0 ? `${readings[0].level} mg/dL` : "No data"}
            </div>
            <p className="text-xs text-gray-600">
              {readings.length > 0
                ? `${readings[0].recordedAt} - ${getTypeLabel(readings[0].readingType)}`
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
                key={reading._id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border rounded-lg bg-white space-y-2 sm:space-y-0"
              >
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div
                    className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${getReadingColor(reading.level, reading.readingType)}`}
                  >
                    {reading.level} mg/dL
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm sm:text-base">{getTypeLabel(reading.readingType)}</p>
                    <p className="text-xs sm:text-sm text-gray-500">
                        {new Date(reading.recordedAt).toLocaleDateString('en-GB')} at {new Date(reading.recordedAt).toLocaleTimeString('en-GB', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
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
                    {reading.readingType}
                  </Badge>

                  <p>
                    <Button
                      variant="destructive"
                      className="h-6 w-6 p-0"
                      onClick={() => handleDeleteReading(reading._id)}
                    >
                      <TrashIcon className="h-3 w-3" />
                    </Button>

                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
