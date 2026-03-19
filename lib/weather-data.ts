// Mock weather data for Hanoi, Vietnam
export const currentWeather = {
  temperature: 32,
  feelsLike: 36,
  condition: "sunny",
  description: "Trời nắng",
  humidity: 68,
  windSpeed: 12,
  windDirection: "Đông Nam",
  uvIndex: 8,
  aqi: 125,
  aqiLevel: "Không tốt cho nhóm nhạy cảm",
  visibility: 10,
  pressure: 1012,
}

export const hourlyForecast = [
  { time: "06:00", temp: 26, condition: "cloudy" },
  { time: "08:00", temp: 28, condition: "partly-cloudy" },
  { time: "10:00", temp: 30, condition: "sunny" },
  { time: "12:00", temp: 33, condition: "sunny" },
  { time: "14:00", temp: 34, condition: "sunny" },
  { time: "16:00", temp: 32, condition: "partly-cloudy" },
  { time: "18:00", temp: 29, condition: "partly-cloudy" },
  { time: "20:00", temp: 27, condition: "cloudy" },
  { time: "22:00", temp: 26, condition: "cloudy" },
  { time: "00:00", temp: 25, condition: "cloudy" },
]

export const weeklyForecast = [
  { day: "Hôm nay", condition: "sunny", high: 34, low: 26, rainChance: 10 },
  { day: "T3", condition: "partly-cloudy", high: 33, low: 25, rainChance: 20 },
  { day: "T4", condition: "rainy", high: 29, low: 24, rainChance: 80 },
  { day: "T5", condition: "thunderstorm", high: 28, low: 23, rainChance: 90 },
  { day: "T6", condition: "rainy", high: 27, low: 23, rainChance: 70 },
  { day: "T7", condition: "partly-cloudy", high: 30, low: 24, rainChance: 30 },
  { day: "CN", condition: "sunny", high: 32, low: 25, rainChance: 15 },
]

export const temperatureChartData = [
  { time: "00:00", temp: 25 },
  { time: "03:00", temp: 24 },
  { time: "06:00", temp: 26 },
  { time: "09:00", temp: 29 },
  { time: "12:00", temp: 33 },
  { time: "15:00", temp: 34 },
  { time: "18:00", temp: 30 },
  { time: "21:00", temp: 27 },
  { time: "24:00", temp: 25 },
]

export type BetOption = {
  id: string
  type: "temperature" | "rain" | "condition"
  description: string
  odds: number
  deadline: string
}

export const bettingOptions: BetOption[] = [
  {
    id: "1",
    type: "temperature",
    description: "Nhiệt độ cao nhất ngày mai > 35°C",
    odds: 2.5,
    deadline: "23:59 hôm nay",
  },
  {
    id: "2",
    type: "rain",
    description: "Có mưa trong 24h tới",
    odds: 1.8,
    deadline: "12:00 ngày mai",
  },
  {
    id: "3",
    type: "condition",
    description: "Thứ 4 sẽ có sấm sét",
    odds: 3.2,
    deadline: "00:00 Thứ 4",
  },
  {
    id: "4",
    type: "temperature",
    description: "Nhiệt độ thấp nhất tuần < 22°C",
    odds: 4.0,
    deadline: "Chủ Nhật",
  },
]

export type UserBet = {
  id: string
  optionId: string
  amount: number
  status: "pending" | "won" | "lost"
  potentialWin: number
}

export const getConditionIcon = (condition: string) => {
  switch (condition) {
    case "sunny":
      return "sun"
    case "partly-cloudy":
      return "cloud-sun"
    case "cloudy":
      return "cloud"
    case "rainy":
      return "cloud-rain"
    case "thunderstorm":
      return "cloud-lightning"
    default:
      return "sun"
  }
}

export const getAqiColor = (aqi: number) => {
  if (aqi <= 50) return "text-success"
  if (aqi <= 100) return "text-warning"
  if (aqi <= 150) return "text-accent"
  return "text-destructive"
}

export const getAqiBgColor = (aqi: number) => {
  if (aqi <= 50) return "bg-success/10"
  if (aqi <= 100) return "bg-warning/10"
  if (aqi <= 150) return "bg-accent/10"
  return "bg-destructive/10"
}

export const getUvColor = (uv: number) => {
  if (uv <= 2) return "text-success"
  if (uv <= 5) return "text-warning"
  if (uv <= 7) return "text-accent"
  return "text-destructive"
}
