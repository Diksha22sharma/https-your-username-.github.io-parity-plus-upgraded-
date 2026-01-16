import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { Info } from 'lucide-react'

interface ViolationReason {
  name: string
  value: number
  color: string
}

interface TopViolationReasonsCardProps {
  data?: ViolationReason[]
}

const renderCustomizedLabel = (entry: any) => {
  const RADIAN = Math.PI / 180
  const { cx, cy, midAngle, innerRadius, outerRadius, percent } = entry
  
  // Only show labels for segments larger than 12%
  if (percent < 0.12) return null

  // Position labels further out to avoid overlap
  const radius = innerRadius + (outerRadius - innerRadius) * 0.75
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)

  // Determine text anchor based on position
  const textAnchor = x > cx ? 'start' : 'end'

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={textAnchor}
      dominantBaseline="central"
      fontSize={8}
      fontWeight={700}
      style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

export default function TopViolationReasonsCard({ data }: TopViolationReasonsCardProps) {
  const reasonsData = data || [
    { name: 'Bait & Switch', value: 180, color: '#dc2626' },
    { name: 'Caching', value: 145, color: '#f97316' },
    { name: 'Promotion', value: 95, color: '#f59e0b' },
    { name: 'Others', value: 80, color: '#6b7280' }
  ]

  const total = reasonsData.reduce((sum, item) => sum + item.value, 0)

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
        <h3 className="text-xs font-bold text-gray-900">Top Violation Reasons</h3>
        <Info
          className="w-3 h-3 text-gray-400"
          title="Top reasons contributing to violations."
        />
      </div>

      <div className="h-36 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={reasonsData}
              cx="50%"
              cy="38%"
              innerRadius={28}
              outerRadius={50}
              paddingAngle={4}
              dataKey="value"
              label={renderCustomizedLabel}
              labelLine={false}
              animationDuration={800}
            >
              {reasonsData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color} 
                  stroke="#ffffff" 
                  strokeWidth={2}
                  style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))' }}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Center label */}
        <div className="absolute top-[38%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="text-center">
            <div className="text-base font-bold text-gray-900">{total}</div>
            <div className="text-[8px] text-gray-500 font-medium">Total</div>
          </div>
        </div>

        {/* Compact Legend - positioned below chart */}
        <div className="absolute bottom-0 left-0 right-0 grid grid-cols-2 gap-x-2 gap-y-1 px-1">
          {reasonsData.map((item) => (
            <div key={item.name} className="flex items-center gap-1.5 min-w-0">
              <div 
                className="w-2 h-2 rounded flex-shrink-0 shadow-sm"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-[8px] text-gray-600 truncate font-medium flex-1">{item.name}</span>
              <span className="text-[8px] font-bold text-gray-900 flex-shrink-0">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
