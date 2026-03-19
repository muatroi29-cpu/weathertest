"use client"

import { useState, useMemo } from "react"
import { Dices, TrendingUp, Clock, Coins, Trophy, Sparkles, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useWeather } from "@/lib/weather-context"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

// Format number consistently to avoid hydration mismatch
const formatNumber = (num: number): string => {
  return new Intl.NumberFormat("vi-VN").format(num)
}

type BetType = "temperature" | "rain" | "condition"

type BetOption = {
  id: string
  type: BetType
  description: string
  odds: number
  deadline: string
}

type UserBet = {
  id: string
  optionId: string
  amount: number
  status: "pending" | "won" | "lost"
  potentialWin: number
}

const getBetTypeColor = (type: BetType) => {
  switch (type) {
    case "temperature":
      return "bg-accent/10 text-accent border-accent/20"
    case "rain":
      return "bg-info/10 text-info border-info/20"
    case "condition":
      return "bg-destructive/10 text-destructive border-destructive/20"
    default:
      return "bg-primary/10 text-primary border-primary/20"
  }
}

const getBetTypeLabel = (type: BetType) => {
  switch (type) {
    case "temperature":
      return "Nhiet do"
    case "rain":
      return "Mua"
    case "condition":
      return "Thoi tiet"
    default:
      return type
  }
}

