"use client"

import { useState, useEffect } from "react"
import { MapPin, Moon, Sun, User, Coins, Flame, Gift, LogOut, ChevronDown } from "lucide-react"
import { useTheme } from "next-themes"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LocationSearch } from "@/components/weather/location-search"
import { AuthModal } from "@/components/auth/auth-modal"
import { DailyBonusModal } from "@/components/auth/daily-bonus-modal"
import { useAuth } from "@/lib/auth-context"
import { useWeather } from "@/lib/weather-context"

const formatNumber = (n: number) => new Intl.NumberFormat("vi-VN").format(n)

export function WeatherHeader() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [currentDate, setCurrentDate] = useState("")
  const [showAuth, setShowAuth] = useState(false)
  const [showBonus, setShowBonus] = useState(false)
  const { user, logout, canClaimBonus } = useAuth()
  const { location } = useWeather()

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
      <header className="flex flex-col gap-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">Hà Nội, Việt Nam</h1>
            </div>
            <p className="mt-1 text-muted-foreground capitalize h-5" />
          </div>
        </div>
      </header>
    )
  }

  const locationDisplay = location.admin1
    ? `${location.name}, ${location.admin1}`
    : location.country
    ? `${location.name}, ${location.country}`
    : location.name

  return (
    <>
      <header className="flex flex-col gap-3">
        {/* Top row: location + auth */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Location display */}
          <div>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary shrink-0" />
              <h1 className="text-xl font-bold text-foreground sm:text-2xl leading-tight">
                {locationDisplay}
              </h1>
            </div>
            <p className="mt-1 text-sm text-muted-foreground capitalize">
              {currentDate}
            </p>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Location search */}
            <LocationSearch />

            {/* Dark mode */}
            <div className="flex items-center gap-2">
              <Sun className="h-4 w-4 text-muted-foreground" />
              <Switch
                checked={theme === "dark"}
                onCheckedChange={(v) => setTheme(v ? "dark" : "light")}
                aria-label="Chế độ tối"
              />
              <Moon className="h-4 w-4 text-muted-foreground" />
            </div>

            {/* Auth */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 gap-1.5">
                    <div className="flex items-center gap-1.5">
                      <Coins className="h-3.5 w-3.5 text-warning" />
                      <span className="text-xs font-bold">
                        {formatNumber(user.coins)}
                      </span>
                    </div>
                    {user.loginStreak > 0 && (
                      <div className="flex items-center gap-0.5">
                        <Flame className="h-3.5 w-3.5 text-orange-500" />
                        <span className="text-xs text-orange-500">
                          {user.loginStreak}
                        </span>
                      </div>
                    )}
                    <ChevronDown className="h-3 w-3 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuLabel className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {user.username}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setShowBonus(true)}
                    className="cursor-pointer"
                  >
                    <Gift className="mr-2 h-4 w-4 text-warning" />
                    <span>Điểm danh hàng ngày</span>
                    {canClaimBonus && (
                      <Badge className="ml-auto bg-warning/20 text-warning border-warning/30 text-xs px-1">
                        Mới
                      </Badge>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={logout}
                    className="cursor-pointer text-destructive focus:text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAuth(true)}
                className="h-8 gap-1.5"
              >
                <User className="h-3.5 w-3.5" />
                <span className="text-xs">Đăng nhập</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      <AuthModal open={showAuth} onClose={() => setShowAuth(false)} />
      <DailyBonusModal open={showBonus} onClose={() => setShowBonus(false)} />
    </>
  )
}
