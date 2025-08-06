"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts"

const weeklyData = [
  { day: "Mon", avgGlucose: 142, exercise: 45 },
  { day: "Tue", avgGlucose: 138, exercise: 30 },
  { day: "Wed", avgGlucose: 145, exercise: 60 },
  { day: "Thu", avgGlucose: 140, exercise: 0 },
  { day: "Fri", avgGlucose: 148, exercise: 45 },
  { day: "Sat", avgGlucose: 135, exercise: 90 },
  { day: "Sun", avgGlucose: 141, exercise: 30 },
]

const chartConfig = {
  avgGlucose: {
    label: "Avg Glucose (mg/dL)",
    color: "#8b5cf6",
  },
  exercise: {
    label: "Exercise (min)",
    color: "#10b981",
  },
}

export function WeeklyOverview() {
  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="pb-2 sm:pb-4">
        <CardTitle className="text-base sm:text-lg">Weekly Overview</CardTitle>
        <CardDescription className="text-sm">
          Your average glucose levels and exercise minutes this week
        </CardDescription>
      </CardHeader>
      <CardContent className="p-2 sm:p-6 pt-0">
        <ChartContainer config={chartConfig} className="h-[200px] sm:h-[250px] lg:h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} width={30} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="avgGlucose" fill="#8b5cf6" radius={[2, 2, 0, 0]} />
              <Bar dataKey="exercise" fill="#10b981" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
