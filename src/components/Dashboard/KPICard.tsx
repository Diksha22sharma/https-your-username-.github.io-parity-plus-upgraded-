import { ReactNode } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface KPICardProps {
  title: string
  value: string | number
  subtitle?: string
  trend?: {
    value: number
    period: string
  }
  icon?: ReactNode
  color?: 'blue' | 'green' | 'red' | 'orange' | 'purple'
}

export default function KPICard({ 
  title, 
  value, 
  subtitle, 
  trend, 
  icon,
  color = 'blue'
}: KPICardProps) {
  const colorConfig = {
    blue: {
      border: 'border-l-primary-500',
      bg: 'bg-primary-50/50',
      iconBg: 'bg-primary-100',
      iconColor: 'text-primary-600',
    },
    green: {
      border: 'border-l-green-500',
      bg: 'bg-green-50/50',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    red: {
      border: 'border-l-red-500',
      bg: 'bg-red-50/50',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
    },
    orange: {
      border: 'border-l-orange-500',
      bg: 'bg-orange-50/50',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
    },
    purple: {
      border: 'border-l-purple-500',
      bg: 'bg-purple-50/50',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
    },
  }

  const config = colorConfig[color]
  const trendColor = trend && trend.value > 0 ? 'text-green-600' : trend && trend.value < 0 ? 'text-red-600' : 'text-gray-500'
  const TrendIcon = trend && trend.value > 0 ? TrendingUp : trend && trend.value < 0 ? TrendingDown : Minus

  return (
    <div className={`kpi-card border-l-4 ${config.border} ${config.bg} relative overflow-hidden`}>
      <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
        <div className={`w-full h-full ${config.bg.replace('/50', '')} rounded-full -mr-16 -mt-16`}></div>
      </div>
      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-1 tracking-tight">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 font-medium">{subtitle}</p>
          )}
          {trend && (
            <div className={`flex items-center space-x-1.5 mt-3 ${trendColor}`}>
              <div className={`p-1 rounded-md ${trend.value > 0 ? 'bg-green-100' : trend.value < 0 ? 'bg-red-100' : 'bg-gray-100'}`}>
                <TrendIcon className="w-3.5 h-3.5" />
              </div>
              <span className="text-sm font-semibold">
                {Math.abs(trend.value)}% <span className="text-gray-500 font-normal">{trend.period}</span>
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div className={`ml-4 p-3 rounded-xl ${config.iconBg} ${config.iconColor} flex-shrink-0`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}

