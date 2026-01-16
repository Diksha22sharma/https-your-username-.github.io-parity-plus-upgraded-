import { useState, useMemo, Fragment, useEffect, useRef } from 'react'
import { Settings, MessageSquare, Zap, Filter, X, ChevronDown, ChevronRight, Eye, ExternalLink, BookOpen, ChevronUp, Calendar, Globe, CheckCircle, Sliders, UtensilsCrossed, Coffee, Bed } from 'lucide-react'
import { Violation, FilterState } from '../../types'

interface DetailedViewProps {
  violations: Violation[]
  onReasonUpdate?: (violationId: string, newReason: string) => void
  selectedChannelGroup?: string
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

type Severity = 'Trivial' | 'Minor' | 'Major' | 'Critical'

// Define channels to display
const CHANNELS = ['Expedia', 'Booking.com', 'Agoda', 'Hotels.com', 'Tripadvisor', 'Priceline']

// Map POS to Currency
const getCurrencyFromPOS = (pos: string): string => {
  const posToCurrency: Record<string, string> = {
    'US': 'USD',
    'UK': 'GBP',
    'DE': 'EUR',
    'FR': 'EUR',
    'CA': 'CAD',
    'AU': 'AUD'
  }
  return posToCurrency[pos] || 'USD'
}

export default function DetailedView({ violations, onReasonUpdate, selectedChannelGroup }: DetailedViewProps) {
  const [viewAll, setViewAll] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(15)
  const [showColumnManager, setShowColumnManager] = useState(false)
  const [selectionMode, setSelectionMode] = useState<'reason' | 'test' | 'buzz' | null>(null)
  const [selectedRateCells, setSelectedRateCells] = useState<Set<string>>(new Set())
  const [showBulkConfirm, setShowBulkConfirm] = useState(false)
  const [bulkReasonValue, setBulkReasonValue] = useState<string>('--')
  const [editingReasonId, setEditingReasonId] = useState<string | null>(null)
  const [editingReasonValue, setEditingReasonValue] = useState<string>('')
  const [buzzCounts, setBuzzCounts] = useState<Record<string, number>>({})
  const [testBookingClicked, setTestBookingClicked] = useState<Set<string>>(new Set())
  
  // Expanded state for channel columns (Variance, Actions, Reasons)
  const [expandedChannels, setExpandedChannels] = useState<Set<string>>(new Set())
  
  // Table inline filter states
  const [tableSeverityFilters, setTableSeverityFilters] = useState<string[]>([])
  const [tableRAFilter, setTableRAFilter] = useState<string>('All') // 'All', 'Rate', 'Availability'
  const [tableReasonFilter, setTableReasonFilter] = useState<string>('All') // 'All' or specific reason
  const [isQuickFiltersExpanded, setIsQuickFiltersExpanded] = useState<boolean>(false)
  
  const handleReasonEdit = (violationId: string, currentReason: string) => {
    setEditingReasonId(violationId)
    // If reason is blank/empty, show "--" in the dropdown
    setEditingReasonValue(currentReason === '' || !currentReason ? '--' : currentReason)
  }

  const handleReasonSave = (violationId: string) => {
    // If "--" is selected, save as empty string (blank reason)
    const reasonToSave = editingReasonValue === '--' ? '' : editingReasonValue
    onReasonUpdate?.(violationId, reasonToSave)
    setEditingReasonId(null)
    setEditingReasonValue('')
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
  }

  // Check if there are any violations with enabled Buzz buttons (no reason)
  
  // Filter states matching Overview page
  const [dateRangeOption, setDateRangeOption] = useState<string>('30')
  const [viewBy, setViewBy] = useState<string>('Brand')
  const [selectedChannels, setSelectedChannels] = useState<string[]>(['All'])
  const [customDateStart, setCustomDateStart] = useState<string>('')
  const [customDateEnd, setCustomDateEnd] = useState<string>('')
  const [isChannelDropdownOpen, setIsChannelDropdownOpen] = useState<boolean>(false)
  const [isDateRangeDropdownOpen, setIsDateRangeDropdownOpen] = useState<boolean>(false)
  const [isViewByDropdownOpen, setIsViewByDropdownOpen] = useState<boolean>(false)
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState<boolean>(false)
  const channelDropdownRef = useRef<HTMLDivElement>(null)
  const dateRangeDropdownRef = useRef<HTMLDivElement>(null)
  const viewByDropdownRef = useRef<HTMLDivElement>(null)
  
  // Additional filter states
  const [rateRange, setRateRange] = useState<{ min: string; max: string }>({ min: '', max: '' })
  const [selectedRooms, setSelectedRooms] = useState<string[]>([])
  const [selectedInclusions, setSelectedInclusions] = useState<string[]>([])
  const [losRange, setLosRange] = useState<{ min: string; max: string }>({ min: '', max: '' })
  const [guestCount, setGuestCount] = useState<string>('')
  const [selectedCurrency, setSelectedCurrency] = useState<string>('')
  const [selectedChannelTypes, setSelectedChannelTypes] = useState<string[]>([])
  const [contractStatus, setContractStatus] = useState<string>('All')

  const availableChannels = ['All', 'Meta', 'Booking.com', 'Expedia', 'Agoda', 'TripAdvisor', 'Hotels.com', 'Priceline', 'Trivago']

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
      if (viewByDropdownRef.current && !viewByDropdownRef.current.contains(event.target as Node)) {
        setIsViewByDropdownOpen(false)
      }
    }

