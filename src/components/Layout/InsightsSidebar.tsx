import { AlertTriangle, TrendingUp, Lightbulb, ExternalLink, X } from 'lucide-react'
import { AIInsight } from '../../types'

interface InsightsSidebarProps {
  insights: AIInsight[]
  onInsightClick: (insight: AIInsight) => void
  isOpen: boolean
  onClose: () => void
}

export default function InsightsSidebar({ insights, onInsightClick, isOpen, onClose }: InsightsSidebarProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'alert':
        return <AlertTriangle className="w-4 h-4" />
      case 'trend':
        return <TrendingUp className="w-4 h-4" />
      case 'recommendation':
        return <Lightbulb className="w-4 h-4" />
      default:
        return <Lightbulb className="w-4 h-4" />
    }
  }

  const getColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'border-l-red-500 bg-red-50'
      case 'high':
        return 'border-l-orange-500 bg-orange-50'
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50'
      case 'low':
        return 'border-l-blue-500 bg-blue-50'
      default:
        return 'border-l-gray-500 bg-gray-50'
    }
  }

  if (!isOpen) return null

  return (
    <aside className="w-80 bg-surface border-l border-border-light h-[calc(100vh-64px)] overflow-y-auto fixed right-0 top-16 z-40 shadow-lg">
      <div className="p-4 border-b border-border-light bg-surface-elevated sticky top-0 z-10">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-red-100 text-red-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900">AI Insights & Alerts</h2>
              <p className="text-[10px] text-gray-500">Critical alerts and recommendations</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-surface rounded-lg transition-colors text-gray-500 hover:text-gray-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {insights.length > 0 && (
          <p className="text-xs text-gray-500 mt-1">
            {insights.length} {insights.length === 1 ? 'alert' : 'alerts'}
          </p>
        )}
      </div>

      <div className="p-4 space-y-3">
        {insights.length === 0 ? (
          <div className="text-center py-8">
            <Lightbulb className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No insights available</p>
          </div>
        ) : (
          insights.map((insight) => (
            <button
              key={insight.id}
              onClick={() => onInsightClick(insight)}
              className={`w-full text-left p-3 rounded-lg border-l-4 ${getColor(insight.severity)} hover:shadow-md transition-all group relative overflow-hidden border border-border-light`}
            >
              <div className="relative flex items-start space-x-2">
                <div className={`mt-0.5 p-1.5 rounded-lg bg-surface flex-shrink-0 ${insight.severity === 'critical' ? 'text-red-600' : insight.severity === 'high' ? 'text-orange-600' : 'text-blue-600'}`}>
                  {getIcon(insight.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-semibold text-gray-900 text-xs leading-snug">{insight.title}</h3>
                    <ExternalLink className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-1" />
                  </div>
                  <p className="text-xs text-gray-600 mb-2 leading-relaxed line-clamp-2">{insight.description}</p>
                  <div className="flex items-center space-x-2 text-[10px]">
                    <span className="px-1.5 py-0.5 rounded-full bg-surface font-medium text-gray-600 capitalize">
                      {insight.severity}
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-500 font-medium">{new Date(insight.timestamp).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </aside>
  )
}