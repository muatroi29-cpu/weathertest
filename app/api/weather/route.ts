import { NextResponse } from "next/server"

// Hanoi coordinates
const HANOI_LAT = 21.0285
const HANOI_LON = 105.8542

export type WeatherData = {
  current: {
    temperature: number
    feelsLike: number
    condition: string
    description: string
    humidity: number
    windSpeed: number
    windDirection: number
    uvIndex: number
    isDay: boolean
    weatherCode: number
  }
  hourly: Array<{
    time: string
    temp: number
    condition: string
  }>
  daily: Array<{
    day: string
    dayName: string
    condition: string
    high: number
    low: number
    rainChance: number
    weatherCode: number
  }>
  aqi: {
    value: number
    level: string
  }
}

// WMO Weather interpretation codes to condition mapping
function getConditionFromCode(code: number): string {
  if (code === 0) return "sunny"
  if (code >= 1 && code <= 3) return "partly-cloudy"
  if (code >= 45 && code <= 48) return "cloudy"
  if (code >= 51 && code <= 67) return "rainy"
  if (code >= 71 && code <= 77) return "cloudy"
  if (code >= 80 && code <= 82) return "rainy"
  if (code >= 85 && code <= 86) return "cloudy"
  if (code >= 95 && code <= 99) return "thunderstorm"
  return "sunny"
}

function getDescriptionFromCode(code: number): string {
  const descriptions: Record<number, string> = {
    0: "Trời quang",
    1: "Chủ yếu quang",
    2: "Có mây rải rác",
    3: "Nhiều mây",
    45: "Sương mù",
    48: "Sương mù đóng băng",
    51: "Mưa phùn nhẹ",
    53: "Mưa phùn vừa",
    55: "Mưa phùn dày đặc",
    56: "Mưa phùn đóng băng nhẹ",
    57: "Mưa phùn đóng băng dày",
    61: "Mưa nhẹ",
    63: "Mưa vừa",
    65: "Mưa to",
    66: "Mưa đóng băng nhẹ",
    67: "Mưa đóng băng to",
    71: "Tuyết rơi nhẹ",
    73: "Tuyết rơi vừa",
    75: "Tuyết rơi dày",
    77: "Hạt tuyết",
    80: "Mưa rào nhẹ",
    81: "Mưa rào vừa",
    82: "Mưa rào to",
    85: "Tuyết rào nhẹ",
    86: "Tuyết rào to",
    95: "Dông",
    96: "Dông kèm mưa đá nhẹ",
    99: "Dông kèm mưa đá to",
  }
  return descriptions[code] || "Không xác định"
}

function getWindDirection(degrees: number): string {
  const directions = ["Bắc", "Đông Bắc", "Đông", "Đông Nam", "Nam", "Tây Nam", "Tây", "Tây Bắc"]
  const index = Math.round(degrees / 45) % 8
  return directions[index]
}

function getDayName(dateStr: string, index: number): { day: string; dayName: string } {
  const date = new Date(dateStr)
  const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"]
  const fullDayNames = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"]
  
  if (index === 0) return { day: "Hôm nay", dayName: "Hôm nay" }
  if (index === 1) return { day: "Ngày mai", dayName: "Ngày mai" }
  
  return { 
    day: dayNames[date.getDay()], 
    dayName: fullDayNames[date.getDay()] 
  }
}

function getAqiLevel(aqi: number): string {
  if (aqi <= 50) return "Tốt"
  if (aqi <= 100) return "Trung bình"
  if (aqi <= 150) return "Không tốt cho nhóm nhạy cảm"
  if (aqi <= 200) return "Không lành mạnh"
  if (aqi <= 300) return "Rất không lành mạnh"
  return "Nguy hiểm"
}

export async function GET() {
  try {
    // Fetch weather data from Open-Meteo
    const weatherUrl = new URL("https://api.open-meteo.com/v1/forecast")
    weatherUrl.searchParams.set("latitude", HANOI_LAT.toString())
    weatherUrl.searchParams.set("longitude", HANOI_LON.toString())
    weatherUrl.searchParams.set("timezone", "Asia/Ho_Chi_Minh")
    weatherUrl.searchParams.set("current", "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m,wind_direction_10m")
    weatherUrl.searchParams.set("hourly", "temperature_2m,weather_code")
    weatherUrl.searchParams.set("daily", "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,uv_index_max")
    weatherUrl.searchParams.set("forecast_days", "7")

    // Fetch air quality data
    const aqiUrl = new URL("https://air-quality-api.open-meteo.com/v1/air-quality")
    aqiUrl.searchParams.set("latitude", HANOI_LAT.toString())
    aqiUrl.searchParams.set("longitude", HANOI_LON.toString())
    aqiUrl.searchParams.set("current", "us_aqi")
    aqiUrl.searchParams.set("timezone", "Asia/Ho_Chi_Minh")

    const [weatherResponse, aqiResponse] = await Promise.all([
      fetch(weatherUrl.toString()),
      fetch(aqiUrl.toString()),
    ])

    if (!weatherResponse.ok) {
      throw new Error("Failed to fetch weather data")
    }

    const weatherData = await weatherResponse.json()
    
    let aqiValue = 0
    if (aqiResponse.ok) {
      const aqiData = await aqiResponse.json()
      aqiValue = aqiData.current?.us_aqi || 0
    }

    // Process current weather
    const current = {
      temperature: Math.round(weatherData.current.temperature_2m),
      feelsLike: Math.round(weatherData.current.apparent_temperature),
      condition: getConditionFromCode(weatherData.current.weather_code),
      description: getDescriptionFromCode(weatherData.current.weather_code),
      humidity: Math.round(weatherData.current.relative_humidity_2m),
      windSpeed: Math.round(weatherData.current.wind_speed_10m),
      windDirection: weatherData.current.wind_direction_10m,
      uvIndex: Math.round(weatherData.daily.uv_index_max[0] || 0),
      isDay: weatherData.current.is_day === 1,
      weatherCode: weatherData.current.weather_code,
    }

    // Process hourly data (next 24 hours, every 3 hours)
    const now = new Date()
    const currentHour = now.getHours()
    const hourly: WeatherData["hourly"] = []
    
    for (let i = 0; i < 24; i += 3) {
      const hourIndex = currentHour + i
      if (hourIndex < weatherData.hourly.time.length) {
        const time = new Date(weatherData.hourly.time[hourIndex])
        hourly.push({
          time: time.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
          temp: Math.round(weatherData.hourly.temperature_2m[hourIndex]),
          condition: getConditionFromCode(weatherData.hourly.weather_code[hourIndex]),
        })
      }
    }

    // Process daily data
    const daily: WeatherData["daily"] = weatherData.daily.time.map((date: string, index: number) => {
      const { day, dayName } = getDayName(date, index)
      return {
        day,
        dayName,
        condition: getConditionFromCode(weatherData.daily.weather_code[index]),
        high: Math.round(weatherData.daily.temperature_2m_max[index]),
        low: Math.round(weatherData.daily.temperature_2m_min[index]),
        rainChance: weatherData.daily.precipitation_probability_max[index] || 0,
        weatherCode: weatherData.daily.weather_code[index],
      }
    })

    const responseData: WeatherData = {
      current,
      hourly,
      daily,
      aqi: {
        value: aqiValue,
        level: getAqiLevel(aqiValue),
      },
    }

    return NextResponse.json(responseData)
  } catch (error) {
    console.error("Weather API error:", error)
    return NextResponse.json(
      { error: "Failed to fetch weather data" },
      { status: 500 }
    )
  }
}
