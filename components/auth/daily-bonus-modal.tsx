"use client"

import { useState } from "react"
import { Gift, Coins, Flame, CheckCircle2, Lock } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth, getDailyBonusAmount } from "@/lib/auth-context"

type Props = {
  open: boolean
  onClose: () => void
}

const formatNumber = (n: number) => new Intl.NumberFormat("vi-VN").format(n)

export function DailyBonusModal({ open, onClose }: Props) {
  const { user, claimDailyBonus, canClaimBonus } = useAuth()
  const [claimed, setClaimed] = useState<{ coins: number; streak: number } | null>(null)
  const [error, setError] = useState("")

  const handleClaim = () => {
    setError("")
    const result = claimDailyBonus()
    if (result.success && result.coins !== undefined && result.streak !== undefined) {
      setClaimed({ coins: result.coins, streak: result.streak })
    } else {
      setError(result.error || "Không thể điểm danh")
    }
  }

  const handleClose = () => {
    setClaimed(null)
    setError("")
    onClose()
  }

  if (!user) return null

  const currentStreak = user.loginStreak
  const todayDay = canClaimBonus ? currentStreak + 1 : currentStreak

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-warning" />
            Điểm danh nhận thưởng
          </DialogTitle>
          <DialogDescription>
            Đăng nhập mỗi ngày để nhận xu thưởng tăng dần
          </DialogDescription>
        </DialogHeader>

        {/* Streak info */}
        <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-warning/20 to-accent/20 p-4">
          <div className="flex items-center gap-2">
            <Flame className="h-6 w-6 text-warning" />
            <div>
              <p className="text-sm text-muted-foreground">Chuỗi hiện tại</p>
              <p className="text-2xl font-bold text-foreground">
                {currentStreak} ngày
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Số xu hiện có</p>
            <div className="flex items-center gap-1">
              <Coins className="h-4 w-4 text-warning" />
              <p className="font-bold text-foreground">
                {formatNumber(user.coins)}
              </p>
            </div>
          </div>
        </div>

        {/* 7-day grid */}
        <div className="grid grid-cols-7 gap-1.5">
          {Array.from({ length: 7 }, (_, i) => {
            const day = i + 1
            const bonus = getDailyBonusAmount(day)
            const isDone = currentStreak >= day && !canClaimBonus
            const isToday = day === todayDay && canClaimBonus
            const isFuture = day > todayDay

            return (
              <div
                key={day}
                className={`flex flex-col items-center rounded-lg p-1.5 text-center transition-all ${
                  isDone
                    ? "bg-success/15 border border-success/30"
                    : isToday
                    ? "bg-warning/20 border border-warning/50 ring-1 ring-warning/30"
                    : isFuture
                    ? "bg-secondary/50 border border-transparent opacity-60"
                    : "bg-secondary/50 border border-transparent"
                }`}
              >
                <span className="text-[10px] font-medium text-muted-foreground mb-1">
                  Ngày {day}
                </span>
                {isDone ? (
                  <CheckCircle2 className="h-4 w-4 text-success" />
                ) : isFuture ? (
                  <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                ) : (
                  <Coins className="h-4 w-4 text-warning" />
                )}
                <span
                  className={`mt-1 text-[10px] font-bold ${
                    isDone
                      ? "text-success"
                      : isToday
                      ? "text-warning"
                      : "text-muted-foreground"
                  }`}
                >
                  +{bonus}
                </span>
              </div>
            )
          })}
        </div>

        {/* Claimed success */}
        {claimed && (
          <div className="rounded-xl bg-success/15 border border-success/30 p-4 text-center">
            <CheckCircle2 className="h-8 w-8 text-success mx-auto mb-2" />
            <p className="font-semibold text-foreground">
              Điểm danh thành công!
            </p>
            <div className="mt-1 flex items-center justify-center gap-1">
              <Coins className="h-4 w-4 text-warning" />
              <span className="text-lg font-bold text-warning">
                +{formatNumber(claimed.coins)} xu
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Chuỗi ngày {claimed.streak}/7
            </p>
            {claimed.streak === 7 && (
              <Badge className="mt-2 bg-warning text-warning-foreground">
                🎉 Hoàn thành chuỗi 7 ngày!
              </Badge>
            )}
          </div>
        )}

        {/* Error */}
        {error && <p className="text-sm text-destructive text-center">{error}</p>}

        {/* Action button */}
        {!claimed && (
          <Button
            className="w-full"
            onClick={handleClaim}
            disabled={!canClaimBonus}
            variant={canClaimBonus ? "default" : "secondary"}
          >
            {canClaimBonus ? (
              <>
                <Gift className="mr-2 h-4 w-4" />
                Nhận thưởng hôm nay (+{formatNumber(getDailyBonusAmount(Math.min(currentStreak + 1, 7)))} xu)
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Đã điểm danh hôm nay
              </>
            )}
          </Button>
        )}

        <p className="text-xs text-muted-foreground text-center">
          Chuỗi ngày sẽ reset nếu bỏ lỡ một ngày • Tối đa 7 ngày
        </p>
      </DialogContent>
    </Dialog>
  )
}
