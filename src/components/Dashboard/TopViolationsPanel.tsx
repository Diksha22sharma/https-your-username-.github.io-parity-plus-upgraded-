import { useState } from 'react'
import { Building2, ChevronRight, Eye, CheckCircle, XCircle, X, ArrowLeft, BookOpen, ExternalLink, ArrowRight, Download } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

interface WLMData {
  win: number
  meet: number
  loss: number
  totalInstances: number
}

interface ViolatingChannel {
  name: string
  violationPercent: number
}

interface SeverityData {
  critical: number
  major: number
  minor: number
  trivial: number
  total: number
}

interface TopViolation {
  name: string
  violations: number
  parityScore: number
  trend?: number
  type: 'property' | 'channel'
  channelType?: 'OTA' | 'Meta' | 'Wholesaler'
  wlm?: WLMData
  instances?: number
  violatingChannel?: ViolatingChannel
  revenueLoss?: number
  currency?: string
  availabilityHealth?: number
  availableChannels?: string[]
  notAvailableChannels?: string[]
  lossPercent?: number
  severity?: SeverityData
}

interface ViolationDetail {
  id: string
  hotel: string
  channel: string
  channelType: 'OTA' | 'Meta'
  subChannel?: string
  date: string
  brandRate: number
  otaRate: number
  variancePercent: number
  severity: 'Critical' | 'Major' | 'Minor' | 'Trivial'
  reason: string
  revenueLoss: number
}

interface TopViolationsPanelProps {
  topProperties?: TopViolation[]
  onPropertyClick?: (property: TopViolation) => void
}

// Mock violation details data
const getMockViolationDetails = (propertyName: string): ViolationDetail[] => {
  return [
    {
      id: '1',
      hotel: propertyName || 'Hotel 1',
      channel: 'Booking.com',
      channelType: 'OTA',
      date: '2026-01-13',
      brandRate: 241.89,
      otaRate: 231.37,
      variancePercent: -4.35,
      severity: 'Critical',
      reason: 'Rate plan difference',
      revenueLoss: 477.87
    },
    {
      id: '2',
      hotel: propertyName || 'Hotel 2',
      channel: 'TripAdvisor',
      channelType: 'Meta',
      subChannel: 'via Expedia',
      date: '2026-01-14',
      brandRate: 303.58,
      otaRate: 319.09,
      variancePercent: 5.11,
      severity: 'Major',
      reason: 'Room or board difference',
      revenueLoss: 471.13
    },
    {
      id: '3',
      hotel: propertyName || 'Hotel 3',
      channel: 'Agoda',
      channelType: 'OTA',
      date: '2026-01-15',
      brandRate: 158.44,
      otaRate: 165.48,
      variancePercent: 4.44,
      severity: 'Minor',
      reason: 'Promotion/discount difference',
      revenueLoss: 5.24
    },
    {
      id: '4',
      hotel: propertyName || 'Hotel 4',
      channel: 'Kayak',
      channelType: 'Meta',
      subChannel: 'via Hotels.com',
      date: '2026-01-16',
      brandRate: 328.32,
      otaRate: 314.37,
      variancePercent: -4.25,
      severity: 'Trivial',
      reason: 'Bait & switch',
      revenueLoss: 49.22
    },
    {
      id: '5',
      hotel: propertyName || 'Hotel 1',
      channel: 'Expedia',
      channelType: 'OTA',
      date: '2026-01-17',
      brandRate: 275.50,
      otaRate: 289.25,
      variancePercent: 4.99,
      severity: 'Major',
      reason: 'Rate plan difference',
      revenueLoss: 325.15
    },
    {
      id: '6',
      hotel: propertyName || 'Hotel 2',
      channel: 'Hotels.com',
      channelType: 'OTA',
      date: '2026-01-18',
      brandRate: 198.75,
      otaRate: 190.20,
      variancePercent: -4.31,
      severity: 'Critical',
      reason: 'Bait & switch',
      revenueLoss: 512.45
    }
  ]
}

