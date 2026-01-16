import { useState, useEffect, useRef } from 'react'
import { Filter, X, Calendar, Globe, ChevronDown, DollarSign, Bed, UtensilsCrossed, CalendarDays, Users, Coins, MapPin, Info, ArrowRight, Zap, MessageSquare, BookOpen, AlertTriangle, CheckCircle } from 'lucide-react'
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, LabelList } from 'recharts'
import { useNavigate } from 'react-router-dom'
import HierarchicalViewBy, { mockHierarchy as viewByHierarchy } from '../components/Filters/HierarchicalViewBy'
import ParityScoreCard from '../components/Dashboard/ParityScoreCard'
import WLMCard from '../components/Dashboard/WLMCard'
import RevenueLossCard from '../components/Dashboard/LossBreakdownCard'
import BrandSoldOutCard from '../components/Dashboard/BrandSoldOutCard'
import ParityTrendChart from '../components/Dashboard/ParityTrendChart'
import TopViolationsPanel from '../components/Dashboard/TopViolationsPanel'
import MostViolatedCard from '../components/Dashboard/MostViolatedCard'
import OverallSeverityCard from '../components/Dashboard/OverallSeverityCard'
import TopViolationReasonsCard from '../components/Dashboard/TopViolationReasonsCard'
import ViolationStatusCard from '../components/Dashboard/ViolationStatusCard'
import BookingWindowCard from '../components/Dashboard/BookingWindowCard'
import FilterBar from '../components/Filters/FilterBar'
import ChannelParityGrid from '../components/ChannelParity/ChannelParityGrid'
import HierarchyDrilldown from '../components/Hierarchy/HierarchyDrilldown'
import ParityCalendarView from '../components/Hierarchy/ParityCalendarView'
import { FilterState, TrendDataPoint, AIInsight, ChannelParity, HierarchyNode } from '../types'

// Helper function to get next 30 days date range
const getNext30DaysRange = () => {
  const today = new Date()
  const next30Days = new Date()
  next30Days.setDate(today.getDate() + 30)
  
  return {
    start: today.toISOString().split('T')[0],
    end: next30Days.toISOString().split('T')[0]
  }
}

// Mock Parity Score data with OTA and Meta
const mockParityScoreData = {
  parityScore: 87.5,
  instances: 80,
  totalInstances: 100,
  delta: 2.3,
  ota: {
    score: 89.2,
    instances: 45,
    totalInstances: 50,
    delta: 1.5
  },
  meta: {
    score: 85.1,
    instances: 35,
    totalInstances: 50,
    delta: 0.8
  }
}

// Mock WLM data with Rate and Availability breakdown
const mockWLMData = {
  rate: {
    win: { instances: 15, totalInstances: 100, delta: 2.3 },
    meet: { instances: 50, totalInstances: 100, delta: -1.2 },
    loss: { instances: 35, totalInstances: 100, delta: -1.1 }
  },
  availability: {
    win: { instances: 18, totalInstances: 100, delta: 1.5 },
    meet: { instances: 52, totalInstances: 100, delta: -0.8 },
    loss: { instances: 30, totalInstances: 100, delta: -0.7 }
  }
}

// Mock Revenue Loss data with Rate and Availability
const mockRevenueLossData = {
  estimatedLoss: 12400,
  delta: -8.5,
  period: 'This month',
  rate: {
    instances: 18,
    totalInstances: 100,
    estimatedAmount: 7500,
    delta: -5.2
  },
  availability: {
    instances: 12,
    totalInstances: 100,
    estimatedAmount: 4900,
    delta: -3.3
  }
}

// Mock Brand Sold Out data
const mockBrandSoldOutData = {
  percentage: 12.5,
  instances: 1250,
  totalInstances: 10000,
  delta: -2.3,
  period: 'This month'
}

const mockTrendData: TrendDataPoint[] = Array.from({ length: 30 }, (_, i) => ({
  date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  score: 85 + Math.random() * 10,
  violations: Math.floor(300 + Math.random() * 100)
}))

const mockWorkflowInsights = {
  buzzReason: {
    title: 'Buzz & Reason',
    items: [
      { label: 'Total Buzzed', value: 186, trend: '+12%' },
      { label: 'Responded with Reasons', value: 142, trend: '+8%' },
      { label: 'Buzz Not Responded', value: 44, trend: '-2%' },
      { label: 'Automatically Closed', value: 18, trend: '+1%' },
      { label: 'Unattended (No Buzz/Reason)', value: 34, trend: '-3%' }
    ]
  },
  testBooking: {
    title: 'Test Booking',
    items: [
      { label: 'Test Bookings Done', value: 98, trend: '+5%' },
      { label: 'Unattended Bookings', value: 22, trend: '-2%' },
      { label: 'Active Bookings', value: 76, trend: '+6%' },
      { label: 'Closed Bookings', value: 54, trend: '+4%' }
    ]
  }
}

// Export mockInsights so it can be used in App.tsx
export const mockInsights: AIInsight[] = [
  {
    id: '1',
    type: 'alert',
    title: 'Spike in bait & switch violations for Brand X on Channel Y this week',
    description: 'Bait & switch violations have increased by 45% compared to last week, primarily affecting Brand X on Channel Y.',
    severity: 'high',
    filters: { brand: ['Brand X'], channel: ['Channel Y'], violationReason: ['Bait & switch'] },
    timestamp: new Date().toISOString()
  },
  {
    id: '2',
    type: 'trend',
    title: 'Wholesaler Z causing recurring undercuts in Region A',
    description: 'Wholesaler Z has been consistently undercutting rates in Region A, resulting in an estimated $12K revenue loss this month.',
    severity: 'critical',
    filters: { channel: ['Wholesaler Z'], region: ['Region A'] },
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '3',
    type: 'recommendation',
    title: 'Parity score dropping for Sub Brand B due to promotion differences',
    description: 'Consider reviewing promotion strategies for Sub Brand B as promotion differences are causing a 5% drop in parity score.',
    severity: 'medium',
    filters: { subBrand: ['Sub Brand B'], violationReason: ['Promotion/discount difference'] },
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '4',
    type: 'alert',
    title: 'Critical violation detected on Booking.com for Hotel Grand',
    description: 'Rate discrepancy of $150 detected. Immediate action required.',
    severity: 'critical',
    filters: { hotel: ['Hotel Grand'], channel: ['Booking.com'] },
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
  }
]

// Mock data for top violations
const mockTopProperties = [
  { 
    name: 'Hotel Grand', 
    violations: 145, 
    parityScore: 72.5, 
    trend: 12, 
    type: 'property' as const,
    wlm: { win: 1200, meet: 3500, loss: 2800, totalInstances: 7500 },
    instances: 7500,
    violatingChannel: { name: 'Booking.com', violationPercent: 45.2 },
    revenueLoss: 45280,
    currency: 'USD',
    availabilityHealth: 45.2,
    availableChannels: ['Booking.com', 'Expedia', 'Agoda'],
    notAvailableChannels: ['TripAdvisor', 'Hotels.com', 'Priceline', 'Makemytrip']
  },
  { 
    name: 'Hotel Plaza', 
    violations: 98, 
    parityScore: 78.3, 
    trend: 8, 
    type: 'property' as const,
    wlm: { win: 1800, meet: 4200, loss: 2000, totalInstances: 8000 },
    instances: 8000,
    violatingChannel: { name: 'Expedia', violationPercent: 38.5 },
    revenueLoss: 32150,
    currency: 'EUR',
    availabilityHealth: 62.8,
    availableChannels: ['Booking.com', 'Expedia', 'Agoda', 'Hotels.com'],
    notAvailableChannels: ['TripAdvisor', 'Priceline']
  },
  { 
    name: 'Hotel Royal', 
    violations: 87, 
    parityScore: 81.2, 
    trend: 5, 
    type: 'property' as const,
    wlm: { win: 2200, meet: 4800, loss: 1000, totalInstances: 8000 },
    instances: 8000,
    violatingChannel: { name: 'Agoda', violationPercent: 32.1 },
    revenueLoss: 28450,
    currency: 'GBP',
    availabilityHealth: 75.5,
    availableChannels: ['Booking.com', 'Expedia', 'Agoda', 'Hotels.com', 'TripAdvisor'],
    notAvailableChannels: ['Priceline']
  },
  { 
    name: 'Hotel Ocean', 
    violations: 76, 
    parityScore: 82.1, 
    trend: 3, 
    type: 'property' as const,
    wlm: { win: 2400, meet: 5100, loss: 500, totalInstances: 8000 },
    instances: 8000,
    violatingChannel: { name: 'Hotels.com', violationPercent: 28.7 },
    revenueLoss: 19820,
    currency: 'USD',
    availabilityHealth: 85.3,
    availableChannels: ['Booking.com', 'Expedia', 'Agoda', 'Hotels.com', 'TripAdvisor', 'Priceline'],
    notAvailableChannels: []
  },
  { 
    name: 'Hotel Sky', 
    violations: 65, 
    parityScore: 84.5, 
    trend: -2, 
    type: 'property' as const,
    wlm: { win: 2800, meet: 5200, loss: 0, totalInstances: 8000 },
    instances: 8000,
    violatingChannel: { name: 'Priceline', violationPercent: 24.3 },
    revenueLoss: 12450,
    currency: 'INR',
    availabilityHealth: 92.1,
    availableChannels: ['Booking.com', 'Expedia', 'Agoda', 'Hotels.com', 'TripAdvisor', 'Priceline', 'Makemytrip'],
    notAvailableChannels: []
  }
]

