import { useState } from 'react'
import { AlertTriangle, TrendingUp, DollarSign } from 'lucide-react'
import { Violation } from '../../types'

interface ReasonsPanelProps {
  violations: Violation[]
  onReasonClick: (reason: string) => void
}

interface ReasonSummary {
  reason: string
  count: number
  revenueLoss: number
  percentage: number
}

export default function ReasonsPanel({ violations, onReasonClick }: ReasonsPanelProps) {
  const [sortBy, setSortBy] = useState<'count' | 'revenue'>('revenue')

  // Calculate reason summaries
  const reasonSummaries: ReasonSummary[] = Object.entries(
    violations.reduce((acc, v) => {
      const reason = v.reason
      if (!acc[reason]) {
        acc[reason] = { count: 0, revenueLoss: 0 }
      }
      acc[reason].count += 1
      acc[reason].revenueLoss += v.revenueLoss || 0
      return acc
    }, {} as Record<string, { count: number; revenueLoss: number }>)
  )
    .map(([reason, data]) => ({
      reason,
      count: data.count,
      revenueLoss: data.revenueLoss,
      percentage: (data.count / violations.length) * 100
    }))
    .sort((a, b) => {
      if (sortBy === 'revenue') {
        return b.revenueLoss - a.revenueLoss
      }
      return b.count - a.count
    })
    .slice(0, 5) // Top 5 reasons

  const top3Reasons = reasonSummaries.slice(0, 3)

  const getReasonIcon = (reason: string) => {
    if (reason.includes('Bait')) return <AlertTriangle className="w-4 h-4 text-red-600" />
    if (reason.includes('Promotion')) return <TrendingUp className="w-4 h-4 text-orange-600" />
    return <DollarSign className="w-4 h-4 text-blue-600" />
  }

  const getReasonColor = (index: number) => {
    const colors = [
      'bg-red-50 border-red-200 text-red-800',
      'bg-orange-50 border-orange-200 text-orange-800',
      'bg-yellow-50 border-yellow-200 text-yellow-800',
      'bg-blue-50 border-blue-200 text-blue-800',
      'bg-purple-50 border-purple-200 text-purple-800'
    ]
    return colors[index % colors.length]
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Violation Reasons</h2>
        <div className="flex items-center space-x-2">
          <label className="text-xs text-gray-600">Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'count' | 'revenue')}
            className="px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="revenue">Revenue Impact</option>
            <option value="count">Instance Count</option>
          </select>
        </div>
      </div>

      {/* Top 3 Reasons Summary */}
      {top3Reasons.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Top 3 Reasons</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {top3Reasons.map((item, index) => (
              <button
                key={item.reason}
                onClick={() => onReasonClick(item.reason)}
                className={`p-3 rounded-lg border-2 hover:shadow-md transition-all text-left ${getReasonColor(index)}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getReasonIcon(item.reason)}
                    <span className="text-xs font-semibold">#{index + 1}</span>
                  </div>
                  <span className="text-xs font-bold">{item.percentage.toFixed(1)}%</span>
                </div>
                <p className="text-xs font-medium mb-1 line-clamp-2">{item.reason}</p>
                <div className="flex items-center justify-between text-xs mt-2 pt-2 border-t border-current/20">
                  <span>{item.count} instances</span>
                  <span className="font-semibold">${item.revenueLoss.toFixed(0)}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* All Reasons List */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-700">All Reasons</h3>
        {reasonSummaries.map((item, index) => (
          <button
            key={item.reason}
            onClick={() => onReasonClick(item.reason)}
            className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-semibold text-xs">
                  {index + 1}
                </span>
                <span className="font-medium text-gray-900 text-sm">{item.reason}</span>
              </div>
              <span className="text-xs text-gray-500">{item.count} violations</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex-1 bg-gray-200 rounded-full h-1.5 mr-3">
                <div
                  className="bg-primary-600 h-1.5 rounded-full transition-all"
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-red-600">
                ${item.revenueLoss.toFixed(2)} loss
              </span>
            </div>
          </button>
        ))}
      </div>

      {reasonSummaries.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-4">No violation reasons found</p>
      )}
    </div>
  )
}



