import { useState } from 'react'
import { Search, ChevronDown, ChevronUp } from 'lucide-react'

interface ParityDayData {
  wlm?: 'Win' | 'Meet' | 'Loss'
  parityScore?: number
}

interface CalendarRow {
  id: string
  name: string
  type: 'hotel' | 'channel'
  wlm: { win: number; meet: number; loss: number; totalInstances: number }
  parityScore: number
  dateData: Record<string, ParityDayData>
  children?: CalendarRow[]
}

interface ParityCalendarViewProps {
  data: CalendarRow[]
  dates: string[]
  highlightThreshold?: number
}

export default function ParityCalendarView({ 
  data, 
  dates,
  highlightThreshold = 30 
}: ParityCalendarViewProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [threshold, setThreshold] = useState(highlightThreshold)

  const toggleRow = (id: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const calculateWLMPercentages = (wlm: { win: number; meet: number; loss: number; totalInstances: number }) => {
    if (wlm.totalInstances === 0) return { win: 0, meet: 0, loss: 0 }
    return {
      win: (wlm.win / wlm.totalInstances) * 100,
      meet: (wlm.meet / wlm.totalInstances) * 100,
      loss: (wlm.loss / wlm.totalInstances) * 100
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 75) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getWLMColor = (wlm?: 'Win' | 'Meet' | 'Loss') => {
    switch (wlm) {
      case 'Win':
        return 'bg-orange-200'
      case 'Meet':
        return 'bg-green-200'
      case 'Loss':
        return 'bg-red-200'
      default:
        return 'bg-gray-100'
    }
  }

  const getWLMLetter = (wlm?: 'Win' | 'Meet' | 'Loss') => {
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

  const filteredData = data.filter(row => 
    row.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const renderRow = (row: CalendarRow, level: number = 0) => {
    const wlmPercentages = calculateWLMPercentages(row.wlm)
    const isExpanded = expandedRows.has(row.id)
    const hasChildren = row.children && row.children.length > 0
    const isHotel = row.type === 'hotel'

    return (
      <>
        <tr 
          key={row.id}
          className={`border-b border-gray-200 hover:bg-gray-50 ${level > 0 ? 'bg-gray-50/50' : 'bg-white'}`}
        >
          {/* Hotels Column */}
          <td className="px-4 py-3">
            <div className="flex items-center gap-2" style={{ paddingLeft: `${level * 24}px` }}>
              {hasChildren && (
                <button
                  onClick={() => toggleRow(row.id)}
                  className="p-0.5 hover:bg-gray-200 rounded transition-colors"
                >
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-gray-600" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-600" />
                  )}
                </button>
              )}
              {!hasChildren && <div className="w-5" />}
              <span className="text-sm font-medium text-gray-900">{row.name}</span>
            </div>
          </td>

          {/* Win/Meet/Loss Bar */}
          <td className="px-4 py-3">
            <div className="h-6 rounded overflow-hidden flex border border-gray-300" style={{ width: '150px' }}>
              <div 
                className="bg-orange-400 flex items-center justify-center transition-all"
                style={{ width: `${wlmPercentages.win}%` }}
                title={`Win: ${wlmPercentages.win.toFixed(1)}%`}
              >
                {wlmPercentages.win > 5 && (
                  <span className="text-[10px] font-bold text-gray-900">{wlmPercentages.win.toFixed(0)}%</span>
                )}
              </div>
              <div 
                className="bg-green-500 flex items-center justify-center transition-all"
                style={{ width: `${wlmPercentages.meet}%` }}
                title={`Meet: ${wlmPercentages.meet.toFixed(1)}%`}
              >
                {wlmPercentages.meet > 5 && (
                  <span className="text-[10px] font-bold text-white">{wlmPercentages.meet.toFixed(0)}%</span>
                )}
              </div>
              <div 
                className="bg-red-500 flex items-center justify-center transition-all"
                style={{ width: `${wlmPercentages.loss}%` }}
                title={`Loss: ${wlmPercentages.loss.toFixed(1)}%`}
              >
                {wlmPercentages.loss > 5 && (
                  <span className="text-[10px] font-bold text-white">{wlmPercentages.loss.toFixed(0)}%</span>
                )}
              </div>
            </div>
          </td>

          {/* Parity Score */}
          <td className="px-4 py-3">
            <span className={`text-sm font-semibold ${getScoreColor(row.parityScore)}`}>
              {row.parityScore}%
            </span>
          </td>

          {/* Date Columns */}
          {dates.map((date) => {
            const dayData = row.dateData[date] || {}
            const wlm = dayData.wlm
            const score = dayData.parityScore
            const displayValue = wlm ? getWLMLetter(wlm) : (score !== undefined ? `${score}%` : '')
            const bgColor = wlm ? getWLMColor(wlm) : 'bg-gray-100'
            const textColor = wlm ? 'text-white' : 'text-gray-900'
            const shouldHighlight = score !== undefined && score < threshold

            return (
              <td 
                key={date}
                className={`px-2 py-3 text-center ${bgColor} ${textColor} ${shouldHighlight ? 'ring-2 ring-red-500' : ''}`}
              >
                <span className="text-xs font-semibold">{displayValue}</span>
              </td>
            )
          })}
        </tr>

        {/* Render children if expanded */}
        {isExpanded && hasChildren && row.children!.map(child => renderRow(child, level + 1))}
      </>
    )
  }

  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Parity Calendar View</h2>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 bg-red-500 rounded-full"></span>
          <span className="text-sm text-gray-700">Highlight Parity below</span>
          <button
            onClick={() => {
              const newThreshold = prompt('Enter threshold percentage:', threshold.toString())
              if (newThreshold) {
                setThreshold(parseInt(newThreshold))
              }
            }}
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 underline"
          >
            {threshold}%
          </button>
          <span className="text-sm text-blue-600">Change</span>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search hotels..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b-2 border-gray-300">
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-gray-400" />
                  Hotels
                </div>
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Win/Meet/Loss</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Parity Score</th>
              {dates.map((date) => (
                <th 
                  key={date}
                  className="px-2 py-3 text-center text-xs font-semibold text-gray-700 min-w-[60px]"
                >
                  {formatDate(date)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredData.map(row => renderRow(row))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