const mockChannels: ChannelParity[] = [
  { 
    channel: 'Booking.com', 
    channelType: 'OTA', 
    parityScore: 72, 
    parityScoreTrend: -6,
    instancesChecked: 15420, 
    rateViolations: 89, 
    rateViolationsTrend: 6,
    availabilityViolations: 45,
    availabilityViolationsTrend: 0,
    violations: 134,
    violationsTrend: 8,
    trend: 'declining',
    wlm: { win: 8173, meet: 2928, loss: 4319, totalInstances: 15420 },
    revenueLoss: 45280,
    currency: 'USD'
  },
  { 
    channel: 'Expedia', 
    channelType: 'OTA', 
    parityScore: 85,
    parityScoreTrend: 0,
    instancesChecked: 12890, 
    rateViolations: 112,
    rateViolationsTrend: 0,
    availabilityViolations: 67,
    availabilityViolationsTrend: 0,
    violations: 179,
    violationsTrend: -46,
    trend: 'stable',
    wlm: { win: 8121, meet: 2836, loss: 1933, totalInstances: 12890 },
    revenueLoss: 32150,
    currency: 'EUR'
  },
  { 
    channel: 'Google Hotels', 
    channelType: 'Meta', 
    parityScore: 85, 
    parityScoreTrend: 0,
    instancesChecked: 9870, 
    rateViolations: 98,
    rateViolationsTrend: 0,
    availabilityViolations: 89,
    availabilityViolationsTrend: 0,
    violations: 187,
    violationsTrend: 0,
    trend: 'stable',
    wlm: { win: 7203, meet: 2468, loss: 199, totalInstances: 9870 },
    revenueLoss: 28450,
    currency: 'GBP'
  },
  { 
    channel: 'TripAdvisor', 
    channelType: 'Meta', 
    parityScore: 90, 
    parityScoreTrend: 0,
    instancesChecked: 7650, 
    rateViolations: 56,
    rateViolationsTrend: 0,
    availabilityViolations: 34,
    availabilityViolationsTrend: 0,
    violations: 90,
    violationsTrend: 0,
    trend: 'stable',
    wlm: { win: 6885, meet: 765, loss: 0, totalInstances: 7650 },
    revenueLoss: 19820,
    currency: 'USD'
  },
  { 
    channel: 'Wholesaler A', 
    channelType: 'Wholesaler', 
    parityScore: 78, 
    parityScoreTrend: 0,
    instancesChecked: 5430, 
    rateViolations: 145,
    rateViolationsTrend: 0,
    availabilityViolations: 98,
    availabilityViolationsTrend: 0,
    violations: 243,
    violationsTrend: 0,
    trend: 'stable',
    wlm: { win: 3964, meet: 1358, loss: 108, totalInstances: 5430 },
    revenueLoss: 12450,
    currency: 'INR'
  },
  { 
    channel: 'Wholesaler B', 
    channelType: 'Wholesaler', 
    parityScore: 82, 
    parityScoreTrend: 0,
    instancesChecked: 4320, 
    rateViolations: 87,
    rateViolationsTrend: 0,
    availabilityViolations: 56,
    availabilityViolationsTrend: 0,
    violations: 143,
    violationsTrend: 0,
    trend: 'stable',
    wlm: { win: 3542, meet: 778, loss: 0, totalInstances: 4320 },
    revenueLoss: 8750,
    currency: 'USD'
  }
]

// Mock data for Most Violated OTAs
const mockOTAs = [
  {
    name: 'Booking.com',
    parityScore: 72.5,
    win: 8173,
    meet: 2928,
    loss: 4319,
    rateViolations: 89,
    availabilityViolations: 45,
    totalViolations: 134
  },
  {
    name: 'Expedia',
    parityScore: 85.2,
    win: 8121,
    meet: 2836,
    loss: 1933,
    rateViolations: 112,
    availabilityViolations: 67,
    totalViolations: 179
  },
  {
    name: 'Agoda',
    parityScore: 78.8,
    win: 6543,
    meet: 2134,
    loss: 1890,
    rateViolations: 95,
    availabilityViolations: 52,
    totalViolations: 147
  },
  {
    name: 'Hotels.com',
    parityScore: 81.3,
    win: 5234,
    meet: 1876,
    loss: 1234,
    rateViolations: 78,
    availabilityViolations: 41,
    totalViolations: 119
  },
  {
    name: 'Priceline',
    parityScore: 76.9,
    win: 4123,
    meet: 1654,
    loss: 1456,
    rateViolations: 67,
    availabilityViolations: 38,
    totalViolations: 105
  }
]

// Mock data for Top Violating Metas
const mockMetas = [
  {
    name: 'Google Hotels',
    parityScore: 85.1,
    totalViolations: 187,
    subChannels: [
      { name: 'Google Hotels - Booking.com', violations: 98, parityScore: 82.5, rateViolations: 58, availabilityViolations: 40 },
      { name: 'Google Hotels - Expedia', violations: 67, parityScore: 87.2, rateViolations: 40, availabilityViolations: 27 },
      { name: 'Google Hotels - Agoda', violations: 45, parityScore: 89.1, rateViolations: 27, availabilityViolations: 18 },
      { name: 'Google Hotels - Hotels.com', violations: 32, parityScore: 86.5, rateViolations: 19, availabilityViolations: 13 },
      { name: 'Google Hotels - Priceline', violations: 28, parityScore: 88.2, rateViolations: 17, availabilityViolations: 11 }
    ]
  },
  {
    name: 'TripAdvisor',
    parityScore: 90.2,
    totalViolations: 90,
    subChannels: [
      { name: 'TripAdvisor - Booking.com', violations: 45, parityScore: 88.5, rateViolations: 27, availabilityViolations: 18 },
      { name: 'TripAdvisor - Expedia', violations: 34, parityScore: 91.2, rateViolations: 20, availabilityViolations: 14 },
      { name: 'TripAdvisor - Hotels.com', violations: 11, parityScore: 92.8, rateViolations: 7, availabilityViolations: 4 },
      { name: 'TripAdvisor - Agoda', violations: 8, parityScore: 91.5, rateViolations: 5, availabilityViolations: 3 },
      { name: 'TripAdvisor - Priceline', violations: 5, parityScore: 93.2, rateViolations: 3, availabilityViolations: 2 }
    ]
  },
  {
    name: 'Trivago',
    parityScore: 79.5,
    totalViolations: 156,
    subChannels: [
      { name: 'Trivago - Booking.com', violations: 78, parityScore: 75.2, rateViolations: 47, availabilityViolations: 31 },
      { name: 'Trivago - Expedia', violations: 56, parityScore: 81.5, rateViolations: 34, availabilityViolations: 22 },
      { name: 'Trivago - Agoda', violations: 22, parityScore: 83.8, rateViolations: 13, availabilityViolations: 9 },
      { name: 'Trivago - Hotels.com', violations: 18, parityScore: 82.1, rateViolations: 11, availabilityViolations: 7 },
      { name: 'Trivago - Priceline', violations: 15, parityScore: 84.5, rateViolations: 9, availabilityViolations: 6 }
    ]
  }
]

