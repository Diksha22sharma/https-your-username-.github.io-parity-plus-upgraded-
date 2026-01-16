import { TrendingUp, TrendingDown, Info } from 'lucide-react'

interface BrandSoldOutCardProps {
  percentage: number
  instances: number
  totalInstances: number
  delta?: number
  period?: string
}

export default function BrandSoldOutCard({ 
  percentage, 
  instances,
  totalInstances,
  delta, 
  period 
}: BrandSoldOutCardProps) {
  const deltaColor = delta && delta > 0 ? 'text-red-600' : delta && delta < 0 ? 'text-green-600' : 'text-gray-500'
  const DeltaIcon = delta && delta > 0 ? TrendingUp : delta && delta < 0 ? TrendingDown : null

  return (
    <div className="kpi-card border-l-4 border-l-purple-500 bg-purple-50/50">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-1 text-[10px] font-medium text-gray-600 mb-1">
            <span>Brand Sold Out</span>
            <Info
              className="w-3 h-3 text-gray-400"
              title="Percentage of instances where brand is sold out."
            />
          </div>
          <p className="text-3xl font-bold text-purple-600 mb-0.5">
            {percentage.toFixed(1)}%
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

      <div className="p-2 rounded border bg-purple-50 border-purple-200">
        <p className="text-[10px] font-semibold text-gray-700 mb-1 uppercase tracking-wide">Instances</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-base font-bold text-purple-600">
              {instances.toLocaleString()}
            </p>
            <p className="text-[10px] text-gray-600">of {totalInstances.toLocaleString()} total</p>
          </div>
        </div>
      </div>
    </div>
  )
}
