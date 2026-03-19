"use client"

import { createContext, useContext, type ReactNode } from "react"
import useSWR from "swr"
import type { WeatherData } from "@/app/api/weather/route"

type WeatherContextType = {
  data: WeatherData | undefined
  isLoading: boolean
  error: Error | undefined
}

const WeatherContext = createContext<WeatherContextType | undefined>(undefined)

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function WeatherProvider({ children }: { children: ReactNode }) {
  const { data, error, isLoading } = useSWR<WeatherData>("/api/weather", fetcher, {
    refreshInterval: 300000, // Refresh every 5 minutes
    revalidateOnFocus: false,
  })

  return (
    <WeatherContext.Provider value={{ data, isLoading, error }}>
      {children}
    </WeatherContext.Provider>
  )
}

export function useWeather() {
  const context = useContext(WeatherContext)
  if (context === undefined) {
    throw new Error("useWeather must be used within a WeatherProvider")
  }
  return context
}
