import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Violation } from '../../types'

interface ParityDayData {
  date: string
  parityScore: number
  change?: number
  isHighest?: boolean
  isLowest?: boolean
  violations?: Violation[]
}

interface ParityCalendarViewProps {
  startDate: string
  endDate: string
  viewBy?: 'Brand' | 'SubBrand' | 'Hotel' | 'Channel'
  entityName?: string
  violations?: Violation[]
  onDateClick?: (date: string) => void
}

export default function ParityCalendarView({
  startDate,
  endDate,
  entityName,
  violations = [],
  onDateClick
}: ParityCalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [monthOffset, setMonthOffset] = useState(0)

  // Generate all dates in range - extend to show more months (6 months from start)
  const generateDates = () => {
    const dates: string[] = []
    const start = new Date(startDate)
    const end = new Date(startDate)
    // Extend to 6 months from start date
    end.setMonth(end.getMonth() + 6)
    const current = new Date(start)
    
    while (current <= end) {
      dates.push(current.toISOString().split('T')[0])
      current.setDate(current.getDate() + 1)
    }
    return dates
  }

  // Group dates into weeks (Monday to Sunday)
  const groupDatesByWeek = (dates: string[]) => {
    if (dates.length === 0) return []
    
    const weeks: { start: string; end: string; dates: string[] }[] = []
    let currentWeek: string[] = []
    let weekStart: string | null = null

    dates.forEach((date) => {
      const dateObj = new Date(date)
      const dayOfWeek = dateObj.getDay() // 0 = Sunday, 1 = Monday, etc.
      
      // If it's Monday (1) or we're starting a new week
      if (dayOfWeek === 1 || currentWeek.length === 0) {
        // Save previous week if it exists
        if (currentWeek.length > 0 && weekStart) {
          weeks.push({
            start: weekStart,
            end: currentWeek[currentWeek.length - 1],
            dates: [...currentWeek]
          })
        }
        // Start new week
        currentWeek = [date]
        weekStart = date
      } else {
        currentWeek.push(date)
      }
    })

    // Add the last week
    if (currentWeek.length > 0 && weekStart) {
      weeks.push({
        start: weekStart,
        end: currentWeek[currentWeek.length - 1],
        dates: [...currentWeek]
      })
    }

    return weeks
  }

  // Generate parity data for each date from violations
  const generateParityData = (dates: string[]): Record<string, ParityDayData> => {
    const data: Record<string, ParityDayData> = {}
    
    // Initialize all dates
    dates.forEach(date => {
      data[date] = {
        date,
        parityScore: 85, // Default score
        change: 0,
        violations: []
      }
    })

    // Group violations by date
    violations.forEach(violation => {
      if (data[violation.date]) {
        if (!data[violation.date].violations) {
          data[violation.date].violations = []
        }
        data[violation.date].violations!.push(violation)
      }
    })

    // Calculate parity scores based on violations
    Object.keys(data).forEach(date => {
      const dayViolations = data[date].violations || []
      if (dayViolations.length > 0) {
        // Calculate average parity score based on WLM
        const winCount = dayViolations.filter(v => v.wlm === 'Win').length
        const meetCount = dayViolations.filter(v => v.wlm === 'Meet').length
        const lossCount = dayViolations.filter(v => v.wlm === 'Loss').length
        const total = dayViolations.length
        
        // Score calculation: Win = 95, Meet = 85, Loss = 70
        const avgScore = (winCount * 95 + meetCount * 85 + lossCount * 70) / total
        data[date].parityScore = Math.round(avgScore)
      }
    })

    // Calculate changes
    const sortedDates = dates.sort()
    sortedDates.forEach((date, index) => {
      if (index > 0) {
        const prevDate = sortedDates[index - 1]
        data[date].change = data[date].parityScore - data[prevDate].parityScore
      }
    })

    // Mark highest and lowest
    const scores = Object.values(data).map(d => d.parityScore)
    const maxScore = Math.max(...scores)
    const minScore = Math.min(...scores)
    
    Object.keys(data).forEach(date => {
      if (data[date].parityScore === maxScore) {
        data[date].isHighest = true
      }
      if (data[date].parityScore === minScore) {
        data[date].isLowest = true
      }
    })

    return data
  }

  // Group dates by month
  const groupDatesByMonth = (dates: string[]) => {
    const months: { month: string; year: number; dates: string[] }[] = []
    const monthMap = new Map<string, string[]>()
    
    dates.forEach(date => {
      const dateObj = new Date(date)
      const monthKey = `${dateObj.getFullYear()}-${dateObj.getMonth()}`
      
      if (!monthMap.has(monthKey)) {
        monthMap.set(monthKey, [])
      }
      monthMap.get(monthKey)!.push(date)
    })
    
    monthMap.forEach((monthDates, monthKey) => {
      const [year, month] = monthKey.split('-').map(Number)
      months.push({
        month: new Date(year, month, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        year,
        dates: monthDates.sort()
      })
    })
    
    return months.sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year
      return a.dates[0] > b.dates[0] ? 1 : -1
    })
  }

  const getParityColor = (score: number) => {
    if (score >= 90) return { bg: 'bg-green-50', border: 'border-green-300', text: 'text-green-700' } // High = Green
    if (score >= 75) return { bg: 'bg-yellow-50', border: 'border-yellow-300', text: 'text-yellow-700' } // Medium = Yellow
    return { bg: 'bg-red-50', border: 'border-red-300', text: 'text-red-700' } // Low = Red
  }


  const allDates = generateDates()
  const allMonths = groupDatesByMonth(allDates)
  const parityData = generateParityData(allDates)

  // Show only 3 months at a time
  const visibleMonths = allMonths.slice(monthOffset, monthOffset + 3)
  const canGoPrev = monthOffset > 0
  const canGoNext = monthOffset + 3 < allMonths.length

  const handlePrev = () => {
    if (canGoPrev) {
      setMonthOffset(Math.max(0, monthOffset - 3))
    }
  }

  const handleNext = () => {
    if (canGoNext) {
      const maxOffset = Math.max(0, allMonths.length - 3)
      setMonthOffset(Math.min(maxOffset, monthOffset + 3))
    }
  }

  const handleDateClick = (date: string) => {
    setSelectedDate(date)
    onDateClick?.(date)
    // Scroll to violations report section
    setTimeout(() => {
      const reportSection = document.getElementById('violations-report')
      if (reportSection) {
        reportSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 100)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }



  const getDayNumber = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.getDate()
  }

  return (
    <div className="card p-4 bg-gradient-to-br from-white to-gray-50 border border-gray-200 shadow-md">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-base font-bold text-gray-900 mb-0.5">
              Parity Calendar
            </h2>
            <p className="text-xs text-gray-600">
              {formatDate(startDate)} - {formatDate(endDate)}
            </p>
            {entityName && (
              <p className="text-[10px] text-gray-500 mt-0.5 font-medium">{entityName}</p>
            )}
          </div>
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
            <span className="flex items-center gap-1.5 text-[10px] font-medium text-gray-700">
              <span className="w-2 h-2 rounded-full bg-gradient-to-br from-green-400 to-green-600"></span>
              High
            </span>
            <span className="flex items-center gap-1.5 text-[10px] font-medium text-gray-700">
              <span className="w-2 h-2 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600"></span>
              Med
            </span>
            <span className="flex items-center gap-1.5 text-[10px] font-medium text-gray-700">
              <span className="w-2 h-2 rounded-full bg-gradient-to-br from-red-400 to-red-600"></span>
              Low
            </span>
          </div>
        </div>
      </div>

      {/* Calendar - Fixed 3 Months View with Navigation */}
      <div className="relative">
        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={handlePrev}
            disabled={!canGoPrev}
            className={`px-2 py-1.5 rounded-md transition-all duration-200 flex items-center gap-1 font-medium text-xs ${
              canGoPrev 
                ? 'bg-white border border-gray-300 hover:border-primary-500 hover:bg-primary-50 text-gray-700 hover:text-primary-700 shadow-sm hover:shadow' 
                : 'bg-gray-50 border border-gray-200 text-gray-300 cursor-not-allowed'
            }`}
          >
            <ChevronLeft className="w-3 h-3" />
            <span>Prev</span>
          </button>
          <span className="text-xs font-medium text-gray-700 bg-white px-3 py-1.5 rounded-md border border-gray-200 shadow-sm">
            {monthOffset + 1}-{Math.min(monthOffset + 3, allMonths.length)} of {allMonths.length}
          </span>
          <button
            onClick={handleNext}
            disabled={!canGoNext}
            className={`px-2 py-1.5 rounded-md transition-all duration-200 flex items-center gap-1 font-medium text-xs ${
              canGoNext 
                ? 'bg-white border border-gray-300 hover:border-primary-500 hover:bg-primary-50 text-gray-700 hover:text-primary-700 shadow-sm hover:shadow' 
                : 'bg-gray-50 border border-gray-200 text-gray-300 cursor-not-allowed'
            }`}
          >
            <span>Next</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {/* Calendar - Fixed 3 Months */}
        <div className="grid grid-cols-3 gap-3">
          {visibleMonths.map((month, monthIndex) => {
            const monthWeeks = groupDatesByWeek(month.dates)
            
            return (
              <div key={monthIndex} className="border border-gray-200 rounded-lg p-2 bg-white shadow-sm hover:shadow transition-shadow duration-200 w-full">
                <h3 className="text-sm font-bold text-gray-900 mb-2 text-center bg-gradient-to-r from-primary-600 to-primary-700 text-white py-1.5 px-3 rounded-md">
                  {month.month}
                </h3>
                <table className="border-collapse w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-center py-1.5 px-1 text-[10px] font-semibold text-gray-700 uppercase">Mon</th>
                      <th className="text-center py-1.5 px-1 text-[10px] font-semibold text-gray-700 uppercase">Tue</th>
                      <th className="text-center py-1.5 px-1 text-[10px] font-semibold text-gray-700 uppercase">Wed</th>
                      <th className="text-center py-1.5 px-1 text-[10px] font-semibold text-gray-700 uppercase">Thu</th>
                      <th className="text-center py-1.5 px-1 text-[10px] font-semibold text-gray-700 uppercase">Fri</th>
                      <th className="text-center py-1.5 px-1 text-[10px] font-semibold text-gray-700 uppercase">Sat</th>
                      <th className="text-center py-1.5 px-1 text-[10px] font-semibold text-gray-700 uppercase">Sun</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthWeeks.map((week, weekIndex) => (
                      <tr key={weekIndex} className="border-b border-gray-100 last:border-b-0">
                        {/* Day Cells */}
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((dayName, dayIndex) => {
                          // Find the date for this day in the week
                          const weekDate = week.dates.find(date => {
                            const dateObj = new Date(date)
                            const dayOfWeek = dateObj.getDay()
                            const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
                            return dayNames[dayOfWeek] === dayName
                          })

                    if (!weekDate) {
                      return (
                        <td key={dayIndex} className="py-1 px-1 text-center">
                          <div className="min-w-[35px] h-12"></div>
                        </td>
                      )
                    }

                    const dayData = parityData[weekDate]
                    if (!dayData) {
                      return (
                        <td key={dayIndex} className="py-1 px-1 text-center">
                          <div className="min-w-[35px] h-12"></div>
                        </td>
                      )
                    }

                          // Get parity color based on score
                          const parityColor = getParityColor(dayData.parityScore)
                          const isSelected = selectedDate === weekDate
                          
                          // Enhanced color scheme with gradients
                          const colorClasses = {
                            high: {
                              bg: 'bg-gradient-to-br from-green-50 to-green-100',
                              border: 'border-green-300',
                              text: 'text-green-700',
                              hover: 'hover:from-green-100 hover:to-green-200'
                            },
                            medium: {
                              bg: 'bg-gradient-to-br from-yellow-50 to-yellow-100',
                              border: 'border-yellow-300',
                              text: 'text-yellow-700',
                              hover: 'hover:from-yellow-100 hover:to-yellow-200'
                            },
                            low: {
                              bg: 'bg-gradient-to-br from-red-50 to-red-100',
                              border: 'border-red-300',
                              text: 'text-red-700',
                              hover: 'hover:from-red-100 hover:to-red-200'
                            }
                          }
                          
                          const colorScheme = dayData.parityScore >= 90 ? colorClasses.high :
                                             dayData.parityScore >= 75 ? colorClasses.medium :
                                             colorClasses.low
                          
                          return (
                            <td 
                              key={dayIndex} 
                              className="py-1 px-1 text-center"
                            >
                              <div 
                                className={`min-w-[35px] h-12 relative flex flex-col items-center justify-center border rounded-md p-1 cursor-pointer transition-all duration-200 ${colorScheme.bg} ${colorScheme.border} ${colorScheme.hover} ${isSelected ? 'ring-2 ring-primary-500 ring-offset-1 shadow-lg scale-105 z-10' : 'shadow-sm hover:shadow'}`}
                                onClick={() => handleDateClick(weekDate)}
                              >
                                {/* Date Number - Top */}
                                <div className={`text-[10px] font-bold mb-0.5 ${isSelected ? 'text-primary-800' : 'text-gray-700'}`}>
                                  {getDayNumber(weekDate)}
                                </div>
                                
                                {/* Parity Score - Center */}
                                <div className={`text-xs font-bold ${colorScheme.text}`}>
                                  {dayData.parityScore}
                                </div>
                                
                                {/* Change indicator */}
                                {dayData.change !== undefined && dayData.change !== 0 && (
                                  <div className={`absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full flex items-center justify-center text-[7px] font-bold ${
                                    dayData.change > 0 ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                                  }`}>
                                    {dayData.change > 0 ? '↑' : '↓'}
                                  </div>
                                )}
                              </div>
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          })}
        </div>
      </div>

    </div>
  )
}

