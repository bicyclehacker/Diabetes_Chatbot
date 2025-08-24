"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, XAxis, YAxis, ResponsiveContainer, Area, AreaChart } from "recharts"

import { api } from "@/lib/api"
import { useEffect, useState } from "react"


const glucoseData = [
  { time: "6:00", glucose: 95, target: 100 },
  { time: "8:00", glucose: 145, target: 100 },
  { time: "10:00", glucose: 120, target: 100 },
  { time: "12:00", glucose: 165, target: 100 },
  { time: "14:00", glucose: 135, target: 100 },
  { time: "16:00", glucose: 110, target: 100 },
  { time: "18:00", glucose: 155, target: 100 },
  { time: "20:00", glucose: 125, target: 100 },
  { time: "22:00", glucose: 105, target: 100 },
]

const chartConfig = {
  glucose: {
    label: "Blood Glucose",
    color: "#3b82f6",
  },
  target: {
    label: "Target Range",
    color: "#10b981",
  },
}

export function GlucoseChart() {

    const [glucose, setGlucose] = useState([]);

    useEffect(() => {
    const fetchGlucose = async () => {
        try {
            const data = await api.getGlucoseReadings();

            const formatted = data.map(item => ({
                time: new Date(item.recordedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                glucose: item.level,
                target: 100
            }));
            setGlucose(formatted);
        } catch (error) {
            console.log("error fetching glucose log ", error);
        }
    }
    fetchGlucose(); 
    }, []);

    console.log(glucose);

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="pb-2 sm:pb-4">
        <CardTitle className="text-base sm:text-lg">Blood Glucose Trends</CardTitle>
        <CardDescription className="text-sm">Your glucose levels throughout the day</CardDescription>
      </CardHeader>
      <CardContent className="p-2 sm:p-6 pt-0">
        <ChartContainer config={chartConfig} className="h-[200px] sm:h-[250px] lg:h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={glucose} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <defs>
                <linearGradient id="glucoseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="time"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10 }}
                interval="preserveStartEnd"
              />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} domain={[70, 200]} width={30} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area type="monotone" dataKey="glucose" stroke="#3b82f6" strokeWidth={2} fill="url(#glucoseGradient)" />
              <Line
                type="monotone"
                dataKey="target"
                stroke="#10b981"
                strokeWidth={1.5}
                strokeDasharray="3 3"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
