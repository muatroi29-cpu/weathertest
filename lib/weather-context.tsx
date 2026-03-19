"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import useSWR from "swr"
import type { WeatherData } from "@/app/api/weather/route"

type WeatherContextType = {
  data: WeatherData | undefined
  isLoading: boolean
  error: Error | undefined
  city: string
  setCity: (city: string) => void
}

const WeatherContext = createContext<WeatherContextType | undefined>(undefined)

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function WeatherProvider({ children }: { children: ReactNode }) {
  const [city, setCity] = useState("ha-noi")
  
  const { data, error, isLoading } = useSWR<WeatherData>(
    `/api/weather?city=${city}`,
    fetcher,
    {
      refreshInterval: 300000, // Refresh every 5 minutes
      revalidateOnFocus: false,
    }
  )

  return (
    <WeatherContext.Provider value={{ data, isLoading, error, city, setCity }}>
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
