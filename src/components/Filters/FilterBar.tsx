import { useState } from 'react'
import { Filter, X, SlidersHorizontal } from 'lucide-react'
import { FilterState } from '../../types'
import AdvancedFilters from './AdvancedFilters'

interface FilterBarProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  violations?: any[] // For generating entity options
}

export default function FilterBar({ filters, onFiltersChange, violations = [] }: FilterBarProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const calendarViewBy = filters.calendarViewBy
  const selectedEntities = filters.selectedEntities || []

  const activeFilterCount = Object.values(filters).filter(v => {
    if (v === undefined || v === null) return false
    if (Array.isArray(v)) return v.length > 0
    if (typeof v === 'object' && 'start' in v) return true // dateRange
    return true
  }).length

  const clearFilter = (key: keyof FilterState) => {
    onFiltersChange({ ...filters, [key]: undefined })
  }

  const clearAllFilters = () => {
    onFiltersChange({})
  }

  const getFilterChipColor = (key: keyof FilterState) => {
    if (key === 'channelType') return 'bg-primary-100 text-primary-700 border-primary-200'
    if (key === 'severity') return 'bg-red-100 text-red-700 border-red-200'
    if (key === 'brand' || key === 'subBrand' || key === 'hotel') return 'bg-purple-100 text-purple-700 border-purple-200'
    return 'bg-gray-100 text-gray-700 border-gray-200'
  }

  return (
    <>
      <div className="bg-surface rounded-card shadow-card border border-border-light p-5 mb-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 overflow-x-auto pb-1">
            <div className="flex items-center space-x-2 text-sm font-semibold text-gray-700 flex-shrink-0">
              <Filter className="w-4 h-4" />
              <span>Active Filters</span>
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              {filters.channelType && filters.channelType.length > 0 && (
                <div className={`filter-chip ${getFilterChipColor('channelType')} border`}>
                  <span className="font-medium">Channel Type:</span>
                  <span>{filters.channelType.join(', ')}</span>
                  <button 
                    onClick={() => clearFilter('channelType')} 
                    className="ml-1 hover:opacity-70 transition-opacity"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {filters.severity && filters.severity.length > 0 && (
                <div className={`filter-chip ${getFilterChipColor('severity')} border`}>
                  <span className="font-medium">Severity:</span>
                  <span>{filters.severity.join(', ')}</span>
                  <button 
                    onClick={() => clearFilter('severity')} 
                    className="ml-1 hover:opacity-70 transition-opacity"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {filters.brand && filters.brand.length > 0 && (
                <div className={`filter-chip ${getFilterChipColor('brand')} border`}>
                  <span className="font-medium">Brand:</span>
                  <span>{filters.brand.join(', ')}</span>
                  <button 
                    onClick={() => clearFilter('brand')} 
                    className="ml-1 hover:opacity-70 transition-opacity"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {filters.subBrand && filters.subBrand.length > 0 && (
                <div className={`filter-chip ${getFilterChipColor('subBrand')} border`}>
                  <span className="font-medium">Sub Brand:</span>
                  <span>{filters.subBrand.join(', ')}</span>
                  <button 
                    onClick={() => clearFilter('subBrand')} 
                    className="ml-1 hover:opacity-70 transition-opacity"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {filters.dateRange && (
                <div className={`filter-chip ${getFilterChipColor('dateRange')} border`}>
                  <span className="font-medium">Date:</span>
                  <span>{filters.dateRange.start} to {filters.dateRange.end}</span>
                  <button 
                    onClick={() => clearFilter('dateRange')} 
                    className="ml-1 hover:opacity-70 transition-opacity"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {calendarViewBy && (
                <div className={`filter-chip ${getFilterChipColor('brand')} border`}>
                  <span className="font-medium">View By:</span>
                  <span>{calendarViewBy}</span>
                  <button 
                    onClick={() => onFiltersChange({ ...filters, calendarViewBy: undefined, selectedEntities: [] })} 
                    className="ml-1 hover:opacity-70 transition-opacity"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {selectedEntities.length > 0 && (
                <div className={`filter-chip ${getFilterChipColor('brand')} border`}>
                  <span className="font-medium">{calendarViewBy}:</span>
                  <span>{selectedEntities.join(', ')}</span>
                  <button 
                    onClick={() => onFiltersChange({ ...filters, selectedEntities: [] })} 
                    className="ml-1 hover:opacity-70 transition-opacity"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {activeFilterCount === 0 && (
                <span className="text-sm text-gray-400 italic">No filters applied</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {activeFilterCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-surface-hover rounded-lg transition-colors"
              >
                Clear All
              </button>
            )}
            <button
              onClick={() => setShowAdvanced(true)}
              className="btn-primary flex items-center space-x-2 relative"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Advanced</span>
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shadow-soft">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {showAdvanced && (
        <AdvancedFilters
          filters={filters}
          onFiltersChange={onFiltersChange}
          onClose={() => setShowAdvanced(false)}
          violations={violations}
        />
      )}
    </>
  )
}