// Mock data for Parity Calendar View
const mockCalendarData = [
  {
    id: 'hotel-1',
    name: 'Copthorne Hotel',
    type: 'hotel' as const,
    wlm: { win: 31, meet: 38, loss: 31, totalInstances: 100 },
    parityScore: 69,
    dateData: {
      '2024-11-14': { parityScore: 67 },
      '2024-11-15': { parityScore: 67 },
      '2024-11-16': { parityScore: 67 },
      '2024-11-17': { parityScore: 67 },
      '2024-11-18': { parityScore: 67 },
      '2024-11-19': { parityScore: 100 },
      '2024-11-20': { parityScore: 67 },
      '2024-11-21': { parityScore: 67 },
      '2024-11-22': { parityScore: 67 },
      '2024-11-23': { parityScore: 67 },
      '2024-11-24': { parityScore: 67 },
      '2024-11-25': { parityScore: 67 },
      '2024-11-26': { parityScore: 67 },
      '2024-11-27': { parityScore: 67 },
      '2024-11-28': { parityScore: 67 }
    },
    children: [
      {
        id: 'channel-booking',
        name: 'Booking.com',
        type: 'channel' as const,
        wlm: { win: 0, meet: 100, loss: 0, totalInstances: 100 },
        parityScore: 100,
        dateData: {
          '2024-11-14': { wlm: 'Meet' },
          '2024-11-15': { wlm: 'Meet' },
          '2024-11-16': { wlm: 'Meet' },
          '2024-11-17': { wlm: 'Meet' },
          '2024-11-18': { wlm: 'Meet' },
          '2024-11-19': { wlm: 'Meet' },
          '2024-11-20': { wlm: 'Meet' },
          '2024-11-21': { wlm: 'Meet' },
          '2024-11-22': { wlm: 'Meet' },
          '2024-11-23': { wlm: 'Meet' },
          '2024-11-24': { wlm: 'Meet' },
          '2024-11-25': { wlm: 'Meet' },
          '2024-11-26': { wlm: 'Meet' },
          '2024-11-27': { wlm: 'Meet' },
          '2024-11-28': { wlm: 'Meet' }
        }
      },
      {
        id: 'channel-expedia',
        name: 'Expedia',
        type: 'channel' as const,
        wlm: { win: 0, meet: 100, loss: 0, totalInstances: 100 },
        parityScore: 100,
        dateData: {
          '2024-11-14': { wlm: 'Meet' },
          '2024-11-15': { wlm: 'Meet' },
          '2024-11-16': { wlm: 'Meet' },
          '2024-11-17': { wlm: 'Meet' },
          '2024-11-18': { wlm: 'Meet' },
          '2024-11-19': { wlm: 'Meet' },
          '2024-11-20': { wlm: 'Meet' },
          '2024-11-21': { wlm: 'Meet' },
          '2024-11-22': { wlm: 'Meet' },
          '2024-11-23': { wlm: 'Meet' },
          '2024-11-24': { wlm: 'Meet' },
          '2024-11-25': { wlm: 'Meet' },
          '2024-11-26': { wlm: 'Meet' },
          '2024-11-27': { wlm: 'Meet' },
          '2024-11-28': { wlm: 'Meet' }
        }
      },
      {
        id: 'channel-agoda',
        name: 'Agoda',
        type: 'channel' as const,
        wlm: { win: 93, meet: 7, loss: 0, totalInstances: 100 },
        parityScore: 100,
        dateData: {
          '2024-11-14': { wlm: 'Win' },
          '2024-11-15': { wlm: 'Win' },
          '2024-11-16': { wlm: 'Win' },
          '2024-11-17': { wlm: 'Win' },
          '2024-11-18': { wlm: 'Win' },
          '2024-11-19': { wlm: 'Meet' },
          '2024-11-20': { wlm: 'Win' },
          '2024-11-21': { wlm: 'Win' },
          '2024-11-22': { wlm: 'Win' },
          '2024-11-23': { wlm: 'Win' },
          '2024-11-24': { wlm: 'Win' },
          '2024-11-25': { wlm: 'Win' },
          '2024-11-26': { wlm: 'Win' },
          '2024-11-27': { wlm: 'Win' },
          '2024-11-28': { wlm: 'Win' }
        }
      },
      {
        id: 'channel-tripadvisor',
        name: 'Tripadvisor',
        type: 'channel' as const,
        wlm: { win: 0, meet: 7, loss: 93, totalInstances: 100 },
        parityScore: 7,
        dateData: {
          '2024-11-14': { wlm: 'Loss' },
          '2024-11-15': { wlm: 'Loss' },
          '2024-11-16': { wlm: 'Loss' },
          '2024-11-17': { wlm: 'Loss' },
          '2024-11-18': { wlm: 'Loss' },
          '2024-11-19': { wlm: 'Meet' },
          '2024-11-20': { wlm: 'Loss' },
          '2024-11-21': { wlm: 'Loss' },
          '2024-11-22': { wlm: 'Loss' },
          '2024-11-23': { wlm: 'Loss' },
          '2024-11-24': { wlm: 'Loss' },
          '2024-11-25': { wlm: 'Loss' },
          '2024-11-26': { wlm: 'Loss' },
          '2024-11-27': { wlm: 'Loss' },
          '2024-11-28': { wlm: 'Loss' }
        }
      },
      {
        id: 'channel-makemytrip',
        name: 'Makemytrip',
        type: 'channel' as const,
        wlm: { win: 93, meet: 7, loss: 0, totalInstances: 100 },
        parityScore: 100,
        dateData: {
          '2024-11-14': { wlm: 'Win' },
          '2024-11-15': { wlm: 'Win' },
          '2024-11-16': { wlm: 'Win' },
          '2024-11-17': { wlm: 'Win' },
          '2024-11-18': { wlm: 'Win' },
          '2024-11-19': { wlm: 'Meet' },
          '2024-11-20': { wlm: 'Win' },
          '2024-11-21': { wlm: 'Win' },
          '2024-11-22': { wlm: 'Win' },
          '2024-11-23': { wlm: 'Win' },
          '2024-11-24': { wlm: 'Win' },
          '2024-11-25': { wlm: 'Win' },
          '2024-11-26': { wlm: 'Win' },
          '2024-11-27': { wlm: 'Win' },
          '2024-11-28': { wlm: 'Win' }
        }
      },
      {
        id: 'channel-google',
        name: 'GoogleHotelFinder',
        type: 'channel' as const,
        wlm: { win: 0, meet: 7, loss: 93, totalInstances: 100 },
        parityScore: 7,
        dateData: {
          '2024-11-14': { wlm: 'Loss' },
          '2024-11-15': { wlm: 'Loss' },
          '2024-11-16': { wlm: 'Loss' },
          '2024-11-17': { wlm: 'Loss' },
          '2024-11-18': { wlm: 'Loss' },
          '2024-11-19': { wlm: 'Meet' },
          '2024-11-20': { wlm: 'Loss' },
          '2024-11-21': { wlm: 'Loss' },
          '2024-11-22': { wlm: 'Loss' },
          '2024-11-23': { wlm: 'Loss' },
          '2024-11-24': { wlm: 'Loss' },
          '2024-11-25': { wlm: 'Loss' },
          '2024-11-26': { wlm: 'Loss' },
          '2024-11-27': { wlm: 'Loss' },
          '2024-11-28': { wlm: 'Loss' }
        }
      }
    ]
  },
  {
    id: 'hotel-2',
    name: 'Millennium Maxw',
    type: 'hotel' as const,
    wlm: { win: 40, meet: 23, loss: 37, totalInstances: 100 },
    parityScore: 63,
    dateData: {
      '2024-11-14': { parityScore: 60 },
      '2024-11-15': { parityScore: 60 },
      '2024-11-16': { parityScore: 60 },
      '2024-11-17': { parityScore: 60 },
      '2024-11-18': { parityScore: 60 },
      '2024-11-19': { parityScore: 60 },
      '2024-11-20': { parityScore: 60 },
      '2024-11-21': { parityScore: 60 },
      '2024-11-22': { parityScore: 60 },
      '2024-11-23': { parityScore: 60 },
      '2024-11-24': { parityScore: 60 },
      '2024-11-25': { parityScore: 80 },
      '2024-11-26': { parityScore: 60 },
      '2024-11-27': { parityScore: 60 },
      '2024-11-28': { parityScore: 80 }
    },
    children: []
  },
  {
    id: 'hotel-3',
    name: 'Hotel Neo Dipat..',
    type: 'hotel' as const,
    wlm: { win: 42, meet: 30, loss: 28, totalInstances: 100 },
    parityScore: 72,
    dateData: {
      '2024-11-14': { parityScore: 50 },
      '2024-11-15': { parityScore: 50 },
      '2024-11-16': { parityScore: 100 },
      '2024-11-17': { parityScore: 75 },
      '2024-11-18': { parityScore: 50 },
      '2024-11-19': { parityScore: 50 },
      '2024-11-20': { parityScore: 75 },
      '2024-11-21': { parityScore: 50 },
      '2024-11-22': { parityScore: 100 },
      '2024-11-23': { parityScore: 50 },
      '2024-11-24': { parityScore: 75 },
      '2024-11-25': { parityScore: 50 },
      '2024-11-26': { parityScore: 50 },
      '2024-11-27': { parityScore: 75 },
      '2024-11-28': { parityScore: 50 }
    },
    children: []
  }
]

