import { useState, useMemo, useEffect } from 'react'
import { Eye, ExternalLink, AlertCircle, CheckCircle, XCircle, Clock, ChevronDown, ChevronRight, X, Building2, DollarSign, ChevronLeft, Paperclip, Mail } from 'lucide-react'
import { TestBooking } from '../../types'

interface TestBookingsDetailedProps {
  bookings: TestBooking[]
}

interface FailedBooking {
  id: string
  failedId: string
  hotel: string
  checkInDate: string
  checkOutDate: string
  reason: string
  shopDate: string
  hasAttachment?: boolean
  details?: string
}

// Mock failed bookings data matching screenshot format
const mockFailedBookings: FailedBooking[] = [
  {
    id: 'failed-1',
    failedId: 'Failed172',
    hotel: 'Avani Windhoek Hotel & Casino',
    checkInDate: '2025-04-06',
    checkOutDate: '2025-04-09',
    reason: 'Rate Match',
    shopDate: '2025-02-10',
    hasAttachment: true
  },
  {
    id: 'failed-2',
    failedId: 'Failed171',
    hotel: 'Avani Windhoek Hotel & Casino',
    checkInDate: '2025-03-28',
    checkOutDate: '2025-03-29',
    reason: 'Rate Match',
    shopDate: '2025-02-10',
    hasAttachment: true
  },
  {
    id: 'failed-3',
    failedId: 'Failed170',
    hotel: 'Avani Windhoek Hotel & Casino',
    checkInDate: '2025-02-21',
    checkOutDate: '2025-02-22',
    reason: 'Rate Match',
    shopDate: '2025-02-10',
    hasAttachment: true
  },
  {
    id: 'failed-4',
    failedId: 'Failed169',
    hotel: 'Heritage Queenstown',
    checkInDate: '2025-03-15',
    checkOutDate: '2025-03-18',
    reason: 'Rate Match',
    shopDate: '2025-02-10',
    hasAttachment: true
  },
  {
    id: 'failed-5',
    failedId: 'Failed168',
    hotel: 'Srilanka Ayurveda Hotel',
    checkInDate: '2025-04-27',
    checkOutDate: '2025-04-28',
    reason: 'Violation on Meta but lost on OTA',
    shopDate: '2025-02-10',
    hasAttachment: true
  },
  {
    id: 'failed-6',
    failedId: 'Failed166',
    hotel: 'Savoy Homann Bidakara Hotel',
    checkInDate: '2025-02-23',
    checkOutDate: '2025-02-24',
    reason: 'Brand Rate is Lowest',
    shopDate: '2025-02-10',
    hasAttachment: true
  },
  // Add more mock data to match the pattern
  ...Array.from({ length: 9 }, (_, i) => ({
    id: `failed-${i + 7}`,
    failedId: `Failed${165 - i}`,
    hotel: ['Avani Windhoek Hotel & Casino', 'Heritage Queenstown', 'Srilanka Ayurveda Hotel', 'Savoy Homann Bidakara Hotel'][i % 4],
    checkInDate: new Date(2025, 1, 10 + i * 3).toISOString().split('T')[0],
    checkOutDate: new Date(2025, 1, 13 + i * 3).toISOString().split('T')[0],
    reason: ['Rate Match', 'Violation on Meta but lost on OTA', 'Brand Rate is Lowest'][i % 3],
    shopDate: '2025-02-10',
    hasAttachment: true
  }))
]

