import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip, LabelList } from 'recharts'
import { Info } from 'lucide-react'

interface ViolationStatus {
  total: number
  open: number
  closed: number
  closedByTestBooking: number
}

interface ViolationStatusCardProps {
  data?: ViolationStatus
}

const CustomLabel = (props: any) => {
  const { x, y, width, value, payload } = props
  const total = payload?.total || 500
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
  total: ['#60a5fa', '#3b82f6'],
  open: ['#f87171', '#ef4444'],
  closed: ['#4ade80', '#22c55e'],
  closedByTestBooking: ['#fbbf24', '#f59e0b']
}

export default function ViolationStatusCard({ data }: ViolationStatusCardProps) {
  const statusData = data || {
    total: 500,
    open: 320,
    closed: 150,
    closedByTestBooking: 30
  }

  const chartData = [
    { name: 'Total', value: statusData.total, color: '#3b82f6', gradient: gradients.total, total: statusData.total },
    { name: 'Open', value: statusData.open, color: '#ef4444', gradient: gradients.open, total: statusData.total },
    { name: 'Closed', value: statusData.closed, color: '#22c55e', gradient: gradients.closed, total: statusData.total },
    { name: 'Closed by Test Booking', value: statusData.closedByTestBooking, color: '#f59e0b', gradient: gradients.closedByTestBooking, total: statusData.total }
  ]

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]
      const percentage = statusData.total > 0 ? ((data.value / statusData.total) * 100).toFixed(1) : 0
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-xl">
          <p className="text-xs font-bold text-gray-900 mb-1">{data.name}</p>
          <p className="text-xs text-gray-600">
            <span className="font-semibold">{data.value}</span> violations
          </p>
          {data.name !== 'Total' && (
            <p className="text-xs text-gray-500 mt-0.5">{percentage}% of total</p>
          )}
        </div>
      )
    }
    return null
  }

  return (
    <div className="card p-3 bg-gradient-to-br from-white to-gray-50/50">
      <div className="mb-3 flex items-center gap-1">
        <h3 className="text-xs font-bold text-gray-900">Violation Status</h3>
        <Info
          className="w-3 h-3 text-gray-400"
          title="Status breakdown of all violations."
        />
      </div>

      <div className="h-36 relative">
        <svg style={{ position: 'absolute', width: 0, height: 0 }}>
          <defs>
            {chartData.map((item, index) => (
              <linearGradient key={`gradient-${index}`} id={`statusGradient-${index}`} x1="0%" y1="0%" x2="100%" y2="0%">
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
              width={85}
              tick={{ fontSize: 9, fill: '#4b5563', fontWeight: 600 }}
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
                  fill={`url(#statusGradient-${index})`}
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
