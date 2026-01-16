import { useState } from 'react'
import { ChevronRight, ChevronDown, Hotel, Globe, Eye, ChevronLeft, ChevronRight as ChevronRightIcon } from 'lucide-react'
import { CalendarEntity, CalendarDayData } from '../../types'

interface CalendarViewProps {
  entities: CalendarEntity[]
  startDate: string
  endDate: string
  highlightThreshold?: number
  onEntityClick?: (entity: CalendarEntity) => void
}

export default function CalendarView({ 
  entities, 
  startDate, 
  endDate, 
  highlightThreshold = 30,
  onEntityClick 
}: CalendarViewProps) {
  const [expandedEntities, setExpandedEntities] = useState<Set<string>>(new Set())
  const [threshold, setThreshold] = useState(highlightThreshold)
  const [dateOffset, setDateOffset] = useState(0)
  const [visibleDays] = useState(14) // Show 14 days by default

  // Generate date range - only first 14 dates by default
  const generateDateRange = () => {
    const start = new Date(startDate)
    const current = new Date(start)
    current.setDate(current.getDate() + dateOffset)
    
    // Generate all dates in range
    const allDates: string[] = []
    const end = new Date(endDate)
    const tempDate = new Date(start)
    while (tempDate <= end) {
      allDates.push(tempDate.toISOString().split('T')[0])
      tempDate.setDate(tempDate.getDate() + 1)
    }
    
    // Get visible dates based on offset
    const visibleDates = allDates.slice(dateOffset, dateOffset + visibleDays)
    return { visibleDates, allDates }
  }

  const { visibleDates, allDates } = generateDateRange()
  const canGoBack = dateOffset > 0
  const canGoForward = dateOffset + visibleDays < allDates.length

  const toggleExpand = (entityId: string) => {
    const newExpanded = new Set(expandedEntities)
    if (newExpanded.has(entityId)) {
      newExpanded.delete(entityId)
    } else {
      newExpanded.add(entityId)
    }
    setExpandedEntities(newExpanded)
  }

  const getWLMColor = (wlm: 'Win' | 'Loss' | 'Meet') => {
    switch (wlm) {
      case 'Win':
        return 'bg-yellow-400'
      case 'Meet':
        return 'bg-green-500'
      case 'Loss':
        return 'bg-red-500'
      default:
        return 'bg-gray-300'
    }
  }

  const getWLMLetter = (wlm: 'Win' | 'Loss' | 'Meet') => {
    switch (wlm) {
      case 'Win':
        return 'W'
      case 'Meet':
        return 'M'
      case 'Loss':
        return 'L'
      default:
        return '-'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 75) return 'text-yellow-600'
    return 'text-red-600'
  }

  const calculateWLMPercentages = (wlm: { win: number; meet: number; loss: number; totalInstances: number }) => {
    if (wlm.totalInstances === 0) return { win: 0, meet: 0, loss: 0 }
    return {
      win: (wlm.win / wlm.totalInstances) * 100,
      meet: (wlm.meet / wlm.totalInstances) * 100,
      loss: (wlm.loss / wlm.totalInstances) * 100
    }
  }

  const getDayData = (entity: CalendarEntity, date: string): CalendarDayData | null => {
    return entity.days.find(d => d.date === date) || null
  }

  const shouldHighlight = (dayData: CalendarDayData | null) => {
    if (!dayData) return false
    return dayData.parityScore < threshold
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'hotel':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'channel':
        return 'bg-gray-100 text-gray-700 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const renderEntity = (entity: CalendarEntity, level: number = 0) => {
    const isExpanded = expandedEntities.has(entity.id)
    const hasChildren = entity.children && entity.children.length > 0
    const wlmPercentages = calculateWLMPercentages(entity.wlm)
    const Icon = entity.type === 'hotel' ? Hotel : Globe

    return (
      <div key={entity.id} className={`${level > 0 ? 'ml-6 mt-2' : ''}`}>
        <div
          className={`flex items-center gap-4 p-3 rounded-lg hover:bg-surface-hover cursor-pointer transition-all group border ${
            level === 0 
              ? 'bg-surface border-border-light shadow-soft' 
              : level === 1
              ? 'bg-surface-elevated border-border-light'
              : 'bg-surface-elevated/50 border-border-light'
          }`}
          onClick={() => {
            if (hasChildren) {
              toggleExpand(entity.id)
            }
            onEntityClick?.(entity)
          }}
        >
          {/* Expand/Collapse Icon */}
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleExpand(entity.id)
              }}
              className="p-1 hover:bg-surface rounded transition-colors flex-shrink-0"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-600" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-600" />
              )}
            </button>
          )}
          {!hasChildren && <div className="w-6 flex-shrink-0" />}

          {/* Type Icon */}
          <div className={`p-1.5 rounded-lg flex-shrink-0 ${
            level === 0 ? 'bg-primary-100 text-primary-600' : 
            level === 1 ? 'bg-purple-100 text-purple-600' :
            level === 2 ? 'bg-blue-100 text-blue-600' :
            'bg-gray-100 text-gray-600'
          }`}>
            <Icon className="w-4 h-4" />
          </div>

          {/* Name */}
          <div className="flex items-center gap-2 min-w-0 flex-shrink-0">
            <span className="font-semibold text-gray-900 text-sm whitespace-nowrap">{entity.name}</span>
            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border flex-shrink-0 ${getTypeColor(entity.type)}`}>
              {entity.type === 'hotel' ? 'Hotel' : 'Channel'}
            </span>
            {entity.channelType && (
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border flex-shrink-0 ${
                entity.channelType === 'OTA' ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-purple-100 text-purple-700 border-purple-200'
              }`}>
                {entity.channelType}
              </span>
            )}
            {entity.underlyingOTA && (
              <span className="text-[10px] text-gray-500 italic flex-shrink-0">via {entity.underlyingOTA}</span>
            )}
          </div>

          {/* Score */}
          {entity.totalParityScore !== undefined && (
            <div className="flex items-center gap-1 flex-shrink-0">
              <span className="text-xs text-gray-500">Score:</span>
              <span className={`text-sm font-bold ${getScoreColor(entity.totalParityScore)}`}>
                {entity.totalParityScore.toFixed(1)}%
              </span>
            </div>
          )}

          {/* Instances */}
          {entity.wlm && (
            <div className="flex items-center gap-1 flex-shrink-0">
              <span className="text-xs text-gray-500">
                {entity.wlm.win + entity.wlm.meet + entity.wlm.loss}/{entity.wlm.totalInstances}
              </span>
              <span className="text-xs text-gray-400">instances</span>
            </div>
          )}

          {/* Win/Meet/Loss Bar - Compact */}
          {entity.wlm && (
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="h-6 rounded overflow-hidden flex border border-gray-200 flex-1 min-w-[120px] max-w-[200px]">
                <div 
                  className="bg-yellow-400 flex items-center justify-center transition-all"
                  style={{ width: `${wlmPercentages.win}%` }}
                  title={`Win: ${wlmPercentages.win.toFixed(1)}%`}
                >
                  {wlmPercentages.win > 8 && (
                    <span className="text-[9px] font-bold text-gray-900">{wlmPercentages.win.toFixed(0)}%</span>
                  )}
                </div>
                <div 
                  className="bg-green-500 flex items-center justify-center transition-all"
                  style={{ width: `${wlmPercentages.meet}%` }}
                  title={`Meet: ${wlmPercentages.meet.toFixed(1)}%`}
                >
                  {wlmPercentages.meet > 8 && (
                    <span className="text-[9px] font-bold text-white">{wlmPercentages.meet.toFixed(0)}%</span>
                  )}
                </div>
                <div 
                  className="bg-red-500 flex items-center justify-center transition-all"
                  style={{ width: `${wlmPercentages.loss}%` }}
                  title={`Loss: ${wlmPercentages.loss.toFixed(1)}%`}
                >
                  {wlmPercentages.loss > 8 && (
                    <span className="text-[9px] font-bold text-white">{wlmPercentages.loss.toFixed(0)}%</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Calendar Grid */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {visibleDates.map((date) => {
              const dayData = getDayData(entity, date)
              const highlight = shouldHighlight(dayData)
              
              return (
                <div
                  key={date}
                  className={`w-12 h-10 border border-gray-200 flex flex-col items-center justify-center text-xs relative ${
                    highlight ? 'bg-red-50 border-red-300' : 'bg-white'
                  } hover:bg-gray-100 transition-colors cursor-pointer group rounded`}
                  title={dayData ? `${date}: ${dayData.parityScore}% (${dayData.wlm})${entity.type === 'channel' && dayData.rate ? ` - Rate: $${dayData.rate.toFixed(2)}` : ''}` : date}
                  onClick={(e) => {
                    e.stopPropagation()
                    if (dayData) {
                      onEntityClick?.(entity)
                    }
                  }}
                >
                  {dayData ? (
                    <>
                      {/* W/M/L Indicator */}
                      <div className={`w-3 h-3 rounded-full ${getWLMColor(dayData.wlm)} flex items-center justify-center mb-0.5`}>
                        <span className="text-[7px] font-bold text-white">{getWLMLetter(dayData.wlm)}</span>
                      </div>
                      {/* Percentage */}
                      <span className={`text-[9px] font-semibold ${getScoreColor(dayData.parityScore)}`}>
                        {dayData.parityScore}%
                      </span>
                      {/* Rate info for channels */}
                      {entity.type === 'channel' && dayData.rate && (
                        <span className="text-[7px] text-gray-500 absolute bottom-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          ${dayData.rate.toFixed(0)}
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-gray-300 text-[8px]">-</span>
                  )}
                </div>
              )
            })}
          </div>

          {/* View Details Button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onEntityClick?.(entity)
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors flex-shrink-0"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View Details</span>
          </button>
        </div>

        {/* Children (if expanded) */}
        {hasChildren && isExpanded && entity.children && (
          <div className="mt-2 space-y-2">
            {entity.children.map(child => renderEntity(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="card">
      {/* Header with Threshold Control and Date Navigation */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Parity Calendar View</h2>
        <div className="flex items-center space-x-4">
          {/* Date Navigation */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setDateOffset(Math.max(0, dateOffset - visibleDays))}
              disabled={!canGoBack}
              className={`p-1.5 rounded-lg transition-colors ${
                canGoBack 
                  ? 'hover:bg-gray-100 text-gray-700' 
                  : 'text-gray-300 cursor-not-allowed'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-gray-600 min-w-[120px] text-center">
              {visibleDates.length > 0 && (
                <>
                  {new Date(visibleDates[0]).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(visibleDates[visibleDates.length - 1]).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </>
              )}
            </span>
            <button
              onClick={() => setDateOffset(Math.min(allDates.length - visibleDays, dateOffset + visibleDays))}
              disabled={!canGoForward}
              className={`p-1.5 rounded-lg transition-colors ${
                canGoForward 
                  ? 'hover:bg-gray-100 text-gray-700' 
                  : 'text-gray-300 cursor-not-allowed'
              }`}
            >
              <ChevronRightIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Highlight Threshold */}
          <label className="text-sm text-gray-600 flex items-center space-x-2">
            <span>Highlight Threshold:</span>
            <input
              type="number"
              min="0"
              max="100"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="w-16 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            <span className="text-xs text-gray-500">%</span>
          </label>
        </div>
      </div>

      {/* Calendar Header */}
      <div className="flex items-center border-b-2 border-gray-300 mb-2 pb-2">
        <div className="flex-1 pr-4">
          <div className="flex items-center space-x-2 pl-8">
            <span className="text-xs font-semibold text-gray-700 uppercase">Entity</span>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {visibleDates.map((date) => {
            const dateObj = new Date(date)
            const day = dateObj.getDate()
            const month = dateObj.toLocaleDateString('en-US', { month: 'short' })
            return (
              <div
                key={date}
                className="w-12 text-center"
              >
                <div className="text-[9px] font-semibold text-gray-700">{month}</div>
                <div className="text-[10px] font-bold text-gray-900">{day}</div>
              </div>
            )
          })}
        </div>
        <div className="w-24 flex-shrink-0"></div> {/* Space for View Details button */}
      </div>

      {/* Entity List with Calendar */}
      <div className="space-y-2">
        {entities.map(entity => renderEntity(entity))}
      </div>
    </div>
  )
}