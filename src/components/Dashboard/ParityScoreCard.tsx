import { TrendingUp, TrendingDown, Info } from 'lucide-react'

interface ParityScoreCardProps {
  parityScore: number
  instances: number
  totalInstances: number
  delta?: number
  ota?: {
    score: number
    instances: number
    totalInstances: number
    delta?: number
  }
  meta?: {
    score: number
    instances: number
    totalInstances: number
    delta?: number
  }
}

export default function ParityScoreCard({ 
  parityScore, 
  instances, 
  totalInstances, 
  delta, 
  ota, 
  meta 
}: ParityScoreCardProps) {
  const getParityStatus = (score: number) => {
    if (score >= 95) return { label: 'Excellent', color: 'text-green-600', bg: 'bg-green-100' }
    if (score >= 85) return { label: 'Good', color: 'text-blue-600', bg: 'bg-blue-100' }
    if (score >= 75) return { label: 'Poor', color: 'text-orange-600', bg: 'bg-orange-100' }
    return { label: 'Very Poor', color: 'text-red-600', bg: 'bg-red-100' }
  }

  const status = getParityStatus(parityScore)
  const deltaColor = delta && delta > 0 ? 'text-green-600' : delta && delta < 0 ? 'text-red-600' : 'text-gray-500'
  const DeltaIcon = delta && delta > 0 ? TrendingUp : delta && delta < 0 ? TrendingDown : null

  const renderSection = (label: string, score: number, instances: number, totalInstances: number, delta?: number, colorClass: string = 'bg-blue-50 border-blue-200') => {
    const deltaColor = delta && delta > 0 ? 'text-green-600' : delta && delta < 0 ? 'text-red-600' : 'text-gray-500'
    const DeltaIcon = delta && delta > 0 ? TrendingUp : delta && delta < 0 ? TrendingDown : null

    return (
      <div className={`p-2 rounded border ${colorClass}`}>
        <p className="text-[10px] font-semibold text-gray-700 mb-1 uppercase tracking-wide">{label}</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-base font-bold text-gray-900">{score}%</p>
            <p className="text-[10px] text-gray-600">{instances.toLocaleString()}/{totalInstances.toLocaleString()}</p>
          </div>
          {delta !== undefined && DeltaIcon && (
            <div className={`flex items-center space-x-0.5 ${deltaColor}`}>
              <DeltaIcon className="w-3 h-3" />
              <span className="text-[10px] font-semibold">{Math.abs(delta)}%</span>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Default values if ota/meta are not provided
  const otaData = ota || { score: 0, instances: 0, totalInstances: 0 }
  const metaData = meta || { score: 0, instances: 0, totalInstances: 0 }

  return (
    <div className="kpi-card border-l-4 border-l-primary-500 bg-primary-50/50">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-1 text-[10px] font-medium text-gray-600 mb-1">
            <span>Parity Score</span>
            <Info
              className="w-3 h-3 text-gray-400"
              title="Overall parity score based on rate comparisons vs brand across channels."
            />
          </div>
          <div className="flex items-baseline space-x-2 mb-1">
            <p className="text-3xl font-bold text-gray-900">{parityScore}%</p>
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${status.bg} ${status.color}`}>
              {status.label}
            </span>
          </div>
          <p className="text-xs text-gray-500">
            {instances.toLocaleString()}/{totalInstances.toLocaleString()} instances
          </p>
        </div>
        {delta !== undefined && DeltaIcon && (
          <div className={`flex items-center space-x-1 ${deltaColor}`}>
            <DeltaIcon className="w-4 h-4" />
            <span className="text-sm font-semibold">{Math.abs(delta)}%</span>
          </div>
        )}
      </div>

      {(ota || meta) && (
        <div className="grid grid-cols-2 gap-2">
          {ota && renderSection('OTA', otaData.score, otaData.instances, otaData.totalInstances, otaData.delta, 'bg-blue-50 border-blue-200')}
          {meta && renderSection('Meta', metaData.score, metaData.instances, metaData.totalInstances, metaData.delta, 'bg-purple-50 border-purple-200')}
        </div>
      )}
    </div>
  )
}