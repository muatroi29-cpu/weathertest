"use client"

import { useState, useEffect, useRef } from "react"
import { Search, MapPin, X, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useWeather, type LocationType } from "@/lib/weather-context"
import { VIETNAM_CITIES } from "@/lib/cities"

type GeoResult = {
  id: number
  name: string
  latitude: number
  longitude: number
  country: string
  country_code: string
  admin1?: string
}

export function LocationSearch() {
  const { location, setLocation } = useWeather()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<GeoResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>()
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
        setShowSearch(false)
        setQuery("")
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([])
      setIsOpen(false)
      return
    }
    clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(async () => {
      setIsSearching(true)
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`)
        const data = await res.json()
        setResults(data.results || [])
        setIsOpen(true)
      } catch {
        setResults([])
      } finally {
        setIsSearching(false)
      }
    }, 400)
    return () => clearTimeout(timeoutRef.current)
  }, [query])

  const handleSelect = (result: GeoResult) => {
    const newLocation: LocationType = {
      key: `custom_${result.latitude}_${result.longitude}`,
      name: result.name,
      lat: result.latitude,
      lon: result.longitude,
      country: result.country,
      admin1: result.admin1,
    }
    setLocation(newLocation)
    setQuery("")
    setIsOpen(false)
    setShowSearch(false)
  }

  const handleVietnamCity = (key: string) => {
    const city = VIETNAM_CITIES[key as keyof typeof VIETNAM_CITIES]
    if (!city) return
    setLocation({
      key,
      name: city.name,
      lat: city.lat,
      lon: city.lon,
      country: "Việt Nam",
    })
    setIsOpen(false)
    setShowSearch(false)
    setQuery("")
  }

  if (!showSearch) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowSearch(true)}
        className="gap-1.5 text-muted-foreground hover:text-foreground h-8"
      >
        <Search className="h-3.5 w-3.5" />
        <span className="text-xs hidden sm:inline">Tìm địa điểm</span>
      </Button>
    )
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-xs">
      <div className="relative flex items-center">
        {isSearching ? (
          <Loader2 className="absolute left-2.5 h-3.5 w-3.5 text-muted-foreground animate-spin" />
        ) : (
          <Search className="absolute left-2.5 h-3.5 w-3.5 text-muted-foreground" />
        )}
        <Input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm thành phố..."
          className="pl-8 pr-8 h-8 text-sm"
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 h-8 w-8"
            onClick={() => {
              setQuery("")
              setResults([])
            }}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      {(isOpen || !query) && (
        <div className="absolute top-full mt-1 w-full z-50 bg-popover border border-border rounded-lg shadow-xl overflow-hidden min-w-[260px]">
          {results.length > 0 && (
            <ul className="py-1 max-h-56 overflow-y-auto">
              {results.map((r) => (
                <li key={r.id}>
                  <button
                    className="w-full flex items-start gap-2 px-3 py-2 hover:bg-accent text-left transition-colors"
                    onClick={() => handleSelect(r)}
                  >
                    <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{r.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {[r.admin1, r.country].filter(Boolean).join(", ")}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {!isSearching && query.length >= 2 && results.length === 0 && (
            <div className="py-4 text-center">
              <p className="text-sm text-muted-foreground">
                Không tìm thấy kết quả
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Thử tìm với tên tiếng Anh
              </p>
            </div>
          )}

          {/* Quick cities */}
          <div className={`border-t border-border p-2 ${results.length > 0 ? "" : "border-t-0"}`}>
            <p className="text-xs font-medium text-muted-foreground px-1 mb-1.5">
              Thành phố Việt Nam
            </p>
            <div className="grid grid-cols-2 gap-1">
              {Object.entries(VIETNAM_CITIES).map(([key, city]) => (
                <button
                  key={key}
                  className={`text-xs px-2 py-1.5 rounded text-left transition-colors ${
                    location.key === key
                      ? "bg-primary/10 text-primary font-medium"
                      : "hover:bg-accent"
                  }`}
                  onClick={() => handleVietnamCity(key)}
                >
                  {city.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
