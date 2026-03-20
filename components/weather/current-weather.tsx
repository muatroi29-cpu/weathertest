"use client"

import {
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  CloudLightning,
  Thermometer,
  Moon,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useWeather } from "@/lib/weather-context"

const WeatherIcon = ({
  condition,
  isDay,
  className,
}: {
  condition: string
  isDay: boolean
  className?: string
}) => {
  if (!isDay && condition === "sunny") return <Moon className={className} />
  switch (condition) {
    case "sunny":
      return <Sun className={className} />
    case "partly-cloudy":
      return isDay ? (
        <CloudSun className={className} />
      ) : (
        <Cloud className={className} />
      )
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

export function CurrentWeather() {
  const { data, isLoading } = useWeather()

  if (isLoading || !data) {
    return (
      <Card className="overflow-hidden border-0 bg-gradient-to-br from-primary/90 to-primary shadow-xl">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
            <div className="text-center sm:text-left">
              <Skeleton className="h-20 w-32 bg-primary-foreground/20" />
              <Skeleton className="mt-4 h-6 w-24 bg-primary-foreground/20" />
              <Skeleton className="mt-3 h-4 w-32 bg-primary-foreground/20" />
            </div>
            <Skeleton className="h-28 w-28 rounded-full bg-primary-foreground/20 sm:h-36 sm:w-36" />
          </div>
        </CardContent>
      </Card>
    )
  }

  const { current } = data

  return (
    <Card className="overflow-hidden border-0 bg-gradient-to-br from-primary/90 to-primary shadow-xl">
      <CardContent className="p-6 sm:p-8">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
          <div className="text-center sm:text-left">
            <div className="flex items-baseline justify-center gap-1 sm:justify-start">
              <span className="text-7xl font-light text-primary-foreground sm:text-8xl">
                {current.temperature}
              </span>
              <span className="text-3xl font-light text-primary-foreground/80">
                °C
              </span>
            </div>
            <p className="mt-2 text-xl text-primary-foreground/90">
              {current.description}
            </p>
            <div className="mt-3 flex items-center justify-center gap-2 text-primary-foreground/70 sm:justify-start">
              <Thermometer className="h-4 w-4" />
              <span className="text-sm">
                Cảm giác như {current.feelsLike}°C
              </span>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 rounded-full bg-primary-foreground/10 blur-2xl" />
            <WeatherIcon
              condition={current.condition}
              isDay={current.isDay}
              className="relative h-28 w-28 text-primary-foreground drop-shadow-lg sm:h-36 sm:w-36"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
