import { TrendingUp, TrendingDown, Info } from 'lucide-react'

interface RevenueLossCardProps {
  estimatedLoss: number
  delta?: number
  period?: string
  rate?: {
    instances: number
    totalInstances: number
    estimatedAmount: number
    delta?: number
  }
  availability?: {
    instances: number
    totalInstances: number
    estimatedAmount: number
    delta?: number
  }
}

export default function RevenueLossCard({ 
  estimatedLoss, 
  delta, 
  period, 
  rate, 
  availability 
}: RevenueLossCardProps) {
  const deltaColor = delta && delta > 0 ? 'text-red-600' : delta && delta < 0 ? 'text-green-600' : 'text-gray-500'
  const DeltaIcon = delta && delta > 0 ? TrendingUp : delta && delta < 0 ? TrendingDown : null

  const renderSection = (label: string, data: { instances: number; totalInstances: number; estimatedAmount: number; delta?: number }, colorClass: string) => {
    const deltaColor = data.delta && data.delta > 0 ? 'text-red-600' : data.delta && data.delta < 0 ? 'text-green-600' : 'text-gray-500'
    const DeltaIcon = data.delta && data.delta > 0 ? TrendingUp : data.delta && data.delta < 0 ? TrendingDown : null

    return (
      <div className={`p-2 rounded border ${colorClass}`}>
        <p className="text-[10px] font-semibold text-gray-700 mb-1 uppercase tracking-wide">{label}</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-base font-bold text-red-600">
              ${(data.estimatedAmount / 1000).toFixed(1)}K
            </p>
            <p className="text-[10px] text-gray-600">{data.instances.toLocaleString()}/{data.totalInstances.toLocaleString()}</p>
          </div>
          {data.delta !== undefined && DeltaIcon && (
            <div className={`flex items-center space-x-0.5 ${deltaColor}`}>
              <DeltaIcon className="w-3 h-3" />
              <span className="text-[10px] font-semibold">{Math.abs(data.delta || 0)}%</span>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="kpi-card border-l-4 border-l-red-500 bg-red-50/50">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-1 text-[10px] font-medium text-gray-600 mb-1">
            <span>Revenue Loss</span>
            <Info
              className="w-3 h-3 text-gray-400"
              title="Estimated revenue loss from parity violations."
            />
          </div>
          <p className="text-3xl font-bold text-red-600 mb-0.5">
            ${(estimatedLoss / 1000).toFixed(1)}K
          </p>
          {period && (
            <p className="text-xs text-gray-500">{period}</p>
          )}
        </div>
        {delta !== undefined && DeltaIcon && (
          <div className={`flex items-center space-x-1 ${deltaColor}`}>
            <DeltaIcon className="w-4 h-4" />
            <span className="text-sm font-semibold">{Math.abs(delta)}%</span>
          </div>
        )}
      </div>

      {(rate || availability) && (
        <div className="grid grid-cols-2 gap-2">
          {rate && renderSection('Rate', rate, 'bg-orange-50 border-orange-200')}
          {availability && renderSection('Availability', availability, 'bg-red-50 border-red-200')}
        </div>
      )}
    </div>
  )
}