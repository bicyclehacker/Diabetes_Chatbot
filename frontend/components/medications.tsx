"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Plus, Pill, Clock, CheckCircle, AlertCircle } from "lucide-react"

interface Medication {
  id: string
  name: string
  dosage: string
  frequency: string
  time: string[]
  taken: boolean
  lastTaken?: string
  notes?: string
}

export function Medications() {
  const [medications, setMedications] = useState<Medication[]>([
    {
      id: "1",
      name: "Metformin",
      dosage: "500mg",
      frequency: "twice-daily",
      time: ["08:00", "20:00"],
      taken: true,
      lastTaken: "2024-01-15 08:00",
      notes: "Take with food",
    },
    {
      id: "2",
      name: "Insulin Glargine",
      dosage: "20 units",
      frequency: "once-daily",
      time: ["22:00"],
      taken: false,
      notes: "Bedtime injection",
    },
    {
      id: "3",
      name: "Lisinopril",
      dosage: "10mg",
      frequency: "once-daily",
      time: ["08:00"],
      taken: true,
      lastTaken: "2024-01-15 08:15",
    },
  ])

  const [newMedication, setNewMedication] = useState({
    name: "",
    dosage: "",
    frequency: "",
    time: "",
    notes: "",
  })

  const [showAddForm, setShowAddForm] = useState(false)

  const handleAddMedication = () => {
    if (newMedication.name && newMedication.dosage && newMedication.frequency) {
      const medication: Medication = {
        id: Date.now().toString(),
        name: newMedication.name,
        dosage: newMedication.dosage,
        frequency: newMedication.frequency,
        time: newMedication.time.split(",").map((t) => t.trim()),
        taken: false,
        notes: newMedication.notes,
      }
      setMedications([...medications, medication])
      setNewMedication({ name: "", dosage: "", frequency: "", time: "", notes: "" })
      setShowAddForm(false)
    }
  }

  const toggleMedicationTaken = (id: string) => {
    setMedications(
      medications.map((med) =>
        med.id === id
          ? {
              ...med,
              taken: !med.taken,
              lastTaken: !med.taken ? new Date().toISOString().slice(0, 16).replace("T", " ") : med.lastTaken,
            }
          : med,
      ),
    )
  }

  const getFrequencyLabel = (frequency: string) => {
    const labels = {
      "once-daily": "Once Daily",
      "twice-daily": "Twice Daily",
      "three-times-daily": "Three Times Daily",
      "as-needed": "As Needed",
    }
    return labels[frequency as keyof typeof labels] || frequency
  }

  const takenToday = medications.filter((med) => med.taken).length
  const totalMedications = medications.length
  const adherenceRate = totalMedications > 0 ? Math.round((takenToday / totalMedications) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Adherence</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{adherenceRate}%</div>
            <p className="text-xs text-gray-600">
              {takenToday} of {totalMedications} medications taken
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Medications</CardTitle>
            <Pill className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalMedications}</div>
            <p className="text-xs text-gray-600">Currently prescribed</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Dose</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">20:00</div>
            <p className="text-xs text-gray-600">Metformin 500mg</p>
          </CardContent>
        </Card>
      </div>

      {/* Medications List */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>My Medications</CardTitle>
              <CardDescription>Manage your daily medications and track adherence</CardDescription>
            </div>
            <Button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Medication
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {showAddForm && (
            <div className="p-4 border rounded-lg bg-gray-50 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="med-name">Medication Name</Label>
                  <Input
                    id="med-name"
                    placeholder="Enter medication name"
                    value={newMedication.name}
                    onChange={(e) => setNewMedication({ ...newMedication, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dosage">Dosage</Label>
                  <Input
                    id="dosage"
                    placeholder="e.g., 500mg, 10 units"
                    value={newMedication.dosage}
                    onChange={(e) => setNewMedication({ ...newMedication, dosage: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="frequency">Frequency</Label>
                  <Select
                    value={newMedication.frequency}
                    onValueChange={(value) => setNewMedication({ ...newMedication, frequency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="once-daily">Once Daily</SelectItem>
                      <SelectItem value="twice-daily">Twice Daily</SelectItem>
                      <SelectItem value="three-times-daily">Three Times Daily</SelectItem>
                      <SelectItem value="as-needed">As Needed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Times (comma separated)</Label>
                  <Input
                    id="time"
                    placeholder="e.g., 08:00, 20:00"
                    value={newMedication.time}
                    onChange={(e) => setNewMedication({ ...newMedication, time: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="med-notes">Notes (Optional)</Label>
                <Input
                  id="med-notes"
                  placeholder="Special instructions"
                  value={newMedication.notes}
                  onChange={(e) => setNewMedication({ ...newMedication, notes: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleAddMedication}
                  disabled={!newMedication.name || !newMedication.dosage || !newMedication.frequency}
                >
                  Add Medication
                </Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Medications List */}
          <div className="space-y-3">
            {medications.map((medication) => (
              <div
                key={medication.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border rounded-lg bg-white space-y-3 sm:space-y-0"
              >
                <div className="flex items-start space-x-3 sm:space-x-4 min-w-0 flex-1">
                  <div className="flex items-center space-x-2 shrink-0">
                    <Switch checked={medication.taken} onCheckedChange={() => toggleMedicationTaken(medication.id)} />
                    {medication.taken ? (
                      <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm sm:text-base">{medication.name}</p>
                    <p className="text-xs sm:text-sm text-gray-500">
                      {medication.dosage} - {getFrequencyLabel(medication.frequency)}
                    </p>
                    <p className="text-xs text-gray-400">Times: {medication.time.join(", ")}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end sm:text-right space-x-2 sm:space-y-1 sm:space-x-0 sm:flex-col">
                  {medication.notes && (
                    <p className="text-xs sm:text-sm text-gray-600 max-w-xs truncate flex-1 sm:flex-none">
                      {medication.notes}
                    </p>
                  )}
                  {medication.lastTaken && (
                    <p className="text-xs text-gray-400 hidden sm:block">Last taken: {medication.lastTaken}</p>
                  )}
                  <Badge variant={medication.taken ? "default" : "secondary"} className="shrink-0">
                    {medication.taken ? "Taken" : "Pending"}
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
