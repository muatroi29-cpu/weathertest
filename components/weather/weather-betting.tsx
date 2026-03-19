"use client"

import { useState } from "react"
import { Dices, TrendingUp, Clock, Coins, Trophy, Sparkles, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { bettingOptions, type BetOption, type UserBet } from "@/lib/weather-data"
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

const getBetTypeColor = (type: BetOption["type"]) => {
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

const getBetTypeLabel = (type: BetOption["type"]) => {
  switch (type) {
    case "temperature":
      return "Nhiệt độ"
    case "rain":
      return "Mưa"
    case "condition":
      return "Thời tiết"
    default:
      return type
  }
}

export function WeatherBetting() {
  const [balance, setBalance] = useState(10000)
  const [userBets, setUserBets] = useState<UserBet[]>([])
  const [selectedBet, setSelectedBet] = useState<BetOption | null>(null)
  const [betAmount, setBetAmount] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

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

  return (
    <Card className="border-0 shadow-lg overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-base font-medium">
            <Dices className="h-5 w-5 text-primary" />
            <span>Cược Thời Tiết</span>
            <Badge variant="secondary" className="ml-2">
              <Sparkles className="mr-1 h-3 w-3" />
              Giả lập
            </Badge>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-card px-4 py-2 shadow-sm">
            <Coins className="h-4 w-4 text-warning" />
            <span className="font-bold text-foreground">{balance.toLocaleString()}</span>
            <span className="text-xs text-muted-foreground">xu</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {/* Stats */}
        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl bg-secondary/50 p-3 text-center">
            <p className="text-xs text-muted-foreground">Đang cược</p>
            <p className="text-lg font-bold text-foreground">
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
            <p className="text-lg font-bold text-warning">+{totalPotentialWin.toLocaleString()}</p>
          </div>
        </div>

        {/* Betting Options */}
        <div className="space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Trophy className="h-4 w-4" />
            Lựa chọn cược
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
                              Đã đặt cược
                            </Badge>
                          )}
                        </div>
                        <p className="font-medium text-foreground">{option.description}</p>
                        <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>Hết hạn: {option.deadline}</span>
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
                      Đặt cược
                    </DialogTitle>
                    <DialogDescription>{option.description}</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="flex items-center justify-between rounded-lg bg-secondary/50 p-3">
                      <span className="text-sm text-muted-foreground">Tỷ lệ cược</span>
                      <span className="font-bold text-success">x{option.odds}</span>
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
                        <span>Số dư: {balance.toLocaleString()} xu</span>
                        <button 
                          onClick={() => setBetAmount(balance.toString())}
                          className="text-primary hover:underline"
                        >
                          Tất cả
                        </button>
                      </div>
                    </div>
                    {betAmount && parseInt(betAmount) > 0 && (
                      <div className="rounded-lg bg-success/10 p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Tiềm năng thắng</span>
                          <span className="font-bold text-success">
                            +{Math.floor(parseInt(betAmount) * option.odds).toLocaleString()} xu
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
                      Hủy
                    </Button>
                    <Button 
                      onClick={placeBet}
                      disabled={!betAmount || parseInt(betAmount) <= 0 || parseInt(betAmount) > balance}
                    >
                      Xác nhận đặt cược
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
              Cược đang chờ kết quả
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
                          Đặt: {bet.amount.toLocaleString()} xu
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-success">
                          +{bet.potentialWin.toLocaleString()} xu
                        </p>
                        <Badge variant="secondary" className="mt-1">
                          Đang chờ
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
