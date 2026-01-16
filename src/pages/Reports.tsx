import { useState, useEffect, useRef } from 'react'
import { ExternalLink, Download, Eye, Filter, BookOpen, X, Calendar, Globe, ChevronDown, Zap, CheckCircle, DollarSign, Bed, UtensilsCrossed, CalendarDays, Users, Coins, MapPin, Info, FileText, FileSpreadsheet, Clock, Sliders, Coffee } from 'lucide-react'
import ParityCalendarView from '../components/Reports/ParityCalendarView'
import DetailedView from '../components/Reports/DetailedView'
import HierarchicalViewBy, { mockHierarchy as viewByHierarchy } from '../components/Filters/HierarchicalViewBy'
import { FilterState, Violation } from '../types'
import { useNotifications } from '../contexts/NotificationContext'
import { setViolations } from '../store/violationsStore'

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

// Available reason options
const reasonOptions = [
  '--',
  'Rate plan difference',
  'Room or board difference',
  'Promotion/discount difference',
  'Bait & switch',
  'Other'
]

// Mock violations data with brandRate and underlyingOTA for Meta channels
const mockViolations: Violation[] = Array.from({ length: 50 }, (_, i) => {
  const otaRate = 150 + Math.random() * 200
  const brandRate = otaRate * (0.95 + Math.random() * 0.1)
  const channelTypes: ('OTA' | 'Meta')[] = ['OTA', 'Meta']
  const channelType = channelTypes[i % 2]
  const channels = channelType === 'OTA' 
    ? ['Booking.com', 'Expedia', 'Agoda', 'Hotels.com']
    : ['Google Hotels', 'TripAdvisor', 'Trivago', 'Kayak']
  const underlyingOTAs = ['Booking.com', 'Expedia', 'Agoda', 'Hotels.com', 'Priceline']
  
  // Add blank reasons for some violations (every 7th violation will have blank reason)
  const reasons = ['Rate plan difference', 'Room or board difference', 'Promotion/discount difference', 'Bait & switch', 'Other']
  const reason = i % 7 === 0 ? '' : reasons[i % 5]
  
  return {
    id: `violation-${i}`,
    hotel: `Hotel ${i % 10 + 1}`,
    brand: `Brand ${i % 3 + 1}`,
    subBrand: i % 2 === 0 ? `Sub Brand ${i % 2 + 1}` : undefined,
    channel: channels[i % channels.length],
    channelType: channelType,
    underlyingOTA: channelType === 'Meta' ? underlyingOTAs[i % underlyingOTAs.length] : undefined,
    date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    rate: otaRate,
    brandRate: brandRate,
    room: ['Standard', 'Deluxe', 'Suite'][i % 3],
    board: ['Room Only', 'Breakfast', 'Half Board'][i % 3],
    pos: ['US', 'UK', 'DE', 'FR'][i % 4],
    los: Math.floor(1 + Math.random() * 7),
    occupancy: Math.floor(1 + Math.random() * 4),
    wlm: (['Win', 'Loss', 'Meet'] as const)[i % 3],
    ra: (['Rate', 'Availability'] as const)[i % 2],
    severity: (['Critical', 'Major', 'Minor', 'Trivial'] as const)[i % 4],
    reason: reason,
    revenueLoss: Math.random() * 500,
    cacheUrl: `https://cache.example.com/snapshot/${i}`,
    liveUrl: `https://${['booking.com', 'expedia.com', 'google.com'][i % 3]}/hotel/${i}`
  }
})

