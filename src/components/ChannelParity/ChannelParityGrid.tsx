import { useState } from 'react'
import { TrendingUp, TrendingDown, ExternalLink, ChevronLeft, ChevronRight, Download } from 'lucide-react'
import { ChannelParity } from '../../types'

const formatCurrency = (amount: number | undefined, currency: string = 'USD') => {
  if (!amount) return '-'
  const currencySymbols: Record<string, string> = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'INR': '₹',
    'JPY': '¥',
    'AUD': 'A$',
    'CAD': 'C$',
    'CHF': 'CHF',
    'CNY': '¥',
    'SGD': 'S$',
    'AED': 'AED',
    'SAR': 'SAR'
  }
  const symbol = currencySymbols[currency] || currency
  return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

interface ChannelParityGridProps {
  channels: ChannelParity[]
  onChannelClick: (channel: ChannelParity) => void
}

export default function ChannelParityGrid({ channels, onChannelClick }: ChannelParityGridProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const cardsPerPage = 3
  const totalPages = Math.ceil(channels.length / cardsPerPage)
  const currentChannels = channels.slice(currentIndex, currentIndex + cardsPerPage)
  
  const handlePrevious = () => {
    setCurrentIndex(Math.max(0, currentIndex - cardsPerPage))
  }
  
  const handleNext = () => {
    setCurrentIndex(Math.min(channels.length - cardsPerPage, currentIndex + cardsPerPage))
  }
  
  const getTrendIcon = (_trend: 'improving' | 'declining' | 'stable' | undefined, value?: number) => {
    if (value === undefined) return null
    if (value > 0) return <TrendingUp className="w-3 h-3 text-red-600" />
    if (value < 0) return <TrendingDown className="w-3 h-3 text-green-600" />
    return null
  }

  const getTrendText = (value?: number) => {
    if (value === undefined) return null
    if (value > 0) return `up ${Math.abs(value)}%`
    if (value < 0) return `down ${Math.abs(value)}%`
    return null
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 75) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getChannelLogo = (channel: string) => {
    const firstLetter = channel.charAt(0).toUpperCase()
    return (
      <div className="w-8 h-8 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm">
        {firstLetter}
      </div>
    )
  }

  const downloadCsv = (filename: string, rows: string[][]) => {
    const csvContent = rows
      .map(row =>
        row
          .map(value => `"${String(value ?? '').replace(/"/g, '""')}"`)
          .join(',')
      )
      .join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    setTimeout(() => URL.revokeObjectURL(url), 0)
  }

  const handleExport = () => {
    const rows = [
      ['Channel', 'Type', 'Parity Score', 'Instances Checked', 'Rate Violations', 'Availability Violations', 'Revenue Loss']
    ]
    channels.forEach(channel => {
      rows.push([
        channel.channel,
        channel.channelType,
        channel.parityScore?.toFixed(1) ?? '-',
        channel.instancesChecked,
        channel.rateViolations,
        channel.availabilityViolations,
        formatCurrency(channel.revenueLoss, channel.currency || 'USD')
      ])
    })
    downloadCsv('channel-performance-insights.csv', rows)
  }

  const calculateWLMPercentages = (wlm?: { win: number; meet: number; loss: number; totalInstances: number }) => {
    if (!wlm || wlm.totalInstances === 0) return { win: 0, meet: 0, loss: 0 }
    return {
      win: (wlm.win / wlm.totalInstances) * 100,
      meet: (wlm.meet / wlm.totalInstances) * 100,
      loss: (wlm.loss / wlm.totalInstances) * 100
    }
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Channel Performance Insights</h2>
          <p className="text-sm text-gray-500 mt-0.5">Monitor performance across all channels</p>
        </div>
        {/* Navigation Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Download className="w-3.5 h-3.5" />
            Export Excel
          </button>
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className={`p-2 rounded-lg border transition-colors ${
              currentIndex === 0
                ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-primary-500 hover:text-primary-600'
            }`}
            aria-label="Previous"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs text-gray-600 font-medium min-w-[60px] text-center">
            {Math.floor(currentIndex / cardsPerPage) + 1} / {totalPages}
          </span>
          <button
            onClick={handleNext}
            disabled={currentIndex >= channels.length - cardsPerPage}
            className={`p-2 rounded-lg border transition-colors ${
              currentIndex >= channels.length - cardsPerPage
                ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-primary-500 hover:text-primary-600'
            }`}
            aria-label="Next"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentChannels.map((channel) => {
          const wlmPercentages = calculateWLMPercentages(channel.wlm)
          
          // Calculate Loss breakdown percentages
          const totalLossInstances = channel.rateViolations + channel.availabilityViolations
          const rateLossPercent = totalLossInstances > 0 
            ? (channel.rateViolations / totalLossInstances) * 100 
            : 0
          const availabilityLossPercent = totalLossInstances > 0 
            ? (channel.availabilityViolations / totalLossInstances) * 100 
            : 0

          return (
            <div
              key={channel.channel}
              className="bg-surface border border-border-light rounded-card p-4 hover:shadow-elevated transition-all relative overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  {getChannelLogo(channel.channel)}
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">{channel.channel}</h3>
                    <p className="text-[10px] text-gray-500">{channel.instancesChecked.toLocaleString()} instances</p>
                  </div>
                </div>
                <button
                  onClick={() => onChannelClick(channel)}
                  className="text-[10px] text-primary-600 hover:text-primary-700 font-medium flex items-center space-x-1"
                >
                  <span>View</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>

              {/* Parity Score and Revenue Loss */}
              <div className="mb-3 grid grid-cols-2 gap-3">
                <div>
                <div className="flex items-baseline space-x-2 mb-0.5">
                  <span className={`text-xl font-bold ${getScoreColor(channel.parityScore)}`}>
                    {channel.parityScore}%
                  </span>
                  {channel.parityScoreTrend !== undefined && (
                    <div className="flex items-center space-x-1">
                      {getTrendIcon(channel.trend, channel.parityScoreTrend)}
                      <span className={`text-[10px] font-medium ${channel.parityScoreTrend > 0 ? 'text-red-600' : channel.parityScoreTrend < 0 ? 'text-green-600' : 'text-gray-600'}`}>
                        {getTrendText(channel.parityScoreTrend)}
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-gray-500">Parity Score</p>
                </div>
                <div>
                  <div className="mb-0.5">
                    <span className="text-xl font-bold text-red-600">
                      {channel.revenueLoss ? formatCurrency(channel.revenueLoss, channel.currency) : '-'}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-500">Revenue Loss</p>
                </div>
              </div>

              {/* Win/Meet/Loss Bar with Instances */}
              {channel.wlm && (
                <div className="mb-3">
                  <div className="h-5 rounded overflow-hidden flex border border-gray-200 mb-1.5">
                    <div 
                      className="bg-yellow-400 flex items-center justify-center transition-all"
                      style={{ width: `${wlmPercentages.win}%` }}
                    >
                      {wlmPercentages.win > 8 && (
                        <span className="text-[9px] font-bold text-gray-900">{wlmPercentages.win.toFixed(0)}%</span>
                      )}
                    </div>
                    <div 
                      className="bg-green-500 flex items-center justify-center transition-all"
                      style={{ width: `${wlmPercentages.meet}%` }}
                    >
                      {wlmPercentages.meet > 8 && (
                        <span className="text-[9px] font-bold text-white">{wlmPercentages.meet.toFixed(0)}%</span>
                      )}
                    </div>
                    <div 
                      className="bg-red-500 flex items-center justify-center transition-all"
                      style={{ width: `${wlmPercentages.loss}%` }}
                    >
                      {wlmPercentages.loss > 8 && (
                        <span className="text-[9px] font-bold text-white">{wlmPercentages.loss.toFixed(0)}%</span>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-1 text-[10px]">
                    <div className="text-yellow-700">
                      <span className="font-semibold">Win:</span> {channel.wlm.win}/{channel.wlm.totalInstances}
                    </div>
                    <div className="text-green-700">
                      <span className="font-semibold">Meet:</span> {channel.wlm.meet}/{channel.wlm.totalInstances}
                    </div>
                    <div className="text-red-700">
                      <span className="font-semibold">Loss:</span> {channel.wlm.loss}/{channel.wlm.totalInstances}
                    </div>
                  </div>
                </div>
              )}

              {/* Rate and Availability Loss - Side by Side */}
              <div className="grid grid-cols-2 gap-2">
                {/* Rate Loss */}
                <div className="p-2 bg-orange-50 rounded border border-orange-200">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[10px] font-semibold text-gray-700">Rate</p>
                    {channel.rateViolationsTrend !== undefined && (
                      <div className="flex items-center space-x-0.5">
                        {getTrendIcon(channel.trend, channel.rateViolationsTrend)}
                        {channel.rateViolationsTrend !== 0 && (
                          <span className={`text-[9px] font-medium ${channel.rateViolationsTrend > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {Math.abs(channel.rateViolationsTrend)}%
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <p className="text-base font-bold text-orange-900 mb-0.5">
                    {rateLossPercent.toFixed(1)}%
                  </p>
                  <p className="text-[10px] text-gray-600">
                    {channel.rateViolations}/{totalLossInstances}
                  </p>
                </div>

                {/* Availability Loss */}
                <div className="p-2 bg-red-50 rounded border border-red-200">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[10px] font-semibold text-gray-700">Availability</p>
                    {channel.availabilityViolationsTrend !== undefined && (
                      <div className="flex items-center space-x-0.5">
                        {getTrendIcon(channel.trend, channel.availabilityViolationsTrend)}
                        {channel.availabilityViolationsTrend !== 0 && (
                          <span className={`text-[9px] font-medium ${channel.availabilityViolationsTrend > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {Math.abs(channel.availabilityViolationsTrend)}%
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <p className="text-base font-bold text-red-900 mb-0.5">
                    {availabilityLossPercent.toFixed(1)}%
                  </p>
                  <p className="text-[10px] text-gray-600">
                    {channel.availabilityViolations}/{totalLossInstances}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}