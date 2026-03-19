"use client"

import { Sun, CloudSun, Cloud, CloudRain, CloudLightning, Droplets, Calendar } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useWeather } from "@/lib/weather-context"

const WeatherIcon = ({ condition, className }: { condition: string; className?: string }) => {
  switch (condition) {
    case "sunny":
      return <Sun className={className} />
    case "partly-cloudy":
      return <CloudSun className={className} />
    case "cloudy":
      return <Cloud className={className} />
    case "rainy":
      return <CloudRain className={className} />
    case "thunderstorm":
      return <CloudLightning className={className} />
    default:
      return <Sun className={className} />
  }
}

const getConditionColor = (condition: string) => {
  switch (condition) {
    case "sunny":
      return "text-warning"
    case "partly-cloudy":
      return "text-accent"
    case "cloudy":
      return "text-muted-foreground"
    case "rainy":
      return "text-info"
    case "thunderstorm":
      return "text-destructive"
    default:
      return "text-warning"
  }
}

export function WeeklyForecast() {
  const { data, isLoading } = useWeather()

  if (isLoading || !data) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            <Calendar className="h-4 w-4 text-primary" />
            Dự báo 7 ngày tới
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="flex items-center justify-between px-6 py-4">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Calculate min/max for the week for proper scaling
  const weekMin = Math.min(...data.daily.map(d => d.low))
  const weekMax = Math.max(...data.daily.map(d => d.high))
  const tempRange = weekMax - weekMin

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-medium">
          <Calendar className="h-4 w-4 text-primary" />
          Dự báo 7 ngày tới
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {data.daily.map((day, index) => (
            <div
              key={day.day}
              className={`flex items-center justify-between px-6 py-4 transition-colors hover:bg-secondary/50 ${
                index === 0 ? "bg-primary/5" : ""
              }`}
            >
              <div className="flex w-20 items-center">
                <span className={`font-medium ${index === 0 ? "text-primary" : "text-foreground"}`}>
                  {day.day}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <WeatherIcon 
                  condition={day.condition} 
                  className={`h-6 w-6 ${getConditionColor(day.condition)}`} 
                />
                <div className="flex w-12 items-center gap-1 text-xs text-info">
                  <Droplets className="h-3 w-3" />
                  <span>{day.rainChance}%</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="w-8 text-right font-semibold text-foreground">{day.high}°</span>
                <div className="relative h-1.5 w-16 overflow-hidden rounded-full bg-secondary sm:w-24">
                  <div
                    className="absolute h-full rounded-full bg-gradient-to-r from-info via-success to-accent"
                    style={{
                      left: `${((day.low - weekMin) / tempRange) * 100}%`,
                      width: `${((day.high - day.low) / tempRange) * 100}%`,
                    }}
                  />
                </div>
                <span className="w-8 text-muted-foreground">{day.low}°</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
