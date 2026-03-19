"use client"

import { Wind, Droplets, Sun, Activity } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { currentWeather, getAqiColor, getAqiBgColor, getUvColor } from "@/lib/weather-data"

export function HealthMetrics() {
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
          <div className={`text-3xl font-bold ${getAqiColor(currentWeather.aqi)}`}>
            {currentWeather.aqi}
          </div>
          <div className={`mt-2 rounded-full px-2 py-1 text-xs ${getAqiBgColor(currentWeather.aqi)} ${getAqiColor(currentWeather.aqi)}`}>
            {currentWeather.aqiLevel}
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-success via-warning to-destructive transition-all"
              style={{ width: `${Math.min(currentWeather.aqi / 3, 100)}%` }}
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
          <div className={`text-3xl font-bold ${getUvColor(currentWeather.uvIndex)}`}>
            {currentWeather.uvIndex}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {currentWeather.uvIndex >= 8 ? "Rất cao" : currentWeather.uvIndex >= 6 ? "Cao" : "Trung bình"}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            {currentWeather.uvIndex >= 6 ? "Nên đeo kính râm & bôi kem chống nắng" : "An toàn khi ra ngoài"}
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
            {currentWeather.humidity}%
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {currentWeather.humidity > 70 ? "Ẩm ướt" : currentWeather.humidity > 40 ? "Dễ chịu" : "Khô"}
          </p>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div 
              className="h-full rounded-full bg-info transition-all"
              style={{ width: `${currentWeather.humidity}%` }}
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
            {currentWeather.windSpeed}
            <span className="ml-1 text-lg font-normal text-muted-foreground">km/h</span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Hướng {currentWeather.windDirection}
          </p>
          <div className="mt-2 flex items-center gap-1">
            <div className="h-2 w-2 animate-pulse rounded-full bg-success" />
            <span className="text-xs text-muted-foreground">Gió nhẹ</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