export default function TestBookingsDetailed({ bookings }: TestBookingsDetailedProps) {
  const [localBookings, setLocalBookings] = useState<TestBooking[]>(bookings)
  const [expandedBookings, setExpandedBookings] = useState<Set<string>>(new Set())
  const [selectedFailed, setSelectedFailed] = useState<FailedBooking | null>(null)
  const [selectedWholesaler, setSelectedWholesaler] = useState<string | null>('Unassigned')
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [activeEmailMenuId, setActiveEmailMenuId] = useState<string | null>(null)
  const [emailDraft, setEmailDraft] = useState<{
    booking: TestBooking
    templateKey: 'Notify' | 'Warn' | 'Final Notice'
  } | null>(null)
  const cardsPerPage = 4

  useEffect(() => {
    setLocalBookings(bookings)
  }, [bookings])

  const wholesalerOptions = useMemo(() => {
    const unique = new Set(localBookings.map(booking => booking.wholesalerOta || '--'))
    return ['--', ...Array.from(unique).filter(option => option !== '--')]
  }, [localBookings])

  const wholesalerReasonOptions = useMemo(() => {
    const unique = new Set(localBookings.map(booking => booking.wholesalerReason || '--'))
    return ['--', ...Array.from(unique).filter(option => option !== '--')]
  }, [localBookings])

  // Calculate wholesaler statistics
  const wholesalerStats = useMemo(() => {
    const stats = new Map<string, { bookings: number; revenueLoss: number; bookingIds: string[]; unattendedBookings: number }>()
    
    // Add Unassigned Wholesaler first (default card)
    stats.set('Unassigned', { bookings: 0, revenueLoss: 0, bookingIds: [], unattendedBookings: 0 })
    
    // Process regular bookings
    localBookings.forEach(booking => {
      const wholesaler = !booking.wholesalerOta || booking.wholesalerOta === '--' ? 'Unassigned' : booking.wholesalerOta
      const existing = stats.get(wholesaler) || { bookings: 0, revenueLoss: 0, bookingIds: [], unattendedBookings: 0 }
      existing.bookings += 1
      existing.revenueLoss += booking.leakage
      existing.bookingIds.push(booking.bookingId)
      if (booking.unattendedViolations > 0) {
        existing.unattendedBookings += 1
      }
      stats.set(wholesaler, existing)
    })
    
    // Process failed bookings
    const failedBookingIds = mockFailedBookings.map(fb => fb.failedId)
    const failedStats = { bookings: mockFailedBookings.length, revenueLoss: 0, bookingIds: failedBookingIds, unattendedBookings: 0 }
    stats.set('Failed Bookings', failedStats)
    
    return Array.from(stats.entries()).map(([name, data]) => ({
      name,
      ...data
    })).sort((a, b) => {
      // Put Unassigned first, then Failed Bookings, then sort by bookings
      if (a.name === 'Unassigned') return -1
      if (b.name === 'Unassigned') return 1
      if (a.name === 'Failed Bookings') return -1
      if (b.name === 'Failed Bookings') return 1
      return b.bookings - a.bookings
    })
  }, [localBookings])

  // Get current cards to display
  const currentCards = useMemo(() => {
    return wholesalerStats.slice(currentCardIndex, currentCardIndex + cardsPerPage)
  }, [wholesalerStats, currentCardIndex])

  const totalPages = Math.ceil(wholesalerStats.length / cardsPerPage)

  const handlePrevious = () => {
    setCurrentCardIndex(Math.max(0, currentCardIndex - cardsPerPage))
  }

  const handleNext = () => {
    setCurrentCardIndex(Math.min(wholesalerStats.length - cardsPerPage, currentCardIndex + cardsPerPage))
  }

  const getWholesalerLogo = (name: string) => {
    const firstLetter = name.charAt(0).toUpperCase()
    return (
      <div className="w-8 h-8 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm">
        {firstLetter}
      </div>
    )
  }

  // Filter bookings based on selected wholesaler
  const filteredBookings = useMemo(() => {
    if (!selectedWholesaler) return localBookings
    
    if (selectedWholesaler === 'Unassigned') {
      return localBookings.filter(b => !b.wholesalerOta || b.wholesalerOta === '' || b.wholesalerOta === '--')
    }
    
    if (selectedWholesaler === 'Failed Bookings') {
      return [] // Failed bookings are shown in separate table
    }
    
    return localBookings.filter(b => b.wholesalerOta === selectedWholesaler)
  }, [localBookings, selectedWholesaler])

  // Filter failed bookings based on selected wholesaler
  const filteredFailedBookings = useMemo(() => {
    if (!selectedWholesaler) return mockFailedBookings
    
    if (selectedWholesaler === 'Failed Bookings') {
      return mockFailedBookings
    }
    
    if (selectedWholesaler === 'Unassigned') {
      return mockFailedBookings.filter(fb => !fb.wholesalerOta || fb.wholesalerOta === '')
    }
    
    return mockFailedBookings.filter(fb => fb.wholesalerOta === selectedWholesaler)
  }, [selectedWholesaler])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Open':
        return <Clock className="w-4 h-4 text-orange-600" />
      case 'Active':
        return <Clock className="w-4 h-4 text-blue-600" />
      case 'Close':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'Closed by User':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'Closed by RateGain':
        return <XCircle className="w-4 h-4 text-blue-600" />
      default:
        return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'Active':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'Close':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'Closed by User':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'Closed by RateGain':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const toggleBooking = (id: string) => {
    setExpandedBookings(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const updateBooking = (id: string, updates: Partial<TestBooking>) => {
    setLocalBookings(prev =>
      prev.map(item => (item.id === id ? { ...item, ...updates } : item))
    )
  }

  const getDerivedStatus = (booking: TestBooking) => {
    const hasWholesaler = Boolean(booking.wholesalerOta && booking.wholesalerOta !== '--')
    const hasReason = Boolean(booking.wholesalerReason && booking.wholesalerReason !== '--')
    const hasMail = booking.mailCount > 0

    if (hasWholesaler && hasReason) return 'Close'
    if (hasWholesaler && !hasReason && hasMail) return 'Active'
    return 'Open'
  }

  const incrementMailCount = (id: string) => {
    setLocalBookings(prev =>
      prev.map(item =>
        item.id === id ? { ...item, mailCount: (item.mailCount || 0) + 1 } : item
      )
    )
  }

  const emailTemplates = {
    Notify: {
      subject: 'Test Booking Notification - {{bookingId}}',
      body: `Hi {{wholesaler}},

We detected a test booking for {{hotel}} ({{bookingId}}) with check-in {{checkIn}} and check-out {{checkOut}}.

Please review the booking details and share your confirmation.

Thanks,
RateGain Team`
    },
    Warn: {
      subject: 'Warning: Test Booking Follow-up - {{bookingId}}',
      body: `Hi {{wholesaler}},

This is a follow-up regarding the test booking {{bookingId}} for {{hotel}} ({{checkIn}} to {{checkOut}}).

We have not received confirmation yet. Please respond within 24 hours to avoid escalation.

Thanks,
RateGain Team`
    },
    'Final Notice': {
      subject: 'Final Notice: Test Booking - {{bookingId}}',
      body: `Hi {{wholesaler}},

Final notice for test booking {{bookingId}} at {{hotel}} ({{checkIn}} to {{checkOut}}).

If we do not receive confirmation within 12 hours, this will be escalated.

Thanks,
RateGain Team`
    }
  }

  const renderTemplate = (template: string, booking: TestBooking) => {
    const wholesalerName = booking.wholesalerOta || 'Wholesaler'
    return template
      .replace(/{{bookingId}}/g, booking.bookingId)
      .replace(/{{hotel}}/g, booking.hotel)
      .replace(/{{checkIn}}/g, booking.dates.checkIn)
      .replace(/{{checkOut}}/g, booking.dates.checkOut)
      .replace(/{{wholesaler}}/g, wholesalerName)
  }

  const downloadTestBookingDoc = (booking: TestBooking) => {
    const content = [
      'Test Booking Details',
      `Booking ID: ${booking.bookingId}`,
      `Hotel: ${booking.hotel}`,
      `Wholesaler/OTA: ${booking.wholesalerOta || 'Unassigned'}`,
      `Check-in: ${booking.dates.checkIn}`,
      `Check-out: ${booking.dates.checkOut}`,
      `Region: ${booking.region}`,
      `Country: ${booking.country}`,
      `Leakage: $${booking.leakage.toFixed(2)}`,
      `Total Violations: ${booking.totalViolations}`,
      `Unattended Violations: ${booking.unattendedViolations}`,
      `Status: ${booking.status}`
    ].join('\n')

    const blob = new Blob([content], {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${booking.bookingId}-test-booking.docx`
    link.click()
    setTimeout(() => URL.revokeObjectURL(url), 0)
  }


  return (
    <div className="space-y-6">
      {/* Wholesaler Cards */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Wholesaler Performance</h2>
            <p className="text-sm text-gray-500 mt-0.5">Monitor test bookings and revenue loss by wholesaler</p>
          </div>
          {/* Navigation Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevious}
              disabled={currentCardIndex === 0}
              className={`p-2 rounded-lg border transition-colors ${
                currentCardIndex === 0
                  ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-primary-500 hover:text-primary-600'
              }`}
              aria-label="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs text-gray-600 font-medium min-w-[60px] text-center">
              {Math.floor(currentCardIndex / cardsPerPage) + 1} / {totalPages}
            </span>
            <button
              onClick={handleNext}
              disabled={currentCardIndex >= wholesalerStats.length - cardsPerPage}
              className={`p-2 rounded-lg border transition-colors ${
                currentCardIndex >= wholesalerStats.length - cardsPerPage
                  ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-primary-500 hover:text-primary-600'
              }`}
              aria-label="Next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {currentCards.map((stat) => {
            const isSelected = selectedWholesaler === stat.name
            const isDefault = stat.name === 'Unassigned' || stat.name === 'Failed Bookings'
            
            return (
              <button
                key={stat.name}
                onClick={() => setSelectedWholesaler(isSelected ? null : stat.name)}
                className={`group bg-white border rounded-xl p-3 hover:shadow-sm transition-all text-left relative overflow-hidden ${
                  isSelected 
                    ? 'border-primary-500 shadow-sm ring-1 ring-primary-200' 
                    : 'border-gray-200 hover:border-primary-300'
                }`}
              >
                <div className={`absolute inset-x-0 top-0 h-0.5 ${
                  stat.name === 'Failed Bookings'
                    ? 'bg-gradient-to-r from-red-400 to-red-600'
                    : isSelected
                      ? 'bg-gradient-to-r from-primary-400 to-primary-600'
                      : 'bg-gradient-to-r from-gray-200 to-gray-300'
                }`} />

                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    {getWholesalerLogo(stat.name)}
                    <div>
                      <h3 className={`font-semibold text-gray-900 text-sm ${isSelected ? 'text-primary-900' : ''}`}>
                        {stat.name}
                      </h3>
                      <p className="text-[10px] text-gray-500 mt-0.5">{stat.bookings} bookings</p>
                    </div>
                  </div>
                  {isDefault && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                      stat.name === 'Failed Bookings' 
                        ? 'bg-red-50 text-red-700 border-red-200' 
                        : 'bg-gray-50 text-gray-700 border-gray-200'
                    }`}>
                      {stat.name === 'Failed Bookings' ? 'Failed' : 'Unassigned'}
                    </span>
                  )}
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-lg bg-gray-50 border border-gray-200 p-1.5">
                    <p className="text-[10px] text-gray-500">Total</p>
                    <span className={`text-sm font-bold ${isSelected ? 'text-primary-900' : 'text-gray-900'}`}>
                      {stat.bookings}
                    </span>
                  </div>
                  <div className="rounded-lg bg-orange-50 border border-orange-200 p-1.5">
                    <p className="text-[10px] text-orange-700">Un-attended</p>
                    <span className="text-sm font-bold text-orange-700">
                      {stat.unattendedBookings}
                    </span>
                  </div>
                  <div className="rounded-lg bg-red-50 border border-red-200 p-1.5">
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3 text-red-600" />
                      <p className="text-[10px] text-red-700">Loss</p>
                    </div>
                    <span className="text-sm font-bold text-red-700">
                      ${stat.revenueLoss.toFixed(2)}
                    </span>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Test Bookings Section - Hide when Failed Bookings card is selected */}
      {selectedWholesaler !== 'Failed Bookings' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Test Bookings Details</h2>
            <p className="text-sm text-gray-600 mt-1">
              Showing {filteredBookings.length} test bookings
              {selectedWholesaler && ` for ${selectedWholesaler}`}
            </p>
          </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase w-8"></th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Booking ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Booking Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Check-in</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Check-out</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Guest Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Hotel</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Region</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Wholesaler/OTA</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Wholesaler Reason</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Leakage</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-4 py-8 text-center text-sm text-gray-500">
                    No bookings found for the selected wholesaler.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((booking) => {
                const isExpanded = expandedBookings.has(booking.id)
                return (
                  <>
                    <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleBooking(booking.id)}
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-gray-600" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-gray-600" />
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{booking.bookingId}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{booking.bookingDate}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{booking.dates.checkIn}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{booking.dates.checkOut}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{booking.guestName}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{booking.hotel}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        <div>
                          <div>{booking.region}</div>
                          <div className="text-xs text-gray-500">{booking.country}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        <select
                          value={booking.wholesalerOta || '--'}
                          onChange={(event) => {
                            const value = event.target.value
                            updateBooking(booking.id, { wholesalerOta: value === '--' ? '' : value })
                          }}
                          className="w-full bg-transparent border border-transparent rounded px-2 py-1 text-sm text-gray-900 focus:outline-none focus:border-primary-300 focus:bg-white"
                        >
                          {wholesalerOptions.map(option => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        <select
                          value={booking.wholesalerReason || '--'}
                          onChange={(event) => {
                            const value = event.target.value
                            updateBooking(booking.id, { wholesalerReason: value === '--' ? '' : value })
                          }}
                          className="w-full bg-transparent border border-transparent rounded px-2 py-1 text-sm text-gray-900 focus:outline-none focus:border-primary-300 focus:bg-white"
                        >
                          {wholesalerReasonOptions.map(option => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-red-600">${booking.leakage.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded border ${getStatusColor(getDerivedStatus(booking))}`}>
                          {getStatusIcon(getDerivedStatus(booking))}
                          <span className="text-xs font-medium">{getDerivedStatus(booking)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="relative flex items-center space-x-2">
                          {booking.wholesalerOta && booking.wholesalerOta !== '--' && (
                            <button
                              onClick={() => setActiveEmailMenuId(activeEmailMenuId === booking.id ? null : booking.id)}
                              className="relative p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="Send Email"
                            >
                              <Mail className="w-4 h-4" />
                              {booking.mailCount > 0 && (
                                <span className="absolute -top-1 -right-1 min-w-[14px] h-3.5 px-1 rounded-full bg-primary-600 text-white text-[9px] flex items-center justify-center">
                                  {booking.mailCount}
                                </span>
                              )}
                            </button>
                          )}
                          <button
                            onClick={() => downloadTestBookingDoc(booking)}
                            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                            title="Download Attachment"
                          >
                            <Paperclip className="w-4 h-4" />
                          </button>
                          {activeEmailMenuId === booking.id && (
                            <div className="absolute z-10 top-8 left-0 bg-white border border-gray-200 rounded-md shadow-md w-40">
                              {(['Notify', 'Warn', 'Final Notice'] as const).map(option => (
                                <button
                                  key={option}
                                  onClick={() => {
                                    setEmailDraft({ booking, templateKey: option })
                                    setActiveEmailMenuId(null)
                                  }}
                                  className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50"
                                >
                                  {option}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr>
                        <td colSpan={12} className="px-4 py-3 bg-gray-50">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-xs font-semibold text-gray-700 mb-2">Additional Details</p>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <p className="text-xs font-medium text-gray-600">Shop Date</p>
                                  <p className="text-xs text-gray-900 mt-1">{booking.shopDate}</p>
                                </div>
                                <div>
                                  <p className="text-xs font-medium text-gray-600">City Name</p>
                                  <p className="text-xs text-gray-900 mt-1">{booking.cityName}</p>
                                </div>
                                <div>
                                  <p className="text-xs font-medium text-gray-600">Brand Rate</p>
                                  <p className="text-xs text-gray-900 mt-1">{booking.currency} {booking.brandRate.toFixed(2)}</p>
                                </div>
                                <div>
                                  <p className="text-xs font-medium text-gray-600">Channel Rate</p>
                                  <p className="text-xs text-gray-900 mt-1">{booking.currency} {booking.channelRate.toFixed(2)}</p>
                                </div>
                                <div>
                                  <p className="text-xs font-medium text-gray-600">Difference</p>
                                  <p className="text-xs text-gray-900 mt-1">
                                    {booking.currency} {(booking.channelRate - booking.brandRate).toFixed(2)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs font-medium text-gray-600">Currency</p>
                                  <p className="text-xs text-gray-900 mt-1">{booking.currency}</p>
                                </div>
                                <div>
                                  <p className="text-xs font-medium text-gray-600">Channel Name</p>
                                  <p className="text-xs text-gray-900 mt-1">{booking.channelName}</p>
                                </div>
                                <div>
                                  <p className="text-xs font-medium text-gray-600">Sub Channel Name</p>
                                  <p className="text-xs text-gray-900 mt-1">{booking.subChannelName}</p>
                                </div>
                              </div>
                            </div>

                            <div>
                              <p className="text-xs font-semibold text-gray-700 mb-2">Editable Fields</p>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-[11px] font-medium text-gray-600 mb-1">Rate Code</label>
                                  <input
                                    value={booking.rateCode}
                                    onChange={(event) => updateBooking(booking.id, { rateCode: event.target.value })}
                                    className="w-full px-2 py-1.5 border border-gray-200 rounded-md text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[11px] font-medium text-gray-600 mb-1">Rate Type</label>
                                  <input
                                    value={booking.rateType}
                                    onChange={(event) => updateBooking(booking.id, { rateType: event.target.value })}
                                    className="w-full px-2 py-1.5 border border-gray-200 rounded-md text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[11px] font-medium text-gray-600 mb-1">PMS Rate</label>
                                  <input
                                    type="number"
                                    value={booking.pmsRate}
                                    onChange={(event) => updateBooking(booking.id, { pmsRate: Number(event.target.value) })}
                                    className="w-full px-2 py-1.5 border border-gray-200 rounded-md text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[11px] font-medium text-gray-600 mb-1">PMS Currency</label>
                                  <input
                                    value={booking.pmsCurrency}
                                    onChange={(event) => updateBooking(booking.id, { pmsCurrency: event.target.value })}
                                    className="w-full px-2 py-1.5 border border-gray-200 rounded-md text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[11px] font-medium text-gray-600 mb-1">Markup %</label>
                                  <input
                                    type="number"
                                    value={booking.markupPercent}
                                    onChange={(event) => updateBooking(booking.id, { markupPercent: Number(event.target.value) })}
                                    className="w-full px-2 py-1.5 border border-gray-200 rounded-md text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                )
              })
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* Failed Bookings Section - Only show when Failed Bookings card is selected */}
      {selectedWholesaler === 'Failed Bookings' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Failed Bookings</h2>
              <p className="text-sm text-gray-600 mt-1">
                Showing {filteredFailedBookings.length} failed bookings
                {selectedWholesaler && ` for ${selectedWholesaler}`}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-sm font-medium text-red-600">{filteredFailedBookings.length} Failed</span>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase w-12">Attachment</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Failed Id</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Check-in Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Check-out Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Reason for failure</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Shop Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Hotel name</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredFailedBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">
                    No failed bookings found for the selected wholesaler.
                  </td>
                </tr>
              ) : (
                filteredFailedBookings.map((failed) => {
                  const formatDate = (dateString: string) => {
                    const date = new Date(dateString)
                    const day = date.getDate()
                    const month = date.toLocaleDateString('en-GB', { month: 'short' })
                    const year = date.getFullYear().toString().slice(-2)
                    return `${day} ${month} ${year}`
                  }
                  
                  return (
                    <tr key={failed.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        {failed.hasAttachment && (
                          <Paperclip className="w-4 h-4 text-gray-600" />
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{failed.failedId}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{formatDate(failed.checkInDate)}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{formatDate(failed.checkOutDate)}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{failed.reason}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{formatDate(failed.shopDate)}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{failed.hotel}</td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* Email Template Modal */}
      {emailDraft && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {emailDraft.templateKey} Email - {emailDraft.booking.bookingId}
              </h2>
              <button
                onClick={() => setEmailDraft(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">To</p>
                  <p className="text-sm text-gray-900 mt-1">{emailDraft.booking.wholesalerOta || 'Wholesaler'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Attachment</p>
                  <div className="mt-1 inline-flex items-center space-x-2 text-sm text-gray-700">
                    <Paperclip className="w-4 h-4" />
                    <span>{emailDraft.booking.bookingId}-test-booking.docx</span>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700">Subject</p>
                <p className="text-sm text-gray-900 mt-1">
                  {renderTemplate(emailTemplates[emailDraft.templateKey].subject, emailDraft.booking)}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700">Message</p>
                <textarea
                  className="w-full mt-2 p-3 border border-gray-200 rounded-lg text-sm text-gray-800 min-h-[200px] focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={renderTemplate(emailTemplates[emailDraft.templateKey].body, emailDraft.booking)}
                  readOnly
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  onClick={() => setEmailDraft(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    incrementMailCount(emailDraft.booking.id)
                    setEmailDraft(null)
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700"
                >
                  Send Email
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Failed Booking Detail Modal */}
      {selectedFailed && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Failed Booking Details - {selectedFailed.bookingId}</h2>
              <button
                onClick={() => setSelectedFailed(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <p className="text-sm font-semibold text-red-900">Booking Failed</p>
                </div>
                <p className="text-sm text-red-800">{selectedFailed.reason}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Booking ID</p>
                  <p className="text-sm text-gray-900 mt-1">{selectedFailed.bookingId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Date</p>
                  <p className="text-sm text-gray-900 mt-1">{selectedFailed.date}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Hotel</p>
                  <p className="text-sm text-gray-900 mt-1">{selectedFailed.hotel}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Wholesaler/OTA</p>
                  <p className="text-sm text-gray-900 mt-1">{selectedFailed.wholesalerOta}</p>
                </div>
              </div>
              {selectedFailed.details && (
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-2">Failure Details</p>
                  <p className="text-sm text-gray-700">{selectedFailed.details}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
