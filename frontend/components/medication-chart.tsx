"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"

const medicationData = [
  { name: "Taken on Time", value: 85, color: "#10b981" },
  { name: "Taken Late", value: 10, color: "#f59e0b" },
  { name: "Missed", value: 5, color: "#ef4444" },
]

const chartConfig = {
  taken: {
    label: "Taken on Time",
    color: "#10b981",
  },
  late: {
    label: "Taken Late",
    color: "#f59e0b",
  },
  missed: {
    label: "Missed",
    color: "#ef4444",
  },
}

export function MedicationChart() {
  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="pb-2 sm:pb-4">
        <CardTitle className="text-base sm:text-lg">Medication Adherence</CardTitle>
        <CardDescription className="text-sm">Your medication compliance over the past month</CardDescription>
      </CardHeader>
      <CardContent className="p-2 sm:p-6 pt-0">
        <ChartContainer config={chartConfig} className="h-[200px] sm:h-[250px] lg:h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={medicationData}
                cx="50%"
                cy="50%"
                innerRadius={30}
                outerRadius={60}
                paddingAngle={2}
                dataKey="value"
              >
                {medicationData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mt-2 sm:mt-4">
          {medicationData.map((item, index) => (
            <div key={index} className="flex items-center space-x-1 sm:space-x-2">
              <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-xs sm:text-sm text-gray-600">
                {item.name}: {item.value}%
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
