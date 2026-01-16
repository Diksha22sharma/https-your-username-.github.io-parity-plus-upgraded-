import { AlertTriangle, TrendingUp, Lightbulb, ExternalLink } from 'lucide-react'
import { AIInsight } from '../../types'

interface InsightsPanelProps {
  insights: AIInsight[]
  onInsightClick: (insight: AIInsight) => void
}

export default function InsightsPanel({ insights, onInsightClick }: InsightsPanelProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'alert':
        return <AlertTriangle className="w-5 h-5" />
      case 'trend':
        return <TrendingUp className="w-5 h-5" />
      case 'recommendation':
        return <Lightbulb className="w-5 h-5" />
      default:
        return <Lightbulb className="w-5 h-5" />
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

  if (insights.length === 0) {
    return (
      <div className="card">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 rounded-lg bg-primary-100 text-primary-600">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">AI Insights</h2>
            <p className="text-xs text-gray-500">Intelligent recommendations</p>
          </div>
        </div>
        <p className="text-sm text-gray-500">No insights available at this time.</p>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 rounded-lg bg-primary-100 text-primary-600">
          <Lightbulb className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">AI Insights</h2>
          <p className="text-xs text-gray-500">Intelligent recommendations</p>
        </div>
      </div>
      <div className="space-y-3">
        {insights.map((insight) => (
          <button
            key={insight.id}
            onClick={() => onInsightClick(insight)}
            className={`w-full text-left p-4 rounded-card border-l-4 ${getColor(insight.severity)} hover:shadow-elevated transition-all group relative overflow-hidden border border-border-light`}
          >
            <div className="absolute top-0 right-0 w-16 h-16 opacity-5 group-hover:opacity-10 transition-opacity">
              <div className={`w-full h-full ${getColor(insight.severity).split(' ')[1]} rounded-full -mr-8 -mt-8`}></div>
            </div>
            <div className="relative flex items-start space-x-3">
              <div className={`mt-0.5 p-2 rounded-lg bg-surface ${insight.severity === 'critical' ? 'text-red-600' : insight.severity === 'high' ? 'text-orange-600' : 'text-blue-600'}`}>
                {getIcon(insight.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-semibold text-gray-900 text-sm leading-snug">{insight.title}</h3>
                  <ExternalLink className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2" />
                </div>
                <p className="text-sm text-gray-600 mb-3 leading-relaxed">{insight.description}</p>
                <div className="flex items-center space-x-2 text-xs">
                  <span className="px-2 py-0.5 rounded-full bg-surface font-medium text-gray-600 capitalize">
                    {insight.severity}
                  </span>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-500 font-medium">{new Date(insight.timestamp).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

