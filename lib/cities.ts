export const VIETNAM_CITIES = {
  "ha-noi": { name: "Hà Nội", lat: 21.0285, lon: 105.8542 },
  "ho-chi-minh": { name: "TP. Hồ Chí Minh", lat: 10.8231, lon: 106.6297 },
  "da-nang": { name: "Đà Nẵng", lat: 16.0544, lon: 108.2022 },
  "hai-phong": { name: "Hải Phòng", lat: 20.8449, lon: 106.6881 },
  "can-tho": { name: "Cần Thơ", lat: 10.0452, lon: 105.7469 },
  "nha-trang": { name: "Nha Trang", lat: 12.2388, lon: 109.1967 },
  "hue": { name: "Huế", lat: 16.4637, lon: 107.5909 },
  "da-lat": { name: "Đà Lạt", lat: 11.9465, lon: 108.4419 },
  "vung-tau": { name: "Vũng Tàu", lat: 10.346, lon: 107.0843 },
  "quy-nhon": { name: "Quy Nhơn", lat: 13.7829, lon: 109.2196 },
} as const

export type CityKey = keyof typeof VIETNAM_CITIES

export const VIETNAM_CITIES_LIST = Object.entries(VIETNAM_CITIES).map(([key, val]) => ({
  key,
  name: val.name,
}))