// Multiple brands with multiple hotels and channels
const mockHierarchy: HierarchyNode[] = [
  {
    id: 'brand-1',
    name: 'Brand A',
    type: 'Brand',
    parityScore: 87.5,
    violations: 342,
    wlm: { win: 20, meet: 50, loss: 30, totalInstances: 100 },
    children: [
      {
        id: 'subbrand-1',
        name: 'Sub Brand A1',
        type: 'SubBrand',
        parityScore: 89.2,
        violations: 198,
        wlm: { win: 25, meet: 55, loss: 20, totalInstances: 100 },
        children: [
          {
            id: 'hotel-1',
            name: 'Hotel Grand',
            type: 'Hotel',
            parityScore: 91.5,
            violations: 45,
            wlm: { win: 30, meet: 60, loss: 10, totalInstances: 100 },
            children: [
              { 
                id: 'channel-1', 
                name: 'Booking.com', 
                type: 'Channel', 
                parityScore: 92, 
                violations: 12,
                wlm: { win: 35, meet: 57, loss: 8, totalInstances: 100 }
              },
              { 
                id: 'channel-2', 
                name: 'Expedia', 
                type: 'Channel', 
                parityScore: 88, 
                violations: 18,
                wlm: { win: 28, meet: 60, loss: 12, totalInstances: 100 }
              },
              { 
                id: 'channel-3', 
                name: 'Google Hotels', 
                type: 'Channel', 
                parityScore: 85, 
                violations: 15,
                wlm: { win: 25, meet: 60, loss: 15, totalInstances: 100 }
              }
            ]
          },
          {
            id: 'hotel-2',
            name: 'Hotel Plaza',
            type: 'Hotel',
            parityScore: 88.3,
            violations: 78,
            wlm: { win: 22, meet: 58, loss: 20, totalInstances: 100 },
            children: [
              { 
                id: 'channel-4', 
                name: 'Booking.com', 
                type: 'Channel', 
                parityScore: 90, 
                violations: 10,
                wlm: { win: 30, meet: 60, loss: 10, totalInstances: 100 }
              },
              { 
                id: 'channel-5', 
                name: 'TripAdvisor', 
                type: 'Channel', 
                parityScore: 86, 
                violations: 14,
                wlm: { win: 24, meet: 62, loss: 14, totalInstances: 100 }
              }
            ]
          },
          {
            id: 'hotel-3',
            name: 'Hotel Royal',
            type: 'Hotel',
            parityScore: 90.1,
            violations: 35,
            wlm: { win: 28, meet: 62, loss: 10, totalInstances: 100 },
            children: [
              { 
                id: 'channel-6', 
                name: 'Expedia', 
                type: 'Channel', 
                parityScore: 92, 
                violations: 8,
                wlm: { win: 35, meet: 57, loss: 8, totalInstances: 100 }
              },
              { 
                id: 'channel-7', 
                name: 'Booking.com', 
                type: 'Channel', 
                parityScore: 88, 
                violations: 12,
                wlm: { win: 28, meet: 60, loss: 12, totalInstances: 100 }
              }
            ]
          }
        ]
      },
      {
        id: 'subbrand-2',
        name: 'Sub Brand A2',
        type: 'SubBrand',
        parityScore: 85.8,
        violations: 144,
        wlm: { win: 18, meet: 52, loss: 30, totalInstances: 100 },
        children: [
          {
            id: 'hotel-4',
            name: 'Hotel Ocean',
            type: 'Hotel',
            parityScore: 87.2,
            violations: 56,
            wlm: { win: 20, meet: 55, loss: 25, totalInstances: 100 },
            children: [
              { 
                id: 'channel-8', 
                name: 'Booking.com', 
                type: 'Channel', 
                parityScore: 89, 
                violations: 11,
                wlm: { win: 32, meet: 57, loss: 11, totalInstances: 100 }
              },
              { 
                id: 'channel-9', 
                name: 'Expedia', 
                type: 'Channel', 
                parityScore: 85, 
                violations: 15,
                wlm: { win: 28, meet: 57, loss: 15, totalInstances: 100 }
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'brand-2',
    name: 'Brand B',
    type: 'Brand',
    parityScore: 82.3,
    violations: 456,
    wlm: { win: 15, meet: 45, loss: 40, totalInstances: 100 },
    children: [
      {
        id: 'subbrand-3',
        name: 'Sub Brand B1',
        type: 'SubBrand',
        parityScore: 84.5,
        violations: 234,
        wlm: { win: 20, meet: 50, loss: 30, totalInstances: 100 },
        children: [
          {
            id: 'hotel-5',
            name: 'Hotel Sky',
            type: 'Hotel',
            parityScore: 86.8,
            violations: 67,
            wlm: { win: 25, meet: 55, loss: 20, totalInstances: 100 },
            children: [
              { 
                id: 'channel-10', 
                name: 'Booking.com', 
                type: 'Channel', 
                parityScore: 88, 
                violations: 12,
                wlm: { win: 30, meet: 58, loss: 12, totalInstances: 100 }
              },
              { 
                id: 'channel-11', 
                name: 'TripAdvisor', 
                type: 'Channel', 
                parityScore: 85, 
                violations: 15,
                wlm: { win: 28, meet: 57, loss: 15, totalInstances: 100 }
              }
            ]
          }
        ]
      }
    ]
  }
]

export default function Overview() {
  // Tab state
  const [activeTab, setActiveTab] = useState<'overview' | 'drilldown'>('overview')
  
  // Date navigation for drilldown view
  const [dateOffset, setDateOffset] = useState(0)
  const visibleDays = 14

  // Initialize with next 30 days date range
  const [filters, setFilters] = useState<FilterState>({
    dateRange: getNext30DaysRange()
  })

  // Ensure date range is set on mount
  useEffect(() => {
    if (!filters.dateRange) {
      setFilters(prev => ({
        ...prev,
        dateRange: getNext30DaysRange()
      }))
    }
  }, [])

  // Generate dates from date range - default to Nov 14-28 for calendar view
  const generateDates = () => {
    // For calendar view, use Nov 14-28, 2024
    const dates: string[] = []
    const start = new Date('2024-11-14')
    const end = new Date('2024-11-28')
    const current = new Date(start)
    
    while (current <= end) {
      dates.push(current.toISOString().split('T')[0])
      current.setDate(current.getDate() + 1)
    }
    return dates
  }

  // Generate mock date data for hierarchy nodes recursively - always include parity score
  const generateDateDataForNode = (node: HierarchyNode, dates: string[]): Record<string, { wlm?: 'Win' | 'Loss' | 'Meet'; parityScore?: number }> => {
    const data: Record<string, { wlm?: 'Win' | 'Loss' | 'Meet'; parityScore?: number }> = {}
    const baseScore = node.parityScore !== undefined ? node.parityScore : 80
    
    dates.forEach((date, index) => {
      // Generate parity score with some variation based on date and node
      const hash = (node.id.charCodeAt(0) + date.charCodeAt(0) + index) % 20
      const variation = (hash - 10) * 1.5 // -15 to +15 variation
      const score = Math.max(0, Math.min(100, baseScore + variation))
      
      data[date] = { parityScore: score }
    })
    
    return data
  }

  // Generate date data for all nodes in hierarchy
  const generateAllDateData = (nodes: HierarchyNode[], dates: string[]): Map<string, Record<string, { wlm?: 'Win' | 'Loss' | 'Meet'; parityScore?: number }>> => {
    const dataMap = new Map<string, Record<string, { wlm?: 'Win' | 'Loss' | 'Meet'; parityScore?: number }>>()
    
    const traverse = (node: HierarchyNode) => {
      dataMap.set(node.id, generateDateDataForNode(node, dates))
      if (node.children) {
        node.children.forEach(traverse)
      }
    }
    
    nodes.forEach(traverse)
    return dataMap
  }

  const dates = generateDates() || []
  const allDateData = dates.length > 0 ? generateAllDateData(mockHierarchy, dates) : new Map()

  const navigate = useNavigate()
  const [selectedChannelForModal, setSelectedChannelForModal] = useState<ChannelParity | null>(null)

  const handleChannelClick = (channel: ChannelParity) => {
    setSelectedChannelForModal(channel)
  }
  
  const handleViewMoreDetails = (channel: string) => {
    navigate('/reports', { state: { channelFilter: channel } })
  }
  
  // Mock data for channel property details
  const getChannelPropertyDetails = (channel: ChannelParity) => {
    return [
      {
        propertyName: 'Hotel Manhattan',
        totalViolations: 45,
        rateViolations: 28,
        availabilityViolations: 17,
        revenueLoss: 1250.50,
        criticalIssues: 12
      },
      {
        propertyName: 'Hotel Central Park',
        totalViolations: 38,
        rateViolations: 22,
        availabilityViolations: 16,
        revenueLoss: 980.25,
        criticalIssues: 8
      },
      {
        propertyName: 'Hotel Times Square',
        totalViolations: 52,
        rateViolations: 35,
        availabilityViolations: 17,
        revenueLoss: 1650.75,
        criticalIssues: 15
      },
      {
        propertyName: 'Hotel Broadway',
        totalViolations: 31,
        rateViolations: 18,
        availabilityViolations: 13,
        revenueLoss: 720.40,
        criticalIssues: 6
      },
      {
        propertyName: 'Hotel Empire State',
        totalViolations: 42,
        rateViolations: 26,
        availabilityViolations: 16,
        revenueLoss: 1100.60,
        criticalIssues: 10
      }
    ]
  }

  const handleTopPropertyClick = (property: { name: string; violations: number; parityScore: number; trend?: number; type: 'property' | 'channel' }) => {
    setFilters({ ...filters, hotel: [property.name] })
  }

  const [dateRange, setDateRange] = useState<string>('7')
  const [viewBy, setViewBy] = useState<string>('Brand')
  const [viewByPath, setViewByPath] = useState<string[]>([])
  const [selectedChannels, setSelectedChannels] = useState<string[]>(['All'])
  const [customDateStart, setCustomDateStart] = useState<string>('')
  const [customDateEnd, setCustomDateEnd] = useState<string>('')
  const [isChannelDropdownOpen, setIsChannelDropdownOpen] = useState<boolean>(false)
  const [isDateRangeDropdownOpen, setIsDateRangeDropdownOpen] = useState<boolean>(false)
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState<boolean>(false)
  const channelDropdownRef = useRef<HTMLDivElement>(null)
  const dateRangeDropdownRef = useRef<HTMLDivElement>(null)
  
  // Additional filter states
  const [viewByCheapestOrProduct, setViewByCheapestOrProduct] = useState<string>('Product') // 'Cheapest' or 'Product'
  const [rateType, setRateType] = useState<string>('') // 'Lowest' or 'BAR'
  const [selectedRooms, setSelectedRooms] = useState<string[]>([])
  const [selectedInclusions, setSelectedInclusions] = useState<string[]>([])
  const [losValue, setLosValue] = useState<string>('Any')
  const [guestCount, setGuestCount] = useState<string>('Any')
  const [selectedCurrency, setSelectedCurrency] = useState<string>('')
  const [selectedPOS, setSelectedPOS] = useState<string>('')
  const [channelViewType, setChannelViewType] = useState<'type' | 'contract' | 'individual'>('individual')
  const [selectedChannelTypes, setSelectedChannelTypes] = useState<string[]>([])
  const [contractStatus, setContractStatus] = useState<string>('All')
  const [selectedIndividualChannels, setSelectedIndividualChannels] = useState<string[]>([])
  const [selectedGroupBy, setSelectedGroupBy] = useState<string>('Individual Channel')
  
  // Channel data with type and contract status
  const channelData = [
    { name: 'Booking.com', type: 'OTA', contractStatus: 'Contracted' },
    { name: 'Expedia', type: 'OTA', contractStatus: 'Contracted' },
    { name: 'Agoda', type: 'OTA', contractStatus: 'Contracted' },
    { name: 'TripAdvisor', type: 'OTA', contractStatus: 'Non-Contracted' },
    { name: 'Hotels.com', type: 'OTA', contractStatus: 'Contracted' },
    { name: 'Priceline', type: 'OTA', contractStatus: 'Non-Contracted' },
    { name: 'Trivago', type: 'Meta', contractStatus: 'Contracted' },
    { name: 'Google Hotels', type: 'Meta', contractStatus: 'Contracted' },
    { name: 'Kayak', type: 'Meta', contractStatus: 'Non-Contracted' },
    { name: 'Hotwire', type: 'OTA', contractStatus: 'Non-Contracted' }
  ]
  
  const individualChannels = channelData.map(c => c.name)
  
  // Get channels based on group selection
  const getChannelsForGroup = (group: string): string[] => {
    switch (group) {
      case 'OTA':
        return channelData.filter(c => c.type === 'OTA').map(c => c.name)
      case 'Meta':
        return channelData.filter(c => c.type === 'Meta').map(c => c.name)
      case 'Contracted':
        return channelData.filter(c => c.contractStatus === 'Contracted').map(c => c.name)
      case 'Non-Contracted':
        return channelData.filter(c => c.contractStatus === 'Non-Contracted').map(c => c.name)
      case 'Individual Channel':
        return [] // User can select individually
      default:
        return []
    }
  }
  
  // Handle group by selection
  const handleGroupBySelect = (group: string) => {
    setSelectedGroupBy(group)
    if (group === 'Individual Channel') {
      // Don't auto-select, let user choose
      setChannelViewType('individual')
    } else {
      const channels = getChannelsForGroup(group)
      setSelectedIndividualChannels(channels)
      if (group === 'OTA' || group === 'Meta') {
        setChannelViewType('type')
        setSelectedChannelTypes([group])
      } else {
        setChannelViewType('contract')
        setContractStatus(group)
      }
    }
  }
  const posOptions = ['US', 'EU', 'UK', 'CA', 'AU', 'IN', 'JP', 'CN', 'SG', 'HK', 'NZ', 'AE', 'MX', 'BR', 'ZA', 'DE', 'FR', 'IT', 'ES', 'NL']

  const availableChannels = ['All', 'Booking.com', 'Expedia', 'Agoda', 'TripAdvisor', 'Hotels.com', 'Priceline', 'Trivago']

  const handleChannelToggle = (channel: string) => {
    if (channel === 'All') {
      setSelectedChannels(['All'])
    } else {
      setSelectedChannels(prev => {
        const newChannels = prev.filter(c => c !== 'All')
        if (newChannels.includes(channel)) {
          return newChannels.filter(c => c !== channel)
        } else {
          return [...newChannels, channel]
        }
      })
    }
  }

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (channelDropdownRef.current && !channelDropdownRef.current.contains(event.target as Node)) {
        setIsChannelDropdownOpen(false)
      }
      if (dateRangeDropdownRef.current && !dateRangeDropdownRef.current.contains(event.target as Node)) {
        setIsDateRangeDropdownOpen(false)
      }
    }

    if (isChannelDropdownOpen || isDateRangeDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isChannelDropdownOpen, isDateRangeDropdownOpen])

  // Format date for display
  const formatDateRange = () => {
    if (dateRange === 'custom' && customDateStart && customDateEnd) {
      const start = new Date(customDateStart)
      const end = new Date(customDateEnd)
      return ` • ${start.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })} - ${end.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}`
    }
    return ''
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Overview</h1>
          <p className="text-sm text-gray-500 mt-1">Monitor and action rate parity issues across all channels</p>
        </div>
      </div>

      {/* Top Filters - Horizontal Button Style */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Date Range Button */}
        <div className="relative" ref={dateRangeDropdownRef}>
          <button
            type="button"
            onClick={() => setIsDateRangeDropdownOpen(!isDateRangeDropdownOpen)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Calendar className="w-4 h-4 text-gray-600" />
            <span>
              {dateRange === '7' && 'Next 7 Days'}
              {dateRange === '14' && 'Next 14 Days'}
              {dateRange === '30' && 'Next 30 Days'}
              {dateRange === '60' && 'Next 60 Days'}
              {dateRange === '90' && 'Next 90 Days'}
              {dateRange === 'custom' && 'Custom Range'}
              {formatDateRange()}
            </span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>
          {/* Date Range Dropdown */}
          {isDateRangeDropdownOpen && (
            <div className="absolute z-10 mt-1 w-48 bg-white border border-gray-300 rounded-lg shadow-lg">
              <div className="p-2">
                <button
                  onClick={() => {
                    setDateRange('7')
                    setIsDateRangeDropdownOpen(false)
                  }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded"
                >
                  Next 7 days
                </button>
                <button
                  onClick={() => {
                    setDateRange('14')
                    setIsDateRangeDropdownOpen(false)
                  }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded"
                >
                  Next 14 days
                </button>
                <button
                  onClick={() => {
                    setDateRange('30')
                    setIsDateRangeDropdownOpen(false)
                  }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded"
                >
                  Next 30 days
                </button>
                <button
                  onClick={() => {
                    setDateRange('60')
                    setIsDateRangeDropdownOpen(false)
                  }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded"
                >
                  Next 60 days
                </button>
                <button
                  onClick={() => {
                    setDateRange('90')
                    setIsDateRangeDropdownOpen(false)
                  }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded"
                >
                  Next 90 days
                </button>
                <button
                  onClick={() => {
                    setDateRange('custom')
                    setIsDateRangeDropdownOpen(false)
                  }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded"
                >
                  Custom
                </button>
              </div>
            </div>
          )}
        </div>

        {/* View By - Cheapest or Product */}
        <div className="relative">
          <select
            value={viewByCheapestOrProduct}
            onChange={(e) => setViewByCheapestOrProduct(e.target.value)}
            className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors appearance-none pr-8 cursor-pointer"
          >
            <option value="Product">View By Product</option>
            <option value="Cheapest">View By Cheapest</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>

        {/* View By - Hierarchical Selection */}
        <HierarchicalViewBy
          hierarchy={viewByHierarchy}
          selectedPath={viewByPath}
          onSelectionChange={(path) => {
            setViewByPath(path)
            // Update viewBy based on the deepest level selected
            if (path.length > 0) {
              const lastPath = path[path.length - 1]
              const parts = lastPath.split(' >> ')
              if (parts.length >= 6) {
                setViewBy('Hotel')
              } else if (parts.length >= 5) {
                setViewBy('City')
              } else if (parts.length >= 4) {
                setViewBy('Country')
              } else if (parts.length >= 3) {
                setViewBy('Region')
              } else if (parts.length >= 2) {
                setViewBy('Sub Brand')
              } else {
                setViewBy('Brand')
              }
            } else {
              setViewBy('Brand')
            }
          }}
        />

        {/* Channel Button */}
        <div className="relative" ref={channelDropdownRef}>
          <button
            type="button"
            onClick={() => setIsChannelDropdownOpen(!isChannelDropdownOpen)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Globe className="w-4 h-4 text-gray-600" />
            <span>
              {selectedIndividualChannels.length === 0
                ? 'All Channels'
                : selectedIndividualChannels.length === 1
                  ? selectedIndividualChannels[0]
                  : `${selectedIndividualChannels.length} Channels`}
            </span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>
          {isChannelDropdownOpen && (
            <div className="absolute z-10 mt-1 w-[500px] bg-white border border-gray-300 rounded-lg shadow-xl">
              <div className="flex" style={{ height: '300px' }}>
                {/* Left Column - Group By */}
                <div className="w-1/2 border-r border-gray-200 flex flex-col">
                  <div className="p-3 border-b border-gray-200 bg-gray-50">
                    <h4 className="text-sm font-semibold text-gray-900">Group By</h4>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    {['Individual Channel', 'OTA', 'Meta', 'Contracted', 'Non-Contracted'].map(group => (
                      <label
                        key={group}
                        className={`flex items-center gap-2 px-3 py-2.5 cursor-pointer border-b border-gray-100 hover:bg-gray-50 ${
                          selectedGroupBy === group ? 'bg-primary-50 border-primary-200' : ''
                        }`}
                      >
                        <input
                          type="radio"
                          name="groupBy"
                          value={group}
                          checked={selectedGroupBy === group}
                          onChange={() => handleGroupBySelect(group)}
                          className="w-4 h-4 border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className={`text-sm ${selectedGroupBy === group ? 'font-medium text-primary-700' : 'text-gray-700'}`}>
                          {group}
                        </span>
                      </label>
                    ))}
        </div>
      </div>

                {/* Right Column - Channel Names */}
                <div className="w-1/2 flex flex-col">
                  <div className="p-3 border-b border-gray-200 bg-gray-50">
                    <h4 className="text-sm font-semibold text-gray-900">Channels</h4>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    {selectedGroupBy === 'Individual Channel' ? (
                      <>
                        <label className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-50 border-b border-gray-100">
                          <input
                            type="checkbox"
                            checked={selectedIndividualChannels.length === 0}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedIndividualChannels([])
                              }
                            }}
                            className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="text-sm text-gray-700 font-medium">All</span>
                        </label>
                        {individualChannels.map(channel => (
                          <label
                            key={channel}
                            className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-50 border-b border-gray-100"
                          >
                            <input
                              type="checkbox"
                              checked={selectedIndividualChannels.includes(channel)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedIndividualChannels([...selectedIndividualChannels, channel])
                                } else {
                                  setSelectedIndividualChannels(selectedIndividualChannels.filter(c => c !== channel))
                                }
                              }}
                              className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                            <span className="text-sm text-gray-700">{channel}</span>
                          </label>
                        ))}
                      </>
                    ) : (
                      <>
                        {getChannelsForGroup(selectedGroupBy).map(channel => (
                          <label
                            key={channel}
                            className={`flex items-center gap-2 px-3 py-2 cursor-pointer border-b border-gray-100 ${
                              selectedIndividualChannels.includes(channel) ? 'bg-primary-50' : 'hover:bg-gray-50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={selectedIndividualChannels.includes(channel)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedIndividualChannels([...selectedIndividualChannels, channel])
                                } else {
                                  setSelectedIndividualChannels(selectedIndividualChannels.filter(c => c !== channel))
                                }
                              }}
                              className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                            <span className={`text-sm ${selectedIndividualChannels.includes(channel) ? 'font-medium text-primary-700' : 'text-gray-700'}`}>
                              {channel}
                            </span>
                          </label>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Filter Icon Button */}
        <button
          onClick={() => setIsFilterPanelOpen(true)}
          className="flex items-center justify-center px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Filter className="w-4 h-4" />
        </button>
      </div>

      {/* Filter Panel Modal */}
      {isFilterPanelOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-end">
          <div className="bg-white h-full w-full max-w-md shadow-xl overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-primary-600 to-primary-700 border-b border-primary-800 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Filter className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Advanced Filters</h2>
                  <p className="text-xs text-primary-100">Refine your data view</p>
                </div>
              </div>
              <button
                onClick={() => setIsFilterPanelOpen(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Clear All Button */}
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setRateType('')
                    setSelectedRooms([])
                    setSelectedInclusions([])
                    setLosValue('Any')
                    setGuestCount('Any')
                    setSelectedCurrency('')
                    setSelectedPOS('')
                    setSelectedChannelTypes([])
                    setContractStatus('All')
                    setChannelViewType('type')
                    setSelectedIndividualChannels([])
                  }}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Clear All Filters
                </button>
              </div>
              {/* View By - Cheapest or Product Filter */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <Info className="w-4 h-4 text-primary-600" />
                  <label className="block text-sm font-semibold text-gray-900">View By</label>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <label className={`flex items-center justify-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    viewByCheapestOrProduct === 'Cheapest'
                      ? 'border-primary-600 bg-primary-50 text-primary-700'
                      : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                  }`}>
                    <input
                      type="radio"
                      name="viewByCheapestOrProduct"
                      value="Cheapest"
                      checked={viewByCheapestOrProduct === 'Cheapest'}
                      onChange={(e) => setViewByCheapestOrProduct(e.target.value)}
                      className="sr-only"
                    />
                    <span className="text-sm font-medium">Cheapest</span>
                  </label>
                  <label className={`flex items-center justify-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    viewByCheapestOrProduct === 'Product'
                      ? 'border-primary-600 bg-primary-50 text-primary-700'
                      : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                  }`}>
                    <input
                      type="radio"
                      name="viewByCheapestOrProduct"
                      value="Product"
                      checked={viewByCheapestOrProduct === 'Product'}
                      onChange={(e) => setViewByCheapestOrProduct(e.target.value)}
                      className="sr-only"
                    />
                    <span className="text-sm font-medium">Product</span>
                  </label>
                </div>
              </div>

              {/* Rate Filter */}
              <div className={`bg-gray-50 rounded-lg p-4 border ${viewByCheapestOrProduct === 'Cheapest' ? 'border-gray-200 opacity-60' : 'border-gray-200'}`}>
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign className={`w-4 h-4 ${viewByCheapestOrProduct === 'Cheapest' ? 'text-gray-400' : 'text-primary-600'}`} />
                  <label className={`block text-sm font-semibold ${viewByCheapestOrProduct === 'Cheapest' ? 'text-gray-400' : 'text-gray-900'}`}>
                    Rate Type
                  </label>
                  {viewByCheapestOrProduct === 'Cheapest' && (
                    <span className="ml-auto text-xs text-gray-400 bg-gray-200 px-2 py-0.5 rounded">Disabled</span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <label className={`flex items-center justify-center p-2.5 rounded-lg border-2 cursor-pointer transition-all ${
                    viewByCheapestOrProduct === 'Cheapest'
                      ? 'border-gray-200 bg-gray-100 cursor-not-allowed opacity-50'
                      : rateType === 'Lowest'
                        ? 'border-primary-600 bg-primary-50 text-primary-700'
                        : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                  }`}>
                    <input
                      type="radio"
                      name="rateType"
                      value="Lowest"
                      checked={rateType === 'Lowest'}
                      onChange={(e) => setRateType(e.target.value)}
                      disabled={viewByCheapestOrProduct === 'Cheapest'}
                      className="sr-only"
                    />
                    <span className="text-sm font-medium">Lowest</span>
                  </label>
                  <label className={`flex items-center justify-center p-2.5 rounded-lg border-2 cursor-pointer transition-all ${
                    viewByCheapestOrProduct === 'Cheapest'
                      ? 'border-gray-200 bg-gray-100 cursor-not-allowed opacity-50'
                      : rateType === 'BAR'
                        ? 'border-primary-600 bg-primary-50 text-primary-700'
                        : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                  }`}>
                    <input
                      type="radio"
                      name="rateType"
                      value="BAR"
                      checked={rateType === 'BAR'}
                      onChange={(e) => setRateType(e.target.value)}
                      disabled={viewByCheapestOrProduct === 'Cheapest'}
                      className="sr-only"
                    />
                    <span className="text-sm font-medium">BAR</span>
                  </label>
                </div>
              </div>

              {/* Room Filter */}
              <div className={`bg-gray-50 rounded-lg p-4 border ${viewByCheapestOrProduct === 'Cheapest' ? 'border-gray-200 opacity-60' : 'border-gray-200'}`}>
                <div className="flex items-center gap-2 mb-3">
                  <Bed className={`w-4 h-4 ${viewByCheapestOrProduct === 'Cheapest' ? 'text-gray-400' : 'text-primary-600'}`} />
                  <label className={`block text-sm font-semibold ${viewByCheapestOrProduct === 'Cheapest' ? 'text-gray-400' : 'text-gray-900'}`}>
                    Room Type
                  </label>
                  {viewByCheapestOrProduct === 'Cheapest' && (
                    <span className="ml-auto text-xs text-gray-400 bg-gray-200 px-2 py-0.5 rounded">Disabled</span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {['Any', 'Standard', 'Deluxe', 'Suite', 'Executive', 'Presidential'].map(room => (
                    <label
                      key={room}
                      className={`flex items-center p-2 rounded-lg border cursor-pointer transition-all ${
                        viewByCheapestOrProduct === 'Cheapest'
                          ? 'border-gray-200 bg-gray-100 cursor-not-allowed opacity-50'
                          : selectedRooms.includes(room)
                            ? 'border-primary-600 bg-primary-50 text-primary-700'
                            : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedRooms.includes(room)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedRooms([...selectedRooms, room])
                          } else {
                            setSelectedRooms(selectedRooms.filter(r => r !== room))
                          }
                        }}
                        disabled={viewByCheapestOrProduct === 'Cheapest'}
                        className="sr-only"
                      />
                      <span className="text-xs font-medium">{room}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Inclusions Filter */}
              <div className={`bg-gray-50 rounded-lg p-4 border ${viewByCheapestOrProduct === 'Cheapest' ? 'border-gray-200 opacity-60' : 'border-gray-200'}`}>
                <div className="flex items-center gap-2 mb-3">
                  <UtensilsCrossed className={`w-4 h-4 ${viewByCheapestOrProduct === 'Cheapest' ? 'text-gray-400' : 'text-primary-600'}`} />
                  <label className={`block text-sm font-semibold ${viewByCheapestOrProduct === 'Cheapest' ? 'text-gray-400' : 'text-gray-900'}`}>
                    Inclusions
                  </label>
                  {viewByCheapestOrProduct === 'Cheapest' && (
                    <span className="ml-auto text-xs text-gray-400 bg-gray-200 px-2 py-0.5 rounded">Disabled</span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {['Room Only', 'Breakfast', 'Half Board', 'Full Board', 'All Inclusive'].map(inclusion => (
                    <label
                      key={inclusion}
                      className={`flex items-center p-2 rounded-lg border cursor-pointer transition-all ${
                        viewByCheapestOrProduct === 'Cheapest'
                          ? 'border-gray-200 bg-gray-100 cursor-not-allowed opacity-50'
                          : selectedInclusions.includes(inclusion)
                            ? 'border-primary-600 bg-primary-50 text-primary-700'
                            : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedInclusions.includes(inclusion)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedInclusions([...selectedInclusions, inclusion])
                          } else {
                            setSelectedInclusions(selectedInclusions.filter(i => i !== inclusion))
                          }
                        }}
                        disabled={viewByCheapestOrProduct === 'Cheapest'}
                        className="sr-only"
                      />
                      <span className="text-xs font-medium text-center w-full">{inclusion}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* LOS and Guest Filters - Side by Side */}
              <div className="grid grid-cols-2 gap-4">
                {/* LOS (Length of Stay) Filter */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <CalendarDays className="w-4 h-4 text-primary-600" />
                    <label className="block text-sm font-semibold text-gray-900">Length of Stay</label>
                  </div>
                  <select
                    value={losValue}
                    onChange={(e) => setLosValue(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="Any">Any</option>
                    {Array.from({ length: 30 }, (_, i) => i + 1).map(num => (
                      <option key={num} value={num.toString()}>{num} {num === 1 ? 'night' : 'nights'}</option>
                    ))}
                  </select>
                </div>

                {/* Guest Filter */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-primary-600" />
                    <label className="block text-sm font-semibold text-gray-900">Guests</label>
                  </div>
                  <select
                    value={guestCount}
                    onChange={(e) => setGuestCount(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="Any">Any</option>
                    {Array.from({ length: 10 }, (_, i) => i + 1).map(num => (
                      <option key={num} value={num.toString()}>{num} {num === 1 ? 'guest' : 'guests'}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Currency Filter */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <Coins className="w-4 h-4 text-primary-600" />
                  <label className="block text-sm font-semibold text-gray-900">Currency</label>
                </div>
                <select
                  value={selectedCurrency}
                  onChange={(e) => setSelectedCurrency(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">All Currencies</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="INR">INR (₹)</option>
                  <option value="JPY">JPY (¥)</option>
                  <option value="AUD">AUD (A$)</option>
                  <option value="CAD">CAD (C$)</option>
                  <option value="CHF">CHF</option>
                  <option value="CNY">CNY (¥)</option>
                  <option value="SGD">SGD</option>
                  <option value="HKD">HKD</option>
                  <option value="NZD">NZD</option>
                </select>
              </div>

              {/* POS Filter */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-primary-600" />
                  <label className="block text-sm font-semibold text-gray-900">Point of Sale (POS)</label>
                </div>
                <select
                  value={selectedPOS}
                  onChange={(e) => setSelectedPOS(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">All POS</option>
                  {posOptions.map(pos => (
                    <option key={pos} value={pos}>{pos}</option>
                  ))}
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setRateType('')
                    setSelectedRooms([])
                    setSelectedInclusions([])
                    setLosValue('Any')
                    setGuestCount('Any')
                    setSelectedCurrency('')
                    setSelectedPOS('')
                    setSelectedChannelTypes([])
                    setContractStatus('All')
                    setChannelViewType('type')
                    setSelectedIndividualChannels([])
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setIsFilterPanelOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'overview'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('drilldown')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'drilldown'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Drilldown View
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <>
      {/* Four Compact KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ParityScoreCard
          parityScore={mockParityScoreData.parityScore}
          instances={mockParityScoreData.instances}
          totalInstances={mockParityScoreData.totalInstances}
          delta={mockParityScoreData.delta}
          ota={mockParityScoreData.ota}
          meta={mockParityScoreData.meta}
        />
        <WLMCard
          rate={mockWLMData.rate}
          availability={mockWLMData.availability}
        />
        <RevenueLossCard
          estimatedLoss={mockRevenueLossData.estimatedLoss}
          delta={mockRevenueLossData.delta}
          period={mockRevenueLossData.period}
          rate={mockRevenueLossData.rate}
          availability={mockRevenueLossData.availability}
        />
        <BrandSoldOutCard
          percentage={mockBrandSoldOutData.percentage}
          instances={mockBrandSoldOutData.instances}
          totalInstances={mockBrandSoldOutData.totalInstances}
          delta={mockBrandSoldOutData.delta}
          period={mockBrandSoldOutData.period}
        />
      </div>

      {/* Trend Chart */}
      <ParityTrendChart data={mockTrendData} />

      {/* Four Cards: Overall Severity, Top Violation Reasons, Violation Status, Booking Window */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <OverallSeverityCard />
        <TopViolationReasonsCard />
        <ViolationStatusCard />
        <BookingWindowCard />
      </div>

          {/* Top Violations Panel - Highlighted */}
          <TopViolationsPanel
            topProperties={mockTopProperties}
            onPropertyClick={handleTopPropertyClick}
          />

          {/* Most Violated OTAs / Top Violating Metas Cards - Side by Side */}
          <MostViolatedCard otas={mockOTAs} metas={mockMetas} />

          {/* Channel Parity Grid */}
          <ChannelParityGrid channels={mockChannels} onChannelClick={handleChannelClick} />

          {/* Workflow Insights */}
      <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Workflow Insights</h2>
                <p className="text-sm text-gray-500 mt-0.5">Action coverage and booking status overview</p>
              </div>
            </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="p-3 rounded-lg border border-gray-200 bg-white">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-md border border-orange-200 bg-orange-50 flex items-center justify-center">
                    <Zap className="w-3.5 h-3.5 text-orange-600" />
          </div>
          <div>
                    <h3 className="text-sm font-semibold text-gray-900">{mockWorkflowInsights.buzzReason.title}</h3>
                    <p className="text-xs text-gray-500">Follow-ups and reasons coverage</p>
          </div>
        </div>
                <div className="h-36">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mockWorkflowInsights.buzzReason.items} margin={{ top: 12, right: 12, left: 0, bottom: 32 }}>
                      <XAxis
                        dataKey="label"
                        tick={{ fontSize: 10 }}
                        interval={0}
                        angle={-20}
                        textAnchor="end"
                        height={40}
                        tickFormatter={(value) => value.replace(/\s*\(.*?\)\s*/g, '').slice(0, 14)}
                      />
                      <Tooltip
                        cursor={{ fill: '#F3F4F6' }}
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: 8 }}
                        labelStyle={{ fontSize: 12, fontWeight: 600, color: '#111827' }}
                      />
                      <Bar dataKey="value" fill="#F97316" radius={[4, 4, 0, 0]}>
                        <LabelList dataKey="value" position="top" fontSize={10} fill="#111827" formatter={(value: number) => value.toLocaleString()} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
      </div>

              <div className="p-3 rounded-lg border border-gray-200 bg-white">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-md border border-purple-200 bg-purple-50 flex items-center justify-center">
                    <BookOpen className="w-3.5 h-3.5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">{mockWorkflowInsights.testBooking.title}</h3>
                    <p className="text-xs text-gray-500">Completion and state tracking</p>
                  </div>
                </div>
                <div className="h-36">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mockWorkflowInsights.testBooking.items} margin={{ top: 12, right: 12, left: 0, bottom: 32 }}>
                      <XAxis
                        dataKey="label"
                        tick={{ fontSize: 10 }}
                        interval={0}
                        angle={-20}
                        textAnchor="end"
                        height={40}
                        tickFormatter={(value) => value.replace(/\s*\(.*?\)\s*/g, '').slice(0, 14)}
                      />
                      <Tooltip
                        cursor={{ fill: '#F3F4F6' }}
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: 8 }}
                        labelStyle={{ fontSize: 12, fontWeight: 600, color: '#111827' }}
                      />
                      <Bar dataKey="value" fill="#7C3AED" radius={[4, 4, 0, 0]}>
                        <LabelList dataKey="value" position="top" fontSize={10} fill="#111827" formatter={(value: number) => value.toLocaleString()} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Channel Details Modal */}
      {selectedChannelForModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-primary-600 to-primary-700 border-b border-primary-800 px-6 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/20 text-white flex items-center justify-center font-bold text-lg">
                  {selectedChannelForModal.channel.charAt(0).toUpperCase()}
          </div>
          <div>
                  <h2 className="text-lg font-semibold text-white">{selectedChannelForModal.channel} - Channel Details</h2>
                  <p className="text-xs text-primary-100">Property-wise violation breakdown</p>
          </div>
        </div>
              <button
                onClick={() => setSelectedChannelForModal(null)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
      </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className="sticky top-0 bg-gray-50 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Property Name</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Total Violations</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Rate</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Availability</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Revenue Loss</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Critical Issues</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {getChannelPropertyDetails(selectedChannelForModal).map((property, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900">{property.propertyName}</span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-center">
                          <span className="text-sm text-gray-900 font-semibold">{property.totalViolations}</span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-center">
                          <span className="text-sm text-orange-700 font-medium">{property.rateViolations}</span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-center">
                          <span className="text-sm text-red-700 font-medium">{property.availabilityViolations}</span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-center">
                          <span className="text-sm text-red-600 font-semibold">
                            {selectedChannelForModal.currency === 'USD' ? '$' : selectedChannelForModal.currency === 'EUR' ? '€' : selectedChannelForModal.currency || '$'}
                            {property.revenueLoss.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            {property.criticalIssues}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-center">
                          <button
                            onClick={() => handleViewMoreDetails(selectedChannelForModal.channel)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
                          >
                            <span>View More Details</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'drilldown' && (
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Hierarchy View</h2>
            <p className="text-sm text-gray-500 mt-0.5">Explore brands, hotels, and channels</p>
          </div>
            {dates.length > 0 && (
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <span>
                  {dates.length > 0 && new Date(dates[0]).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {dates.length > 0 && new Date(dates[dates.length - 1]).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
        </div>
            )}
          </div>
          {dates.length > 0 && (
            <>
              <div className="mb-4 pb-2 border-b border-gray-200">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <span className="font-medium">Date Range:</span>
                  <span>
                    Showing {dateOffset + 1}-{Math.min(dateOffset + visibleDays, dates.length)} of {dates.length} days
                  </span>
                </div>
              </div>
              {/* Date Headers - Aligned exactly with date cells */}
              <div className="mb-2 pb-2 border-b border-gray-200">
                <div className="flex items-center">
                  <div className="w-5 flex-shrink-0"></div>
                  <div className="flex items-center min-w-0 flex-shrink-0" style={{ minWidth: '200px', maxWidth: '250px' }}></div>
                  <div className="flex items-center gap-2 flex-1 min-w-0" style={{ minWidth: '150px', maxWidth: '250px' }}></div>
                  <div className="flex items-center gap-1 flex-shrink-0" style={{ minWidth: '50px' }}></div>
                  <div className="flex items-center ml-4" style={{ width: `${visibleDays * 42 + 80}px` }}>
                    <div className="w-6 flex-shrink-0"></div>
                    <div className="flex items-center justify-start" style={{ width: `${visibleDays * 42}px` }}>
                      {dates.slice(dateOffset, dateOffset + visibleDays).map((date, index) => (
                        <div
                          key={date}
                          className="w-10 h-10 flex items-center justify-center text-center text-[10px] font-medium text-gray-600"
                          style={{ marginRight: index < visibleDays - 1 ? '2px' : '0' }}
                          title={new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        >
                          {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                      ))}
                    </div>
                    <div className="w-6 flex-shrink-0"></div>
                  </div>
          </div>
        </div>
            </>
          )}
          <div className="space-y-2">
          {mockHierarchy.map((brand) => (
              <HierarchyDrilldown 
                key={brand.id} 
                node={brand}
                dates={dates}
                getDateData={(nodeId) => allDateData.get(nodeId) || {}}
                dateOffset={dateOffset}
                onDateOffsetChange={setDateOffset}
                visibleDays={visibleDays}
              />
          ))}
        </div>
      </div>
      )}
    </div>
  )
}