export function WeatherBetting() {
  const { data, isLoading } = useWeather()
  const [balance, setBalance] = useState(10000)
  const [userBets, setUserBets] = useState<UserBet[]>([])
  const [selectedBet, setSelectedBet] = useState<BetOption | null>(null)
  const [betAmount, setBetAmount] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Generate betting options based on real weather data
  const bettingOptions = useMemo<BetOption[]>(() => {
    if (!data) return []

    const tomorrow = data.daily[1]
    const dayAfter = data.daily[2]
    const maxTempWeek = Math.max(...data.daily.map(d => d.high))
    const minTempWeek = Math.min(...data.daily.map(d => d.low))

    return [
      {
        id: "1",
        type: "temperature" as BetType,
        description: `Nhiet do cao nhat ngay mai > ${tomorrow.high + 2}°C`,
        odds: 2.5,
        deadline: "23:59 hom nay",
      },
      {
        id: "2",
        type: "rain" as BetType,
        description: `Co mua trong 24h toi (hien tai: ${data.daily[0].rainChance}% kha nang)`,
        odds: data.daily[0].rainChance > 50 ? 1.4 : 2.2,
        deadline: "12:00 ngay mai",
      },
      {
        id: "3",
        type: "condition" as BetType,
        description: `${dayAfter.day} se co dong (${dayAfter.condition === "thunderstorm" ? "co kha nang cao" : "it kha nang"})`,
        odds: dayAfter.condition === "thunderstorm" ? 1.5 : 3.5,
        deadline: `00:00 ${dayAfter.day}`,
      },
      {
        id: "4",
        type: "temperature" as BetType,
        description: `Nhiet do thap nhat tuan < ${minTempWeek - 2}°C`,
        odds: 4.0,
        deadline: "Chu Nhat",
      },
      {
        id: "5",
        type: "rain" as BetType,
        description: `Tong kha nang mua tuan nay > 300%`,
        odds: data.daily.reduce((sum, d) => sum + d.rainChance, 0) > 250 ? 1.8 : 2.8,
        deadline: "Chu Nhat",
      },
    ]
  }, [data])

  const placeBet = () => {
    if (!selectedBet || !betAmount) return
    
    const amount = parseInt(betAmount)
    if (amount > balance || amount <= 0) return

    const newBet: UserBet = {
      id: Date.now().toString(),
      optionId: selectedBet.id,
      amount,
      status: "pending",
      potentialWin: Math.floor(amount * selectedBet.odds),
    }

    setUserBets([...userBets, newBet])
    setBalance(balance - amount)
    setBetAmount("")
    setSelectedBet(null)
    setIsDialogOpen(false)
  }

  const totalPotentialWin = userBets
    .filter((bet) => bet.status === "pending")
    .reduce((sum, bet) => sum + bet.potentialWin, 0)

  if (isLoading || !data) {
    return (
      <Card className="border-0 shadow-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10">
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            <Dices className="h-5 w-5 text-primary" />
            <span>Cuoc Thoi Tiet</span>
            <Badge variant="secondary" className="ml-2">
              <Sparkles className="mr-1 h-3 w-3" />
              Gia lap
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-lg overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-base font-medium">
            <Dices className="h-5 w-5 text-primary" />
            <span>Cuoc Thoi Tiet</span>
            <Badge variant="secondary" className="ml-2">
              <Sparkles className="mr-1 h-3 w-3" />
              Gia lap
            </Badge>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-card px-4 py-2 shadow-sm">
            <Coins className="h-4 w-4 text-warning" />
            <span className="font-bold text-foreground">{formatNumber(balance)}</span>
            <span className="text-xs text-muted-foreground">xu</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {/* Stats */}
        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl bg-secondary/50 p-3 text-center">
            <p className="text-xs text-muted-foreground">Dang cuoc</p>
            <p className="text-lg font-bold text-foreground">
              {userBets.filter((b) => b.status === "pending").length}
            </p>
          </div>
          <div className="rounded-xl bg-success/10 p-3 text-center">
            <p className="text-xs text-muted-foreground">Thang</p>
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
            <p className="text-xs text-muted-foreground">Tiem nang</p>
            <p className="text-lg font-bold text-warning">+{formatNumber(totalPotentialWin)}</p>
          </div>
        </div>

        {/* Betting Options */}
        <div className="space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Trophy className="h-4 w-4" />
            Lua chon cuoc
          </h3>
          
          {bettingOptions.map((option) => {
            const hasBet = userBets.some(
              (bet) => bet.optionId === option.id && bet.status === "pending"
            )
            
            return (
              <Dialog 
                key={option.id} 
                open={isDialogOpen && selectedBet?.id === option.id}
                onOpenChange={(open) => {
                  setIsDialogOpen(open)
                  if (!open) setSelectedBet(null)
                }}
              >
                <DialogTrigger asChild>
                  <button
                    onClick={() => setSelectedBet(option)}
                    disabled={hasBet}
                    className={`group w-full rounded-xl border p-4 text-left transition-all ${
                      hasBet
                        ? "cursor-not-allowed border-primary/30 bg-primary/5 opacity-70"
                        : "border-border bg-card hover:border-primary/50 hover:shadow-md"
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <Badge variant="outline" className={getBetTypeColor(option.type)}>
                            {getBetTypeLabel(option.type)}
                          </Badge>
                          {hasBet && (
                            <Badge variant="secondary" className="bg-primary/10 text-primary">
                              Da dat cuoc
                            </Badge>
                          )}
                        </div>
                        <p className="font-medium text-foreground">{option.description}</p>
                        <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>Het han: {option.deadline}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-1 rounded-lg bg-success/10 px-3 py-1.5">
                          <TrendingUp className="h-4 w-4 text-success" />
                          <span className="text-lg font-bold text-success">x{option.odds}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Dices className="h-5 w-5 text-primary" />
                      Dat cuoc
                    </DialogTitle>
                    <DialogDescription>{option.description}</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="flex items-center justify-between rounded-lg bg-secondary/50 p-3">
                      <span className="text-sm text-muted-foreground">Ty le cuoc</span>
                      <span className="font-bold text-success">x{option.odds}</span>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">So xu dat cuoc</label>
                      <Input
                        type="number"
                        placeholder="Nhap so xu"
                        value={betAmount}
                        onChange={(e) => setBetAmount(e.target.value)}
                        max={balance}
                        min={1}
                      />
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>So du: {formatNumber(balance)} xu</span>
                        <button 
                          onClick={() => setBetAmount(balance.toString())}
                          className="text-primary hover:underline"
                        >
                          Tat ca
                        </button>
                      </div>
                    </div>
                    {betAmount && parseInt(betAmount) > 0 && (
                      <div className="rounded-lg bg-success/10 p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Tiem nang thang</span>
                          <span className="font-bold text-success">
                            +{formatNumber(Math.floor(parseInt(betAmount) * option.odds))} xu
                          </span>
                        </div>
                      </div>
                    )}
                    <div className="flex items-start gap-2 rounded-lg bg-warning/10 p-3 text-xs text-warning">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>Day la tro choi gia lap, khong su dung tien that.</span>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Huy
                    </Button>
                    <Button 
                      onClick={placeBet}
                      disabled={!betAmount || parseInt(betAmount) <= 0 || parseInt(betAmount) > balance}
                    >
                      Xac nhan dat cuoc
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )
          })}
        </div>

        {/* Active Bets */}
        {userBets.filter((b) => b.status === "pending").length > 0 && (
          <div className="mt-6 space-y-3">
            <h3 className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Clock className="h-4 w-4" />
              Cuoc dang cho ket qua
            </h3>
            {userBets
              .filter((bet) => bet.status === "pending")
              .map((bet) => {
                const option = bettingOptions.find((o) => o.id === bet.optionId)
                if (!option) return null
                return (
                  <div
                    key={bet.id}
                    className="rounded-xl border border-primary/20 bg-primary/5 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">{option.description}</p>
                        <p className="text-xs text-muted-foreground">
                          Dat: {formatNumber(bet.amount)} xu
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-success">
                          +{formatNumber(bet.potentialWin)} xu
                        </p>
                        <Badge variant="secondary" className="mt-1">
                          Dang cho
                        </Badge>
                      </div>
                    </div>
                  </div>
                )
              })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
