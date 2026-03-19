"use client"

import { Wind, Droplets, Sun, Activity, Navigation } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useWeather } from "@/lib/weather-context"

function getAqiColor(aqi: number) {
  if (aqi <= 50) return "text-success"
  if (aqi <= 100) return "text-warning"
  if (aqi <= 150) return "text-accent"
  return "text-destructive"
}

function getAqiBgColor(aqi: number) {
  if (aqi <= 50) return "bg-success/10"
  if (aqi <= 100) return "bg-warning/10"
  if (aqi <= 150) return "bg-accent/10"
  return "bg-destructive/10"
}

function getUvColor(uv: number) {
  if (uv <= 2) return "text-success"
  if (uv <= 5) return "text-warning"
  if (uv <= 7) return "text-accent"
  return "text-destructive"
}

function getWindDirection(degrees: number): string {
  const directions = ["Bắc", "Đông Bắc", "Đông", "Đông Nam", "Nam", "Tây Nam", "Tây", "Tây Bắc"]
  const index = Math.round(degrees / 45) % 8
  return directions[index]
}

function getWindLevel(speed: number): string {
  if (speed < 12) return "Gió nhẹ"
  if (speed < 20) return "Gió vừa"
  if (speed < 39) return "Gió mạnh"
  return "Gió rất mạnh"
}

export function HealthMetrics() {
  const { data, isLoading } = useWeather()

  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="border-0 shadow-lg">
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
              <Skeleton className="mt-2 h-4 w-32" />
              <Skeleton className="mt-3 h-2 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const { current, aqi } = data

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {/* AQI Card */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Activity className="h-4 w-4" />
            Chất lượng KK
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-3xl font-bold ${getAqiColor(aqi.value)}`}>
            {aqi.value}
          </div>
          <div className={`mt-2 rounded-full px-2 py-1 text-xs ${getAqiBgColor(aqi.value)} ${getAqiColor(aqi.value)}`}>
            {aqi.level}
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-success via-warning to-destructive transition-all"
              style={{ width: `${Math.min(aqi.value / 3, 100)}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* UV Index Card */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Sun className="h-4 w-4" />
            Chỉ số UV
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-3xl font-bold ${getUvColor(current.uvIndex)}`}>
            {current.uvIndex}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {current.uvIndex >= 8 ? "Rất cao" : current.uvIndex >= 6 ? "Cao" : current.uvIndex >= 3 ? "Trung bình" : "Thấp"}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            {current.uvIndex >= 6 ? "Nên đeo kính râm & bôi kem chống nắng" : "An toàn khi ra ngoài"}
          </p>
        </CardContent>
      </Card>

      {/* Humidity Card */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Droplets className="h-4 w-4" />
            Độ ẩm
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-info">
            {current.humidity}%
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {current.humidity > 70 ? "Ẩm ướt" : current.humidity > 40 ? "Dễ chịu" : "Khô"}
          </p>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div 
              className="h-full rounded-full bg-info transition-all"
              style={{ width: `${current.humidity}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Wind Card */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Wind className="h-4 w-4" />
            Sức gió
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-foreground">
            {current.windSpeed}
            <span className="ml-1 text-lg font-normal text-muted-foreground">km/h</span>
          </div>
          <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            <Navigation 
              className="h-4 w-4" 
              style={{ transform: `rotate(${current.windDirection}deg)` }}
            />
            <span>Hướng {getWindDirection(current.windDirection)}</span>
          </div>
          <div className="mt-2 flex items-center gap-1">
            <div className={`h-2 w-2 animate-pulse rounded-full ${current.windSpeed < 20 ? "bg-success" : "bg-warning"}`} />
            <span className="text-xs text-muted-foreground">{getWindLevel(current.windSpeed)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
