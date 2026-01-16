import { useState, useRef, useEffect } from 'react'
import { Calendar, Building2, ChevronDown } from 'lucide-react'
import { FilterState, TestBooking } from '../types'
import TestBookingsAnalytics from '../components/TestBookings/TestBookingsAnalytics'
import TestBookingsDetailed from '../components/TestBookings/TestBookingsDetailed'

// Mock test bookings data
const mockTestBookings: TestBooking[] = Array.from({ length: 30 }, (_, i) => ({
  id: `booking-${i}`,
  bookingId: `TB-${String(i + 1).padStart(6, '0')}`,
  guestName: [
    'Ava Carter',
    'Liam Patel',
    'Noah Kim',
    'Emma Singh',
    'Olivia Garcia',
    'Ethan Brown',
    'Mia Lopez',
    'Lucas Martin',
    'Isabella Davis',
    'Aria Thompson'
  ][i % 10],
  shopDate: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  bookingDate: new Date(Date.now() - (i + 2) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  cityName: ['New York', 'London', 'Berlin', 'Paris', 'Mumbai'][i % 5],
  brandRate: 150 + (i % 5) * 20,
  channelRate: 155 + (i % 5) * 18,
  currency: ['USD', 'GBP', 'EUR', 'EUR', 'INR'][i % 5],
  channelName: ['Booking.com', 'Expedia', 'Agoda', 'MakeMyTrip', 'Trip.com'][i % 5],
  subChannelName: ['Mobile', 'Desktop', 'Affiliate', 'Wholesale', 'Corporate'][i % 5],
  rateCode: ['RACK', 'ADV', 'BAR', 'CORP', 'PKG'][i % 5],
  pmsRate: 148 + (i % 5) * 19,
  pmsCurrency: ['USD', 'GBP', 'EUR', 'EUR', 'INR'][i % 5],
  rateType: ['Refundable', 'Non-refundable', 'Advance Purchase', 'Package', 'Corporate'][i % 5],
  markupPercent: [5, 7.5, 10, 12.5, 15][i % 5],
  mailCount: 0,
  dates: {
    checkIn: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    checkOut: new Date(Date.now() + (i + 3) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  },
  hotel: `Hotel ${i % 10 + 1}`,
  region: ['North America', 'Europe', 'Asia Pacific'][i % 3],
  country: ['USA', 'UK', 'Germany', 'France', 'India'][i % 5],
  leakage: Math.random() * 500,
  wholesalerOta: ['Wholesaler A', 'Wholesaler B', 'Booking.com', 'Expedia', '--'][i % 5],
  wholesalerReason: ['Rate mismatch', 'Parity loss', 'Delayed update', 'Inventory issue', '--'][i % 5],
  status: (['Open', 'Closed by User', 'Closed by RateGain'] as const)[i % 3],
  unattendedViolations: Math.floor(Math.random() * 5),
  totalViolations: Math.floor(5 + Math.random() * 10)
}))

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

export default function TestBookings() {
  const [filters, setFilters] = useState<FilterState>({
    dateRange: getNext30DaysRange()
  })
  const [activeTab, setActiveTab] = useState<'analytics' | 'detailed'>('analytics')
  const [isShopDateDropdownOpen, setIsShopDateDropdownOpen] = useState(false)
  const [isHotelsDropdownOpen, setIsHotelsDropdownOpen] = useState(false)
  const shopDateDropdownRef = useRef<HTMLDivElement>(null)
  const hotelsDropdownRef = useRef<HTMLDivElement>(null)

  // Get unique hotels from bookings
  const availableHotels = Array.from(new Set(mockTestBookings.map(b => b.hotel))).sort()
  const selectedHotels = filters.hotel || []

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (shopDateDropdownRef.current && !shopDateDropdownRef.current.contains(event.target as Node)) {
        setIsShopDateDropdownOpen(false)
      }
      if (hotelsDropdownRef.current && !hotelsDropdownRef.current.contains(event.target as Node)) {
        setIsHotelsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleShopDateRange = (days: number) => {
    const today = new Date()
    const endDate = new Date()
    endDate.setDate(today.getDate() + days)
    
    setFilters({
      ...filters,
      dateRange: {
        start: today.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0]
      }
    })
    setIsShopDateDropdownOpen(false)
  }

  const handleCustomShopDateRange = () => {
    const startInput = document.getElementById('shop-date-start') as HTMLInputElement
    const endInput = document.getElementById('shop-date-end') as HTMLInputElement
    
    if (startInput && endInput && startInput.value && endInput.value) {
      setFilters({
        ...filters,
        dateRange: {
          start: startInput.value,
          end: endInput.value
        }
      })
      setIsShopDateDropdownOpen(false)
    }
  }

  const handleHotelToggle = (hotel: string) => {
    const currentHotels = filters.hotel || []
    if (currentHotels.includes(hotel)) {
      setFilters({
        ...filters,
        hotel: currentHotels.filter(h => h !== hotel)
      })
    } else {
      setFilters({
        ...filters,
        hotel: [...currentHotels, hotel]
      })
    }
  }

  const handleSelectAllHotels = () => {
    if (selectedHotels.length === availableHotels.length) {
      setFilters({
        ...filters,
        hotel: []
      })
    } else {
      setFilters({
        ...filters,
        hotel: [...availableHotels]
      })
    }
  }

  const filteredBookings = mockTestBookings.filter(b => {
    // Apply hotel filter
    if (filters.hotel && filters.hotel.length > 0 && !filters.hotel.includes(b.hotel)) return false
    
    // Apply shop date filter (check if booking date falls within range)
    if (filters.dateRange) {
      const bookingDate = new Date(b.dates.checkIn)
      const startDate = new Date(filters.dateRange.start)
      const endDate = new Date(filters.dateRange.end)
      
      if (bookingDate < startDate || bookingDate > endDate) return false
    }
    
    return true
  })

  const formatDateRange = () => {
    if (!filters.dateRange) return 'Select Date Range'
    const start = new Date(filters.dateRange.start)
    const end = new Date(filters.dateRange.end)
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Test Bookings</h1>
      </div>

      {/* Quick Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        {/* Shop Date Filter */}
        <div className="relative" ref={shopDateDropdownRef}>
          <button
            type="button"
            onClick={() => setIsShopDateDropdownOpen(!isShopDateDropdownOpen)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Calendar className="w-4 h-4" />
            <span>Shop Date: {formatDateRange()}</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${isShopDateDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Shop Date Dropdown */}
          {isShopDateDropdownOpen && (
            <div className="absolute z-10 mt-1 w-64 bg-white border border-gray-300 rounded-lg shadow-lg">
              <div className="p-2">
                <button
                  onClick={() => handleShopDateRange(7)}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                >
                  Last 7 days
                </button>
                <button
                  onClick={() => handleShopDateRange(30)}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                >
                  Last 30 days
                </button>
                <button
                  onClick={() => handleShopDateRange(90)}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                >
                  Last 90 days
                </button>
                <div className="border-t border-gray-200 my-2"></div>
                <div className="px-3 py-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Custom Range</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      id="shop-date-start"
                      type="date"
                      className="flex-1 px-2 py-1.5 text-xs border border-gray-300 rounded"
                      defaultValue={filters.dateRange?.start}
                    />
                    <input
                      id="shop-date-end"
                      type="date"
                      className="flex-1 px-2 py-1.5 text-xs border border-gray-300 rounded"
                      defaultValue={filters.dateRange?.end}
                    />
              </div>
                  <button
                    onClick={handleCustomShopDateRange}
                    className="w-full px-3 py-1.5 text-xs font-medium text-white bg-primary-600 rounded hover:bg-primary-700"
                  >
                    Apply
                  </button>
              </div>
            </div>
          </div>
          )}
      </div>

        {/* Hotels Filter */}
        <div className="relative" ref={hotelsDropdownRef}>
          <button
            type="button"
            onClick={() => setIsHotelsDropdownOpen(!isHotelsDropdownOpen)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Building2 className="w-4 h-4" />
            <span>
              Hotels: {selectedHotels.length === 0 
                ? 'All' 
                : selectedHotels.length === 1 
                  ? selectedHotels[0] 
                  : `${selectedHotels.length} selected`}
            </span>
            <ChevronDown className={`w-4 h-4 transition-transform ${isHotelsDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Hotels Dropdown */}
          {isHotelsDropdownOpen && (
            <div className="absolute z-10 mt-1 w-64 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-y-auto">
              <div className="p-2">
                <button
                  onClick={handleSelectAllHotels}
                  className="w-full text-left px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded mb-1"
                >
                  {selectedHotels.length === availableHotels.length ? 'Deselect All' : 'Select All'}
                </button>
                <div className="border-t border-gray-200 my-1"></div>
                {availableHotels.map((hotel) => (
                  <label
                    key={hotel}
                    className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedHotels.includes(hotel)}
                      onChange={() => handleHotelToggle(hotel)}
                      className="mr-2 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span>{hotel}</span>
                  </label>
                ))}
                    </div>
                    </div>
                      )}
                    </div>
                    </div>

      {/* Tabs */}
      <div className="flex items-center space-x-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`pb-3 px-1 text-sm font-medium transition-colors ${
            activeTab === 'analytics'
              ? 'text-gray-900 border-b-2 border-primary-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Analytics
        </button>
        <button
          onClick={() => setActiveTab('detailed')}
          className={`pb-3 px-1 text-sm font-medium transition-colors ${
            activeTab === 'detailed'
              ? 'text-gray-900 border-b-2 border-primary-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Detailed View
        </button>
        </div>

      {/* Tab Content */}
      {activeTab === 'analytics' && (
        <TestBookingsAnalytics bookings={filteredBookings} />
      )}

      {activeTab === 'detailed' && (
        <TestBookingsDetailed bookings={filteredBookings} />
      )}
    </div>
  )
}