export default function Reports() {
  // Initialize with next 30 days date range
  const [activeTab, setActiveTab] = useState<'reports' | 'detailed-view'>('reports')
  const [filters, setFilters] = useState<FilterState>({
    dateRange: getNext30DaysRange()
  })
  const [selectedViolation, setSelectedViolation] = useState<Violation | null>(null)
  const [showCacheModal, setShowCacheModal] = useState(false)
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(null)
  const [editingReasonId, setEditingReasonId] = useState<string | null>(null)
  const [editingReasonValue, setEditingReasonValue] = useState<string>('')
  const [violations, setViolations] = useState<Violation[]>(mockViolations)
  const [buzzCounts, setBuzzCounts] = useState<Record<string, number>>({})
  const [testBookingClicked, setTestBookingClicked] = useState<Set<string>>(new Set())
  const [lastBuzzBatch, setLastBuzzBatch] = useState<string[]>([])
  const [lastUpdateBatch, setLastUpdateBatch] = useState<string[]>([])
  
  // Notification context
  const { addNotification, userRole } = useNotifications()
  
  const calendarViewBy = filters.calendarViewBy || 'Brand'
  const selectedEntities = filters.selectedEntities || []
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(new Set([
    'hotel', 'channel', 'date', 'shopDate', 'brandRate', 'rate', 'variance', 'severity', 'reason', 'revenueLoss', 'actions'
  ]))
  
  // Table inline filter states
  const [tableSeverityFilters, setTableSeverityFilters] = useState<string[]>([])
  const [tableRAFilter, setTableRAFilter] = useState<string>('All') // 'All', 'Rate', 'Availability'
  const [tableReasonFilter, setTableReasonFilter] = useState<string>('All') // 'All' or specific reason
  const [isQuickFiltersExpanded, setIsQuickFiltersExpanded] = useState<boolean>(false)

  // Filter states matching Overview page
  const [dateRangeOption, setDateRangeOption] = useState<string>('30')
  const [viewBy, setViewBy] = useState<string>('Brand')
  const [viewByPath, setViewByPath] = useState<string[]>([])
  const [selectedChannels, setSelectedChannels] = useState<string[]>(['All'])
  const [customDateStart, setCustomDateStart] = useState<string>('')
  const [customDateEnd, setCustomDateEnd] = useState<string>('')
  const [isChannelDropdownOpen, setIsChannelDropdownOpen] = useState<boolean>(false)
  const [isDateRangeDropdownOpen, setIsDateRangeDropdownOpen] = useState<boolean>(false)
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState<boolean>(false)
  const [isDownloadDropdownOpen, setIsDownloadDropdownOpen] = useState<boolean>(false)
  const [showOnDemandModal, setShowOnDemandModal] = useState<boolean>(false)
  const channelDropdownRef = useRef<HTMLDivElement>(null)
  const dateRangeDropdownRef = useRef<HTMLDivElement>(null)
  const downloadDropdownRef = useRef<HTMLDivElement>(null)
  
  // On-demand report form state
  const [onDemandForm, setOnDemandForm] = useState({
    checkInDate: '',
    daysOfData: '',
    selectedProperties: [] as string[],
    selectedChannels: [] as string[],
    los: '',
    guest: ''
  })
  
  // Additional filter states
  const [viewByCheapestOrProduct, setViewByCheapestOrProduct] = useState<string>('Product') // 'Cheapest' or 'Product'
  const [rateType, setRateType] = useState<string>('') // 'Lowest' or 'BAR'
  const [selectedRooms, setSelectedRooms] = useState<string[]>([])
  const [selectedInclusions, setSelectedInclusions] = useState<string[]>([])
  const [losValue, setLosValue] = useState<string>('Any')
  const [guestCount, setGuestCount] = useState<string>('Any')
  const [selectedCurrency, setSelectedCurrency] = useState<string>('')
  const [selectedPOS, setSelectedPOS] = useState<string>('')
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
  const posOptions = ['US', 'EU', 'UK', 'CA', 'AU', 'IN', 'JP', 'CN', 'SG', 'HK', 'NZ', 'AE', 'MX', 'BR', 'ZA', 'DE', 'FR', 'IT', 'ES', 'NL']
  
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
    } else {
      const channels = getChannelsForGroup(group)
      setSelectedChannels(channels.length > 0 ? channels : ['All'])
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
      if (downloadDropdownRef.current && !downloadDropdownRef.current.contains(event.target as Node)) {
        setIsDownloadDropdownOpen(false)
      }
    }

    if (isChannelDropdownOpen || isDateRangeDropdownOpen || isDownloadDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isChannelDropdownOpen, isDateRangeDropdownOpen, isDownloadDropdownOpen])
  
  // Download handlers
  const handleDownload = (type: 'current-view' | 'lite-report' | 'macros-report' | 'product-parity-report' | 'last-month' | 'last-3-months') => {
    setIsDownloadDropdownOpen(false)
    
    let reportData = filteredViolations
    let fileName = ''
    
    // Handle historical reports
    if (type === 'last-month' || type === 'last-3-months') {
      const now = new Date()
      const startDate = new Date()
      
      if (type === 'last-month') {
        startDate.setMonth(now.getMonth() - 1)
        fileName = `historical-report-last-month-${now.toISOString().split('T')[0]}.csv`
      } else {
        startDate.setMonth(now.getMonth() - 3)
        fileName = `historical-report-last-3-months-${now.toISOString().split('T')[0]}.csv`
      }
      
      // Filter violations for historical period (mock - in real app would fetch from API)
      reportData = filteredViolations.filter(v => {
        const violationDate = new Date(v.date)
        return violationDate >= startDate && violationDate <= now
      })
    } else {
      // Current reports
      switch (type) {
        case 'current-view':
          fileName = `current-view-${new Date().toISOString().split('T')[0]}.csv`
          break
        case 'lite-report':
          fileName = `lite-report-${new Date().toISOString().split('T')[0]}.csv`
          // Lite report might have fewer columns
          break
        case 'macros-report':
          fileName = `macros-report-${new Date().toISOString().split('T')[0]}.csv`
          // Macros report might have aggregated data
          break
        case 'product-parity-report':
          fileName = `product-parity-report-${new Date().toISOString().split('T')[0]}.csv`
          break
      }
    }
    
    // Generate CSV based on report type
    let headers: string[] = []
    let rows: string[][] = []
    
    if (type === 'lite-report') {
      // Lite report - simplified columns
      headers = ['Hotel', 'Channel', 'Date', 'Severity', 'Revenue Loss']
      rows = reportData.map(v => [
        v.hotel,
        v.channel,
        v.date,
        v.severity,
        v.revenueLoss?.toFixed(2) || '0.00'
      ])
    } else if (type === 'product-parity-report') {
      // Product Parity Report - product-specific columns
      headers = ['Hotel', 'Channel', 'Date', 'Room Type', 'Board Type', 'POS', 'LOS', 'Occupancy', 'Brand Rate', 'OTA Rate', 'Variance %', 'WLM', 'RA', 'Severity', 'Revenue Loss']
      rows = reportData.map(v => {
        const variance = calculateVariance(v.rate, v.brandRate)
        return [
          v.hotel,
          v.channel,
          v.date,
          v.room || 'N/A',
          v.board || 'N/A',
          v.pos || 'N/A',
          v.los?.toString() || 'N/A',
          v.occupancy?.toString() || 'N/A',
          v.brandRate?.toFixed(2) || '',
          v.rate.toFixed(2),
          variance !== null ? `${variance.toFixed(2)}%` : '',
          v.wlm || 'N/A',
          v.ra || 'N/A',
          v.severity,
          v.revenueLoss?.toFixed(2) || '0.00'
        ]
      })
    } else if (type === 'macros-report') {
      // Macros report - aggregated data
      headers = ['Hotel', 'Channel', 'Total Violations', 'Rate Violations', 'Availability Violations', 'Total Revenue Loss', 'Critical Issues']
      const aggregated = reportData.reduce((acc, v) => {
        const key = `${v.hotel}-${v.channel}`
        if (!acc[key]) {
          acc[key] = {
            hotel: v.hotel,
            channel: v.channel,
            total: 0,
            rate: 0,
            availability: 0,
            revenueLoss: 0,
            critical: 0
          }
        }
        acc[key].total++
        if (v.ra === 'Rate') acc[key].rate++
        if (v.ra === 'Availability') acc[key].availability++
        acc[key].revenueLoss += v.revenueLoss || 0
        if (v.severity === 'Critical') acc[key].critical++
        return acc
      }, {} as Record<string, any>)
      
      rows = Object.values(aggregated).map((agg: any) => [
        agg.hotel,
        agg.channel,
        agg.total.toString(),
        agg.rate.toString(),
        agg.availability.toString(),
        agg.revenueLoss.toFixed(2),
        agg.critical.toString()
      ])
    } else {
      // Current view or historical - full details
      headers = ['Hotel', 'Channel', 'Underlying OTA', 'Date', 'Brand Rate', 'OTA Rate', 'Variance %', 'Severity', 'Reason', 'Revenue Loss']
      rows = reportData.map(v => {
        const variance = calculateVariance(v.rate, v.brandRate)
        return [
          v.hotel,
          v.channel,
          v.underlyingOTA || '',
          v.date,
          v.brandRate?.toFixed(2) || '',
          v.rate.toFixed(2),
          variance !== null ? `${variance.toFixed(2)}%` : '',
          v.severity,
          v.reason,
          v.revenueLoss?.toFixed(2) || '0.00'
        ]
      })
    }
    
    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    a.click()
    URL.revokeObjectURL(url)
  }
  
  // Get unique hotels and channels for on-demand form
  const availableHotels = Array.from(new Set(violations.map(v => v.hotel))).sort()
  const availableChannels = Array.from(new Set(violations.map(v => v.channel))).sort()
  
  // Handle property selection
  const handlePropertyToggle = (property: string) => {
    setOnDemandForm(prev => ({
      ...prev,
      selectedProperties: prev.selectedProperties.includes(property)
        ? prev.selectedProperties.filter(p => p !== property)
        : [...prev.selectedProperties, property]
    }))
  }
  
  // Handle channel selection
  const handleChannelToggle = (channel: string) => {
    setOnDemandForm(prev => ({
      ...prev,
      selectedChannels: prev.selectedChannels.includes(channel)
        ? prev.selectedChannels.filter(c => c !== channel)
        : [...prev.selectedChannels, channel]
    }))
  }
  
  // Handle on-demand form submission
  const handleOnDemandSubmit = () => {
    if (!onDemandForm.checkInDate || !onDemandForm.daysOfData) {
      alert('Please fill in Check-in date and Days of data')
      return
    }
    
    // Calculate date range
    const checkInDate = new Date(onDemandForm.checkInDate)
    const days = parseInt(onDemandForm.daysOfData) || 1
    const endDate = new Date(checkInDate)
    endDate.setDate(checkInDate.getDate() + days - 1)
    
    // Filter violations based on criteria
    let filteredData = violations.filter(v => {
      const violationDate = new Date(v.date)
      const isInDateRange = violationDate >= checkInDate && violationDate <= endDate
      
      const matchesProperty = onDemandForm.selectedProperties.length === 0 || 
        onDemandForm.selectedProperties.includes(v.hotel)
      
      const matchesChannel = onDemandForm.selectedChannels.length === 0 || 
        onDemandForm.selectedChannels.includes(v.channel)
      
      const matchesLOS = !onDemandForm.los || v.los === parseInt(onDemandForm.los)
      
      const matchesGuest = !onDemandForm.guest || v.occupancy === parseInt(onDemandForm.guest)
      
      return isInDateRange && matchesProperty && matchesChannel && matchesLOS && matchesGuest
    })
    
    // Generate CSV
    const headers = ['Hotel', 'Channel', 'Date', 'Check-in Date', 'Room Type', 'Board Type', 'POS', 'LOS', 'Guest', 'Brand Rate', 'OTA Rate', 'Variance %', 'WLM', 'RA', 'Severity', 'Revenue Loss']
    const rows = filteredData.map(v => {
      const variance = calculateVariance(v.rate, v.brandRate)
      return [
        v.hotel,
        v.channel,
        v.date,
        onDemandForm.checkInDate,
        v.room || 'N/A',
        v.board || 'N/A',
        v.pos || 'N/A',
        v.los?.toString() || 'N/A',
        v.occupancy?.toString() || 'N/A',
        v.brandRate?.toFixed(2) || '',
        v.rate.toFixed(2),
        variance !== null ? `${variance.toFixed(2)}%` : '',
        v.wlm || 'N/A',
        v.ra || 'N/A',
        v.severity,
        v.revenueLoss?.toFixed(2) || '0.00'
      ]
    })
    
    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `on-demand-report-${onDemandForm.checkInDate}-${days}days.csv`
    a.click()
    URL.revokeObjectURL(url)
    
    // Close modal and reset form
    setShowOnDemandModal(false)
    setOnDemandForm({
      checkInDate: '',
      daysOfData: '',
      selectedProperties: [],
      selectedChannels: [],
      los: '',
      guest: ''
    })
  }

  // Format date for display
  const formatDateRange = () => {
    if (dateRangeOption === 'custom' && customDateStart && customDateEnd) {
      const start = new Date(customDateStart)
      const end = new Date(customDateEnd)
      return ` • ${start.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })} - ${end.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}`
    }
    return ''
  }

  // Ensure date range is set on mount
  useEffect(() => {
    if (!filters.dateRange) {
      setFilters(prev => ({
        ...prev,
        dateRange: getNext30DaysRange()
      }))
    }
    if (!filters.calendarViewBy) {
      setFilters(prev => ({
        ...prev,
        calendarViewBy: 'Brand'
      }))
    }
  }, [])

  const toggleColumn = (column: string) => {
    const newVisible = new Set(visibleColumns)
    if (newVisible.has(column)) {
      newVisible.delete(column)
    } else {
      newVisible.add(column)
    }
    setVisibleColumns(newVisible)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return 'bg-red-100 text-red-800'
      case 'Major':
        return 'bg-orange-100 text-orange-800'
      case 'Minor':
        return 'bg-yellow-100 text-yellow-800'
      case 'Trivial':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getChannelTypeColor = (type: string) => {
    switch (type) {
      case 'OTA':
        return 'bg-blue-100 text-blue-700'
      case 'Meta':
        return 'bg-purple-100 text-purple-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const calculateVariance = (otaRate: number, brandRate?: number): number | null => {
    if (!brandRate || brandRate === 0) return null
    return ((otaRate - brandRate) / brandRate) * 100
  }

  const getVarianceColor = (variance: number | null) => {
    if (variance === null) return 'text-gray-500'
    if (variance > 5) return 'text-red-600'
    if (variance < -5) return 'text-green-600'
    return 'text-yellow-600'
  }

  // Get room type abbreviation
  const getRoomAbbreviation = (roomType: string): string => {
    const roomMap: Record<string, string> = {
      'Standard': 'STD',
      'Deluxe': 'DLX',
      'Suite': 'STE',
      'Superior': 'SUP',
      'Executive': 'EXE',
      'Presidential': 'PRS',
      'Junior Suite': 'JST',
      'Family Room': 'FAM',
      'Ocean View': 'OCV',
      'Garden View': 'GVW'
    }
    return roomMap[roomType] || roomType.substring(0, 3).toUpperCase()
  }

  // Get inclusion icon based on board type
  const getInclusionIcon = (boardType: string) => {
    const boardLower = boardType.toLowerCase()
    if (boardLower.includes('all inclusive') || boardLower.includes('all-inclusive')) {
      return <UtensilsCrossed className="w-3.5 h-3.5 text-purple-600" title="All Inclusive" />
    } else if (boardLower.includes('full board') || boardLower.includes('fullboard')) {
      return <UtensilsCrossed className="w-3.5 h-3.5 text-blue-600" title="Full Board" />
    } else if (boardLower.includes('half board') || boardLower.includes('halfboard')) {
      return <UtensilsCrossed className="w-3.5 h-3.5 text-green-600" title="Half Board" />
    } else if (boardLower.includes('breakfast')) {
      return <Coffee className="w-3.5 h-3.5 text-orange-600" title="Breakfast" />
    } else {
      return <Bed className="w-3.5 h-3.5 text-gray-500" title="Room Only" />
    }
  }

  const handleTestBooking = (violation: Violation) => {
    // Mark as clicked and disable the button
    setTestBookingClicked(prev => new Set(prev).add(violation.id))
    // Navigate to test bookings page or open test booking modal
    console.log('Create test booking for:', violation)
    // You can add navigation logic here
    // navigate('/test-bookings', { state: { violation } })
  }

  const handleReasonEdit = (violationId: string, currentReason: string) => {
    setEditingReasonId(violationId)
    // If reason is blank/empty, show "--" in the dropdown
    setEditingReasonValue(currentReason === '' || !currentReason ? '--' : currentReason)
  }

  const handleReasonSave = (violationId: string) => {
    // If "--" is selected, save as empty string (blank reason)
    const reasonToSave = editingReasonValue === '--' ? '' : editingReasonValue
    const previousViolation = violations.find(v => v.id === violationId)
    
    setViolations(prev => prev.map(v => 
      v.id === violationId ? { ...v, reason: reasonToSave } : v
    ))
    setEditingReasonId(null)
    setEditingReasonValue('')
    
    // Send notification to corporate user when intermediate/single-property user updates reason
    if (previousViolation && (userRole === 'intermediate' || userRole === 'single-property') && reasonToSave && reasonToSave.trim() !== '') {
      // Add to current update batch
      setLastUpdateBatch(prev => {
        const newBatch = [...prev, violationId]
        
        // Debounce: Create summary notification after a short delay
        setTimeout(() => {
          addNotification({
            type: 'reason-updated',
            violationIds: newBatch,
            count: newBatch.length,
            message: `${newBatch.length} Violation reasons have been updated.`,
            updatedBy: userRole === 'intermediate' ? 'Intermediate User' : 'Single Property User',
            timestamp: new Date().toISOString()
          })
        }, 1000) // 1 second debounce
        
        return newBatch
      })
      
      // Clear batch after delay
      setTimeout(() => {
        setLastUpdateBatch([])
      }, 1500)
    }
  }

  const handleReasonCancel = () => {
    setEditingReasonId(null)
    setEditingReasonValue('')
  }

  const handleBuzzClick = (violationId: string) => {
    setBuzzCounts(prev => ({
      ...prev,
      [violationId]: (prev[violationId] || 0) + 1
    }))
    
    // Add to current buzz batch
    setLastBuzzBatch(prev => {
      const newBatch = [...prev, violationId]
      
      // Debounce: Create summary notification after a short delay
      setTimeout(() => {
        // Send summary notification based on user role
        if (userRole === 'corporate') {
          addNotification({
            type: 'buzz-assigned',
            violationIds: newBatch,
            count: newBatch.length,
            message: `${newBatch.length} Violations have been shared for actioning.`,
            assignedBy: 'Corporate User',
            assignedTo: 'Intermediate User',
            timestamp: new Date().toISOString()
          })
          
          addNotification({
            type: 'buzz-assigned',
            violationIds: newBatch,
            count: newBatch.length,
            message: `${newBatch.length} Violations have been shared for actioning.`,
            assignedBy: 'Corporate User',
            assignedTo: 'Single Property User',
            timestamp: new Date().toISOString()
          })
        } else if (userRole === 'intermediate') {
          addNotification({
            type: 'buzz-assigned',
            violationIds: newBatch,
            count: newBatch.length,
            message: `${newBatch.length} Violations have been shared for actioning.`,
            assignedBy: 'Intermediate User',
            assignedTo: 'Single Property User',
            timestamp: new Date().toISOString()
          })
        }
      }, 1000) // 1 second debounce
      
      return newBatch
    })
    
    // Clear batch after delay
    setTimeout(() => {
      setLastBuzzBatch([])
    }, 1500)
  }

  const filteredViolations = violations.filter(v => {
    // Apply filters
    if (filters.channel && filters.channel.length > 0 && !filters.channel.includes(v.channel)) return false
    if (filters.severity && filters.severity.length > 0 && !filters.severity.includes(v.severity)) return false
    if (filters.violationReason && filters.violationReason.length > 0 && !filters.violationReason.includes(v.reason)) return false
    
    // Date range filter
    if (filters.dateRange) {
      const violationDate = new Date(v.date)
      const startDate = new Date(filters.dateRange.start)
      const endDate = new Date(filters.dateRange.end)
      if (violationDate < startDate || violationDate > endDate) return false
    }
    
    // Table inline filters
    if (tableSeverityFilters.length > 0 && !tableSeverityFilters.includes(v.severity)) return false
    if (tableRAFilter !== 'All' && v.ra !== tableRAFilter) return false
    if (tableReasonFilter !== 'All' && v.reason !== tableReasonFilter) return false
    
    return true
  })

  const dateRange = filters.dateRange || getNext30DaysRange()

  return (
    <div className="space-y-6">
      {/* Top Filters - Horizontal Button Style (Matching Overview) - Above Tabs */}
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
                  {dateRangeOption === '7' && 'Next 7 Days'}
                  {dateRangeOption === '14' && 'Next 14 Days'}
                  {dateRangeOption === '30' && 'Next 30 Days'}
                  {dateRangeOption === '60' && 'Next 60 Days'}
                  {dateRangeOption === '90' && 'Next 90 Days'}
                  {dateRangeOption === 'custom' && 'Custom Range'}
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
                        setDateRangeOption('7')
                        setIsDateRangeDropdownOpen(false)
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded"
                    >
                      Next 7 days
                    </button>
                    <button
                      onClick={() => {
                        setDateRangeOption('14')
                        setIsDateRangeDropdownOpen(false)
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded"
                    >
                      Next 14 days
                    </button>
                    <button
                      onClick={() => {
                        setDateRangeOption('30')
                        setIsDateRangeDropdownOpen(false)
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded"
                    >
                      Next 30 days
                    </button>
                    <button
                      onClick={() => {
                        setDateRangeOption('60')
                        setIsDateRangeDropdownOpen(false)
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded"
                    >
                      Next 60 days
                    </button>
                    <button
                      onClick={() => {
                        setDateRangeOption('90')
                        setIsDateRangeDropdownOpen(false)
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded"
                    >
                      Next 90 days
                    </button>
                    <button
                      onClick={() => {
                        setDateRangeOption('custom')
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
                  {selectedChannels.length === 0
                    ? 'All Channels'
                    : selectedChannels.length === 1
                      ? selectedChannels[0]
                      : `${selectedChannels.length} Channels`}
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
                                checked={selectedChannels.length === 0}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedChannels([])
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
                                  checked={selectedChannels.includes(channel)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedChannels([...selectedChannels, channel])
                                    } else {
                                      setSelectedChannels(selectedChannels.filter(c => c !== channel))
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
                                  selectedChannels.includes(channel) ? 'bg-primary-50' : 'hover:bg-gray-50'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedChannels.includes(channel)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedChannels([...selectedChannels, channel])
                                    } else {
                                      setSelectedChannels(selectedChannels.filter(c => c !== channel))
                                    }
                                  }}
                                  className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                />
                                <span className={`text-sm ${selectedChannels.includes(channel) ? 'font-medium text-primary-700' : 'text-gray-700'}`}>
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
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('reports')}
            className={`pb-3 px-1 text-sm font-medium transition-colors ${
              activeTab === 'reports'
                ? 'text-gray-900 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Reports
          </button>
          <button
            onClick={() => setActiveTab('detailed-view')}
            className={`pb-3 px-1 text-sm font-medium transition-colors ${
              activeTab === 'detailed-view'
                ? 'text-gray-900 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Detailed View
          </button>
        </div>
        {activeTab === 'reports' && (
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowOnDemandModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <FileText className="w-4 h-4" />
            <span>Generate On-demand</span>
          </button>
          <div className="relative" ref={downloadDropdownRef}>
            <button
              onClick={() => setIsDownloadDropdownOpen(!isDownloadDropdownOpen)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
              <span>Download</span>
              <ChevronDown className="w-4 h-4" />
          </button>
            {isDownloadDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-300 rounded-lg shadow-xl z-50">
                {/* Current Section */}
                <div className="p-2">
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 mb-1">
                    Current
        </div>
                  <button
                    onClick={() => handleDownload('current-view')}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded transition-colors"
                  >
                    <FileText className="w-4 h-4 text-gray-500" />
                    <span>Current View</span>
                  </button>
                  <button
                    onClick={() => handleDownload('lite-report')}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded transition-colors"
                  >
                    <FileText className="w-4 h-4 text-gray-500" />
                    <span>Lite Report</span>
                  </button>
                  <button
                    onClick={() => handleDownload('macros-report')}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded transition-colors"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-gray-500" />
                    <span>Macros Report</span>
                  </button>
                  <button
                    onClick={() => handleDownload('product-parity-report')}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded transition-colors"
                  >
                    <FileText className="w-4 h-4 text-gray-500" />
                    <span>Product Parity Report</span>
                  </button>
      </div>

                {/* Historical Section */}
                <div className="p-2 border-t border-gray-200">
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 mb-1">
                    Historical
                  </div>
                  <button
                    onClick={() => handleDownload('last-month')}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded transition-colors"
                  >
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span>Last Month</span>
                  </button>
                  <button
                    onClick={() => handleDownload('last-3-months')}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded transition-colors"
                  >
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span>Last 3 Months</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        )}
      </div>

      {activeTab === 'reports' && (
        <>
      {/* Calendar and Table View - Vertical Layout */}
      <div className="space-y-6">
        {/* Top Half - Calendar View (Compact) */}
        <div className="space-y-3">
          {/* Parity Calendar View */}
          <ParityCalendarView
            startDate={dateRange.start}
            endDate={dateRange.end}
            viewBy={calendarViewBy}
            entityName={
              selectedEntities.length > 0
                ? selectedEntities.join(', ')
                : undefined
            }
            violations={filteredViolations}
            onDateClick={(date) => {
              setSelectedCalendarDate(date)
              // Filter table by selected date - update filters to show only that date
              setFilters({ ...filters, dateRange: { start: date, end: date } })
            }}
          />
        </div>

        {/* Bottom Half - Table View (Larger) */}
        <div className="flex-1" id="violations-report">
      {/* Column Management */}
          <div className="card flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Violations Report</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsQuickFiltersExpanded(!isQuickFiltersExpanded)}
              className={`px-3 py-1.5 text-sm rounded-lg flex items-center space-x-2 transition-colors ${
                isQuickFiltersExpanded || tableSeverityFilters.length > 0 || tableRAFilter !== 'All' || tableReasonFilter !== 'All'
                  ? 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              title="Toggle Quick Filters"
            >
              <Sliders className="w-4 h-4" />
              <span>Quick Filters</span>
              {(tableSeverityFilters.length > 0 || tableRAFilter !== 'All' || tableReasonFilter !== 'All') && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary-600 text-white rounded-full">
                  {tableSeverityFilters.length + (tableRAFilter !== 'All' ? 1 : 0) + (tableReasonFilter !== 'All' ? 1 : 0)}
                </span>
              )}
            </button>
            <button
              onClick={() => {
                const drawer = document.getElementById('column-drawer')
                drawer?.classList.toggle('hidden')
              }}
              className="px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg flex items-center space-x-2"
            >
              <Filter className="w-4 h-4" />
              <span>Columns</span>
            </button>
          </div>
        </div>

        {/* Column Selector Drawer */}
        <div id="column-drawer" className="hidden mb-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium text-gray-700 mb-2">Select visible columns:</p>
          <div className="grid grid-cols-4 gap-2">
            {['hotel', 'brand', 'subBrand', 'channel', 'date', 'shopDate', 'brandRate', 'rate', 'variance', 'room', 'board', 'pos', 'los', 'occupancy', 'wlm', 'ra', 'severity', 'reason', 'revenueLoss'].map(col => (
              <label key={col} className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={visibleColumns.has(col)}
                  onChange={() => toggleColumn(col)}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="text-gray-700 capitalize">{col}</span>
              </label>
            ))}
          </div>
        </div>

            {/* Selected Date Filter */}
            {selectedCalendarDate && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-blue-800">Filtered by date:</span>
                  <span className="text-sm font-medium text-blue-900">{selectedCalendarDate}</span>
                </div>
                <button
                  onClick={() => {
                    setSelectedCalendarDate(null)
                    // Reset to original date range
                    const originalRange = getNext30DaysRange()
                    setFilters({ ...filters, dateRange: originalRange })
                  }}
                  className="text-xs text-blue-600 hover:text-blue-700 underline"
                >
                  Clear filter
                </button>
              </div>
            )}

            {/* Inline Table Filters - Creative Filter Bar (Collapsible) */}
            {isQuickFiltersExpanded && (
            <div className="mb-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-semibold text-gray-700">Quick Filters</span>
                </div>
                {(tableSeverityFilters.length > 0 || tableRAFilter !== 'All' || tableReasonFilter !== 'All') && (
                  <button
                    onClick={() => {
                      setTableSeverityFilters([])
                      setTableRAFilter('All')
                      setTableReasonFilter('All')
                    }}
                    className="text-xs text-gray-600 hover:text-gray-800 underline flex items-center gap-1"
                  >
                    <X className="w-3 h-3" />
                    Clear All
                  </button>
                )}
              </div>
              
              <div className="space-y-3">
                {/* Severity Filter */}
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-2 block">Severity</label>
                  <div className="flex flex-wrap gap-2">
                    {['Critical', 'Major', 'Minor', 'Trivial'].map(severity => {
                      const isSelected = tableSeverityFilters.includes(severity)
                      const severityColors: Record<string, string> = {
                        'Critical': 'bg-red-100 text-red-800 border-red-300',
                        'Major': 'bg-orange-100 text-orange-800 border-orange-300',
                        'Minor': 'bg-yellow-100 text-yellow-800 border-yellow-300',
                        'Trivial': 'bg-green-100 text-green-800 border-green-300'
                      }
                      return (
                        <button
                          key={severity}
                          onClick={() => {
                            setTableSeverityFilters(prev => 
                              prev.includes(severity)
                                ? prev.filter(s => s !== severity)
                                : [...prev, severity]
                            )
                          }}
                          className={`px-3 py-1.5 text-xs font-medium rounded-full border-2 transition-all duration-200 flex items-center gap-1.5 ${
                            isSelected
                              ? `${severityColors[severity]} shadow-md scale-105`
                              : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          {isSelected && <CheckCircle className="w-3 h-3" />}
                          {severity}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Rate/Availability Filter */}
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-2 block">View By</label>
                  <div className="flex flex-wrap gap-2">
                    {['All', 'Rate', 'Availability'].map(ra => {
                      const isSelected = tableRAFilter === ra
                      return (
                        <button
                          key={ra}
                          onClick={() => setTableRAFilter(ra)}
                          className={`px-3 py-1.5 text-xs font-medium rounded-full border-2 transition-all duration-200 flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-primary-100 text-primary-800 border-primary-400 shadow-md scale-105'
                              : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          {isSelected && <CheckCircle className="w-3 h-3" />}
                          {ra === 'All' ? 'All Issues' : ra === 'Rate' ? 'Rate Only' : 'Availability Only'}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Reason Filter */}
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-2 block">Reason</label>
                  <div className="flex items-center gap-2">
                    <select
                      value={tableReasonFilter}
                      onChange={(e) => setTableReasonFilter(e.target.value)}
                      className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 min-w-[200px]"
                    >
                      <option value="All">All Reasons</option>
                      {reasonOptions.filter(r => r !== '--').map(reason => (
                        <option key={reason} value={reason}>{reason}</option>
                      ))}
                      <option value="">Blank/Unassigned</option>
                    </select>
                    {tableReasonFilter !== 'All' && (
                      <button
                        onClick={() => setTableReasonFilter('All')}
                        className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                        title="Clear reason filter"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Active Filters Summary */}
              {(tableSeverityFilters.length > 0 || tableRAFilter !== 'All' || tableReasonFilter !== 'All') && (
                <div className="mt-3 pt-3 border-t border-gray-300">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-gray-500">Active filters:</span>
                    {tableSeverityFilters.map(severity => (
                      <span key={severity} className="px-2 py-0.5 text-xs bg-gray-200 text-gray-700 rounded-full">
                        {severity}
                      </span>
                    ))}
                    {tableRAFilter !== 'All' && (
                      <span className="px-2 py-0.5 text-xs bg-gray-200 text-gray-700 rounded-full">
                        {tableRAFilter}
                      </span>
                    )}
                    {tableReasonFilter !== 'All' && (
                      <span className="px-2 py-0.5 text-xs bg-gray-200 text-gray-700 rounded-full">
                        {tableReasonFilter || 'Blank'}
                      </span>
                    )}
                    <span className="text-xs text-gray-500">
                      ({filteredViolations.length} {filteredViolations.length === 1 ? 'violation' : 'violations'})
                    </span>
                  </div>
                </div>
              )}
            </div>
            )}

            {/* Table - Scrollable - Show at least 8 rows before scroll */}
            <div className="overflow-x-auto flex-1">
              <div className="overflow-y-auto" style={{ maxHeight: '600px', minHeight: '450px' }}>
                <table className="w-full">
                  <thead className="sticky top-0 z-10 bg-gray-50">
              <tr>
                {visibleColumns.has('hotel') && <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-b border-gray-200">Hotel</th>}
                {visibleColumns.has('channel') && <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-b border-gray-200">Channel</th>}
                {visibleColumns.has('date') && <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-b border-gray-200">Date</th>}
                {visibleColumns.has('shopDate') && <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-b border-gray-200">Shop Date</th>}
                {visibleColumns.has('brandRate') && <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-b border-gray-200">Brand Rate</th>}
                {visibleColumns.has('rate') && <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-b border-gray-200">OTA Rate</th>}
                {visibleColumns.has('variance') && <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-b border-gray-200">Variance %</th>}
                {visibleColumns.has('severity') && <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-b border-gray-200">Severity</th>}
                {visibleColumns.has('reason') && <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-b border-gray-200">Reason</th>}
                {visibleColumns.has('revenueLoss') && <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-b border-gray-200">Revenue Loss</th>}
                {visibleColumns.has('actions') && <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-b border-gray-200">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredViolations.map((violation) => {
                const variance = calculateVariance(violation.rate, violation.brandRate)
                const tooltipText = `Room: ${violation.room} | Meal: ${violation.board}`
                
                return (
                  <tr key={violation.id} className="hover:bg-gray-50 transition-colors">
                    {visibleColumns.has('hotel') && (
                      <td className="px-4 py-3 text-sm text-gray-900" title={tooltipText}>{violation.hotel}</td>
                    )}
                    {visibleColumns.has('channel') && (
                      <td className="px-4 py-3" title={tooltipText}>
                        <div className="flex flex-col space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-900">{violation.channel}</span>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${getChannelTypeColor(violation.channelType)}`}>
                              {violation.channelType}
                            </span>
                          </div>
                          {violation.channelType === 'Meta' && violation.underlyingOTA && (
                            <span className="text-xs text-gray-500 italic">
                              via {violation.underlyingOTA}
                            </span>
                          )}
                        </div>
                      </td>
                    )}
                    {visibleColumns.has('date') && (
                      <td className="px-4 py-3 text-sm text-gray-600" title={tooltipText}>{violation.date}</td>
                    )}
                    {visibleColumns.has('shopDate') && (
                      <td className="px-4 py-3 text-sm text-gray-600" title={tooltipText}>
                        {new Date().toISOString().split('T')[0]}
                      </td>
                    )}
                    {visibleColumns.has('brandRate') && (
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium" title={tooltipText}>
                        <div className="flex flex-col gap-1">
                          <span>${violation.brandRate?.toFixed(2) || 'N/A'}</span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-semibold text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">
                              {getRoomAbbreviation(violation.room)}
                            </span>
                            <div className="flex items-center">
                              {getInclusionIcon(violation.board)}
                            </div>
                          </div>
                        </div>
                      </td>
                    )}
                    {visibleColumns.has('rate') && (
                      <td className="px-4 py-3 text-sm text-gray-900" title={tooltipText}>
                        <div className="flex flex-col gap-1">
                          <span>${violation.rate.toFixed(2)}</span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-semibold text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">
                              {getRoomAbbreviation(violation.room)}
                            </span>
                            <div className="flex items-center">
                              {getInclusionIcon(violation.board)}
                            </div>
                          </div>
                        </div>
                      </td>
                    )}
                    {visibleColumns.has('variance') && (
                      <td className={`px-4 py-3 text-sm font-semibold ${getVarianceColor(variance)}`} title={tooltipText}>
                        {variance !== null ? `${variance > 0 ? '+' : ''}${variance.toFixed(2)}%` : 'N/A'}
                      </td>
                    )}
                    {visibleColumns.has('severity') && (
                      <td className="px-4 py-3" title={tooltipText}>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(violation.severity)}`}>
                          {violation.severity}
                        </span>
                      </td>
                    )}
                    {visibleColumns.has('reason') && (
                      <td className="px-4 py-3" title={tooltipText}>
                        {editingReasonId === violation.id ? (
                          <div className="flex items-center space-x-2">
                            <select
                              value={editingReasonValue}
                              onChange={(e) => setEditingReasonValue(e.target.value)}
                              className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleReasonSave(violation.id)
                                } else if (e.key === 'Escape') {
                                  handleReasonCancel()
                                }
                              }}
                            >
                              {reasonOptions.map(option => (
                                <option key={option} value={option}>{option}</option>
                              ))}
                            </select>
                            <button
                              onClick={() => handleReasonSave(violation.id)}
                              className="px-2 py-1 text-xs bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
                              title="Save"
                            >
                              ✓
                            </button>
                            <button
                              onClick={handleReasonCancel}
                              className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                              title="Cancel"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div 
                            className="text-sm text-gray-700 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded transition-colors flex items-center justify-between group"
                            onClick={() => handleReasonEdit(violation.id, violation.reason || '')}
                            title="Click to edit"
                          >
                            <span>{violation.reason || '--'}</span>
                            <span className="text-gray-400 opacity-0 group-hover:opacity-100 text-xs ml-2">✎</span>
                          </div>
                        )}
                      </td>
                    )}
                    {visibleColumns.has('revenueLoss') && (
                      <td className="px-4 py-3 text-sm font-medium text-red-600" title={tooltipText}>
                        ${violation.revenueLoss?.toFixed(2) || '0.00'}
                      </td>
                    )}
                    {visibleColumns.has('actions') && (
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleTestBooking(violation)}
                            disabled={testBookingClicked.has(violation.id)}
                            className={`relative p-1.5 rounded transition-colors ${
                              testBookingClicked.has(violation.id)
                                ? 'text-gray-400 cursor-not-allowed bg-gray-50'
                                : 'text-purple-600 hover:bg-purple-50'
                            }`}
                            title={testBookingClicked.has(violation.id) ? 'Test Booking Created' : 'Create Test Booking'}
                          >
                            <BookOpen className="w-4 h-4" />
                            {testBookingClicked.has(violation.id) && (
                              <CheckCircle className="absolute -top-1 -right-1 w-4 h-4 text-green-600 bg-white rounded-full" />
                            )}
                          </button>
                          {violation.cacheUrl && (
                            <button
                              onClick={() => {
                                setSelectedViolation(violation)
                                setShowCacheModal(true)
                              }}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="View Cache"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}
                          {violation.liveUrl && (
                            <a
                              href={violation.liveUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                              title="Open Live Site"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                          <button
                            onClick={() => handleBuzzClick(violation.id)}
                            disabled={!!violation.reason && violation.reason.trim() !== ''}
                            className={`relative p-1.5 rounded transition-colors ${
                              violation.reason && violation.reason.trim() !== ''
                                ? 'text-gray-400 cursor-not-allowed bg-gray-50'
                                : 'text-orange-600 hover:bg-orange-50'
                            }`}
                            title={
                              violation.reason && violation.reason.trim() !== ''
                                ? 'Buzz disabled - Reason already added'
                                : 'Buzz'
                            }
                          >
                            <Zap className="w-4 h-4" />
                            {buzzCounts[violation.id] > 0 && (
                              <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                {buzzCounts[violation.id]}
                              </span>
                            )}
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
              </div>
        </div>

            <div className="mt-4 flex items-center justify-between text-sm text-gray-600 border-t border-gray-200 pt-4">
          <span>Showing {filteredViolations.length} of {violations.length} violations</span>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">Previous</button>
            <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">Next</button>
          </div>
        </div>
      </div>
        </div>
      </div>
        </>
      )}

      {activeTab === 'detailed-view' && (
        <DetailedView 
          violations={filteredViolations} 
          selectedChannelGroup={selectedGroupBy}
          onReasonUpdate={(violationId, newReason) => {
            const previousViolation = violations.find(v => v.id === violationId)
            setViolations(prev => prev.map(v => 
              v.id === violationId ? { ...v, reason: newReason } : v
            ))
            
            // Send notification to corporate user when intermediate/single-property user updates reason
            if (previousViolation && (userRole === 'intermediate' || userRole === 'single-property') && newReason && newReason.trim() !== '') {
              // Add to current update batch
              setLastUpdateBatch(prev => {
                const newBatch = [...prev, violationId]
                
                // Debounce: Create summary notification after a short delay
                setTimeout(() => {
                  addNotification({
                    type: 'reason-updated',
                    violationIds: newBatch,
                    count: newBatch.length,
                    message: `${newBatch.length} Violation reasons have been updated.`,
                    updatedBy: userRole === 'intermediate' ? 'Intermediate User' : 'Single Property User',
                    timestamp: new Date().toISOString()
                  })
                }, 1000) // 1 second debounce
                
                return newBatch
              })
              
              // Clear batch after delay
              setTimeout(() => {
                setLastUpdateBatch([])
              }, 1500)
            }
          }}
        />
      )}

      {/* Cache Modal */}
      {showCacheModal && selectedViolation && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Cache Snapshot</h2>
              <button
                onClick={() => setShowCacheModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <span className="text-gray-600">×</span>
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> This is a cached snapshot of the rate data as captured at the time of the shop.
                  For current live rates, use the "Open Live Site" option.
                </p>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Violation Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Hotel:</span>
                      <span className="ml-2 font-medium">{selectedViolation.hotel}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Channel:</span>
                      <span className="ml-2 font-medium">{selectedViolation.channel}</span>
                      {selectedViolation.channelType === 'Meta' && selectedViolation.underlyingOTA && (
                        <span className="ml-2 text-xs text-gray-500">(via {selectedViolation.underlyingOTA})</span>
                      )}
                    </div>
                    <div>
                      <span className="text-gray-600">Date:</span>
                      <span className="ml-2 font-medium">{selectedViolation.date}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Brand Rate:</span>
                      <span className="ml-2 font-medium">${selectedViolation.brandRate?.toFixed(2) || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">OTA Rate:</span>
                      <span className="ml-2 font-medium">${selectedViolation.rate.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Variance:</span>
                      <span className={`ml-2 font-medium ${getVarianceColor(calculateVariance(selectedViolation.rate, selectedViolation.brandRate))}`}>
                        {calculateVariance(selectedViolation.rate, selectedViolation.brandRate) !== null 
                          ? `${calculateVariance(selectedViolation.rate, selectedViolation.brandRate)! > 0 ? '+' : ''}${calculateVariance(selectedViolation.rate, selectedViolation.brandRate)!.toFixed(2)}%`
                          : 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Room:</span>
                      <span className="ml-2 font-medium">{selectedViolation.room}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Meal:</span>
                      <span className="ml-2 font-medium">{selectedViolation.board}</span>
                    </div>
                  </div>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Cached Data</h3>
                  <p className="text-sm text-gray-600">
                    Cache URL: <a href={selectedViolation.cacheUrl} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">{selectedViolation.cacheUrl}</a>
                  </p>
                  <p className="text-sm text-gray-500 mt-2">In a real implementation, this would show the actual cached snapshot data.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* On-demand Report Modal */}
      {showOnDemandModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-700 border-b border-green-800 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Generate On-demand Report</h2>
                  <p className="text-xs text-green-100">Configure report parameters</p>
                </div>
              </div>
              <button
                onClick={() => setShowOnDemandModal(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Check-in Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Check-in Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={onDemandForm.checkInDate}
                  onChange={(e) => setOnDemandForm(prev => ({ ...prev, checkInDate: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>

              {/* Days of Data */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Days of Data <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={onDemandForm.daysOfData}
                  onChange={(e) => setOnDemandForm(prev => ({ ...prev, daysOfData: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter number of days"
                  required
                />
              </div>

              {/* Property Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Selection
                </label>
                <div className="border border-gray-300 rounded-lg p-3 max-h-40 overflow-y-auto">
                  <div className="space-y-2">
                    {availableHotels.map(hotel => (
                      <label key={hotel} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                        <input
                          type="checkbox"
                          checked={onDemandForm.selectedProperties.includes(hotel)}
                          onChange={() => handlePropertyToggle(hotel)}
                          className="w-4 h-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">{hotel}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {onDemandForm.selectedProperties.length === 0 
                    ? 'All properties will be included' 
                    : `${onDemandForm.selectedProperties.length} propert${onDemandForm.selectedProperties.length === 1 ? 'y' : 'ies'} selected`}
                </p>
              </div>

              {/* Channel Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Channel Selection
                </label>
                <div className="border border-gray-300 rounded-lg p-3 max-h-40 overflow-y-auto">
                  <div className="space-y-2">
                    {availableChannels.map(channel => (
                      <label key={channel} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                        <input
                          type="checkbox"
                          checked={onDemandForm.selectedChannels.includes(channel)}
                          onChange={() => handleChannelToggle(channel)}
                          className="w-4 h-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">{channel}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {onDemandForm.selectedChannels.length === 0 
                    ? 'All channels will be included' 
                    : `${onDemandForm.selectedChannels.length} channel${onDemandForm.selectedChannels.length === 1 ? '' : 's'} selected`}
                </p>
              </div>

              {/* LOS and Guest in a row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    LOS (Length of Stay)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={onDemandForm.los}
                    onChange={(e) => setOnDemandForm(prev => ({ ...prev, los: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Any"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Guest
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={onDemandForm.guest}
                    onChange={(e) => setOnDemandForm(prev => ({ ...prev, guest: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Any"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowOnDemandModal(false)
                    setOnDemandForm({
                      checkInDate: '',
                      daysOfData: '',
                      selectedProperties: [],
                      selectedChannels: [],
                      los: '',
                      guest: ''
                    })
                  }}
                  className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleOnDemandSubmit}
                  className="px-6 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Generate Report</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}