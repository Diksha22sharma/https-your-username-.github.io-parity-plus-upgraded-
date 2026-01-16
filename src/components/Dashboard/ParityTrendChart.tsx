import { useState, useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { TrendingUp, ChevronDown } from 'lucide-react'
import { TrendDataPoint } from '../../types'

interface ParityTrendChartProps {
  data: TrendDataPoint[]
}

const viewOptions = ['Daily', 'Weekly', 'Monthly', 'Yearly'] as const
type ViewOption = typeof viewOptions[number]

const viewByOptions = ['Brand', 'Sub-brand', 'Hotel', 'Channel'] as const
type ViewByOption = typeof viewByOptions[number]

// Generate mock data for different entities
const generateEntityData = (entityType: ViewByOption, view: ViewOption): any[] => {
  const baseDate = new Date()
  
  let days = 30
  let interval = 1
  let dataPoints = 30
  
  switch (view) {
    case 'Daily':
      days = 30
      interval = 1
      dataPoints = 30
      break
    case 'Weekly':
      days = 84 // 12 weeks
      interval = 7
      dataPoints = 12
      break
    case 'Monthly':
      days = 365 // 12 months
      interval = 30
      dataPoints = 12
      break
    case 'Yearly':
      days = 1825 // 5 years
      interval = 365
      dataPoints = 5
      break
  }
  
  const entities = entityType === 'Brand' 
    ? ['Brand A', 'Brand B']
    : entityType === 'Sub-brand'
    ? ['Sub Brand A1', 'Sub Brand A2', 'Sub Brand B1']
    : entityType === 'Hotel'
    ? ['Hotel Grand', 'Hotel Plaza', 'Hotel Royal', 'Hotel Ocean']
    : ['Booking.com', 'Expedia', 'Agoda', 'Hotels.com']
  
  // Generate merged data for all entities
  const mergedData: any[] = []
  
  for (let i = 0; i < dataPoints; i++) {
    const date = new Date(baseDate)
    date.setDate(date.getDate() - (days - (i * interval)))
    
    let dateLabel = ''
    switch (view) {
      case 'Daily':
        dateLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        break
      case 'Weekly':
        const weekStart = new Date(date)
        weekStart.setDate(date.getDate() - date.getDay())
        dateLabel = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        break
      case 'Monthly':
        dateLabel = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        break
      case 'Yearly':
        dateLabel = date.getFullYear().toString()
        break
    }
    
    const dataPoint: any = { date: dateLabel }
    
    entities.forEach((entity, entityIndex) => {
      const baseScore = 75 + (entityIndex * 5)
      const variation = (Math.sin((i * interval) / 10) * 5) + (Math.random() * 3 - 1.5)
      const score = Math.max(0, Math.min(100, baseScore + variation))
      
      dataPoint[entity] = parseFloat(score.toFixed(1))
    })
    
    mergedData.push(dataPoint)
  }
  
  return mergedData
}

export default function ParityTrendChart({ data: initialData }: ParityTrendChartProps) {
  const [view, setView] = useState<ViewOption>('Daily')
  const [viewBy, setViewBy] = useState<ViewByOption>('Brand')
  const [showViewByDropdown, setShowViewByDropdown] = useState(false)

  // Generate data based on view and viewBy selection
  const chartData = useMemo(() => {
    return generateEntityData(viewBy, view)
  }, [view, viewBy])

  // Get all entity names from the data
  const entities = useMemo(() => {
    if (viewBy === 'Brand') return ['Brand A', 'Brand B']
    if (viewBy === 'Sub-brand') return ['Sub Brand A1', 'Sub Brand A2', 'Sub Brand B1']
    if (viewBy === 'Hotel') return ['Hotel Grand', 'Hotel Plaza', 'Hotel Royal', 'Hotel Ocean']
    return ['Booking.com', 'Expedia', 'Agoda', 'Hotels.com']
  }, [viewBy])

  // Colors for different entities
  const entityColors = [
    '#0ea5e9', // blue
    '#10b981', // green
    '#f59e0b', // amber
    '#ef4444', // red
    '#8b5cf6', // purple
    '#ec4899'  // pink
  ]

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-primary-100 text-primary-600">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Parity Score Trend</h2>
            <p className="text-xs text-gray-500 mt-0.5">Track performance over time</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {/* View By Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowViewByDropdown(!showViewByDropdown)}
              className="flex items-center space-x-2 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <span>View By: {viewBy}</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            {showViewByDropdown && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowViewByDropdown(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded-lg shadow-lg z-20">
                  {viewByOptions.map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        setViewBy(option)
                        setShowViewByDropdown(false)
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                        viewBy === option ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          
          {/* Time Period Buttons */}
        <div className="flex items-center space-x-1 bg-surface-elevated rounded-lg p-1 border border-border-light">
          {viewOptions.map((option) => (
            <button
              key={option}
              onClick={() => setView(option)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-nav ${
                view === option
                  ? 'bg-primary-600 text-white shadow-soft'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-surface-hover'
              }`}
            >
              {option}
            </button>
          ))}
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
          <XAxis 
            dataKey="date" 
            stroke="#9ca3af"
            tick={{ fill: '#6b7280', fontSize: 11, fontWeight: 500 }}
            axisLine={{ stroke: '#e5e7eb' }}
            angle={view === 'Yearly' ? 0 : -45}
            textAnchor={view === 'Yearly' ? 'middle' : 'end'}
            height={view === 'Yearly' ? 30 : 60}
          />
          <YAxis 
            yAxisId="left"
            stroke="#9ca3af"
            tick={{ fill: '#6b7280', fontSize: 11, fontWeight: 500 }}
            axisLine={{ stroke: '#e5e7eb' }}
            domain={[0, 100]}
            label={{ value: 'Parity Score (%)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#6b7280' } }}
          />
          <YAxis 
            yAxisId="right"
            orientation="right"
            stroke="#9ca3af"
            tick={{ fill: '#6b7280', fontSize: 11, fontWeight: 500 }}
            axisLine={{ stroke: '#e5e7eb' }}
            label={{ value: 'Violations', angle: 90, position: 'insideRight', style: { textAnchor: 'middle', fill: '#6b7280' } }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'white', 
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              padding: '12px'
            }}
            labelStyle={{ color: '#374151', fontWeight: 600, marginBottom: '4px' }}
          />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="line"
          />
          {/* Render lines for each entity */}
          {entities.map((entity, index) => {
            const color = entityColors[index % entityColors.length]
            
            return (
          <Line 
                key={entity}
            type="monotone" 
                dataKey={entity}
                stroke={color}
            strokeWidth={2.5}
                dot={{ fill: color, r: 4, strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                name={entity}
            yAxisId="left"
          />
            )
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
