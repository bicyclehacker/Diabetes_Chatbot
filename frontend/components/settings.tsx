"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { User, Bell, Shield, Globe, Moon, Sun, Save, Trash2 } from "lucide-react"

export function Settings() {
  const [profile, setProfile] = useState({
    name: "Sarah Johnson",
    email: "sarah.johnson@email.com",
    phone: "+1 (555) 123-4567",
    dateOfBirth: "1985-06-15",
    diabetesType: "type-2",
    diagnosisDate: "2020-03-15",
    emergencyContact: "John Johnson - +1 (555) 987-6543",
  })

  const [preferences, setPreferences] = useState({
    glucoseUnit: "mg-dl",
    timeFormat: "12-hour",
    language: "en",
    timezone: "America/New_York",
    theme: "light",
  })

  const [notifications, setNotifications] = useState({
    medicationReminders: true,
    glucoseAlerts: true,
    appointmentReminders: true,
    weeklyReports: false,
    emergencyAlerts: true,
    pushNotifications: true,
    emailNotifications: false,
    smsNotifications: true,
  })

  const [privacy, setPrivacy] = useState({
    shareDataWithDoctor: true,
    anonymousAnalytics: false,
    marketingEmails: false,
    dataExport: true,
  })

  const handleSaveProfile = () => {
    // Save profile logic
    console.log("Profile saved:", profile)
  }

  const handleSavePreferences = () => {
    // Save preferences logic
    console.log("Preferences saved:", preferences)
  }

  const handleDeleteAccount = () => {
    // Delete account logic
    if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      console.log("Account deletion requested")
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Profile Settings */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <User className="h-4 w-4 sm:h-5 sm:w-5" />
            Profile Information
          </CardTitle>
          <CardDescription className="text-sm">Manage your personal information and medical details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm">
                Full Name
              </Label>
              <Input
                id="name"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="h-9 sm:h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="h-9 sm:h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm">
                Phone Number
              </Label>
              <Input
                id="phone"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="h-9 sm:h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dob" className="text-sm">
                Date of Birth
              </Label>
              <Input
                id="dob"
                type="date"
                value={profile.dateOfBirth}
                onChange={(e) => setProfile({ ...profile, dateOfBirth: e.target.value })}
                className="h-9 sm:h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="diabetes-type" className="text-sm">
                Diabetes Type
              </Label>
              <Select
                value={profile.diabetesType}
                onValueChange={(value) => setProfile({ ...profile, diabetesType: value })}
              >
                <SelectTrigger className="h-9 sm:h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="type-1">Type 1</SelectItem>
                  <SelectItem value="type-2">Type 2</SelectItem>
                  <SelectItem value="gestational">Gestational</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="diagnosis-date" className="text-sm">
                Diagnosis Date
              </Label>
              <Input
                id="diagnosis-date"
                type="date"
                value={profile.diagnosisDate}
                onChange={(e) => setProfile({ ...profile, diagnosisDate: e.target.value })}
                className="h-9 sm:h-10"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="emergency-contact" className="text-sm">
              Emergency Contact
            </Label>
            <Input
              id="emergency-contact"
              placeholder="Name - Phone Number"
              value={profile.emergencyContact}
              onChange={(e) => setProfile({ ...profile, emergencyContact: e.target.value })}
              className="h-9 sm:h-10"
            />
          </div>
          <Button onClick={handleSaveProfile} className="w-full sm:w-auto" size="sm">
            <Save className="h-4 w-4 mr-2" />
            Save Profile
          </Button>
        </CardContent>
      </Card>

      {/* App Preferences */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Globe className="h-4 w-4 sm:h-5 sm:w-5" />
            App Preferences
          </CardTitle>
          <CardDescription className="text-sm">Customize your app experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label htmlFor="glucose-unit" className="text-sm">
                Glucose Unit
              </Label>
              <Select
                value={preferences.glucoseUnit}
                onValueChange={(value) => setPreferences({ ...preferences, glucoseUnit: value })}
              >
                <SelectTrigger className="h-9 sm:h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mg-dl">mg/dL</SelectItem>
                  <SelectItem value="mmol-l">mmol/L</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="time-format" className="text-sm">
                Time Format
              </Label>
              <Select
                value={preferences.timeFormat}
                onValueChange={(value) => setPreferences({ ...preferences, timeFormat: value })}
              >
                <SelectTrigger className="h-9 sm:h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12-hour">12 Hour</SelectItem>
                  <SelectItem value="24-hour">24 Hour</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="language" className="text-sm">
                Language
              </Label>
              <Select
                value={preferences.language}
                onValueChange={(value) => setPreferences({ ...preferences, language: value })}
              >
                <SelectTrigger className="h-9 sm:h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="theme" className="text-sm">
                Theme
              </Label>
              <Select
                value={preferences.theme}
                onValueChange={(value) => setPreferences({ ...preferences, theme: value })}
              >
                <SelectTrigger className="h-9 sm:h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    <div className="flex items-center">
                      <Sun className="h-4 w-4 mr-2" />
                      Light
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center">
                      <Moon className="h-4 w-4 mr-2" />
                      Dark
                    </div>
                  </SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handleSavePreferences} className="w-full sm:w-auto" size="sm">
            <Save className="h-4 w-4 mr-2" />
            Save Preferences
          </Button>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
            Notifications
          </CardTitle>
          <CardDescription className="text-sm">Manage your notification preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Medication Reminders</Label>
                <p className="text-xs text-gray-500">Get notified when it's time to take your medication</p>
              </div>
              <Switch
                checked={notifications.medicationReminders}
                onCheckedChange={(checked) => setNotifications({ ...notifications, medicationReminders: checked })}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Glucose Alerts</Label>
                <p className="text-xs text-gray-500">Alerts for high or low glucose readings</p>
              </div>
              <Switch
                checked={notifications.glucoseAlerts}
                onCheckedChange={(checked) => setNotifications({ ...notifications, glucoseAlerts: checked })}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Appointment Reminders</Label>
                <p className="text-xs text-gray-500">Reminders for upcoming medical appointments</p>
              </div>
              <Switch
                checked={notifications.appointmentReminders}
                onCheckedChange={(checked) => setNotifications({ ...notifications, appointmentReminders: checked })}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Push Notifications</Label>
                <p className="text-xs text-gray-500">Receive notifications on your device</p>
              </div>
              <Switch
                checked={notifications.pushNotifications}
                onCheckedChange={(checked) => setNotifications({ ...notifications, pushNotifications: checked })}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Email Notifications</Label>
                <p className="text-xs text-gray-500">Receive notifications via email</p>
              </div>
              <Switch
                checked={notifications.emailNotifications}
                onCheckedChange={(checked) => setNotifications({ ...notifications, emailNotifications: checked })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy & Security */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Shield className="h-4 w-4 sm:h-5 sm:w-5" />
            Privacy & Security
          </CardTitle>
          <CardDescription className="text-sm">Control your data and privacy settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Share Data with Doctor</Label>
                <p className="text-xs text-gray-500">Allow your healthcare provider to access your data</p>
              </div>
              <Switch
                checked={privacy.shareDataWithDoctor}
                onCheckedChange={(checked) => setPrivacy({ ...privacy, shareDataWithDoctor: checked })}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Anonymous Analytics</Label>
                <p className="text-xs text-gray-500">Help improve the app with anonymous usage data</p>
              </div>
              <Switch
                checked={privacy.anonymousAnalytics}
                onCheckedChange={(checked) => setPrivacy({ ...privacy, anonymousAnalytics: checked })}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Data Export</Label>
                <p className="text-xs text-gray-500">Allow exporting your health data</p>
              </div>
              <Switch
                checked={privacy.dataExport}
                onCheckedChange={(checked) => setPrivacy({ ...privacy, dataExport: checked })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-0 shadow-lg border-red-200">
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg text-red-600">
            <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription className="text-sm">Irreversible and destructive actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-3 sm:p-4 border border-red-200 rounded-lg bg-red-50">
              <h3 className="font-medium text-red-800 text-sm sm:text-base">Delete Account</h3>
              <p className="text-xs sm:text-sm text-red-600 mt-1">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <Button variant="destructive" onClick={handleDeleteAccount} className="mt-3" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Account
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
