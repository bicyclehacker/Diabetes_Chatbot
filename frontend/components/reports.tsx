"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { FileText, Download, CalendarIcon, TrendingUp, Activity, Pill, Apple, BarChart3 } from "lucide-react"
import { format } from "date-fns"

interface Report {
  id: string
  title: string
  type: "glucose" | "medication" | "meals" | "comprehensive"
  dateRange: string
  status: "ready" | "generating" | "scheduled"
  size: string
  createdAt: string
}

export function Reports() {
  const [selectedPeriod, setSelectedPeriod] = useState("last-30-days")
  const [selectedType, setSelectedType] = useState("comprehensive")
  const [date, setDate] = useState<Date>()
  const [isGenerating, setIsGenerating] = useState(false)

  const reports: Report[] = [
    {
      id: "1",
      title: "Monthly Comprehensive Report",
      type: "comprehensive",
      dateRange: "Dec 1-31, 2024",
      status: "ready",
      size: "2.4 MB",
      createdAt: "2024-01-01",
    },
    {
      id: "2",
      title: "Glucose Trends Report",
      type: "glucose",
      dateRange: "Dec 15-31, 2024",
      status: "ready",
      size: "1.2 MB",
      createdAt: "2024-01-01",
    },
    {
      id: "3",
      title: "Medication Adherence Report",
      type: "medication",
      dateRange: "Dec 1-31, 2024",
      status: "generating",
      size: "0.8 MB",
      createdAt: "2024-01-01",
    },
  ]

  const handleGenerateReport = () => {
    setIsGenerating(true)
    // Simulate report generation
    setTimeout(() => {
      setIsGenerating(false)
    }, 3000)
  }

  const getReportIcon = (type: string) => {
    const icons = {
      glucose: <Activity className="h-4 w-4 text-blue-500" />,
      medication: <Pill className="h-4 w-4 text-purple-500" />,
      meals: <Apple className="h-4 w-4 text-orange-500" />,
      comprehensive: <BarChart3 className="h-4 w-4 text-green-500" />,
    }
    return icons[type as keyof typeof icons]
  }

  const getStatusColor = (status: string) => {
    const colors = {
      ready: "bg-green-100 text-green-800",
      generating: "bg-yellow-100 text-yellow-800",
      scheduled: "bg-blue-100 text-blue-800",
    }
    return colors[status as keyof typeof colors]
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Generate New Report */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-base sm:text-lg">Generate New Report</CardTitle>
          <CardDescription className="text-sm">Create detailed health reports for your records</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Report Type</label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="h-9 sm:h-10">
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="comprehensive">Comprehensive Report</SelectItem>
                  <SelectItem value="glucose">Glucose Trends</SelectItem>
                  <SelectItem value="medication">Medication Adherence</SelectItem>
                  <SelectItem value="meals">Nutrition Summary</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Time Period</label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="h-9 sm:h-10">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last-7-days">Last 7 Days</SelectItem>
                  <SelectItem value="last-30-days">Last 30 Days</SelectItem>
                  <SelectItem value="last-90-days">Last 90 Days</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedPeriod === "custom" && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Custom Date Range</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal h-9 sm:h-10 bg-transparent"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
          )}

          <Button
            onClick={handleGenerateReport}
            disabled={isGenerating}
            className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Generating...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Generate Report
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Recent Reports */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-base sm:text-lg">Recent Reports</CardTitle>
          <CardDescription className="text-sm">Download and view your generated health reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {reports.map((report) => (
              <div
                key={report.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border rounded-lg bg-white space-y-2 sm:space-y-0"
              >
                <div className="flex items-start space-x-3 min-w-0 flex-1">
                  <div className="shrink-0 mt-0.5">{getReportIcon(report.type)}</div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-sm sm:text-base">{report.title}</h3>
                    <p className="text-xs sm:text-sm text-gray-500">{report.dateRange}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge className={getStatusColor(report.status)} variant="secondary">
                        {report.status}
                      </Badge>
                      <span className="text-xs text-gray-400">{report.size}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {report.status === "ready" && (
                    <Button size="sm" variant="outline" className="h-8 text-xs bg-transparent">
                      <Download className="h-3 w-3 mr-1" />
                      Download
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" className="h-8 text-xs">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    View
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
