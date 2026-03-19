"use client"

import { MapPin, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Switch } from "@/components/ui/switch"
import { useEffect, useState } from "react"

export function WeatherHeader() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [currentDate, setCurrentDate] = useState("")

  useEffect(() => {
    setMounted(true)
    setCurrentDate(
      new Date().toLocaleDateString("vi-VN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    )
  }, [])

  if (!mounted) {
    return (
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Hà Nội, Việt Nam</h1>
          </div>
          <p className="mt-1 text-muted-foreground capitalize h-6">{currentDate || "\u00A0"}</p>
        </div>
        <div className="flex items-center gap-3">
          <Sun className="h-4 w-4 text-muted-foreground" />
          <Switch checked={false} disabled />
          <Moon className="h-4 w-4 text-muted-foreground" />
        </div>
      </header>
    )
  }

  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Hà Nội, Việt Nam</h1>
        </div>
        <p className="mt-1 text-muted-foreground capitalize h-6">{currentDate}</p>
      </div>
      <div className="flex items-center gap-3">
        <Sun className="h-4 w-4 text-muted-foreground" />
        <Switch
          checked={theme === "dark"}
          onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
          aria-label="Toggle dark mode"
        />
        <Moon className="h-4 w-4 text-muted-foreground" />
      </div>
    </header>
  )
}
