import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, LabelList } from 'recharts'
import { Info } from 'lucide-react'

interface SeverityData {
  critical: number
  major: number
  minor: number
  trivial: number
}

interface OverallSeverityCardProps {
  data?: SeverityData
}

const CustomLabel = (props: any) => {
  const { x, y, width, value, payload } = props
  const total = payload?.total || 600
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

// Gradient definitions for modern look
const gradients = {
  critical: ['#ef4444', '#dc2626'],
  major: ['#f97316', '#ea580c'],
  minor: ['#fbbf24', '#f59e0b'],
  trivial: ['#34d399', '#22c55e']
}

export default function OverallSeverityCard({ data }: OverallSeverityCardProps) {
  const severityData = data || {
    critical: 45,
    major: 120,
    minor: 280,
    trivial: 155
  }

  const total = severityData.critical + severityData.major + severityData.minor + severityData.trivial

  const chartData = [
    { name: 'Critical', value: severityData.critical, color: '#dc2626', gradient: gradients.critical, total },
    { name: 'Major', value: severityData.major, color: '#f97316', gradient: gradients.major, total },
    { name: 'Minor', value: severityData.minor, color: '#f59e0b', gradient: gradients.minor, total },
    { name: 'Trivial', value: severityData.trivial, color: '#22c55e', gradient: gradients.trivial, total }
  ]

  return (
    <div className="card p-3 bg-gradient-to-br from-white to-gray-50/50">
      <div className="mb-3 flex items-center gap-1">
        <h3 className="text-xs font-bold text-gray-900">Overall Severity</h3>
        <Info
          className="w-3 h-3 text-gray-400"
          title="Distribution of violations by severity."
        />
      </div>

      <div className="h-36 relative">
        <svg style={{ position: 'absolute', width: 0, height: 0 }}>
          <defs>
            {chartData.map((item, index) => (
              <linearGradient key={`gradient-${index}`} id={`severityGradient-${index}`} x1="0%" y1="0%" x2="100%" y2="0%">
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
              width={65}
              tick={{ fontSize: 10, fill: '#4b5563', fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
            />
            <Bar 
              dataKey="value" 
              radius={[0, 6, 6, 0]} 
              barSize={26}
              animationDuration={800}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={`url(#severityGradient-${index})`}
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