export default function TopViolationsPanel({
  topProperties = [],
  onPropertyClick
}: TopViolationsPanelProps) {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'violations' | 'availability'>('violations')
  const [selectedSeverityProperty, setSelectedSeverityProperty] = useState<TopViolation | null>(null)
  const [selectedPropertyDetails, setSelectedPropertyDetails] = useState<TopViolation | null>(null)


  // Sort properties by worst parity score (lowest first)
  const sortedProperties = [...topProperties].sort((a, b) => a.parityScore - b.parityScore)

  const calculateWLMPercentages = (wlm?: WLMData) => {
    if (!wlm || wlm.totalInstances === 0) return { win: 0, meet: 0, loss: 0 }
    return {
      win: (wlm.win / wlm.totalInstances) * 100,
      meet: (wlm.meet / wlm.totalInstances) * 100,
      loss: (wlm.loss / wlm.totalInstances) * 100
    }
  }

  const formatCurrency = (amount: number | undefined, currency: string = 'USD') => {
    if (!amount) return '0'
    const currencySymbols: Record<string, string> = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'INR': '₹',
      'JPY': '¥',
      'AUD': 'A$',
      'CAD': 'C$',
      'CHF': 'CHF',
      'CNY': '¥',
      'SGD': 'S$',
      'AED': 'AED',
      'SAR': 'SAR'
    }
    const symbol = currencySymbols[currency] || currency
    return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
  }

  const getAvailabilityHealthColor = (health: number | undefined) => {
    if (!health) return 'text-gray-400'
    if (health >= 80) return 'text-green-600'
    if (health >= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return 'bg-red-600 text-white'
      case 'Major':
        return 'bg-orange-500 text-white'
      case 'Minor':
        return 'bg-yellow-400 text-gray-900'
      case 'Trivial':
        return 'bg-green-400 text-gray-900'
      default:
        return 'bg-gray-200 text-gray-700'
    }
  }

  const getChannelTypeColor = (type: 'OTA' | 'Meta') => {
    return type === 'OTA' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
  }

  // Get channel details for a property (similar to getChannelPropertyDetails in Overview)
  const getPropertyChannelDetails = (propertyName: string) => {
    return [
      {
        channelName: 'Booking.com',
        channelType: 'OTA' as const,
        totalViolations: 45,
        rateViolations: 28,
        availabilityViolations: 17,
        revenueLoss: 1250.50,
        criticalIssues: 12,
        currency: 'USD'
      },
      {
        channelName: 'Expedia',
        channelType: 'OTA' as const,
        totalViolations: 38,
        rateViolations: 22,
        availabilityViolations: 16,
        revenueLoss: 980.25,
        criticalIssues: 8,
        currency: 'USD'
      },
      {
        channelName: 'Google Hotels',
        channelType: 'Meta' as const,
        totalViolations: 52,
        rateViolations: 35,
        availabilityViolations: 17,
        revenueLoss: 1650.75,
        criticalIssues: 15,
        currency: 'USD'
      },
      {
        channelName: 'TripAdvisor',
        channelType: 'Meta' as const,
        totalViolations: 31,
        rateViolations: 18,
        availabilityViolations: 13,
        revenueLoss: 720.40,
        criticalIssues: 6,
        currency: 'USD'
      },
      {
        channelName: 'Agoda',
        channelType: 'OTA' as const,
        totalViolations: 42,
        rateViolations: 26,
        availabilityViolations: 16,
        revenueLoss: 1100.60,
        criticalIssues: 10,
        currency: 'USD'
      },
      {
        channelName: 'Hotels.com',
        channelType: 'OTA' as const,
        totalViolations: 28,
        rateViolations: 15,
        availabilityViolations: 13,
        revenueLoss: 650.30,
        criticalIssues: 5,
        currency: 'USD'
      }
    ]
  }

  const handleViewMoreDetails = (propertyName: string, channelName: string) => {
    navigate('/reports', { state: { channelFilter: channelName, hotelFilter: propertyName } })
  }

  const getChannelLogo = (channelName: string) => {
    return channelName.charAt(0).toUpperCase()
  }

  // Calculate severity distribution based on loss percentage
  const calculateSeverity = (property: TopViolation): SeverityData => {
    if (property.severity) {
      return property.severity
    }
    
    // Calculate loss percentage from parity score
    const lossPercent = property.lossPercent || Math.abs(100 - property.parityScore)
    const totalViolations = property.violations || 100
    
    // Distribute violations across severity levels based on loss percentage
    let critical = 0
    let major = 0
    let minor = 0
    let trivial = 0
    
    if (lossPercent > 10) {
      // More critical violations
      critical = Math.floor(totalViolations * 0.5)
      major = Math.floor(totalViolations * 0.3)
      minor = Math.floor(totalViolations * 0.15)
      trivial = totalViolations - critical - major - minor
    } else if (lossPercent > 5) {
      // More major violations
      critical = Math.floor(totalViolations * 0.2)
      major = Math.floor(totalViolations * 0.5)
      minor = Math.floor(totalViolations * 0.2)
      trivial = totalViolations - critical - major - minor
    } else if (lossPercent > 2) {
      // More minor violations
      critical = Math.floor(totalViolations * 0.1)
      major = Math.floor(totalViolations * 0.2)
      minor = Math.floor(totalViolations * 0.5)
      trivial = totalViolations - critical - major - minor
    } else {
      // More trivial violations
      critical = Math.floor(totalViolations * 0.05)
      major = Math.floor(totalViolations * 0.1)
      minor = Math.floor(totalViolations * 0.2)
      trivial = totalViolations - critical - major - minor
    }
    
    return {
      critical: Math.max(0, critical),
      major: Math.max(0, major),
      minor: Math.max(0, minor),
      trivial: Math.max(0, trivial),
      total: totalViolations
    }
  }

  const calculateSeverityPercentages = (severity: SeverityData) => {
    if (severity.total === 0) return { critical: 0, major: 0, minor: 0, trivial: 0 }
    return {
      critical: (severity.critical / severity.total) * 100,
      major: (severity.major / severity.total) * 100,
      minor: (severity.minor / severity.total) * 100,
      trivial: (severity.trivial / severity.total) * 100
    }
  }

  const downloadCsv = (filename: string, rows: string[][]) => {
    const csvContent = rows
      .map(row =>
        row
          .map(value => `"${String(value ?? '').replace(/"/g, '""')}"`)
          .join(',')
      )
      .join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    setTimeout(() => URL.revokeObjectURL(url), 0)
  }

  const handleExport = () => {
    if (activeTab === 'availability') {
      const rows = [
        ['Property', 'Availability Health %', 'Available Channels', 'Not-Available Channels']
      ]
      sortedProperties.forEach(property => {
        rows.push([
          property.name,
          property.availabilityHealth !== undefined ? property.availabilityHealth.toFixed(1) : '-',
          (property.availableChannels || []).join('; '),
          (property.notAvailableChannels || []).join('; ')
        ])
      })
      downloadCsv('property-availability-view.csv', rows)
      return
    }

    const rows = [
      ['Property', 'Violations', 'Parity Score', 'Most Violating Channel', 'Revenue Loss', 'Severity Total']
    ]
    sortedProperties.forEach(property => {
      rows.push([
        property.name,
        property.violations,
        property.parityScore?.toFixed(1) ?? '-',
        property.violatingChannel?.name ?? '-',
        property.revenueLoss?.toFixed(2) ?? '-',
        property.severity?.total ?? property.violations ?? '-'
      ])
    })
    downloadCsv('property-view-violations.csv', rows)
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
          <div>
          <h2 className="text-base font-semibold text-gray-900">Property View</h2>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <Download className="w-3.5 h-3.5" />
          Export Excel
        </button>
      </div>

      <div className="overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-gray-200 mb-3">
            <nav className="flex space-x-4">
              <button
                onClick={() => setActiveTab('violations')}
                className={`py-2 px-1 border-b-2 font-medium text-xs transition-colors ${
                  activeTab === 'violations'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Most Violated Property
              </button>
        <button
                onClick={() => setActiveTab('availability')}
                className={`py-2 px-1 border-b-2 font-medium text-xs transition-colors ${
                  activeTab === 'availability'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Property Availability View
        </button>
            </nav>
          </div>

          {activeTab === 'violations' && (
            <>
          {/* Table Header - Fixed */}
          <div className="grid grid-cols-6 gap-3 px-3 py-2 bg-gray-50 border-b border-gray-200 text-[10px] font-semibold text-gray-600 uppercase sticky top-0 z-10">
            <div className="flex items-center space-x-1.5">
              <Building2 className="w-3 h-3 text-gray-600" />
              <span>Property</span>
            </div>
                <div className="text-center">Parity & WLM</div>
                <div className="text-center">Most Violating Channel</div>
            <div className="text-center">Revenue Loss</div>
            <div className="text-center">Severity</div>
            <div className="text-center">Actions</div>
      </div>

          {/* Table Body - Scrollable */}
          <div className="max-h-[400px] overflow-y-auto divide-y divide-gray-200">
            {sortedProperties.length === 0 ? (
              <div className="px-3 py-6 text-center text-xs text-gray-500">
                No property violations
            </div>
            ) : (
              sortedProperties.map((property, index) => {
                const wlmPercentages = calculateWLMPercentages(property.wlm)
                const severity = calculateSeverity(property)
                const severityPercentages = calculateSeverityPercentages(severity)
                
                // Prepare data for donut chart
                const wlmData = [
                  { name: 'Win', value: wlmPercentages.win, color: '#facc15' }, // yellow-400
                  { name: 'Meet', value: wlmPercentages.meet, color: '#22c55e' }, // green-500
                  { name: 'Loss', value: wlmPercentages.loss, color: '#ef4444' } // red-500
                ]
                
                return (
                  <button
                    key={`property-${index}-${property.name}`}
                    onClick={() => onPropertyClick?.(property)}
                    className="w-full text-left grid grid-cols-6 gap-3 px-3 py-2 hover:bg-gray-50 transition-colors items-center"
                  >
                    {/* Property Name */}
                    <div className="min-w-0">
                      <span className="text-xs font-semibold text-gray-900 truncate">{property.name}</span>
                    </div>

                    {/* Donut Chart with Parity Score in center */}
                    <div className="flex items-center justify-center">
                      <div className="relative w-16 h-16">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={wlmData}
                              cx="50%"
                              cy="50%"
                              innerRadius={18}
                              outerRadius={28}
                              paddingAngle={2}
                              dataKey="value"
                              startAngle={90}
                              endAngle={-270}
                            >
                              {wlmData.map((entry, idx) => (
                                <Cell key={`cell-${idx}`} fill={entry.color} />
                              ))}
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-[10px] font-bold text-gray-900 leading-tight">
                              {property.parityScore.toFixed(0)}%
                            </div>
                            <div className="text-[7px] text-gray-500 leading-tight">Parity</div>
                          </div>
                        </div>
                      </div>
                        </div>

                    {/* Most Violating Channel with % of Loss */}
                    <div className="text-center">
                      {property.violatingChannel ? (
                        <div className="flex flex-col items-center space-y-0.5">
                          <span className="text-xs font-medium text-gray-900">
                            {property.violatingChannel.name}
                          </span>
                          <span className="text-[10px] text-red-600 font-semibold">
                            {property.violatingChannel.violationPercent.toFixed(1)}% of Loss
                            </span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </div>

                    {/* Revenue Loss */}
                    <div className="text-center">
                      <span className="text-xs font-semibold text-red-600">
                        {formatCurrency(property.revenueLoss, property.currency)}
                              </span>
                    </div>

                    {/* Severity - Clickable */}
                    <div className="flex items-center justify-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedSeverityProperty(property)
                        }}
                        className="w-full max-w-[120px] flex flex-col items-center space-y-0.5 cursor-pointer hover:opacity-80 transition-opacity"
                        title="Click to view severity details"
                      >
                        <div className="h-3 rounded overflow-hidden flex border border-gray-200 w-full">
                          <div 
                            className="bg-red-700 flex items-center justify-center transition-all"
                            style={{ width: `${severityPercentages.critical}%` }}
                            title={`Critical: ${severity.critical}`}
                          >
                            {severityPercentages.critical > 10 && (
                              <span className="text-[7px] font-bold text-white">{severityPercentages.critical.toFixed(0)}%</span>
                            )}
                          </div>
                          <div 
                            className="bg-orange-500 flex items-center justify-center transition-all"
                            style={{ width: `${severityPercentages.major}%` }}
                            title={`Major: ${severity.major}`}
                          >
                            {severityPercentages.major > 10 && (
                              <span className="text-[7px] font-bold text-white">{severityPercentages.major.toFixed(0)}%</span>
                            )}
                          </div>
                          <div 
                            className="bg-amber-500 flex items-center justify-center transition-all"
                            style={{ width: `${severityPercentages.minor}%` }}
                            title={`Minor: ${severity.minor}`}
                          >
                            {severityPercentages.minor > 10 && (
                              <span className="text-[7px] font-bold text-gray-900">{severityPercentages.minor.toFixed(0)}%</span>
                            )}
                          </div>
                          <div 
                            className="bg-green-500 flex items-center justify-center transition-all"
                            style={{ width: `${severityPercentages.trivial}%` }}
                            title={`Trivial: ${severity.trivial}`}
                          >
                            {severityPercentages.trivial > 10 && (
                              <span className="text-[7px] font-bold text-white">{severityPercentages.trivial.toFixed(0)}%</span>
                            )}
                          </div>
                        </div>
                        <span className="text-[9px] text-gray-600 font-medium">
                          Total: {severity.total}
                        </span>
                      </button>
                      </div>

                    {/* View Details Icon */}
                    <div className="flex items-center justify-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedPropertyDetails(property)
                        }}
                        className="text-[10px] text-primary-600 hover:text-primary-700 font-medium flex items-center space-x-1 px-2 py-1 hover:bg-primary-50 rounded transition-colors"
                        title="View Details"
                      >
                        <span>View</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </button>
                )
              })
              )}
            </div>

            </>
          )}

          {activeTab === 'availability' && (
            <div className="overflow-hidden">
              {/* Overall Availability Score - Top Left */}
              {(() => {
                const allAvailableChannels = sortedProperties.flatMap(p => p.availableChannels || [])
                const allNotAvailableChannels = sortedProperties.flatMap(p => p.notAvailableChannels || [])
                const totalChannels = allAvailableChannels.length + allNotAvailableChannels.length
                const overallAvailabilityScore = totalChannels > 0 
                  ? (allAvailableChannels.length / totalChannels) * 100 
                  : 0
                
                return (
                  <div className="flex justify-start mb-3 px-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-600">Overall Availability Score:</span>
                      <span className={`text-sm font-bold ${getAvailabilityHealthColor(overallAvailabilityScore)}`}>
                        {overallAvailabilityScore.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                )
              })()}
              
              {/* Table Header - Fixed */}
              <div className="grid grid-cols-4 gap-3 px-3 py-2 bg-gray-50 border-b border-gray-200 text-[10px] font-semibold text-gray-600 uppercase sticky top-0 z-10">
                <div className="flex items-center space-x-1.5">
                  <Building2 className="w-3 h-3 text-gray-600" />
                  <span>Property</span>
                </div>
                <div className="text-center">Availability Health Score</div>
                <div className="text-center">Available Channels</div>
                <div className="text-center">Not-Available Channels</div>
          </div>

              {/* Table Body - Scrollable */}
              <div className="max-h-[400px] overflow-y-auto divide-y divide-gray-200">
                {sortedProperties.length === 0 ? (
                  <div className="px-3 py-6 text-center text-xs text-gray-500">
                    No property data
            </div>
                ) : (
                  sortedProperties.map((property, index) => {
                    const availableChannels = property.availableChannels || []
                    const notAvailableChannels = property.notAvailableChannels || []
                    
                    return (
                  <button
                        key={`property-avail-${index}-${property.name}`}
                        onClick={() => onPropertyClick?.(property)}
                        className="w-full text-left grid grid-cols-4 gap-3 px-3 py-2 hover:bg-gray-50 transition-colors items-center"
                      >
                        {/* Property Name */}
                        <div className="min-w-0">
                          <span className="text-xs font-semibold text-gray-900 truncate">{property.name}</span>
                        </div>

                        {/* Availability Health Score */}
                        <div className="text-center">
                          {property.availabilityHealth !== undefined ? (
                            <span className={`text-xs font-semibold ${getAvailabilityHealthColor(property.availabilityHealth)}`}>
                              {property.availabilityHealth.toFixed(1)}%
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                        </div>

                        {/* Available Channels - Show only top 3 */}
                        <div className="text-center">
                          {availableChannels.length > 0 ? (
                            <div className="flex flex-wrap items-center justify-center gap-1">
                              {availableChannels.slice(0, 3).map((channel, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded text-[9px] font-medium"
                                >
                                  <CheckCircle className="w-3 h-3" />
                                  {channel}
                                </span>
                              ))}
                              {availableChannels.length > 3 && (
                                <span className="text-[9px] text-gray-500 font-medium">
                                  +{availableChannels.length - 3} more
                              </span>
                            )}
                          </div>
                          ) : (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                        </div>

                        {/* Not-Available Channels - Show only top 3 */}
                        <div className="text-center">
                          {notAvailableChannels.length > 0 ? (
                            <div className="flex flex-wrap items-center justify-center gap-1">
                              {notAvailableChannels.slice(0, 3).map((channel, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded text-[9px] font-medium"
                                >
                                  <XCircle className="w-3 h-3" />
                                  {channel}
                            </span>
                              ))}
                              {notAvailableChannels.length > 3 && (
                                <span className="text-[9px] text-gray-500 font-medium">
                                  +{notAvailableChannels.length - 3} more
                              </span>
                            )}
                          </div>
                          ) : (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                        </div>
                      </button>
                    )
                  })
                )}
                        </div>

                      </div>
          )}

                      </div>

      {/* Severity Pop-up Modal */}
      {selectedSeverityProperty && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setSelectedSeverityProperty(null)}
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Severity Details</h3>
                <p className="text-sm text-gray-600 mt-1">{selectedSeverityProperty.name}</p>
                    </div>
              <button
                onClick={() => setSelectedSeverityProperty(null)}
                className="p-1 hover:bg-gray-100 rounded transition-colors text-gray-500 hover:text-gray-900"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
                  </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 space-y-4">
              {/* Loss % and Total Violations */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Loss %:</span>
                <span className="text-sm font-bold text-red-600">
                  {(selectedSeverityProperty.lossPercent || Math.abs(100 - selectedSeverityProperty.parityScore)).toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Total Violations:</span>
                <span className="text-sm font-semibold text-gray-900">
                  {calculateSeverity(selectedSeverityProperty).total}
                </span>
              </div>

              {/* Severity Bar */}
              {(() => {
                const severity = calculateSeverity(selectedSeverityProperty)
                const severityPercentages = calculateSeverityPercentages(severity)
                
                return (
                  <div className="space-y-3">
                    <div className="flex flex-col space-y-2">
                      <span className="text-sm font-medium text-gray-700">Severity Distribution:</span>
                      <div className="h-6 rounded overflow-hidden flex border border-gray-200">
                        <div 
                          className="bg-red-700 flex items-center justify-center transition-all"
                          style={{ width: `${severityPercentages.critical}%` }}
                          title={`Critical: ${severity.critical}`}
                        >
                          {severityPercentages.critical > 8 && (
                            <span className="text-[10px] font-bold text-white">{severityPercentages.critical.toFixed(0)}%</span>
                          )}
                        </div>
                        <div 
                          className="bg-orange-500 flex items-center justify-center transition-all"
                          style={{ width: `${severityPercentages.major}%` }}
                          title={`Major: ${severity.major}`}
                        >
                          {severityPercentages.major > 8 && (
                            <span className="text-[10px] font-bold text-white">{severityPercentages.major.toFixed(0)}%</span>
                          )}
                        </div>
                        <div 
                          className="bg-amber-500 flex items-center justify-center transition-all"
                          style={{ width: `${severityPercentages.minor}%` }}
                          title={`Minor: ${severity.minor}`}
                        >
                          {severityPercentages.minor > 8 && (
                            <span className="text-[10px] font-bold text-gray-900">{severityPercentages.minor.toFixed(0)}%</span>
                          )}
                        </div>
                        <div 
                          className="bg-green-500 flex items-center justify-center transition-all"
                          style={{ width: `${severityPercentages.trivial}%` }}
                          title={`Trivial: ${severity.trivial}`}
                        >
                          {severityPercentages.trivial > 8 && (
                            <span className="text-[10px] font-bold text-white">{severityPercentages.trivial.toFixed(0)}%</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Severity Breakdown */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="flex items-center justify-between p-2 bg-red-50 rounded">
                        <span className="text-sm font-semibold text-red-700">Critical:</span>
                        <span className="text-sm font-bold text-red-900">{severity.critical}</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-orange-50 rounded">
                        <span className="text-sm font-semibold text-orange-700">Major:</span>
                        <span className="text-sm font-bold text-orange-900">{severity.major}</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-amber-50 rounded">
                        <span className="text-sm font-semibold text-amber-700">Minor:</span>
                        <span className="text-sm font-bold text-amber-900">{severity.minor}</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                        <span className="text-sm font-semibold text-green-700">Trivial:</span>
                        <span className="text-sm font-bold text-green-900">{severity.trivial}</span>
                      </div>
                    </div>
                  </div>
                )
              })()}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end p-4 border-t border-gray-200">
              <button
                onClick={() => setSelectedSeverityProperty(null)}
                className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Property Channel Details Modal - Similar to Channel Insights */}
      {selectedPropertyDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-primary-600 to-primary-700 border-b border-primary-800 px-6 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/20 text-white flex items-center justify-center font-bold text-lg">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">{selectedPropertyDetails.name} - Channel Details</h2>
                  <p className="text-xs text-primary-100">Channel-wise violation breakdown</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPropertyDetails(null)}
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
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Channel</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Total Violations</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Rate</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Availability</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Revenue Loss</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Critical Issues</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {getPropertyChannelDetails(selectedPropertyDetails.name).map((channel, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm">
                              {getChannelLogo(channel.channelName)}
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-900">{channel.channelName}</span>
                              <span className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${
                                channel.channelType === 'OTA' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                              }`}>
                                {channel.channelType}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-center">
                          <span className="text-sm text-gray-900 font-semibold">{channel.totalViolations}</span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-center">
                          <span className="text-sm text-orange-700 font-medium">{channel.rateViolations}</span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-center">
                          <span className="text-sm text-red-700 font-medium">{channel.availabilityViolations}</span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-center">
                          <span className="text-sm text-red-600 font-semibold">
                            {channel.currency === 'USD' ? '$' : channel.currency === 'EUR' ? '€' : channel.currency || '$'}
                            {channel.revenueLoss.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-center">
                          {channel.criticalIssues > 0 && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              {channel.criticalIssues} Critical
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-center">
                          <button
                            onClick={() => handleViewMoreDetails(selectedPropertyDetails.name, channel.channelName)}
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
    </div>
  )
}
