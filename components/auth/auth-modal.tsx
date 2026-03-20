"use client"

import { useState } from "react"
import { User, Lock, Eye, EyeOff, Coins } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/lib/auth-context"

type Props = {
  open: boolean
  onClose: () => void
}

export function AuthModal({ open, onClose }: Props) {
  const { login, register } = useAuth()

  const [loginForm, setLoginForm] = useState({ username: "", password: "" })
  const [registerForm, setRegisterForm] = useState({
    username: "",
    password: "",
    confirm: "",
  })
  const [loginError, setLoginError] = useState("")
  const [registerError, setRegisterError] = useState("")
  const [showLoginPw, setShowLoginPw] = useState(false)
  const [showRegisterPw, setShowRegisterPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleLogin = () => {
    setLoginError("")
    if (!loginForm.username || !loginForm.password) {
      setLoginError("Vui lòng điền đầy đủ thông tin")
      return
    }
    setLoading(true)
    const result = login(loginForm.username, loginForm.password)
    setLoading(false)
    if (result.success) {
      onClose()
      setLoginForm({ username: "", password: "" })
    } else {
      setLoginError(result.error || "Đăng nhập thất bại")
    }
  }

  const handleRegister = () => {
    setRegisterError("")
    if (!registerForm.username || !registerForm.password || !registerForm.confirm) {
      setRegisterError("Vui lòng điền đầy đủ thông tin")
      return
    }
    if (registerForm.password !== registerForm.confirm) {
      setRegisterError("Mật khẩu xác nhận không khớp")
      return
    }
    setLoading(true)
    const result = register(registerForm.username, registerForm.password)
    setLoading(false)
    if (result.success) {
      onClose()
      setRegisterForm({ username: "", password: "", confirm: "" })
    } else {
      setRegisterError(result.error || "Đăng ký thất bại")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Tài khoản
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="login">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Đăng nhập</TabsTrigger>
            <TabsTrigger value="register">Đăng ký</TabsTrigger>
          </TabsList>

          {/* Login */}
          <TabsContent value="login" className="space-y-4 pt-2">
            <div className="space-y-3">
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Tên đăng nhập"
                  className="pl-9"
                  value={loginForm.username}
                  onChange={(e) =>
                    setLoginForm((p) => ({ ...p, username: e.target.value }))
                  }
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type={showLoginPw ? "text" : "password"}
                  placeholder="Mật khẩu"
                  className="pl-9 pr-10"
                  value={loginForm.password}
                  onChange={(e) =>
                    setLoginForm((p) => ({ ...p, password: e.target.value }))
                  }
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPw(!showLoginPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showLoginPw ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {loginError && (
                <p className="text-sm text-destructive">{loginError}</p>
              )}
            </div>
            <Button className="w-full" onClick={handleLogin} disabled={loading}>
              Đăng nhập
            </Button>
          </TabsContent>

          {/* Register */}
          <TabsContent value="register" className="space-y-4 pt-2">
            <div className="rounded-lg bg-primary/10 p-3 flex items-center gap-2">
              <Coins className="h-4 w-4 text-warning shrink-0" />
              <p className="text-sm text-foreground">
                Đăng ký nhận ngay{" "}
                <span className="font-bold text-warning">10.000 xu</span> chào mừng!
              </p>
            </div>
            <div className="space-y-3">
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Tên đăng nhập (3+ ký tự, a-z 0-9 _)"
                  className="pl-9"
                  value={registerForm.username}
                  onChange={(e) =>
                    setRegisterForm((p) => ({ ...p, username: e.target.value }))
                  }
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type={showRegisterPw ? "text" : "password"}
                  placeholder="Mật khẩu (6+ ký tự)"
                  className="pl-9 pr-10"
                  value={registerForm.password}
                  onChange={(e) =>
                    setRegisterForm((p) => ({ ...p, password: e.target.value }))
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowRegisterPw(!showRegisterPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showRegisterPw ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="Xác nhận mật khẩu"
                  className="pl-9"
                  value={registerForm.confirm}
                  onChange={(e) =>
                    setRegisterForm((p) => ({ ...p, confirm: e.target.value }))
                  }
                  onKeyDown={(e) => e.key === "Enter" && handleRegister()}
                />
              </div>
              {registerError && (
                <p className="text-sm text-destructive">{registerError}</p>
              )}
            </div>
            <Button
              className="w-full"
              onClick={handleRegister}
              disabled={loading}
            >
              Tạo tài khoản
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
