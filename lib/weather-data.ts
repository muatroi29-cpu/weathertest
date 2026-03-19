// Weather utility functions

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
