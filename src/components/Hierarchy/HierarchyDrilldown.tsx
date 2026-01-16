import { useState } from 'react'
import { Minus, Plus, Eye, ChevronLeft, ChevronRight } from 'lucide-react'
import { HierarchyNode } from '../../types'

interface HierarchyDrilldownProps {
  node: HierarchyNode
  level?: number
  onNodeClick?: (node: HierarchyNode) => void
  dates?: string[]
  getDateData?: (nodeId: string) => Record<string, { wlm?: 'Win' | 'Loss' | 'Meet'; parityScore?: number }>
  dateOffset?: number
  onDateOffsetChange?: (offset: number) => void
  visibleDays?: number
}

export default function HierarchyDrilldown({ 
  node, 
  level = 0, 
  onNodeClick,
  dates = [],
  getDateData,
  dateOffset = 0,
  onDateOffsetChange,
  visibleDays = 14
}: HierarchyDrilldownProps) {
  const dateData = getDateData ? getDateData(node.id) : {}
  const [expanded, setExpanded] = useState(level === 0)

  const calculateWLMPercentages = (wlm?: { win: number; meet: number; loss: number; totalInstances: number }) => {
    if (!wlm || wlm.totalInstances === 0) return { win: 0, meet: 0, loss: 0 }
    return {
      win: (wlm.win / wlm.totalInstances) * 100,
      meet: (wlm.meet / wlm.totalInstances) * 100,
      loss: (wlm.loss / wlm.totalInstances) * 100
    }
  }

  const hasChildren = node.children && node.children.length > 0
  const wlmPercentages = calculateWLMPercentages(node.wlm)

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 75) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getWLMColor = (wlm?: 'Win' | 'Loss' | 'Meet') => {
    switch (wlm) {
      case 'Win':
        return 'bg-orange-400'
      case 'Meet':
        return 'bg-green-500'
      case 'Loss':
        return 'bg-red-500'
      default:
        return 'bg-gray-200'
    }
  }

  const getWLMLetter = (wlm?: 'Win' | 'Loss' | 'Meet') => {
    switch (wlm) {
      case 'Win':
        return 'W'
      case 'Meet':
        return 'M'
      case 'Loss':
        return 'L'
      default:
        return ''
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  // Get visible dates - always show 14 days initially
  const visibleDates = dates.slice(dateOffset, dateOffset + visibleDays)
  const canGoBack = dateOffset > 0
  const canGoForward = dateOffset + visibleDays < dates.length
  const isChannel = node.type === 'Channel'

  // All levels at same indentation, use visual separation instead
  const getLevelStyle = () => {
    switch (level) {
      case 0: // Brand
        return 'bg-white border-l-4 border-purple-500'
      case 1: // Sub-brand
        return 'bg-orange-50/40 border-l-4 border-orange-500'
      case 2: // Hotel
        return 'bg-gray-50 border-l-4 border-gray-400'
      case 3: // Channel
        return 'bg-gray-100/50 border-l-4 border-gray-300'
      default:
        return 'bg-gray-50/20 border-l-4 border-gray-200'
    }
  }

  const getLevelIndicator = () => {
    switch (level) {
      case 0: // Brand - Purple
        return <div className="w-1 h-6 bg-purple-500 rounded-full mr-2"></div>
      case 1: // Sub-brand - Orange
        return <div className="w-1 h-6 bg-orange-500 rounded-full mr-2"></div>
      case 2: // Hotel - Gray
        return <div className="w-1 h-6 bg-gray-400 rounded-full mr-2"></div>
      case 3: // Channel - Light Gray
        return <div className="w-1 h-6 bg-gray-300 rounded-full mr-2"></div>
      default:
        return <div className="w-1 h-6 bg-gray-200 rounded-full mr-2"></div>
    }
  }

  return (
    <div className="mb-1">
      <div
        className={`flex items-center gap-4 p-2.5 rounded hover:bg-gray-50 cursor-pointer transition-all border-b border-gray-100 ${getLevelStyle()}`}
        onClick={() => {
          if (hasChildren) {
            setExpanded(!expanded)
          }
          onNodeClick?.(node)
        }}
      >
        {/* Expand/Collapse Icon - Circle with Minus/Plus */}
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              setExpanded(!expanded)
            }}
            className="w-5 h-5 rounded-full border-2 border-gray-400 flex items-center justify-center hover:border-gray-600 transition-colors flex-shrink-0 bg-white"
          >
            {expanded ? (
              <Minus className="w-3 h-3 text-gray-600" />
            ) : (
              <Plus className="w-3 h-3 text-gray-600" />
            )}
          </button>
        )}
        {!hasChildren && <div className="w-5 flex-shrink-0" />}
        
        {/* Level Indicator */}
        {getLevelIndicator()}
        
        {/* Name */}
        <div className="flex items-center min-w-0 flex-shrink-0" style={{ minWidth: '200px', maxWidth: '250px' }}>
          <span className={`font-medium text-sm whitespace-nowrap truncate ${
            level === 0 ? 'text-purple-700 font-bold' :
            level === 1 ? 'text-orange-700 font-semibold' :
            level === 2 ? 'text-gray-800 font-semibold' :
            'text-gray-700'
          }`}>{node.name}</span>
        </div>

        {/* Win/Meet/Loss Bar - Even Smaller Display */}
        {node.wlm && (
          <div className="flex items-center gap-2 flex-1 min-w-0" style={{ minWidth: '150px', maxWidth: '250px' }}>
            <div className="h-4 rounded overflow-hidden flex border border-gray-300 flex-1">
              <div 
                className="bg-orange-400 flex items-center justify-center transition-all"
                style={{ width: `${wlmPercentages.win}%` }}
                title={`Win: ${wlmPercentages.win.toFixed(1)}%`}
              >
                {wlmPercentages.win > 10 && (
                  <span className="text-[8px] font-bold text-gray-900">{wlmPercentages.win.toFixed(0)}%</span>
                )}
              </div>
              <div 
                className="bg-green-500 flex items-center justify-center transition-all"
                style={{ width: `${wlmPercentages.meet}%` }}
                title={`Meet: ${wlmPercentages.meet.toFixed(1)}%`}
              >
                {wlmPercentages.meet > 10 && (
                  <span className="text-[8px] font-bold text-white">{wlmPercentages.meet.toFixed(0)}%</span>
                )}
              </div>
              <div 
                className="bg-red-500 flex items-center justify-center transition-all"
                style={{ width: `${wlmPercentages.loss}%` }}
                title={`Loss: ${wlmPercentages.loss.toFixed(1)}%`}
              >
                {wlmPercentages.loss > 10 && (
                  <span className="text-[8px] font-bold text-white">{wlmPercentages.loss.toFixed(0)}%</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Overall Score - Even Smaller (Not for Channels, but reserve space for alignment) */}
        <div className="flex items-center gap-1 flex-shrink-0" style={{ minWidth: '50px' }}>
          {node.parityScore !== undefined && !isChannel && (
            <span className={`text-xs font-semibold ${getScoreColor(node.parityScore)}`}>
              {node.parityScore.toFixed(1)}%
            </span>
          )}
        </div>

        {/* Date Columns - Aligned for all levels */}
        {dates.length > 0 && visibleDates.length > 0 && (
          <div className="flex items-center ml-4" style={{ width: `${visibleDates.length * 42 + 80}px` }}>
            {/* Date Navigation */}
            {onDateOffsetChange && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  if (canGoBack) onDateOffsetChange(dateOffset - 1)
                }}
                disabled={!canGoBack}
                className={`w-6 h-6 flex items-center justify-center rounded ${canGoBack ? 'hover:bg-gray-200' : 'opacity-30 cursor-not-allowed'}`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
            
            {/* Date Cells - Show parity score for non-channels, rate and WLM for channels */}
            <div className="flex items-center" style={{ width: `${visibleDates.length * 42}px` }}>
              {visibleDates.map((date, index) => {
                const dayData = dateData[date] || {}
                
                if (isChannel) {
                  // For channels: show only rate and WLM colors
                  const wlm = dayData.wlm || 'Meet'
                  const wlmColor = getWLMColor(wlm)
                  const rate = Math.random() * 50 + 100
                  
                  return (
                    <div
                      key={date}
                      className="w-10 h-10 flex flex-col items-center justify-center text-[10px] font-semibold border border-gray-300 rounded relative"
                      style={{ 
                        marginRight: index < visibleDates.length - 1 ? '2px' : '0',
                        minWidth: '40px',
                        maxWidth: '40px'
                      }}
                      title={`${formatDate(date)}: Rate: $${rate.toFixed(0)} | ${wlm}`}
                    >
                      <div className={`absolute inset-0 rounded ${wlmColor}`}></div>
                      {/* Rate display for Channels */}
                      <span className="text-[9px] font-bold text-gray-900 z-10">
                        ${rate.toFixed(0)}
                      </span>
                    </div>
                  )
                } else {
                  // For non-channels: show parity score
                  const score = dayData.parityScore !== undefined 
                    ? dayData.parityScore 
                    : (node.parityScore !== undefined ? node.parityScore + (Math.random() * 10 - 5) : 75 + (Math.random() * 20))
                  const scoreColor = score >= 90 ? 'text-green-700' : score >= 75 ? 'text-yellow-700' : 'text-red-700'
                  const bgColor = score >= 90 ? 'bg-green-200' : score >= 75 ? 'bg-yellow-200' : 'bg-red-200'
                  
                  return (
                    <div
                      key={date}
                      className="w-10 h-10 flex flex-col items-center justify-center text-[10px] font-semibold border border-gray-300 rounded relative"
                      style={{ 
                        marginRight: index < visibleDates.length - 1 ? '2px' : '0',
                        minWidth: '40px',
                        maxWidth: '40px'
                      }}
                      title={`${formatDate(date)}: ${score !== undefined ? `${score.toFixed(1)}%` : 'No data'}`}
                    >
                      <div className={`absolute inset-0 rounded ${bgColor}`}></div>
                      {/* Parity score in center */}
                      <span className={`text-[9px] font-bold ${scoreColor} z-10`}>
                        {score !== undefined ? `${Math.round(score)}%` : '-'}
                      </span>
                    </div>
                  )
                }
              })}
            </div>

            {onDateOffsetChange && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  if (canGoForward) onDateOffsetChange(dateOffset + 1)
                }}
                disabled={!canGoForward}
                className={`w-6 h-6 flex items-center justify-center rounded ${canGoForward ? 'hover:bg-gray-200' : 'opacity-30 cursor-not-allowed'}`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* View Details Button - Eye Icon Only */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onNodeClick?.(node)
          }}
          className="flex items-center justify-center p-2 text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded transition-colors flex-shrink-0"
          title="View Details"
        >
          <Eye className="w-4 h-4" />
        </button>
      </div>

      {expanded && hasChildren && (
        <div className="mt-1 space-y-0.5">
          {node.children!.map((child) => (
            <HierarchyDrilldown
              key={child.id}
              node={child}
              level={level + 1}
              onNodeClick={onNodeClick}
              dates={dates}
              getDateData={getDateData}
              dateOffset={dateOffset}
              onDateOffsetChange={onDateOffsetChange}
              visibleDays={visibleDays}
            />
          ))}
        </div>
      )}
    </div>
  )
}