    if (isChannelDropdownOpen || isDateRangeDropdownOpen || isViewByDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isChannelDropdownOpen, isDateRangeDropdownOpen, isViewByDropdownOpen])

  // Format date for display
  const formatDateRange = () => {
    if (dateRangeOption === 'custom' && customDateStart && customDateEnd) {
      const start = new Date(customDateStart)
      const end = new Date(customDateEnd)
      return ` • ${start.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })} - ${end.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}`
    }
    return ''
  }
  
  // Collapsible filter sections
  const [expandedFilterSections, setExpandedFilterSections] = useState<Set<string>>(new Set([
    'rateTypes', 'roomTypes', 'los', 'occupancy', 'currency', 'pos', 'brand', 'subBrand', 'hotel', 'channel', 'dateRange', 'severity'
  ]))
  
  // Filter state
  const [filters, setFilters] = useState<FilterState & { currency?: string[]; rateType?: string; roomType?: string }>({
    los: undefined,
    occupancy: undefined,
    pos: undefined,
    brand: undefined,
    subBrand: undefined,
    hotel: undefined,
    channel: undefined,
    dateRange: undefined,
    severity: undefined,
    currency: undefined,
    rateType: undefined,
    roomType: undefined
  })
  
  // Temporary filter state for applying
  const [tempFilters, setTempFilters] = useState<FilterState & { currency?: string[]; rateType?: string; roomType?: string }>(filters)

  // Sync tempFilters when filters change externally
  useEffect(() => {
    setTempFilters(filters)
  }, [filters])

  // Extract unique values from violations for filter options
  const filterOptions = useMemo(() => {
    const unique = {
      brands: new Set<string>(),
      subBrands: new Set<string>(),
      hotels: new Set<string>(),
      channels: new Set<string>(),
      pos: new Set<string>(),
      currencies: new Set<string>(),
      severities: new Set<string>(),
      rooms: new Set<string>()
    }

    violations.forEach(v => {
      if (v.brand) unique.brands.add(v.brand)
      if (v.subBrand) unique.subBrands.add(v.subBrand)
      unique.hotels.add(v.hotel)
      unique.channels.add(v.channel)
      unique.pos.add(v.pos)
      unique.currencies.add(getCurrencyFromPOS(v.pos))
      unique.severities.add(v.severity)
      unique.rooms.add(v.room)
    })

    return {
      brands: Array.from(unique.brands).sort(),
      subBrands: Array.from(unique.subBrands).sort(),
      hotels: Array.from(unique.hotels).sort(),
      channels: Array.from(unique.channels).sort(),
      pos: Array.from(unique.pos).sort(),
      currencies: Array.from(unique.currencies).sort(),
      severities: Array.from(unique.severities).sort(),
      rooms: Array.from(unique.rooms).sort()
    }
  }, [violations])

  const mapSeverity = (severity: string): Severity => {
    switch (severity) {
      case 'Trivial':
        return 'Trivial'
      case 'Minor':
        return 'Minor'
      case 'Major':
        return 'Major'
      case 'Critical':
        return 'Critical'
      // Backward compatibility with old names
      case 'Low':
        return 'Trivial'
      case 'Medium':
        return 'Minor'
      case 'High':
        return 'Major'
      default:
        return 'Trivial'
    }
  }

  const getSeverityDisplay = (severity: string): string => {
    return mapSeverity(severity)
  }

  const getSeverityColor = (severity: string) => {
    const mapped = mapSeverity(severity)
    switch (mapped) {
      case 'Trivial':
        return 'text-green-600 bg-green-50'
      case 'Minor':
        return 'text-blue-600 bg-blue-50'
      case 'Major':
        return 'text-orange-600 bg-orange-50'
      case 'Critical':
        return 'text-red-600 bg-red-50'
    }
  }

  // Filter violations based on table inline filters
  const filteredViolations = useMemo(() => {
    return violations.filter(v => {
      if (selectedChannelGroup === 'Meta' && v.channelType !== 'Meta') return false
      // Table inline filters
      if (tableSeverityFilters.length > 0 && !tableSeverityFilters.includes(v.severity)) return false
      if (tableRAFilter !== 'All' && v.ra !== tableRAFilter) return false
      if (tableReasonFilter !== 'All' && v.reason !== tableReasonFilter) return false
      
      return true
    })
  }, [violations, tableSeverityFilters, tableRAFilter, tableReasonFilter, selectedChannelGroup])

  const totalPages = Math.ceil(filteredViolations.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedViolations = filteredViolations.slice(startIndex, endIndex)

  const toggleRateSelection = (violationId: string, channel: string) => {
    const key = `${violationId}::${channel}`
    setSelectedRateCells(prev => {
      const newSet = new Set(prev)
      if (newSet.has(key)) {
        newSet.delete(key)
      } else {
        newSet.add(key)
      }
      return newSet
    })
  }

  const isMetaView = selectedChannelGroup === 'Meta' || selectedChannels.includes('Meta') || selectedChannelTypes.includes('Meta')
  const visibleChannels = CHANNELS.slice(0, 10)
  const selectableCellKeys = useMemo(() => {
    const keys: string[] = []
    paginatedViolations.forEach(violation => {
      if (selectionMode === 'test' && testBookingClicked.has(violation.id)) {
        return
      }
      visibleChannels.forEach(channel => {
        keys.push(`${violation.id}::${channel}`)
      })
    })
    return keys
  }, [paginatedViolations, visibleChannels, selectionMode, testBookingClicked])

  const selectedViolationIds = useMemo(() => {
    const ids = new Set<string>()
    selectedRateCells.forEach(key => {
      const [violationId] = key.split('::')
      ids.add(violationId)
    })
    return ids
  }, [selectedRateCells])

  const allSelectableSelected = selectableCellKeys.length > 0 && selectedRateCells.size === selectableCellKeys.length

  const resetSelection = () => {
    setSelectionMode(null)
    setSelectedRateCells(new Set())
    setBulkReasonValue('--')
    setShowBulkConfirm(false)
  }

  const handleSelectionMode = (mode: 'reason' | 'test' | 'buzz') => {
    if (selectionMode === mode) {
      resetSelection()
      return
    }
    setSelectionMode(mode)
    setSelectedRateCells(new Set())
    setBulkReasonValue('--')
  }

  const handleBulkConfirm = () => {
    if (!selectionMode) return
    if (selectionMode === 'reason') {
      const reasonToSave = bulkReasonValue === '--' ? '' : bulkReasonValue
      selectedViolationIds.forEach(id => {
        onReasonUpdate?.(id, reasonToSave)
      })
    }
    if (selectionMode === 'test') {
      setTestBookingClicked(prev => {
        const next = new Set(prev)
        selectedViolationIds.forEach(id => next.add(id))
        return next
      })
    }
    if (selectionMode === 'buzz') {
      selectedViolationIds.forEach(id => {
        setBuzzCounts(prev => ({
          ...prev,
          [id]: (prev[id] || 0) + 1
        }))
      })
    }
    resetSelection()
  }

  const toggleChannel = (channel: string) => {
    setExpandedChannels(prev => {
      const newSet = new Set(prev)
      if (newSet.has(channel)) {
        newSet.delete(channel)
      } else {
        newSet.add(channel)
      }
      return newSet
    })
  }

  // When View All is clicked, expand all collapsed sections
  const handleViewAllClick = () => {
    const newViewAll = !viewAll
    setViewAll(newViewAll)
    if (newViewAll) {
      // Expand all channels
      setExpandedChannels(new Set(CHANNELS))
    } else {
      // Collapse all when unchecked
      setExpandedChannels(new Set())
    }
  }

  const calculateVariance = (channelRate: number, brandRate: number) => {
    return ((channelRate - brandRate) / brandRate * 100).toFixed(2)
  }

  const toggleFilter = (filterKey: keyof FilterState, value: string) => {
    setTempFilters(prev => {
      const current = (prev[filterKey] as string[]) || []
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value]
      return { ...prev, [filterKey]: updated.length > 0 ? updated : undefined }
    })
  }

  const toggleCurrency = (currency: string) => {
    setTempFilters(prev => {
      const current = prev.currency || []
      const updated = current.includes(currency)
        ? current.filter(c => c !== currency)
        : [...current, currency]
      return { ...prev, currency: updated.length > 0 ? updated : undefined }
    })
  }

  const updateRangeFilter = (key: 'los' | 'occupancy', field: 'min' | 'max', value: string) => {
    setTempFilters(prev => {
      const current = prev[key] || {}
      const numValue = value === '' ? undefined : parseInt(value, 10)
      return {
        ...prev,
        [key]: {
          ...current,
          [field]: numValue
        }
      }
    })
  }

  const updateDateRange = (field: 'start' | 'end', value: string) => {
    setTempFilters(prev => {
      const current = prev.dateRange || { start: '', end: '' }
      const updated = {
        ...current,
        [field]: value
      }
      // Only set dateRange if both start and end are present
      if (updated.start && updated.end) {
        return {
          ...prev,
          dateRange: updated as { start: string; end: string }
        }
      }
      // If either is missing, keep the partial dateRange or remove it
      return {
        ...prev,
        dateRange: value ? updated as { start: string; end: string } : undefined
      }
    })
  }

  const clearFilters = () => {
    const clearedFilters = {
      los: undefined,
      occupancy: undefined,
      pos: undefined,
      brand: undefined,
      subBrand: undefined,
      hotel: undefined,
      channel: undefined,
      dateRange: undefined,
      severity: undefined,
      currency: undefined,
      rateType: undefined,
      roomType: undefined
    }
    setFilters(clearedFilters)
    setTempFilters(clearedFilters)
    setCurrentPage(1)
  }

  const toggleFilterSection = (section: string) => {
    setExpandedFilterSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(section)) {
        newSet.delete(section)
      } else {
        newSet.add(section)
      }
      return newSet
    })
  }

  const applyFilters = () => {
    setFilters(tempFilters)
    setCurrentPage(1)
  }

  const resetFilters = () => {
    const resetFilters = {
      los: undefined,
      occupancy: undefined,
      pos: undefined,
      brand: undefined,
      subBrand: undefined,
      hotel: undefined,
      channel: undefined,
      dateRange: undefined,
      severity: undefined,
      currency: undefined,
      rateType: undefined,
      roomType: undefined
    }
    setTempFilters(resetFilters)
  }

  const getRateColor = (wlm: 'Win' | 'Loss' | 'Meet') => {
    switch (wlm) {
      case 'Win':
        return 'text-orange-600 font-semibold'
      case 'Loss':
        return 'text-red-600 font-semibold'
      case 'Meet':
        return 'text-green-600 font-semibold'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const day = date.getDate()
    const month = date.toLocaleString('en-US', { month: 'short' })
    const year = date.getFullYear().toString().slice(-2)
    return `${day} ${month} ${year}`
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

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const getChannelData = (violation: Violation, channelName: string) => {
    const baseRate = violation.rate
    const seed = channelName.charCodeAt(0) + violation.id.charCodeAt(violation.id.length - 1)
    const variance = ((seed % 40) - 20) / 100
    const channelRate = baseRate * (1 + variance)
    
    const brandRate = violation.brandRate || violation.rate * 0.95
    let channelWlm: 'Win' | 'Loss' | 'Meet'
    const diff = (channelRate - brandRate) / brandRate
    if (diff < -0.05) {
      channelWlm = 'Loss'
    } else if (diff > 0.05) {
      channelWlm = 'Win'
    } else {
      channelWlm = 'Meet'
    }
    
    return {
      rate: channelRate,
      wlm: channelWlm,
      currency: violation.pos === 'UK' ? 'GBP' : 'USD'
    }
  }

  const hasActiveFilters = filters.los || filters.occupancy || 
    (filters.pos && filters.pos.length > 0) ||
    (filters.brand && filters.brand.length > 0) ||
    (filters.subBrand && filters.subBrand.length > 0) ||
    (filters.hotel && filters.hotel.length > 0) ||
    (filters.channel && filters.channel.length > 0) ||
    filters.dateRange ||
    (filters.severity && filters.severity.length > 0) ||
    (filters.currency && filters.currency.length > 0) ||
    filters.rateType ||
    filters.roomType

  const isCritical = (severity: string) => {
    return mapSeverity(severity) === 'Critical'
  }

  return (
    <div className="space-y-4 relative">
      {/* Filters are now in the parent component above the tabs */}
      
      {/* Controls */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center space-x-3 flex-wrap gap-2 flex-1">
          <button
            onClick={() => setIsQuickFiltersExpanded(!isQuickFiltersExpanded)}
            className={`px-3 py-1.5 text-sm rounded-lg flex items-center space-x-2 transition-colors ${
              isQuickFiltersExpanded || tableSeverityFilters.length > 0 || tableRAFilter !== 'All' || tableReasonFilter !== 'All'
                ? 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                : 'text-gray-700 hover:bg-gray-100 bg-white border border-gray-300'
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
            onClick={handleViewAllClick}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-sm ${
              viewAll 
                ? 'bg-primary-600 text-white hover:bg-primary-700' 
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            <span>View All</span>
          </button>
          <button 
            onClick={() => handleSelectionMode('reason')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-sm border ${
              selectionMode === 'reason'
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Add Reason</span>
          </button>
          <button 
            onClick={() => handleSelectionMode('test')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-sm border ${
              selectionMode === 'test'
                ? 'bg-purple-600 text-white border-purple-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
            }`}
            disabled={filteredViolations.length === 0}
            title={filteredViolations.length === 0 ? 'No violations available' : 'Select rates for test booking'}
          >
            <BookOpen className="w-4 h-4" />
            <span>Test Booking</span>
          </button>
          <button 
            onClick={() => handleSelectionMode('buzz')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-sm border ${
              selectionMode === 'buzz'
                ? 'bg-orange-600 text-white border-orange-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Buzz</span>
          </button>
          {selectionMode && (
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
              <span className="text-xs text-gray-500">
                Select rates to apply {selectionMode === 'reason' ? 'reason' : selectionMode === 'test' ? 'test booking' : 'buzz'}
              </span>
              <span className="text-sm text-gray-700">
                {selectedRateCells.size} rate{selectedRateCells.size === 1 ? '' : 's'} selected
              </span>
              <label className="flex items-center gap-1 text-xs text-gray-600">
                <input
                  type="checkbox"
                  checked={allSelectableSelected}
                  onChange={() => {
                    if (allSelectableSelected) {
                      setSelectedRateCells(new Set())
                    } else {
                      setSelectedRateCells(new Set(selectableCellKeys))
                    }
                  }}
                  className="w-4 h-4 rounded border-gray-300 focus:ring-2 focus:ring-primary-500"
                />
                All
              </label>
              <button
                onClick={() => setShowBulkConfirm(true)}
                disabled={selectedRateCells.size === 0}
                className="px-2 py-1 text-xs font-medium bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
              <button
                onClick={resetSelection}
                className="px-2 py-1 text-xs font-medium text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
        <div className="flex-shrink-0">
          <button
            onClick={() => setShowColumnManager(!showColumnManager)}
            className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-sm bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400"
          >
            <Settings className="w-4 h-4" />
            <span>Manage Columns</span>
          </button>
        </div>
      </div>

      {showColumnManager && (
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm font-medium text-gray-700 mb-3">Select visible columns:</p>
          <div className="grid grid-cols-4 gap-2">
            {['Hotel', 'Curr.', 'Check in', 'Brand Price', ...CHANNELS].map(col => (
              <label key={col} className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="text-gray-700">{col}</span>
              </label>
            ))}
          </div>
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
              <p className="text-[11px] text-gray-500 mt-1">
                Entries available: {filteredViolations.length}
              </p>
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

      <div className="card relative flex flex-col">
        <div className={`flex-1 ${expandedChannels.size > 0 ? 'overflow-x-auto max-h-[600px]' : 'overflow-hidden'}`} style={{ width: '100%' }}>
          <table className="border-collapse" style={{ width: expandedChannels.size > 0 ? 'max-content' : '100%', tableLayout: expandedChannels.size > 0 ? 'auto' : 'fixed' }}>
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-0 py-2 w-1 min-w-[4px]"></th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase whitespace-nowrap min-w-[120px]">Hotel</th>
              {isMetaView && (
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase whitespace-nowrap min-w-[120px]">Channel Name</th>
              )}
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase whitespace-nowrap min-w-[60px]">Curr.</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase whitespace-nowrap min-w-[100px]">Check in</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase whitespace-nowrap min-w-[100px]">Shop Date</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase whitespace-nowrap min-w-[100px] sticky left-0 bg-gray-50 z-10">Brand Price</th>
              {visibleChannels.map((channel, index) => {
                const isExpanded = expandedChannels.has(channel)
                return (
                  <Fragment key={channel}>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase whitespace-nowrap min-w-[120px]">
                      <div className="flex items-center space-x-1">
                        <span>{isMetaView ? `Rank ${index + 1}` : channel}</span>
                        <button
                          onClick={() => toggleChannel(channel)}
                          className="p-0.5 hover:bg-gray-200 rounded transition-colors flex-shrink-0"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-3 h-3 text-gray-600" />
                          ) : (
                            <ChevronRight className="w-3 h-3 text-gray-600" />
                          )}
                        </button>
                      </div>
                    </th>
                    {isExpanded && (
                      <>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase whitespace-nowrap min-w-[90px]">Variance</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase whitespace-nowrap min-w-[100px]">Severity</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase whitespace-nowrap min-w-[180px]">Actions</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase whitespace-nowrap min-w-[180px]">Reasons</th>
                      </>
                    )}
                  </Fragment>
                )
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedViolations.length === 0 ? (
              <tr>
                <td colSpan={6 + (isMetaView ? 1 : 0) + visibleChannels.length + (expandedChannels.size * 4)} className="px-3 py-8 text-center text-sm text-gray-500">
                  No violations found matching the selected filters.
                </td>
              </tr>
            ) : (
              paginatedViolations.map((violation) => {
                const brandData = {
                  rate: violation.brandRate || violation.rate * 0.95,
                  wlm: violation.wlm,
                  currency: violation.pos === 'UK' ? 'GBP' : 'USD'
                }
                const channelDataMap = new Map(
                  CHANNELS.map(channel => [channel, getChannelData(violation, channel)])
                )
                const isSelected = selectedViolationIds.has(violation.id)
                const leftEdgeColor = brandData.wlm === 'Loss' ? 'bg-red-300' : 
                                     brandData.wlm === 'Meet' ? 'bg-green-300' : 
                                     'bg-orange-300'

                return (
                  <tr key={violation.id} className={`hover:bg-gray-50 transition-colors ${isSelected ? 'bg-blue-50' : ''} relative`}>
                    <td className="w-1 p-0 min-w-[4px]">
                      <div className={`w-full h-full ${leftEdgeColor}`}></div>
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap min-w-[120px]">
                      {violation.hotel.length > 20 ? `${violation.hotel.substring(0, 20)}...` : violation.hotel}
                    </td>
                    {isMetaView && (
                      <td className="px-3 py-3 text-sm text-gray-700 whitespace-nowrap min-w-[140px]">
                        {violation.channelType === 'Meta' ? violation.channel : 'Meta'}
                      </td>
                    )}
                    <td className="px-3 py-3 text-sm text-gray-700 whitespace-nowrap min-w-[60px]">
                      {brandData.currency}
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-700 whitespace-nowrap min-w-[100px]">
                      {formatDate(violation.date)}
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-700 whitespace-nowrap min-w-[100px]">
                      {violation.date}
                    </td>
                     <td className="px-3 py-3 sticky left-0 bg-white z-10 whitespace-nowrap min-w-[100px]">
                       <div className="flex flex-col gap-1">
                         <span className="text-sm font-medium text-gray-900">
                           {formatCurrency(brandData.rate, brandData.currency).replace(/[^\d.]/g, '')}
                         </span>
                         {!isMetaView && (
                           <div className="flex items-center gap-1.5">
                             <span className="text-[10px] font-semibold text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">
                               {getRoomAbbreviation(violation.room)}
                             </span>
                             <div className="flex items-center">
                               {getInclusionIcon(violation.board)}
                             </div>
                           </div>
                         )}
                       </div>
                     </td>
                     {visibleChannels.map(channel => {
                       const channelData = channelDataMap.get(channel)!
                       const isExpanded = expandedChannels.has(channel)
                       const variance = calculateVariance(channelData.rate, brandData.rate)
                       
                       return (
                         <Fragment key={channel}>
                           <td className="px-3 py-3 whitespace-nowrap min-w-[120px]">
                            <div className="flex items-start space-x-2">
                              {selectionMode && !(selectionMode === 'test' && testBookingClicked.has(violation.id)) && (
                                <input
                                  type="checkbox"
                                  checked={selectedRateCells.has(`${violation.id}::${channel}`)}
                                  onChange={() => toggleRateSelection(violation.id, channel)}
                                  className="mt-0.5 w-4 h-4 rounded border-gray-300 focus:ring-2 focus:ring-primary-500"
                                  aria-label={`Select ${channel} rate`}
                                />
                              )}
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center space-x-1.5">
                                  <span className={`text-sm font-medium ${getRateColor(channelData.wlm)}`}>
                                    {formatCurrency(channelData.rate, channelData.currency).replace(/[^\d.]/g, '')}
                                  </span>
                                  {isCritical(violation.severity) && (
                                    <div className="w-2 h-2 bg-red-600 rounded-full flex-shrink-0" title="Critical" />
                                  )}
                                </div>
                                {isMetaView ? (
                                  <div className="text-[10px] text-gray-500">
                                    Via {channel}
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] font-semibold text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">
                                      {getRoomAbbreviation(violation.room)}
                                    </span>
                                    <div className="flex items-center">
                                      {getInclusionIcon(violation.board)}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                           </td>
                          {isExpanded && (
                            <>
                              <td className="px-3 py-3 text-sm text-gray-700 whitespace-nowrap min-w-[90px]">
                                {variance}%
                              </td>
                              <td className="px-3 py-3 whitespace-nowrap min-w-[100px]">
                                <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${getSeverityColor(violation.severity)}`}>
                                  {getSeverityDisplay(violation.severity)}
                                </span>
                              </td>
                              <td className="px-3 py-3 whitespace-nowrap min-w-[180px]">
                                <div className="flex items-center space-x-2 flex-wrap gap-1">
                                  <button
                                    onClick={() => setTestBookingClicked(prev => new Set(prev).add(violation.id))}
                                    disabled={testBookingClicked.has(violation.id)}
                                    className={`relative p-1.5 rounded transition-colors flex-shrink-0 ${
                                      testBookingClicked.has(violation.id)
                                        ? 'text-gray-400 cursor-not-allowed bg-gray-50'
                                        : 'text-purple-600 hover:bg-purple-50'
                                    }`}
                                    title={testBookingClicked.has(violation.id) ? 'Test Booking Created' : 'Test Booking'}
                                  >
                                    <BookOpen className="w-4 h-4" />
                                    {testBookingClicked.has(violation.id) && (
                                      <CheckCircle className="absolute -top-1 -right-1 w-4 h-4 text-green-600 bg-white rounded-full" />
                                    )}
                                  </button>
                                  {violation.cacheUrl && (
                                    <button
                                      onClick={() => window.open(violation.cacheUrl, '_blank')}
                                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors flex-shrink-0"
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
                                      className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors flex-shrink-0"
                                      title="Open Live Site"
                                    >
                                      <ExternalLink className="w-4 h-4" />
                                    </a>
                                  )}
                                  <button
                                    onClick={() => handleBuzzClick(violation.id)}
                                    disabled={!!violation.reason && violation.reason.trim() !== ''}
                                    className={`relative p-1.5 rounded transition-colors flex-shrink-0 ${
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
                              <td className="px-3 py-3 whitespace-nowrap min-w-[180px]">
                                {editingReasonId === violation.id ? (
                                  <div className="flex items-center space-x-2">
                                    <select
                                      value={editingReasonValue}
                                      onChange={(e) => setEditingReasonValue(e.target.value)}
                                      className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
                            </>
                          )}
                        </Fragment>
                      )
                    })}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
        </div>
        
        {/* Pagination - Fixed at bottom of table, outside scroll area */}
        <div className="bg-white border-t border-gray-200 px-4 py-3 flex items-center justify-center mt-auto">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
            >
              &lt;
            </button>
            <span className="px-4 py-1.5 text-sm text-gray-700 font-medium">
              {startIndex + 1}-{Math.min(endIndex, filteredViolations.length)} of {filteredViolations.length}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
            >
              &gt;
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Action Confirmation Modal */}
      {showBulkConfirm && selectionMode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  selectionMode === 'reason'
                    ? 'bg-primary-100'
                    : selectionMode === 'test'
                      ? 'bg-purple-100'
                      : 'bg-orange-100'
                }`}>
                  {selectionMode === 'reason' && <MessageSquare className="w-6 h-6 text-primary-600" />}
                  {selectionMode === 'test' && <BookOpen className="w-6 h-6 text-purple-600" />}
                  {selectionMode === 'buzz' && <Zap className="w-6 h-6 text-orange-600" />}
                </div>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 text-center mb-2">
                {selectionMode === 'reason' ? 'Add Reason' : selectionMode === 'test' ? 'Send Test Booking' : 'Send Buzz'}
              </h2>
              <p className="text-sm text-gray-600 text-center mb-4">
                {selectedRateCells.size} rate{selectedRateCells.size === 1 ? '' : 's'} selected across {selectedViolationIds.size} violation{selectedViolationIds.size === 1 ? '' : 's'}.
              </p>
              {selectionMode === 'reason' && (
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
                  <select
                    value={bulkReasonValue}
                    onChange={(e) => setBulkReasonValue(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    {reasonOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="flex items-center justify-center space-x-3">
                <button
                  onClick={() => setShowBulkConfirm(false)}
                  className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkConfirm}
                  className={`px-6 py-2.5 text-sm font-medium text-white rounded-lg transition-colors ${
                    selectionMode === 'reason'
                      ? 'bg-primary-600 hover:bg-primary-700'
                      : selectionMode === 'test'
                        ? 'bg-purple-600 hover:bg-purple-700'
                        : 'bg-orange-600 hover:bg-orange-700'
                  }`}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
