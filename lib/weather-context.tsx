"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import useSWR from "swr"
import type { WeatherData } from "@/app/api/weather/route"

export type LocationType = {
  key: string
  name: string
  lat: number
  lon: number
  country?: string
  admin1?: string
}

type WeatherContextType = {
  data: WeatherData | undefined
  isLoading: boolean
  error: Error | undefined
  location: LocationType
  setLocation: (loc: LocationType) => void
  refetch: () => void
}

const WeatherContext = createContext<WeatherContextType | undefined>(undefined)

const DEFAULT_LOCATION: LocationType = {
  key: "ha-noi",
  name: "Hà Nội",
  lat: 21.0285,
  lon: 105.8542,
  country: "Việt Nam",
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

function buildWeatherUrl(location: LocationType): string {
  if (location.key.startsWith("custom_") || !location.key.match(/^[a-z-]+$/)) {
    return `/api/weather?lat=${location.lat}&lon=${location.lon}&name=${encodeURIComponent(location.name)}`
  }
  return `/api/weather?city=${location.key}`
}

export function WeatherProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<LocationType>(DEFAULT_LOCATION)

  const { data, error, isLoading, mutate } = useSWR<WeatherData>(
    buildWeatherUrl(location),
    fetcher,
    {
      refreshInterval: 300000,
      revalidateOnFocus: false,
    }
  )

  return (
    <WeatherContext.Provider
      value={{
        data,
        isLoading,
        error,
        location,
        setLocation,
        refetch: () => mutate(),
      }}
    >
      {children}
    </WeatherContext.Provider>
  )
}

export function useWeather() {
  const ctx = useContext(WeatherContext)
  if (!ctx) throw new Error("useWeather must be used within WeatherProvider")
  return ctx
}
