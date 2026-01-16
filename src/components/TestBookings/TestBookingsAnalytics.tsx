import { useMemo, useState } from 'react'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend, LineChart, Line, CartesianGrid, AreaChart, Area, LabelList } from 'recharts'
import { TestBooking } from '../../types'
import KPICard from '../Dashboard/KPICard'
import { FileText, CheckCircle, XCircle, DollarSign, ChevronDown, BarChart3, Building2 } from 'lucide-react'

interface TestBookingsAnalyticsProps {
  bookings: TestBooking[]
}

interface FailedBooking {
  id: string
  bookingId: string
  hotel: string
  date: string
  reason: string
  wholesalerOta: string
}

// Mock failed bookings data
const mockFailedBookings: FailedBooking[] = Array.from({ length: 15 }, (_, i) => ({
  id: `failed-${i}`,
  bookingId: `TB-${String(i + 100).padStart(6, '0')}`,
  hotel: `Hotel ${i % 10 + 1}`,
  date: new Date(Date.now() - i * 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  reason: ['Payment Failed', 'Inventory Unavailable', 'Rate Changed', 'System Error', 'Timeout'][i % 5],
  wholesalerOta: ['Wholesaler A', 'Wholesaler B', 'Booking.com', 'Expedia'][i % 4]
}))

type TimePeriod = 'Daily' | 'Weekly' | 'Monthly' | 'Yearly'

export default function TestBookingsAnalytics({ bookings }: TestBookingsAnalyticsProps) {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('Monthly')
  const [selectedHotel, setSelectedHotel] = useState<string>('All Hotels')
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }
  
  // Calculate KPIs
  const kpis = useMemo(() => {
    const total = bookings.length
    const open = bookings.filter(b => b.status === 'Open').length
    const closedByUser = bookings.filter(b => b.status === 'Closed by User').length
    const closedByRateGain = bookings.filter(b => b.status === 'Closed by RateGain').length
    const totalViolations = bookings.reduce((sum, b) => sum + b.totalViolations, 0)
    const unattendedViolations = bookings.reduce((sum, b) => sum + b.unattendedViolations, 0)
    const totalLeakage = bookings.reduce((sum, b) => sum + b.leakage, 0)
    const failedCount = mockFailedBookings.length
    const successRate = total > 0 ? ((total - failedCount) / total * 100).toFixed(1) : '0'
    
    // New metrics
    const totalContractedBookings = 1000 // Total contracted bookings for the year
    const testBookingsCompleted = closedByUser + closedByRateGain
    const remainingBookings = totalContractedBookings - testBookingsCompleted - failedCount

    return {
      total,
      open,
      closedByUser,
      closedByRateGain,
      totalViolations,
      unattendedViolations,
      totalLeakage,
      failedCount,
      successRate,
      totalContractedBookings,
      testBookingsCompleted,
      remainingBookings
    }
  }, [bookings])


  // Leakage by Wholesaler/OTA
  const leakageByWholesaler = useMemo(() => {
    const grouped = bookings.reduce((acc, booking) => {
      if (!acc[booking.wholesalerOta]) {
        acc[booking.wholesalerOta] = 0
      }
      acc[booking.wholesalerOta] += booking.leakage
      return acc
    }, {} as Record<string, number>)

    return Object.entries(grouped).map(([name, value]) => ({
      name,
      leakage: Number(value.toFixed(2))
    })).sort((a, b) => b.leakage - a.leakage)
  }, [bookings])

  // Violations by Wholesaler/OTA
  const violationsByWholesaler = useMemo(() => {
    const grouped = bookings.reduce((acc, booking) => {
      if (!acc[booking.wholesalerOta]) {
        acc[booking.wholesalerOta] = { total: 0, unattended: 0 }
      }
      acc[booking.wholesalerOta].total += booking.totalViolations
      acc[booking.wholesalerOta].unattended += booking.unattendedViolations
      return acc
    }, {} as Record<string, { total: number; unattended: number }>)

    return Object.entries(grouped).map(([name, data]) => ({
      name,
      total: data.total,
      unattended: data.unattended
    })).sort((a, b) => b.total - a.total)
  }, [bookings])

  // Regional distribution
  const regionalData = useMemo(() => {
    const grouped = bookings.reduce((acc, booking) => {
      const key = `${booking.region} - ${booking.country}`
      if (!acc[key]) {
        acc[key] = 0
      }
      acc[key] += 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(grouped).map(([name, value]) => ({
      name,
      count: value
    })).sort((a, b) => b.count - a.count).slice(0, 5)
  }, [bookings])

  // Failed bookings by reason
  const failedByReason = useMemo(() => {
    const grouped = mockFailedBookings.reduce((acc, booking) => {
      if (!acc[booking.reason]) {
        acc[booking.reason] = 0
      }
      acc[booking.reason] += 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(grouped)
      .map(([name, value]) => ({
        name,
        count: value
      }))
      .sort((a, b) => b.count - a.count) // Sort by count descending
  }, [])

  // Property-wise consumption data for table
  const propertyConsumptionData = useMemo(() => {
    const propertyMap = new Map<string, { 
      hotel: string
      consumedBookings: number
      failedBookings: number
      totalBookings: number
      remainingBookings: number
      leakage: number
    }>()
    
    // Calculate consumed, failed bookings and leakage per property
    bookings.forEach(booking => {
      const existing = propertyMap.get(booking.hotel) || { 
        hotel: booking.hotel, 
        consumedBookings: 0,
        failedBookings: 0,
        totalBookings: 0,
        remainingBookings: 0,
        leakage: 0 
      }
      
      // Count completed bookings (closed by user or RateGain)
      if (booking.status === 'Closed by User' || booking.status === 'Closed by RateGain') {
        existing.consumedBookings += 1
      }
      existing.leakage += booking.leakage
      propertyMap.set(booking.hotel, existing)
    })
    
    // Count failed bookings from mockFailedBookings
    mockFailedBookings.forEach(failedBooking => {
      const existing = propertyMap.get(failedBooking.hotel) || {
        hotel: failedBooking.hotel,
        consumedBookings: 0,
        failedBookings: 0,
        totalBookings: 0,
        remainingBookings: 0,
        leakage: 0
      }
      existing.failedBookings += 1
      propertyMap.set(failedBooking.hotel, existing)
    })
    
    // Calculate total bookings per property (assume 100 per property as base, with some variation)
    const propertyData = Array.from(propertyMap.values()).map(property => {
      // Total bookings = consumed + failed + remaining (with some buffer)
      // For demo: assume total is at least consumed + failed + some remaining
      const baseTotal = Math.max((property.consumedBookings + property.failedBookings) * 5, 50) // At least 5x (consumed + failed) or 50, whichever is higher
      const totalBookings = baseTotal + Math.floor(Math.random() * 50) // Add some variation
      const remainingBookings = Math.max(0, totalBookings - property.consumedBookings - property.failedBookings)
      
      return {
        ...property,
        totalBookings,
        remainingBookings
      }
    })
    
    // Sort by most consumed bookings first
    return propertyData.sort((a, b) => b.consumedBookings - a.consumedBookings)
  }, [bookings])


  // OTA names
  const otaNames = ['Booking.com', 'Expedia', 'Agoda', 'Hotels.com', 'TripAdvisor', 'Priceline', 'Hotwire', 'MakeMyTrip']
  
  // Wholesaler names
  const wholesalerNames = ['Wholesaler A', 'Wholesaler B', 'Wholesaler C', 'Wholesaler D', 'Wholesaler E', 'Wholesaler F']

  // Top OTA booked - Time series data
  const topOTABooked = useMemo(() => {
    const now = new Date()
    const dataPoints = 12 // 12 months or weeks
    const data: any[] = []
    
    // Generate time periods based on timePeriod state
    const periods: string[] = []
    for (let i = dataPoints - 1; i >= 0; i--) {
      const date = new Date(now)
      if (timePeriod === 'Monthly') {
        date.setMonth(date.getMonth() - i)
        periods.push(date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }))
      } else if (timePeriod === 'Weekly') {
        date.setDate(date.getDate() - (i * 7))
        periods.push(`Week ${Math.ceil((date.getTime() - new Date(date.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000))}, ${date.getFullYear()}`)
      } else if (timePeriod === 'Daily') {
        date.setDate(date.getDate() - i)
        periods.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))
      } else {
        date.setFullYear(date.getFullYear() - i)
        periods.push(String(date.getFullYear()))
      }
    }
    
    // Generate data for each period
    periods.forEach((period) => {
      const dataPoint: any = { period }
      
      // Generate data for top 5 OTAs
      otaNames.slice(0, 5).forEach((ota, index) => {
        const baseBookings = 10 + Math.random() * 20
        const baseLeakage = 100 + Math.random() * 200
        dataPoint[ota] = Math.floor(baseBookings)
        dataPoint[`${ota}_leakage`] = Number(baseLeakage.toFixed(2))
      })
      
      data.push(dataPoint)
    })
    
    return data
  }, [bookings, timePeriod])

  // Top wholesalers violating rates - Time series data
  const topViolatingWholesalers = useMemo(() => {
    const now = new Date()
    const dataPoints = 12
    const data: any[] = []
    
    // Generate time periods
    const periods: string[] = []
    for (let i = dataPoints - 1; i >= 0; i--) {
      const date = new Date(now)
      if (timePeriod === 'Monthly') {
        date.setMonth(date.getMonth() - i)
        periods.push(date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }))
      } else if (timePeriod === 'Weekly') {
        date.setDate(date.getDate() - (i * 7))
        periods.push(`Week ${Math.ceil((date.getTime() - new Date(date.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000))}, ${date.getFullYear()}`)
      } else if (timePeriod === 'Daily') {
        date.setDate(date.getDate() - i)
        periods.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))
      } else {
        date.setFullYear(date.getFullYear() - i)
        periods.push(String(date.getFullYear()))
      }
    }
    
    // Generate data for each period
    periods.forEach((period) => {
      const dataPoint: any = { period }
      
      // Generate data for top 5 Wholesalers
      wholesalerNames.slice(0, 5).forEach((wholesaler, index) => {
        const baseViolations = 5 + Math.random() * 15
        const baseLeakage = 150 + Math.random() * 250
        dataPoint[wholesaler] = Math.floor(baseViolations)
        dataPoint[`${wholesaler}_leakage`] = Number(baseLeakage.toFixed(2))
      })
      
      data.push(dataPoint)
    })
    
    return data
  }, [bookings, timePeriod])

  // Get unique hotels
  const hotels = useMemo(() => {
    const hotelSet = new Set(bookings.map(b => b.hotel))
    return ['All Hotels', ...Array.from(hotelSet).sort()]
  }, [bookings])

  // Time-series data for bookings over time
  const bookingsTimeSeries = useMemo(() => {
    const data: Array<{
      period: string
      totalContracted: number
      bookingsDone: number
      failedBookings: number
      remaining: number
    }> = []

    const now = new Date()
    let periods: string[] = []
    let periodCount = 0

    switch (timePeriod) {
      case 'Daily':
        periodCount = 30
        for (let i = periodCount - 1; i >= 0; i--) {
          const date = new Date(now)
          date.setDate(date.getDate() - i)
          periods.push(date.toISOString().split('T')[0])
        }
        break
      case 'Weekly':
        periodCount = 12
        for (let i = periodCount - 1; i >= 0; i--) {
          const date = new Date(now)
          date.setDate(date.getDate() - (i * 7))
          const weekStart = new Date(date)
          weekStart.setDate(date.getDate() - date.getDay())
          periods.push(`Week ${Math.ceil((date.getTime() - new Date(date.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000))}, ${date.getFullYear()}`)
        }
        break
      case 'Monthly':
        periodCount = 12
        for (let i = periodCount - 1; i >= 0; i--) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
          periods.push(date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }))
        }
        break
      case 'Yearly':
        periodCount = 5
        for (let i = periodCount - 1; i >= 0; i--) {
          periods.push(String(now.getFullYear() - i))
        }
        break
    }

    // Filter bookings by selected hotel
    const filteredBookings = selectedHotel === 'All Hotels' 
      ? bookings 
      : bookings.filter(b => b.hotel === selectedHotel)

    periods.forEach((period, index) => {
      let totalContracted = 0
      let bookingsDone = 0
      let failedBookings = 0

      if (selectedHotel === 'All Hotels') {
        // Aggregate data for all hotels
        const baseContracted = timePeriod === 'Yearly' ? 1000 : timePeriod === 'Monthly' ? 83 : timePeriod === 'Weekly' ? 19 : 3
        totalContracted = baseContracted + Math.floor(Math.random() * baseContracted * 0.2)
        bookingsDone = Math.floor(totalContracted * (0.6 + Math.random() * 0.3))
        failedBookings = Math.floor(bookingsDone * (0.1 + Math.random() * 0.1))
      } else {
        // Calculate actual data for selected hotel based on bookings
        const periodBookings = filteredBookings.filter(b => {
          const checkInDate = new Date(b.dates.checkIn)
          let matches = false

          switch (timePeriod) {
            case 'Daily':
              matches = checkInDate.toISOString().split('T')[0] === period
              break
            case 'Weekly':
              const weekNum = Math.ceil((checkInDate.getTime() - new Date(checkInDate.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000))
              matches = `Week ${weekNum}, ${checkInDate.getFullYear()}` === period
              break
            case 'Monthly':
              matches = checkInDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) === period
              break
            case 'Yearly':
              matches = String(checkInDate.getFullYear()) === period
              break
          }
          return matches
        })

        // Calculate contracted bookings (simulated based on actual bookings)
        const baseContracted = timePeriod === 'Yearly' ? 200 : timePeriod === 'Monthly' ? 17 : timePeriod === 'Weekly' ? 4 : 1
        totalContracted = Math.max(periodBookings.length, baseContracted + Math.floor(Math.random() * baseContracted * 0.3))
        
        // Bookings done = completed bookings (closed by user or rategain)
        bookingsDone = periodBookings.filter(b => 
          b.status === 'Closed by User' || b.status === 'Closed by RateGain'
        ).length
        
        // Failed bookings from mock data for this period
        const periodFailed = mockFailedBookings.filter(fb => {
          const failedDate = new Date(fb.date)
          let matches = false
          
          switch (timePeriod) {
            case 'Daily':
              matches = failedDate.toISOString().split('T')[0] === period && fb.hotel === selectedHotel
              break
            case 'Weekly':
              const weekNum = Math.ceil((failedDate.getTime() - new Date(failedDate.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000))
              matches = `Week ${weekNum}, ${failedDate.getFullYear()}` === period && fb.hotel === selectedHotel
              break
            case 'Monthly':
              matches = failedDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) === period && fb.hotel === selectedHotel
              break
            case 'Yearly':
              matches = String(failedDate.getFullYear()) === period && fb.hotel === selectedHotel
              break
          }
          return matches
        }).length
        
        failedBookings = periodFailed
      }

      // Remaining = Total - Done - Failed
      const remaining = totalContracted - bookingsDone - failedBookings

      data.push({
        period,
        totalContracted,
        bookingsDone,
        failedBookings,
        remaining: Math.max(0, remaining)
      })
    })

    return data
  }, [timePeriod, bookings, selectedHotel])

  // Trend data (last 7 days)
  const trendData = useMemo(() => {
    const days = 7
    const data = []
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      const dayBookings = bookings.filter(b => {
        const checkIn = new Date(b.dates.checkIn)
        return checkIn.toISOString().split('T')[0] === dateStr
      })
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        bookings: dayBookings.length,
        violations: dayBookings.reduce((sum, b) => sum + b.totalViolations, 0),
        leakage: dayBookings.reduce((sum, b) => sum + b.leakage, 0)
      })
    }
    return data
  }, [bookings])

  return (
    <div className="space-y-4">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Bookings Card */}
        <div className="card">
          <div className="flex items-start justify-between p-4 border-l-4 border-l-green-500 bg-gradient-to-br from-green-50/50 to-white relative overflow-hidden rounded-lg">
            <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
              <div className="w-full h-full bg-green-100 rounded-full -mr-16 -mt-16"></div>
            </div>
            <div className="relative flex items-start justify-between w-full">
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-600 mb-1.5">Test Bookings Completed</p>
                <p className="text-2xl font-bold text-gray-900 mb-1 tracking-tight">
                  {kpis.testBookingsCompleted}<span className="text-base text-gray-500 font-normal">/{kpis.totalContractedBookings.toLocaleString()}</span>
                </p>
                <p className="text-[10px] text-gray-500 font-medium mb-3">{((kpis.testBookingsCompleted / kpis.totalContractedBookings) * 100).toFixed(1)}% of quota</p>
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[10px] text-gray-500 mb-0.5">Failed Bookings</p>
                      <p className="text-base font-bold text-gray-900">
                        {kpis.failedCount}<span className="text-xs text-gray-500 font-normal">/{kpis.totalContractedBookings.toLocaleString()}</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 mb-0.5">Remaining Bookings</p>
                      <p className="text-base font-bold text-gray-900">
                        {kpis.remainingBookings}<span className="text-xs text-gray-500 font-normal">/{kpis.totalContractedBookings.toLocaleString()}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="ml-3 p-2 rounded-lg bg-green-100 text-green-600 flex-shrink-0">
                <CheckCircle className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Leakage Card */}
        <div className="card">
          <div className="flex items-start justify-between p-4 border-l-4 border-l-purple-500 bg-gradient-to-br from-purple-50/50 to-white relative overflow-hidden rounded-lg">
            <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
              <div className="w-full h-full bg-purple-100 rounded-full -mr-16 -mt-16"></div>
            </div>
            <div className="relative flex items-start justify-between w-full">
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-600 mb-1.5">Revenue Leakage</p>
                <p className="text-2xl font-bold text-purple-600 mb-1 tracking-tight">${kpis.totalLeakage.toFixed(2)}</p>
                <p className="text-[10px] text-gray-500 font-medium mt-1.5">
                  Average: ${kpis.total > 0 ? (kpis.totalLeakage / kpis.total).toFixed(2) : '0.00'} per booking
                </p>
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[10px] text-gray-500 mb-0.5">Total Violations</p>
                      <p className="text-base font-bold text-gray-900">{kpis.totalViolations}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 mb-0.5">Unattended</p>
                      <p className="text-base font-bold text-orange-600">{kpis.unattendedViolations}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="ml-3 p-2 rounded-lg bg-purple-100 text-purple-600 flex-shrink-0">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bookings Over Time Chart */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-primary-100 text-primary-600">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Bookings Over Time</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {selectedHotel === 'All Hotels' 
                  ? 'Track bookings across all hotels'
                  : `Track bookings for ${selectedHotel}`
                }
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {/* Hotel Selector */}
            <div className="relative">
              <select
                value={selectedHotel}
                onChange={(e) => setSelectedHotel(e.target.value)}
                className="flex items-center space-x-2 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors appearance-none pr-8 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                {hotels.map((hotel) => (
                  <option key={hotel} value={hotel}>
                    {hotel}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
            
            {/* Time Period Buttons */}
            <div className="flex items-center space-x-1 bg-surface-elevated rounded-lg p-1 border border-border-light">
              {(['Daily', 'Weekly', 'Monthly', 'Yearly'] as TimePeriod[]).map((period) => (
                <button
                  key={period}
                  onClick={() => setTimePeriod(period)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-nav ${
                    timePeriod === period
                      ? 'bg-primary-600 text-white shadow-soft'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-surface-hover'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={bookingsTimeSeries} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="colorContracted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorDone" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorFailed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorRemaining" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
            <XAxis 
              dataKey="period" 
              stroke="#9ca3af"
              tick={{ fill: '#6b7280', fontSize: 11, fontWeight: 500 }}
              axisLine={{ stroke: '#e5e7eb' }}
              angle={timePeriod === 'Yearly' ? 0 : -45}
              textAnchor={timePeriod === 'Yearly' ? 'middle' : 'end'}
              height={timePeriod === 'Yearly' ? 30 : 60}
            />
            <YAxis 
              stroke="#9ca3af"
              tick={{ fill: '#6b7280', fontSize: 11, fontWeight: 500 }}
              axisLine={{ stroke: '#e5e7eb' }}
              label={{ value: 'Bookings', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#6b7280' } }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                padding: '12px'
              }}
              labelStyle={{ color: '#374151', fontWeight: 600, marginBottom: '4px' }}
              formatter={(value: number, name: string) => {
                const formattedName = name === 'totalContracted' ? 'Total Contracted' :
                                     name === 'bookingsDone' ? 'Bookings Done' :
                                     name === 'failedBookings' ? 'Failed Bookings' :
                                     'Remaining'
                return [value.toLocaleString(), formattedName]
              }}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="square"
            />
            <Area 
              type="monotone" 
              dataKey="totalContracted" 
              stackId="1"
              stroke="#3b82f6" 
              fill="url(#colorContracted)" 
              strokeWidth={2.5}
              name="Total Contracted"
            />
            <Area 
              type="monotone" 
              dataKey="bookingsDone" 
              stackId="1"
              stroke="#22c55e" 
              fill="url(#colorDone)" 
              strokeWidth={2.5}
              name="Bookings Done"
            />
            <Area 
              type="monotone" 
              dataKey="failedBookings" 
              stackId="1"
              stroke="#ef4444" 
              fill="url(#colorFailed)" 
              strokeWidth={2.5}
              name="Failed Bookings"
            />
            <Area 
              type="monotone" 
              dataKey="remaining" 
              stackId="1"
              stroke="#f97316" 
              fill="url(#colorRemaining)" 
              strokeWidth={2.5}
              name="Remaining"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Property-wise Consumption Table & Failed Bookings by Reason */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Property-wise Consumption Table */}
        <div className="card p-4 bg-gradient-to-br from-white to-gray-50/50 h-[400px] flex flex-col">
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="w-4 h-4 text-primary-600" />
              <h3 className="text-xs font-bold text-gray-900">Property-wise Consumption</h3>
            </div>
            <p className="text-[10px] text-gray-500">Bookings consumption and revenue leakage by property</p>
          </div>
          
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
            <div className="overflow-x-auto flex-1 min-h-0">
              <div className="min-w-full h-full flex flex-col">
                {/* Table Header */}
                <div className="grid grid-cols-3 gap-3 px-3 py-2 bg-gray-50 rounded-t-lg border-b border-gray-200 flex-shrink-0">
                  <div className="text-xs font-semibold text-gray-700">Property</div>
                  <div className="text-center text-xs font-semibold text-gray-700">Total Bookings</div>
                  <div className="text-center text-xs font-semibold text-gray-700">Revenue Leakage</div>
                </div>
                
                {/* Table Body - Scrollable */}
                <div className="flex-1 overflow-y-auto min-h-0">
                  {propertyConsumptionData.length === 0 ? (
                    <div className="text-center py-8 text-xs text-gray-500">
                      No property data available
                    </div>
                  ) : (
                    propertyConsumptionData.map((property, index) => {
                      const total = property.totalBookings
                      const consumedPercent = total > 0 ? (property.consumedBookings / total) * 100 : 0
                      const failedPercent = total > 0 ? (property.failedBookings / total) * 100 : 0
                      const remainingPercent = total > 0 ? (property.remainingBookings / total) * 100 : 0
                      
                      return (
                        <div
                          key={`property-${index}-${property.hotel}`}
                          className="w-full text-left grid grid-cols-3 gap-3 px-3 py-2 hover:bg-gray-50 transition-colors items-center border-b border-gray-100 last:border-b-0"
                        >
                          {/* Property Name */}
                          <div className="min-w-0">
                            <span className="text-xs font-semibold text-gray-900 truncate">{property.hotel}</span>
                          </div>

                          {/* Total Bookings Bar */}
                          <div className="flex flex-col items-center space-y-1">
                            <div className="w-full max-w-[200px]">
                              <div className="h-4 rounded overflow-hidden flex border border-gray-200 w-full">
                                {/* Consumed Bookings - Green */}
                                {consumedPercent > 0 && (
                                  <div 
                                    className="bg-green-500 flex items-center justify-center transition-all hover:bg-green-600"
                                    style={{ width: `${consumedPercent}%` }}
                                    title={`Consumed: ${property.consumedBookings} (${consumedPercent.toFixed(1)}%)`}
                                  >
                                    {consumedPercent > 8 && (
                                      <span className="text-[8px] font-bold text-white px-0.5">
                                        {property.consumedBookings}
                                      </span>
                                    )}
                                  </div>
                                )}
                                {/* Failed Bookings - Red */}
                                {failedPercent > 0 && (
                                  <div 
                                    className="bg-red-500 flex items-center justify-center transition-all hover:bg-red-600"
                                    style={{ width: `${failedPercent}%` }}
                                    title={`Failed: ${property.failedBookings} (${failedPercent.toFixed(1)}%)`}
                                  >
                                    {failedPercent > 8 && (
                                      <span className="text-[8px] font-bold text-white px-0.5">
                                        {property.failedBookings}
                                      </span>
                                    )}
                                  </div>
                                )}
                                {/* Remaining Bookings - Orange/Yellow */}
                                {remainingPercent > 0 && (
                                  <div 
                                    className="bg-orange-400 flex items-center justify-center transition-all hover:bg-orange-500"
                                    style={{ width: `${remainingPercent}%` }}
                                    title={`Remaining: ${property.remainingBookings} (${remainingPercent.toFixed(1)}%)`}
                                  >
                                    {remainingPercent > 8 && (
                                      <span className="text-[8px] font-bold text-white px-0.5">
                                        {property.remainingBookings}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-[9px] text-gray-600">
                              <span className="font-medium">Total: {total}</span>
                              <span className="text-gray-400">|</span>
                              <span className="text-green-600">C: {property.consumedBookings}</span>
                              <span className="text-red-600">F: {property.failedBookings}</span>
                              <span className="text-orange-600">R: {property.remainingBookings}</span>
                            </div>
                          </div>

                          {/* Revenue Leakage */}
                          <div className="text-center">
                            <span className="text-xs font-semibold text-red-600">
                              {formatCurrency(property.leakage)}
                            </span>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Failed Bookings by Reason */}
        <div className="card p-3 bg-gradient-to-br from-white to-gray-50/50 h-[400px] flex flex-col">
          <div className="mb-3">
            <h3 className="text-xs font-bold text-gray-900">Failed Bookings by Reason</h3>
            <p className="text-[10px] text-gray-500 mt-0.5">Distribution of failed bookings by failure reason</p>
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
            <BarChart data={failedByReason} layout="vertical" margin={{ top: 5, right: 50, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
              <XAxis 
                type="number" 
                hide
              />
              <YAxis 
                type="category" 
                dataKey="name" 
                width={120}
                tick={{ fontSize: 10, fill: '#4b5563', fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  fontSize: '11px', 
                  padding: '8px'
                }}
                cursor={{ fill: 'rgba(239, 68, 68, 0.1)' }}
                formatter={(value: number) => [value, 'Count']}
              />
              <Bar 
                dataKey="count" 
                radius={[0, 6, 6, 0]} 
                barSize={26}
                animationDuration={800}
              >
                {failedByReason.map((entry, index) => {
                  const colors = ['#ef4444', '#dc2626', '#b91c1c', '#991b1b']
                  return (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={colors[index % colors.length]}
                      style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
                    />
                  )
                })}
                <LabelList 
                  dataKey="count" 
                  position="right" 
                  style={{ fontSize: '10px', fill: '#1f2937', fontWeight: 600 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2 - Top OTA & Top Violating Wholesalers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top OTA Booked */}
        <div className="card p-3 bg-gradient-to-br from-white to-gray-50/50">
          <div className="mb-3">
            <h3 className="text-xs font-bold text-gray-900">Top OTA Booked</h3>
            <p className="text-[10px] text-gray-500 mt-0.5">Bookings over time by OTA</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={topOTABooked} margin={{ top: 5, right: 30, left: 0, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
              <XAxis 
                dataKey="period" 
                angle={timePeriod === 'Yearly' ? 0 : -45} 
                textAnchor={timePeriod === 'Yearly' ? 'middle' : 'end'} 
                height={timePeriod === 'Yearly' ? 30 : 60}
                tick={{ fontSize: 9, fill: '#6b7280', fontWeight: 500 }}
                stroke="#9ca3af"
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis 
                tick={{ fontSize: 9, fill: '#6b7280', fontWeight: 500 }}
                stroke="#9ca3af"
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  padding: '12px',
                  fontSize: '11px'
                }}
                labelStyle={{ color: '#374151', fontWeight: 600, marginBottom: '4px' }}
              />
              <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} iconSize={8} iconType="line" />
              {otaNames.slice(0, 5).map((ota, index) => {
                const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
                return (
                  <Line 
                    key={ota} 
                    type="monotone" 
                    dataKey={ota} 
                    stroke={colors[index % colors.length]} 
                    strokeWidth={2.5}
                    dot={{ fill: colors[index % colors.length], r: 4, strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                    name={ota}
                  />
                )
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top Wholesalers Violating Rates */}
        <div className="card p-3 bg-gradient-to-br from-white to-gray-50/50">
          <div className="mb-3">
            <h3 className="text-xs font-bold text-gray-900">Top Wholesalers Violating Rates</h3>
            <p className="text-[10px] text-gray-500 mt-0.5">Violations over time by wholesaler</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={topViolatingWholesalers} margin={{ top: 5, right: 30, left: 0, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
              <XAxis 
                dataKey="period" 
                angle={timePeriod === 'Yearly' ? 0 : -45} 
                textAnchor={timePeriod === 'Yearly' ? 'middle' : 'end'} 
                height={timePeriod === 'Yearly' ? 30 : 60}
                tick={{ fontSize: 9, fill: '#6b7280', fontWeight: 500 }}
                stroke="#9ca3af"
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis 
                tick={{ fontSize: 9, fill: '#6b7280', fontWeight: 500 }}
                stroke="#9ca3af"
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  padding: '12px',
                  fontSize: '11px'
                }}
                labelStyle={{ color: '#374151', fontWeight: 600, marginBottom: '4px' }}
              />
              <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} iconSize={8} iconType="line" />
              {wholesalerNames.slice(0, 5).map((wholesaler, index) => {
                const colors = ['#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16']
                return (
                  <Line 
                    key={wholesaler} 
                    type="monotone" 
                    dataKey={wholesaler} 
                    stroke={colors[index % colors.length]} 
                    strokeWidth={2.5}
                    dot={{ fill: colors[index % colors.length], r: 4, strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                    name={wholesaler}
                  />
                )
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  )
}
