import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip, LabelList } from 'recharts'
import { Info } from 'lucide-react'

interface BookingWindowData {
  '0-7 days': number
  '14 days': number
  '30 days': number
  '>30 days': number
}

interface BookingWindowCardProps {
  data?: BookingWindowData
}

const CustomLabel = (props: any) => {
  const { x, y, width, value, payload } = props
  const total = payload?.total || 640
  const percentage = total > 0 ? ((value / total) * 100).toFixed(0) : 0
  return (
    <g>
      <text
        x={x + width + 6}
        y={y + 7}
        fill="#1f2937"
        fontSize={9}
        fontWeight={700}
      >
        {value}
      </text>
      <text
        x={x + width + 6}
        y={y + 16}
        fill="#6b7280"
        fontSize={8}
        fontWeight={500}
      >
        {percentage}%
      </text>
    </g>
  )
}

const gradients = {
  '0-7': ['#f87171', '#dc2626'],
  '14': ['#fb923c', '#f97316'],
  '30': ['#fbbf24', '#f59e0b'],
  '>30': ['#a3a3a3', '#6b7280']
}

export default function BookingWindowCard({ data }: BookingWindowCardProps) {
  const windowData = data || {
    '0-7 days': 320,
    '14 days': 180,
    '30 days': 95,
    '>30 days': 45
  }

  const total = windowData['0-7 days'] + windowData['14 days'] + windowData['30 days'] + windowData['>30 days']

  const chartData = [
    { name: '0-7 days', value: windowData['0-7 days'], color: '#dc2626', gradient: gradients['0-7'], total },
    { name: '14 days', value: windowData['14 days'], color: '#f97316', gradient: gradients['14'], total },
    { name: '30 days', value: windowData['30 days'], color: '#f59e0b', gradient: gradients['30'], total },
    { name: '>30 days', value: windowData['>30 days'], color: '#6b7280', gradient: gradients['>30'], total }
  ]

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]
      const percentage = total > 0 ? (data.value / total) * 100 : 0
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-xl">
          <p className="text-xs font-bold text-gray-900 mb-1">{data.name}</p>
          <p className="text-xs text-gray-600">
            <span className="font-semibold">{data.value}</span> violations
          </p>
          <p className="text-xs text-gray-500 mt-0.5">{percentage.toFixed(1)}% of total</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="card p-3 bg-gradient-to-br from-white to-gray-50/50">
      <div className="mb-3 flex items-center gap-1">
        <h3 className="text-xs font-bold text-gray-900">Most Violated Booking Window</h3>
        <Info
          className="w-3 h-3 text-gray-400"
          title="Violations by booking window."
        />
      </div>

      <div className="h-36 relative">
        <svg style={{ position: 'absolute', width: 0, height: 0 }}>
          <defs>
            {chartData.map((item, index) => (
              <linearGradient key={`gradient-${index}`} id={`windowGradient-${index}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={item.gradient[0]} stopOpacity={1} />
                <stop offset="100%" stopColor={item.gradient[1]} stopOpacity={1} />
              </linearGradient>
            ))}
          </defs>
        </svg>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 8, right: 50, bottom: 8, left: 0 }}>
            <XAxis type="number" hide />
            <YAxis 
              type="category" 
              dataKey="name" 
              width={60}
              tick={{ fontSize: 10, fill: '#4b5563', fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="value" 
              radius={[0, 6, 6, 0]} 
              barSize={26}
              animationDuration={800}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={`url(#windowGradient-${index})`}
                  style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
                />
              ))}
              <LabelList content={<CustomLabel />} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
