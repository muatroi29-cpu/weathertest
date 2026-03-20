"use client"

import { useState, useMemo } from "react"
import {
  Dices,
  TrendingUp,
  Clock,
  Coins,
  Sparkles,
  AlertCircle,
  MapPin,
  ChevronUp,
  ChevronDown,
  Droplets,
  Thermometer,
  Wind,
  Sun,
  CloudRain,
  Zap,
  RefreshCw,
  LogIn,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import useSWR from "swr"
import type { WeatherData } from "@/app/api/weather/route"
import { useAuth } from "@/lib/auth-context"
import type { UserBet } from "@/lib/auth-context"
import { AuthModal } from "@/components/auth/auth-modal"
import { VIETNAM_CITIES_LIST } from "@/lib/cities"

const formatNumber = (num: number) =>
  new Intl.NumberFormat("vi-VN").format(num)

type BetCategory = "over-under" | "yes-no" | "comparison" | "special"

type BetOption = {
  id: string
  category: BetCategory
  city: string
  cityName: string
  title: string
  description: string
  line?: number
  unit?: string
  overOdds?: number
  underOdds?: number
  yesOdds?: number
  noOdds?: number
  deadline: string
  icon: React.ReactNode
  currentValue?: number
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function WeatherBetting() {
  const { user, canClaimBonus, updateUser } = useAuth()
  const [selectedCity, setSelectedCity] = useState("ha-noi")
  const [selectedBet, setSelectedBet] = useState<BetOption | null>(null)
  const [selectedChoice, setSelectedChoice] = useState<
    "over" | "under" | "yes" | "no" | null
  >(null)
  const [betAmount, setBetAmount] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const [activeTab, setActiveTab] = useState("over-under")

  const userBets: UserBet[] = user?.bets || []
  const balance = user?.coins || 0

  const { data, isLoading, mutate } = useSWR<WeatherData>(
    `/api/weather?city=${selectedCity}`,
    fetcher,
    { refreshInterval: 300000 }
  )
  const { data: hanoiData } = useSWR<WeatherData>(
    "/api/weather?city=ha-noi",
    fetcher
  )
  const { data: hcmData } = useSWR<WeatherData>(
    "/api/weather?city=ho-chi-minh",
    fetcher
  )
  const { data: danangData } = useSWR<WeatherData>(
    "/api/weather?city=da-nang",
    fetcher
  )

  const overUnderBets = useMemo<BetOption[]>(() => {
    if (!data) return []
    const tomorrow = data.daily[1]
    const currentTemp = data.current.temperature
    const tomorrowHigh = tomorrow?.high || 30
    const tomorrowRain = tomorrow?.rainChance || 0
    return [
      {
        id: `temp-high-${selectedCity}`,
        category: "over-under",
        city: selectedCity,
        cityName: data.city.name,
        title: "Nhiệt độ cao nhất ngày mai",
        description: `Nhiệt độ cao nhất ngày mai tại ${data.city.name}`,
        line: tomorrowHigh,
        unit: "°C",
        overOdds: 1.9,
        underOdds: 1.9,
        deadline: "23:59 hôm nay",
        icon: <Thermometer className="h-4 w-4 text-accent" />,
        currentValue: currentTemp,
      },
      {
        id: `temp-low-${selectedCity}`,
        category: "over-under",
        city: selectedCity,
        cityName: data.city.name,
        title: "Nhiệt độ thấp nhất ngày mai",
        description: `Nhiệt độ thấp nhất ngày mai tại ${data.city.name}`,
        line: tomorrow?.low || 25,
        unit: "°C",
        overOdds: 1.85,
        underOdds: 1.95,
        deadline: "23:59 hôm nay",
        icon: <Thermometer className="h-4 w-4 text-info" />,
        currentValue: currentTemp,
      },
      {
        id: `rain-chance-${selectedCity}`,
        category: "over-under",
        city: selectedCity,
        cityName: data.city.name,
        title: "Khả năng mưa ngày mai",
        description: `Xác suất mưa ngày mai tại ${data.city.name}`,
        line: 50,
        unit: "%",
        overOdds: tomorrowRain > 40 ? 1.6 : 2.2,
        underOdds: tomorrowRain > 40 ? 2.3 : 1.7,
        deadline: "06:00 ngày mai",
        icon: <Droplets className="h-4 w-4 text-info" />,
        currentValue: tomorrowRain,
      },
      {
        id: `humidity-${selectedCity}`,
        category: "over-under",
        city: selectedCity,
        cityName: data.city.name,
        title: "Độ ẩm trung bình",
        description: `Độ ẩm trung bình ngày mai tại ${data.city.name}`,
        line: 75,
        unit: "%",
        overOdds: data.current.humidity > 70 ? 1.7 : 2.1,
        underOdds: data.current.humidity > 70 ? 2.2 : 1.8,
        deadline: "00:00 ngày mai",
        icon: <Droplets className="h-4 w-4 text-primary" />,
        currentValue: data.current.humidity,
      },
      {
        id: `wind-${selectedCity}`,
        category: "over-under",
        city: selectedCity,
        cityName: data.city.name,
        title: "Tốc độ gió",
        description: `Tốc độ gió cao nhất ngày mai tại ${data.city.name}`,
        line: 20,
        unit: "km/h",
        overOdds: 2.5,
        underOdds: 1.5,
        deadline: "00:00 ngày mai",
        icon: <Wind className="h-4 w-4 text-muted-foreground" />,
        currentValue: data.current.windSpeed,
      },
      {
        id: `uv-${selectedCity}`,
        category: "over-under",
        city: selectedCity,
        cityName: data.city.name,
        title: "Chỉ số UV",
        description: `Chỉ số UV cao nhất ngày mai tại ${data.city.name}`,
        line: 7,
        unit: "",
        overOdds: data.current.uvIndex > 6 ? 1.6 : 2.4,
        underOdds: data.current.uvIndex > 6 ? 2.5 : 1.6,
        deadline: "12:00 ngày mai",
        icon: <Sun className="h-4 w-4 text-warning" />,
        currentValue: data.current.uvIndex,
      },
    ]
  }, [data, selectedCity])

  const yesNoBets = useMemo<BetOption[]>(() => {
    if (!data) return []
    const tomorrow = data.daily[1]
    const dayAfter = data.daily[2]
    return [
      {
        id: `rain-tomorrow-${selectedCity}`,
        category: "yes-no",
        city: selectedCity,
        cityName: data.city.name,
        title: "Có mưa ngày mai?",
        description: `Liệu có mưa tại ${data.city.name} ngày mai không?`,
        yesOdds: tomorrow?.rainChance > 50 ? 1.5 : 2.2,
        noOdds: tomorrow?.rainChance > 50 ? 2.5 : 1.7,
        deadline: "23:59 hôm nay",
        icon: <CloudRain className="h-4 w-4 text-info" />,
      },
      {
        id: `storm-week-${selectedCity}`,
        category: "yes-no",
        city: selectedCity,
        cityName: data.city.name,
        title: "Có dông trong tuần?",
        description: `Liệu có dông tại ${data.city.name} trong 7 ngày tới?`,
        yesOdds: data.daily.some((d) => d.condition === "thunderstorm")
          ? 1.4
          : 3.0,
        noOdds: data.daily.some((d) => d.condition === "thunderstorm")
          ? 3.2
          : 1.3,
        deadline: "Chủ Nhật",
        icon: <Zap className="h-4 w-4 text-warning" />,
      },
      {
        id: `sunny-dayafter-${selectedCity}`,
        category: "yes-no",
        city: selectedCity,
        cityName: data.city.name,
        title: `${dayAfter?.dayName} trời nắng?`,
        description: `Liệu ${dayAfter?.dayName} trời có nắng tại ${data.city.name}?`,
        yesOdds: dayAfter?.condition === "sunny" ? 1.6 : 2.8,
        noOdds: dayAfter?.condition === "sunny" ? 2.4 : 1.4,
        deadline: `00:00 ${dayAfter?.day}`,
        icon: <Sun className="h-4 w-4 text-accent" />,
      },
      {
        id: `temp-above-35-${selectedCity}`,
        category: "yes-no",
        city: selectedCity,
        cityName: data.city.name,
        title: "Nhiệt độ vượt 35°C?",
        description: `Liệu nhiệt độ tại ${data.city.name} có vượt 35°C trong tuần?`,
        yesOdds: Math.max(...data.daily.map((d) => d.high)) > 33 ? 1.8 : 3.5,
        noOdds: Math.max(...data.daily.map((d) => d.high)) > 33 ? 2.0 : 1.3,
        deadline: "Chủ Nhật",
        icon: <Thermometer className="h-4 w-4 text-destructive" />,
      },
    ]
  }, [data, selectedCity])

  const comparisonBets = useMemo<BetOption[]>(() => {
    if (!hanoiData || !hcmData || !danangData) return []
    return [
      {
        id: "hanoi-vs-hcm-temp",
        category: "comparison",
        city: "comparison",
        cityName: "So sánh",
        title: "Hà Nội vs Sài Gòn",
        description: "Thành phố nào nóng hơn ngày mai?",
        yesOdds: 1.9,
        noOdds: 1.9,
        deadline: "23:59 hôm nay",
        icon: <Thermometer className="h-4 w-4 text-accent" />,
      },
      {
        id: "danang-vs-hcm-rain",
        category: "comparison",
        city: "comparison",
        cityName: "So sánh",
        title: "Đà Nẵng vs Sài Gòn",
        description: "Thành phố nào có khả năng mưa cao hơn ngày mai?",
        yesOdds:
          (danangData.daily[1]?.rainChance ?? 0) >
          (hcmData.daily[1]?.rainChance ?? 0)
            ? 1.7
            : 2.2,
        noOdds:
          (danangData.daily[1]?.rainChance ?? 0) >
          (hcmData.daily[1]?.rainChance ?? 0)
            ? 2.2
            : 1.7,
        deadline: "06:00 ngày mai",
        icon: <CloudRain className="h-4 w-4 text-info" />,
      },
      {
        id: "north-vs-south-temp",
        category: "comparison",
        city: "comparison",
        cityName: "So sánh",
        title: "Bắc vs Nam",
        description: "Miền nào có nhiệt độ chênh lệch lớn hơn trong tuần?",
        yesOdds: 2.1,
        noOdds: 1.85,
        deadline: "Chủ Nhật",
        icon: <TrendingUp className="h-4 w-4 text-primary" />,
      },
    ]
  }, [hanoiData, hcmData, danangData])

  const specialBets = useMemo<BetOption[]>(() => {
    if (!data) return []
    const weekHighest = Math.max(...data.daily.map((d) => d.high))
    const weekLowest = Math.min(...data.daily.map((d) => d.low))
    const totalRainChance = data.daily.reduce(
      (sum, d) => sum + d.rainChance,
      0
    )
    return [
      {
        id: `perfect-weather-${selectedCity}`,
        category: "special",
        city: selectedCity,
        cityName: data.city.name,
        title: "Ngày thời tiết hoàn hảo",
        description: `Có ít nhất 1 ngày 25–30°C, không mưa, nắng đẹp tại ${data.city.name}`,
        yesOdds: 2.5,
        noOdds: 1.5,
        deadline: "Chủ Nhật",
        icon: <Sparkles className="h-4 w-4 text-accent" />,
      },
      {
        id: `extreme-temp-${selectedCity}`,
        category: "special",
        city: selectedCity,
        cityName: data.city.name,
        title: "Biên độ nhiệt lớn",
        description: `Chênh lệch nhiệt độ ngày/đêm > 12°C trong tuần tại ${data.city.name}`,
        line: 12,
        unit: "°C",
        overOdds: weekHighest - weekLowest > 10 ? 1.8 : 3.0,
        underOdds: weekHighest - weekLowest > 10 ? 2.0 : 1.4,
        deadline: "Chủ Nhật",
        icon: <Thermometer className="h-4 w-4 text-destructive" />,
      },
      {
        id: `rainy-week-${selectedCity}`,
        category: "special",
        city: selectedCity,
        cityName: data.city.name,
        title: "Tuần mưa nhiều",
        description: `Tổng khả năng mưa cả tuần > 350% tại ${data.city.name}`,
        line: 350,
        unit: "%",
        overOdds: totalRainChance > 300 ? 1.7 : 2.8,
        underOdds: totalRainChance > 300 ? 2.3 : 1.5,
        deadline: "Chủ Nhật",
        icon: <CloudRain className="h-4 w-4 text-info" />,
        currentValue: totalRainChance,
      },
      {
        id: `aqi-good-${selectedCity}`,
        category: "special",
        city: selectedCity,
        cityName: data.city.name,
        title: "Chất lượng không khí tốt",
        description: `AQI dưới 50 (Tốt) ít nhất 5 ngày trong tuần tại ${data.city.name}`,
        yesOdds: data.aqi.value < 60 ? 1.6 : 3.2,
        noOdds: data.aqi.value < 60 ? 2.4 : 1.3,
        deadline: "Chủ Nhật",
        icon: <Wind className="h-4 w-4 text-success" />,
      },
    ]
  }, [data, selectedCity])

  const placeBet = () => {
    if (!selectedBet || !selectedChoice || !betAmount || !user) return
    const amount = parseInt(betAmount)
    if (amount > balance || amount <= 0) return

    let odds = 0
    if (selectedChoice === "over" && selectedBet.overOdds) odds = selectedBet.overOdds
    else if (selectedChoice === "under" && selectedBet.underOdds) odds = selectedBet.underOdds
    else if (selectedChoice === "yes" && selectedBet.yesOdds) odds = selectedBet.yesOdds
    else if (selectedChoice === "no" && selectedBet.noOdds) odds = selectedBet.noOdds
    if (odds === 0) return

    const choiceLabel =
      selectedChoice === "over"
        ? `Trên ${selectedBet.line}${selectedBet.unit}`
        : selectedChoice === "under"
        ? `Dưới ${selectedBet.line}${selectedBet.unit}`
        : selectedChoice === "yes"
        ? "Có"
        : "Không"

    const newBet: UserBet = {
      id: Date.now().toString(),
      optionId: selectedBet.id,
      choice: selectedChoice,
      amount,
      odds,
      status: "pending",
      potentialWin: Math.floor(amount * odds),
      city: selectedBet.cityName,
      description: `${selectedBet.title} - ${choiceLabel}`,
      createdAt: new Date().toISOString(),
    }

    updateUser({
      coins: user.coins - amount,
      bets: [...(user.bets || []), newBet],
    })
    setBetAmount("")
    setSelectedBet(null)
    setSelectedChoice(null)
    setIsDialogOpen(false)
  }

  const openBetDialog = (
    bet: BetOption,
    choice: "over" | "under" | "yes" | "no"
  ) => {
    if (!user) {
      setShowAuth(true)
      return
    }
    setSelectedBet(bet)
    setSelectedChoice(choice)
    setIsDialogOpen(true)
  }

  const hasBetOnOption = (
    optionId: string,
    choice: "over" | "under" | "yes" | "no"
  ) =>
    userBets.some(
      (b) =>
        b.optionId === optionId && b.choice === choice && b.status === "pending"
    )

  const totalPotentialWin = userBets
    .filter((b) => b.status === "pending")
    .reduce((s, b) => s + b.potentialWin, 0)

  if (isLoading || !data) {
    return (
      <Card className="border-0 shadow-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10">
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            <Dices className="h-5 w-5 text-primary" />
            <span>Cược Thời Tiết</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="border-0 shadow-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 pb-2">
          <CardTitle className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-base font-medium">
              <Dices className="h-5 w-5 text-primary" />
              <span>Cược Thời Tiết</span>
              <Badge variant="secondary" className="ml-2">
                <Sparkles className="mr-1 h-3 w-3" />
                Giả lập
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              {user ? (
                <div className="flex items-center gap-2 rounded-full bg-card px-4 py-2 shadow-sm">
                  <Coins className="h-4 w-4 text-warning" />
                  <span className="font-bold text-foreground">
                    {formatNumber(balance)}
                  </span>
                  <span className="text-xs text-muted-foreground">xu</span>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAuth(true)}
                  className="gap-1.5"
                >
                  <LogIn className="h-4 w-4" />
                  Đăng nhập để cược
                </Button>
              )}
            </div>
          </CardTitle>

          {/* City Selector */}
          <div className="mt-3 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger className="w-[200px] h-9">
                <SelectValue placeholder="Chọn thành phố" />
              </SelectTrigger>
              <SelectContent>
                {VIETNAM_CITIES_LIST.map((city) => (
                  <SelectItem key={city.key} value={city.key}>
                    {city.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => mutate()}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-4">
          {/* Stats */}
          <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl bg-secondary/50 p-3 text-center">
              <p className="text-xs text-muted-foreground">Đang cược</p>
              <p className="text-lg font-bold">
                {userBets.filter((b) => b.status === "pending").length}
              </p>
            </div>
            <div className="rounded-xl bg-success/10 p-3 text-center">
              <p className="text-xs text-muted-foreground">Thắng</p>
              <p className="text-lg font-bold text-success">
                {userBets.filter((b) => b.status === "won").length}
              </p>
            </div>
            <div className="rounded-xl bg-destructive/10 p-3 text-center">
              <p className="text-xs text-muted-foreground">Thua</p>
              <p className="text-lg font-bold text-destructive">
                {userBets.filter((b) => b.status === "lost").length}
              </p>
            </div>
            <div className="rounded-xl bg-warning/10 p-3 text-center">
              <p className="text-xs text-muted-foreground">Tiềm năng</p>
              <p className="text-lg font-bold text-warning">
                +{formatNumber(totalPotentialWin)}
              </p>
            </div>
          </div>

          {/* Not logged in notice */}
          {!user && (
            <div className="mb-4 rounded-xl border border-primary/20 bg-primary/5 p-4 flex items-center gap-3">
              <LogIn className="h-5 w-5 text-primary shrink-0" />
              <div>
                <p className="text-sm font-medium">
                  Đăng nhập để đặt cược và lưu kết quả
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Tài khoản mới nhận 10.000 xu chào mừng
                </p>
              </div>
              <Button
                size="sm"
                className="ml-auto shrink-0"
                onClick={() => setShowAuth(true)}
              >
                Đăng nhập
              </Button>
            </div>
          )}

          {/* Betting Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 mb-4">
              <TabsTrigger value="over-under" className="text-xs sm:text-sm">
                Trên/Dưới
              </TabsTrigger>
              <TabsTrigger value="yes-no" className="text-xs sm:text-sm">
                Có/Không
              </TabsTrigger>
              <TabsTrigger value="comparison" className="text-xs sm:text-sm">
                So sánh
              </TabsTrigger>
              <TabsTrigger value="special" className="text-xs sm:text-sm">
                Đặc biệt
              </TabsTrigger>
            </TabsList>

            <TabsContent value="over-under" className="space-y-3">
              {overUnderBets.map((bet) => (
                <OverUnderBetCard
                  key={bet.id}
                  bet={bet}
                  hasBetOver={hasBetOnOption(bet.id, "over")}
                  hasBetUnder={hasBetOnOption(bet.id, "under")}
                  onBetOver={() => openBetDialog(bet, "over")}
                  onBetUnder={() => openBetDialog(bet, "under")}
                />
              ))}
            </TabsContent>

            <TabsContent value="yes-no" className="space-y-3">
              {yesNoBets.map((bet) => (
                <YesNoBetCard
                  key={bet.id}
                  bet={bet}
                  hasBetYes={hasBetOnOption(bet.id, "yes")}
                  hasBetNo={hasBetOnOption(bet.id, "no")}
                  onBetYes={() => openBetDialog(bet, "yes")}
                  onBetNo={() => openBetDialog(bet, "no")}
                />
              ))}
            </TabsContent>

            <TabsContent value="comparison" className="space-y-3">
              {comparisonBets.length > 0 ? (
                comparisonBets.map((bet) => (
                  <ComparisonBetCard
                    key={bet.id}
                    bet={bet}
                    hasBetYes={hasBetOnOption(bet.id, "yes")}
                    hasBetNo={hasBetOnOption(bet.id, "no")}
                    onBetYes={() => openBetDialog(bet, "yes")}
                    onBetNo={() => openBetDialog(bet, "no")}
                  />
                ))
              ) : (
                <div className="py-8 text-center text-muted-foreground text-sm">
                  Đang tải dữ liệu so sánh...
                </div>
              )}
            </TabsContent>

            <TabsContent value="special" className="space-y-3">
              {specialBets.map((bet) => (
                <SpecialBetCard
                  key={bet.id}
                  bet={bet}
                  hasBetYes={
                    hasBetOnOption(bet.id, "yes") ||
                    hasBetOnOption(bet.id, "over")
                  }
                  hasBetNo={
                    hasBetOnOption(bet.id, "no") ||
                    hasBetOnOption(bet.id, "under")
                  }
                  onBetYes={() =>
                    openBetDialog(bet, bet.overOdds ? "over" : "yes")
                  }
                  onBetNo={() =>
                    openBetDialog(bet, bet.underOdds ? "under" : "no")
                  }
                />
              ))}
            </TabsContent>
          </Tabs>

          {/* Active Bets */}
          {userBets.filter((b) => b.status === "pending").length > 0 && (
            <div className="mt-6 space-y-3">
              <h3 className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Clock className="h-4 w-4" />
                Cược đang chờ kết quả (
                {userBets.filter((b) => b.status === "pending").length})
              </h3>
              <div className="max-h-[300px] overflow-y-auto space-y-2">
                {userBets
                  .filter((b) => b.status === "pending")
                  .map((bet) => (
                    <div
                      key={bet.id}
                      className="rounded-xl border border-primary/20 bg-primary/5 p-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {bet.description}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {bet.city} · Đặt:{" "}
                            {formatNumber(bet.amount)} xu (x{bet.odds})
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-bold text-success">
                            +{formatNumber(bet.potentialWin)}
                          </p>
                          <Badge variant="secondary" className="mt-1 text-xs">
                            Đang chờ
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bet Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Dices className="h-5 w-5 text-primary" />
              Đặt cược
            </DialogTitle>
            <DialogDescription>
              {selectedBet?.title} – {selectedBet?.cityName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between rounded-lg bg-secondary/50 p-3">
              <span className="text-sm text-muted-foreground">Lựa chọn</span>
              <Badge
                variant="outline"
                className={
                  selectedChoice === "over" || selectedChoice === "yes"
                    ? "bg-success/10 text-success border-success/30"
                    : "bg-destructive/10 text-destructive border-destructive/30"
                }
              >
                {selectedChoice === "over" && (
                  <>
                    <ChevronUp className="h-3 w-3 mr-1" />
                    Trên {selectedBet?.line}
                    {selectedBet?.unit}
                  </>
                )}
                {selectedChoice === "under" && (
                  <>
                    <ChevronDown className="h-3 w-3 mr-1" />
                    Dưới {selectedBet?.line}
                    {selectedBet?.unit}
                  </>
                )}
                {selectedChoice === "yes" && "Có"}
                {selectedChoice === "no" && "Không"}
              </Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-secondary/50 p-3">
              <span className="text-sm text-muted-foreground">Tỷ lệ cược</span>
              <span className="font-bold text-success">
                x
                {selectedChoice === "over"
                  ? selectedBet?.overOdds
                  : selectedChoice === "under"
                  ? selectedBet?.underOdds
                  : selectedChoice === "yes"
                  ? selectedBet?.yesOdds
                  : selectedBet?.noOdds}
              </span>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Số xu đặt cược</label>
              <Input
                type="number"
                placeholder="Nhập số xu"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                max={balance}
                min={1}
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Số dư: {formatNumber(balance)} xu</span>
                <button
                  onClick={() => setBetAmount(balance.toString())}
                  className="text-primary hover:underline"
                >
                  Tất cả
                </button>
              </div>
            </div>
            {betAmount && parseInt(betAmount) > 0 && selectedBet && (
              <div className="rounded-lg bg-success/10 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Tiềm năng thắng
                  </span>
                  <span className="font-bold text-success">
                    +
                    {formatNumber(
                      Math.floor(
                        parseInt(betAmount) *
                          (selectedChoice === "over"
                            ? selectedBet.overOdds || 0
                            : selectedChoice === "under"
                            ? selectedBet.underOdds || 0
                            : selectedChoice === "yes"
                            ? selectedBet.yesOdds || 0
                            : selectedBet.noOdds || 0)
                      )
                    )}{" "}
                    xu
                  </span>
                </div>
              </div>
            )}
            <div className="flex items-start gap-2 rounded-lg bg-warning/10 p-3 text-xs text-warning">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>Đây là trò chơi giả lập, không sử dụng tiền thật.</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Huỷ
            </Button>
            <Button
              onClick={placeBet}
              disabled={
                !betAmount ||
                parseInt(betAmount) <= 0 ||
                parseInt(betAmount) > balance
              }
            >
              Xác nhận đặt cược
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AuthModal open={showAuth} onClose={() => setShowAuth(false)} />
    </>
  )
}

function OverUnderBetCard({
  bet,
  hasBetOver,
  hasBetUnder,
  onBetOver,
  onBetUnder,
}: {
  bet: BetOption
  hasBetOver: boolean
  hasBetUnder: boolean
  onBetOver: () => void
  onBetUnder: () => void
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 transition-all hover:shadow-md">
      <div className="flex-1 mb-3">
        <div className="flex items-center gap-2 mb-1">
          {bet.icon}
          <span className="font-medium text-foreground">{bet.title}</span>
        </div>
        <p className="text-sm text-muted-foreground">{bet.description}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="bg-secondary/50">
            Mức: {bet.line}
            {bet.unit}
          </Badge>
          {bet.currentValue !== undefined && (
            <Badge variant="outline" className="bg-info/10 text-info border-info/30">
              Hiện tại: {bet.currentValue}
              {bet.unit}
            </Badge>
          )}
        </div>
        <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>Hết hạn: {bet.deadline}</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant={hasBetOver ? "secondary" : "outline"}
          className={`h-auto py-3 flex-col gap-1 ${hasBetOver ? "border-success/50 bg-success/10" : "hover:border-success/50 hover:bg-success/5"}`}
          onClick={onBetOver}
          disabled={hasBetOver}
        >
          <div className="flex items-center gap-1">
            <ChevronUp className="h-4 w-4 text-success" />
            <span className="text-sm font-medium">Trên</span>
          </div>
          <span className="text-lg font-bold text-success">x{bet.overOdds}</span>
          {hasBetOver && <span className="text-xs text-muted-foreground">Đã đặt</span>}
        </Button>
        <Button
          variant={hasBetUnder ? "secondary" : "outline"}
          className={`h-auto py-3 flex-col gap-1 ${hasBetUnder ? "border-destructive/50 bg-destructive/10" : "hover:border-destructive/50 hover:bg-destructive/5"}`}
          onClick={onBetUnder}
          disabled={hasBetUnder}
        >
          <div className="flex items-center gap-1">
            <ChevronDown className="h-4 w-4 text-destructive" />
            <span className="text-sm font-medium">Dưới</span>
          </div>
          <span className="text-lg font-bold text-destructive">x{bet.underOdds}</span>
          {hasBetUnder && <span className="text-xs text-muted-foreground">Đã đặt</span>}
        </Button>
      </div>
    </div>
  )
}

function YesNoBetCard({
  bet,
  hasBetYes,
  hasBetNo,
  onBetYes,
  onBetNo,
}: {
  bet: BetOption
  hasBetYes: boolean
  hasBetNo: boolean
  onBetYes: () => void
  onBetNo: () => void
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 transition-all hover:shadow-md">
      <div className="mb-3">
        <div className="flex items-center gap-2 mb-1">
          {bet.icon}
          <span className="font-medium text-foreground">{bet.title}</span>
        </div>
        <p className="text-sm text-muted-foreground">{bet.description}</p>
        <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>Hết hạn: {bet.deadline}</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant={hasBetYes ? "secondary" : "outline"}
          className={`h-auto py-3 flex-col gap-1 ${hasBetYes ? "border-success/50 bg-success/10" : "hover:border-success/50 hover:bg-success/5"}`}
          onClick={onBetYes}
          disabled={hasBetYes}
        >
          <span className="text-sm font-medium text-success">Có</span>
          <span className="text-lg font-bold text-success">x{bet.yesOdds}</span>
          {hasBetYes && <span className="text-xs text-muted-foreground">Đã đặt</span>}
        </Button>
        <Button
          variant={hasBetNo ? "secondary" : "outline"}
          className={`h-auto py-3 flex-col gap-1 ${hasBetNo ? "border-destructive/50 bg-destructive/10" : "hover:border-destructive/50 hover:bg-destructive/5"}`}
          onClick={onBetNo}
          disabled={hasBetNo}
        >
          <span className="text-sm font-medium text-destructive">Không</span>
          <span className="text-lg font-bold text-destructive">x{bet.noOdds}</span>
          {hasBetNo && <span className="text-xs text-muted-foreground">Đã đặt</span>}
        </Button>
      </div>
    </div>
  )
}

function ComparisonBetCard({
  bet,
  hasBetYes,
  hasBetNo,
  onBetYes,
  onBetNo,
}: {
  bet: BetOption
  hasBetYes: boolean
  hasBetNo: boolean
  onBetYes: () => void
  onBetNo: () => void
}) {
  const [city1, city2] = bet.title.split(" vs ")
  return (
    <div className="rounded-xl border border-border bg-card p-4 transition-all hover:shadow-md">
      <div className="mb-3">
        <div className="flex items-center gap-2 mb-1">
          {bet.icon}
          <span className="font-medium text-foreground">{bet.description}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>Hết hạn: {bet.deadline}</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant={hasBetYes ? "secondary" : "outline"}
          className={`h-auto py-3 flex-col gap-1 ${hasBetYes ? "border-primary/50 bg-primary/10" : "hover:border-primary/50 hover:bg-primary/5"}`}
          onClick={onBetYes}
          disabled={hasBetYes}
        >
          <span className="text-sm font-medium">{city1}</span>
          <span className="text-lg font-bold text-primary">x{bet.yesOdds}</span>
          {hasBetYes && <span className="text-xs text-muted-foreground">Đã đặt</span>}
        </Button>
        <Button
          variant={hasBetNo ? "secondary" : "outline"}
          className={`h-auto py-3 flex-col gap-1 ${hasBetNo ? "border-accent/50 bg-accent/10" : "hover:border-accent/50 hover:bg-accent/5"}`}
          onClick={onBetNo}
          disabled={hasBetNo}
        >
          <span className="text-sm font-medium">{city2}</span>
          <span className="text-lg font-bold text-accent">x{bet.noOdds}</span>
          {hasBetNo && <span className="text-xs text-muted-foreground">Đã đặt</span>}
        </Button>
      </div>
    </div>
  )
}

function SpecialBetCard({
  bet,
  hasBetYes,
  hasBetNo,
  onBetYes,
  onBetNo,
}: {
  bet: BetOption
  hasBetYes: boolean
  hasBetNo: boolean
  onBetYes: () => void
  onBetNo: () => void
}) {
  const isOverUnder = bet.overOdds !== undefined && bet.underOdds !== undefined
  return (
    <div className="rounded-xl border border-border bg-gradient-to-br from-card to-secondary/30 p-4 transition-all hover:shadow-md">
      <div className="mb-3">
        <div className="flex items-center gap-2 mb-1">
          <div className="p-1.5 rounded-lg bg-accent/20">{bet.icon}</div>
          <span className="font-medium text-foreground">{bet.title}</span>
          <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/30 ml-auto">
            Đặc biệt
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{bet.description}</p>
        {bet.currentValue !== undefined && (
          <Badge variant="outline" className="mt-2 bg-info/10 text-info border-info/30">
            Hiện tại: {bet.currentValue}{bet.unit}
          </Badge>
        )}
        <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>Hết hạn: {bet.deadline}</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant={hasBetYes ? "secondary" : "outline"}
          className={`h-auto py-3 flex-col gap-1 ${hasBetYes ? "border-success/50 bg-success/10" : "hover:border-success/50 hover:bg-success/5"}`}
          onClick={onBetYes}
          disabled={hasBetYes}
        >
          {isOverUnder ? (
            <>
              <div className="flex items-center gap-1">
                <ChevronUp className="h-4 w-4 text-success" />
                <span className="text-sm font-medium">Trên</span>
              </div>
              <span className="text-lg font-bold text-success">x{bet.overOdds}</span>
            </>
          ) : (
            <>
              <span className="text-sm font-medium text-success">Có</span>
              <span className="text-lg font-bold text-success">x{bet.yesOdds}</span>
            </>
          )}
          {hasBetYes && <span className="text-xs text-muted-foreground">Đã đặt</span>}
        </Button>
        <Button
          variant={hasBetNo ? "secondary" : "outline"}
          className={`h-auto py-3 flex-col gap-1 ${hasBetNo ? "border-destructive/50 bg-destructive/10" : "hover:border-destructive/50 hover:bg-destructive/5"}`}
          onClick={onBetNo}
          disabled={hasBetNo}
        >
          {isOverUnder ? (
            <>
              <div className="flex items-center gap-1">
                <ChevronDown className="h-4 w-4 text-destructive" />
                <span className="text-sm font-medium">Dưới</span>
              </div>
              <span className="text-lg font-bold text-destructive">x{bet.underOdds}</span>
            </>
          ) : (
            <>
              <span className="text-sm font-medium text-destructive">Không</span>
              <span className="text-lg font-bold text-destructive">x{bet.noOdds}</span>
            </>
          )}
          {hasBetNo && <span className="text-xs text-muted-foreground">Đã đặt</span>}
        </Button>
      </div>
    </div>
  )
}
