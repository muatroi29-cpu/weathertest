"use client"

import { WeatherHeader } from "@/components/weather/weather-header"
import { CurrentWeather } from "@/components/weather/current-weather"
import { HealthMetrics } from "@/components/weather/health-metrics"
import { TemperatureChart } from "@/components/weather/temperature-chart"
import { WeeklyForecast } from "@/components/weather/weekly-forecast"
import { WeatherBetting } from "@/components/weather/weather-betting"
import { WeatherProvider } from "@/lib/weather-context"

export default function WeatherDashboard() {
  return (
    <WeatherProvider>
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          {/* Header */}
          <WeatherHeader />

          {/* Main Content Grid */}
          <div className="mt-6 space-y-6">
            {/* Current Weather */}
            <CurrentWeather />

            {/* Health Metrics */}
            <HealthMetrics />

            {/* Charts and Forecast Grid */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Temperature Chart */}
              <TemperatureChart />

              {/* Weekly Forecast */}
              <WeeklyForecast />
            </div>

            {/* Weather Betting */}
            <WeatherBetting />
          </div>

          {/* Footer */}
          <footer className="mt-8 border-t border-border pt-6 text-center text-sm text-muted-foreground">
            <p>Weather Dashboard - Dữ liệu từ Open-Meteo API</p>
            <p className="mt-1">Cập nhật tự động mỗi 5 phút</p>
          </footer>
        </div>
      </div>
    </WeatherProvider>
  )
}
