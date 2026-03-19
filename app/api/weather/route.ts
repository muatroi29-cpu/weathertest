import { NextRequest, NextResponse } from "next/server"

// Vietnamese cities coordinates
export const VIETNAM_CITIES = {
  "ha-noi": { name: "Ha Noi", lat: 21.0285, lon: 105.8542 },
  "ho-chi-minh": { name: "TP. Ho Chi Minh", lat: 10.8231, lon: 106.6297 },
  "da-nang": { name: "Da Nang", lat: 16.0544, lon: 108.2022 },
  "hai-phong": { name: "Hai Phong", lat: 20.8449, lon: 106.6881 },
  "can-tho": { name: "Can Tho", lat: 10.0452, lon: 105.7469 },
  "nha-trang": { name: "Nha Trang", lat: 12.2388, lon: 109.1967 },
  "hue": { name: "Hue", lat: 16.4637, lon: 107.5909 },
  "da-lat": { name: "Da Lat", lat: 11.9465, lon: 108.4419 },
  "vung-tau": { name: "Vung Tau", lat: 10.3460, lon: 107.0843 },
  "quy-nhon": { name: "Quy Nhon", lat: 13.7829, lon: 109.2196 },
} as const

export type CityKey = keyof typeof VIETNAM_CITIES

export type WeatherData = {
  city: {
    key: string
    name: string
  }
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
    0: "Troi quang",
    1: "Chu yeu quang",
    2: "Co may rai rac",
    3: "Nhieu may",
    45: "Suong mu",
    48: "Suong mu dong bang",
    51: "Mua phun nhe",
    53: "Mua phun vua",
    55: "Mua phun day dac",
    56: "Mua phun dong bang nhe",
    57: "Mua phun dong bang day",
    61: "Mua nhe",
    63: "Mua vua",
    65: "Mua to",
    66: "Mua dong bang nhe",
    67: "Mua dong bang to",
    71: "Tuyet roi nhe",
    73: "Tuyet roi vua",
    75: "Tuyet roi day",
    77: "Hat tuyet",
    80: "Mua rao nhe",
    81: "Mua rao vua",
    82: "Mua rao to",
    85: "Tuyet rao nhe",
    86: "Tuyet rao to",
    95: "Dong",
    96: "Dong kem mua da nhe",
    99: "Dong kem mua da to",
  }
  return descriptions[code] || "Khong xac dinh"
}

function getDayName(dateStr: string, index: number): { day: string; dayName: string } {
  const date = new Date(dateStr)
  const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"]
  const fullDayNames = ["Chu Nhat", "Thu Hai", "Thu Ba", "Thu Tu", "Thu Nam", "Thu Sau", "Thu Bay"]
  
  if (index === 0) return { day: "Hom nay", dayName: "Hom nay" }
  if (index === 1) return { day: "Ngay mai", dayName: "Ngay mai" }
  
  return { 
    day: dayNames[date.getDay()], 
    dayName: fullDayNames[date.getDay()] 
  }
}

function getAqiLevel(aqi: number): string {
  if (aqi <= 50) return "Tot"
  if (aqi <= 100) return "Trung binh"
  if (aqi <= 150) return "Khong tot cho nhom nhay cam"
  if (aqi <= 200) return "Khong lanh manh"
  if (aqi <= 300) return "Rat khong lanh manh"
  return "Nguy hiem"
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const cityKey = (searchParams.get("city") || "ha-noi") as CityKey
    
    const city = VIETNAM_CITIES[cityKey] || VIETNAM_CITIES["ha-noi"]
    
    // Fetch weather data from Open-Meteo
    const weatherUrl = new URL("https://api.open-meteo.com/v1/forecast")
    weatherUrl.searchParams.set("latitude", city.lat.toString())
    weatherUrl.searchParams.set("longitude", city.lon.toString())
    weatherUrl.searchParams.set("timezone", "Asia/Ho_Chi_Minh")
    weatherUrl.searchParams.set("current", "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m,wind_direction_10m")
    weatherUrl.searchParams.set("hourly", "temperature_2m,weather_code")
    weatherUrl.searchParams.set("daily", "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,uv_index_max")
    weatherUrl.searchParams.set("forecast_days", "7")

    // Fetch air quality data
    const aqiUrl = new URL("https://air-quality-api.open-meteo.com/v1/air-quality")
    aqiUrl.searchParams.set("latitude", city.lat.toString())
    aqiUrl.searchParams.set("longitude", city.lon.toString())
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
      city: {
        key: cityKey,
        name: city.name,
      },
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
