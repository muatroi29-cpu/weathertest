"use client"

import {
  XAxis,
  YAxis,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import { useWeather } from "@/lib/weather-context"
import { TrendingUp } from "lucide-react"

export function TemperatureChart() {
  const { data, isLoading } = useWeather()

  if (isLoading || !data) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            <TrendingUp className="h-4 w-4 text-primary" />
            Nhiệt độ trong ngày
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[200px] w-full" />
        </CardContent>
      </Card>
    )
  }

  const chartData = data.hourly.map((hour) => ({
    time: hour.time,
    temp: hour.temp,
  }))

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-medium">
          <TrendingUp className="h-4 w-4 text-primary" />
          Nhiệt độ trong ngày
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            temp: {
              label: "Nhiệt độ",
              color: "hsl(var(--chart-1))",
            },
          }}
          className="h-[200px] w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient
                  id="tempGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="hsl(var(--chart-1))"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(var(--chart-1))"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="time"
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: "hsl(var(--muted-foreground))",
                  fontSize: 12,
                }}
                tickMargin={8}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: "hsl(var(--muted-foreground))",
                  fontSize: 12,
                }}
                tickFormatter={(v) => `${v}°`}
                domain={["dataMin - 2", "dataMax + 2"]}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) => [`${value}°C`, "Nhiệt độ"]}
                  />
                }
              />
              <Area
                type="monotone"
                dataKey="temp"
                stroke="hsl(var(--chart-1))"
                strokeWidth={3}
                fill="url(#tempGradient)"
                dot={{
                  fill: "hsl(var(--chart-1))",
                  strokeWidth: 0,
                  r: 4,
                }}
                activeDot={{
                  r: 6,
                  fill: "hsl(var(--chart-1))",
                  stroke: "hsl(var(--background))",
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
