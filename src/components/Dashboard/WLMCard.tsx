import { useState } from 'react'
import { TrendingUp, TrendingDown, Info } from 'lucide-react'

interface WLMItem {
  win: {
    instances: number
    totalInstances: number
    delta?: number
  }
  meet: {
    instances: number
    totalInstances: number
    delta?: number
  }
  loss: {
    instances: number
    totalInstances: number
    delta?: number
  }
}

interface WLMCardProps {
  rate: WLMItem
  availability: WLMItem
}

type WLMType = 'win' | 'meet' | 'loss'

export default function WLMCard({ rate, availability }: WLMCardProps) {
  const [selectedType, setSelectedType] = useState<WLMType>('loss')

  const getSelectedData = (type: WLMType) => {
    const rateData = rate[type]
    const availabilityData = availability[type]
    
    // Calculate overall score (combined instances / combined total instances)
    const totalInstances = rateData.totalInstances + availabilityData.totalInstances
    const totalSelectedInstances = rateData.instances + availabilityData.instances
    const overallScore = totalInstances > 0 ? (totalSelectedInstances / totalInstances) * 100 : 0
    
    return {
      rate: rateData,
      availability: availabilityData,
      overallScore,
      totalInstances,
      selectedInstances: totalSelectedInstances
    }
  }

  const selectedData = getSelectedData(selectedType)

  const renderSection = (label: string, data: WLMItem['win'] | WLMItem['meet'] | WLMItem['loss'], colorClass: string) => {
    const percent = (data.instances / data.totalInstances) * 100
    const deltaColor = data.delta && data.delta > 0 ? 'text-green-600' : data.delta && data.delta < 0 ? 'text-red-600' : 'text-gray-500'
    const DeltaIcon = data.delta && data.delta > 0 ? TrendingUp : data.delta && data.delta < 0 ? TrendingDown : null

    return (
      <div className={`p-2 rounded border ${colorClass}`}>
        <p className="text-[10px] font-semibold text-gray-700 mb-1 uppercase tracking-wide">{label}</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-base font-bold text-gray-900">{percent.toFixed(1)}%</p>
            <p className="text-[10px] text-gray-600">{data.instances.toLocaleString()}/{data.totalInstances.toLocaleString()}</p>
          </div>
          {data.delta !== undefined && DeltaIcon && (
            <div className={`flex items-center space-x-0.5 ${deltaColor}`}>
              <DeltaIcon className="w-3 h-3" />
              <span className="text-[10px] font-semibold">{Math.abs(data.delta)}%</span>
            </div>
          )}
        </div>
      </div>
    )
  }

  const getColorForType = (type: WLMType) => {
    switch (type) {
      case 'win':
        return 'bg-yellow-50 border-yellow-200'
      case 'meet':
        return 'bg-green-50 border-green-200'
      case 'loss':
        return 'bg-red-50 border-red-200'
    }
  }

  const colorClass = getColorForType(selectedType)
  const overallDelta = selectedData.rate.delta && selectedData.availability.delta 
    ? ((selectedData.rate.delta + selectedData.availability.delta) / 2)
    : selectedData.rate.delta || selectedData.availability.delta || undefined

  const deltaColor = overallDelta && overallDelta > 0 ? 'text-green-600' : overallDelta && overallDelta < 0 ? 'text-red-600' : 'text-gray-500'
  const DeltaIcon = overallDelta && overallDelta > 0 ? TrendingUp : overallDelta && overallDelta < 0 ? TrendingDown : null

  return (
    <div className="kpi-card border-l-4 border-l-purple-500 bg-purple-50/50">
      {/* Header with Toggle and Score */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-1 text-[10px] font-medium text-gray-600 mb-1">
            <span>WLM Overview</span>
            <Info
              className="w-3 h-3 text-gray-400"
              title="Win/Loss/Meet breakdown for rate and availability."
            />
          </div>
          {/* Toggle Buttons */}
          <div className="flex items-center space-x-0.5 bg-gray-100 rounded-md p-0.5 mb-2">
            <button
              onClick={() => setSelectedType('win')}
              className={`px-2 py-1 rounded text-xs font-semibold transition-all ${
                selectedType === 'win'
                  ? 'bg-white text-yellow-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Win
            </button>
            <button
              onClick={() => setSelectedType('meet')}
              className={`px-2 py-1 rounded text-xs font-semibold transition-all ${
                selectedType === 'meet'
                  ? 'bg-white text-green-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Meet
            </button>
            <button
              onClick={() => setSelectedType('loss')}
              className={`px-2 py-1 rounded text-xs font-semibold transition-all ${
                selectedType === 'loss'
                  ? 'bg-white text-red-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Loss
            </button>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-0.5">
            {selectedData.overallScore.toFixed(1)}%
          </p>
          <p className="text-xs text-gray-500">
            {selectedData.selectedInstances.toLocaleString()}/{selectedData.totalInstances.toLocaleString()} instances
          </p>
        </div>
        {overallDelta !== undefined && DeltaIcon && (
          <div className={`flex items-center space-x-1 ${deltaColor}`}>
            <DeltaIcon className="w-4 h-4" />
            <span className="text-sm font-semibold">{Math.abs(overallDelta).toFixed(1)}%</span>
          </div>
        )}
      </div>

      {/* Rate and Availability - Side by Side */}
      <div className="grid grid-cols-2 gap-2">
        {renderSection('Rate', selectedData.rate, colorClass)}
        {renderSection('Availability', selectedData.availability, colorClass)}
      </div>
    </div>
  )
}