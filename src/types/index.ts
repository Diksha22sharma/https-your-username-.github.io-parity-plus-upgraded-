export interface ParityData {
  parityScore: number
  totalViolations: number
  wlmViolations: number
  raViolations: number
  otaParity: {
    score: number
    violations: number
  }
  metaParity: {
    score: number
    violations: number
  }
}

export interface TrendDataPoint {
  date: string
  score: number
  violations: number
}

export interface Violation {
  id: string
  hotel: string
  brand: string
  subBrand?: string
  channel: string
  channelType: 'OTA' | 'Meta' | 'Wholesaler'
  underlyingOTA?: string  // OTA name when channelType is Meta
  date: string
  rate: number
  brandRate?: number  // Brand rate as benchmark
  room: string
  board: string
  pos: string
  los: number
  occupancy: number
  wlm: 'Win' | 'Loss' | 'Meet'
  ra: 'Rate' | 'Availability'
  severity: 'Critical' | 'Major' | 'Minor' | 'Trivial'
  reason: string
  revenueLoss?: number
  cacheUrl?: string
  liveUrl?: string
}

export interface WLMData {
  win: number
  meet: number
  loss: number
  totalInstances: number
}

export interface ChannelParity {
  channel: string
  channelType: 'OTA' | 'Meta' | 'Wholesaler'
  parityScore: number
  parityScoreTrend?: number
  instancesChecked: number
  rateViolations: number
  rateViolationsTrend?: number
  availabilityViolations: number
  availabilityViolationsTrend?: number
  violations: number
  violationsTrend?: number
  trend: 'improving' | 'declining' | 'stable'
  wlm?: WLMData
  revenueLoss?: number
  currency?: string
}

export interface AIInsight {
  id: string
  type: 'alert' | 'recommendation' | 'trend'
  title: string
  description: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  filters: Record<string, any>
  timestamp: string
}

export interface TestBooking {
  id: string
  bookingId: string
  guestName: string
  shopDate: string
  bookingDate: string
  cityName: string
  brandRate: number
  channelRate: number
  currency: string
  channelName: string
  subChannelName: string
  rateCode: string
  pmsRate: number
  pmsCurrency: string
  rateType: string
  markupPercent: number
  mailCount: number
  dates: {
    checkIn: string
    checkOut: string
  }
  hotel: string
  region: string
  country: string
  leakage: number
  wholesalerOta: string
  wholesalerReason: string
  status: 'Open' | 'Closed by User' | 'Closed by RateGain'
  unattendedViolations: number
  totalViolations: number
}

export interface HierarchyNode {
  id: string
  name: string
  type: 'Brand' | 'SubBrand' | 'Hotel' | 'Channel'
  children?: HierarchyNode[]
  parityScore?: number
  violations?: number
  wlm?: WLMData
}

export interface FilterState {
  rate?: { min?: number; max?: number }
  room?: string[]
  board?: string[]
  pos?: string[]
  los?: { min?: number; max?: number }
  occupancy?: { min?: number; max?: number }
  dateRange?: { start: string; end: string }
  channel?: string[]
  brand?: string[]
  subBrand?: string[]
  hotel?: string[]
  violationReason?: string[]
  channelType?: ('OTA' | 'Meta' | 'Wholesaler')[]
  severity?: ('Critical' | 'Major' | 'Minor' | 'Trivial')[]
  calendarViewBy?: 'Brand' | 'SubBrand' | 'Hotel' | 'Channel'
  selectedEntities?: string[]
}

export interface CalendarDayData {
  date: string
  parityScore: number
  wlm: 'Win' | 'Loss' | 'Meet'
  rate?: number  // For channels
  brandRate?: number  // For channels
  variance?: number  // For channels
}

export interface CalendarEntity {
  id: string
  name: string
  type: 'hotel' | 'channel'
  channelType?: 'OTA' | 'Meta' | 'Wholesaler'
  underlyingOTA?: string  // For Meta channels
  wlm: {
    win: number
    meet: number
    loss: number
    totalInstances: number
  }
  totalParityScore: number
  days: CalendarDayData[]
  children?: CalendarEntity[]  // For expandable hotels
}
