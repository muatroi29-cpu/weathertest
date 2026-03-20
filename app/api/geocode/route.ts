import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")
  if (!q || q.trim().length < 2) {
    return NextResponse.json({ results: [] })
  }

  try {
    const url = new URL("https://geocoding-api.open-meteo.com/v1/search")
    url.searchParams.set("name", q.trim())
    url.searchParams.set("count", "8")
    url.searchParams.set("language", "vi")
    url.searchParams.set("format", "json")

    const res = await fetch(url.toString())
    if (!res.ok) throw new Error("Geocoding API error")
    const data = await res.json()
    return NextResponse.json({ results: data.results || [] })
  } catch {
    return NextResponse.json({ results: [] })
  }
}
