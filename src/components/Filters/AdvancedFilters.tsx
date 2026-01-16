import { useState } from 'react'
import { X } from 'lucide-react'
import { FilterState } from '../../types'

interface AdvancedFiltersProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  onClose: () => void
  violations?: any[]
}

export default function AdvancedFilters({ filters, onFiltersChange, onClose, violations = [] }: AdvancedFiltersProps) {
  const [showEntityDropdown, setShowEntityDropdown] = useState(false)
  const calendarViewBy = filters.calendarViewBy || 'Brand'
  const selectedEntities = filters.selectedEntities || []

  // Generate entity options based on view type
  const getEntityOptions = () => {
    const uniqueSet = new Set<string>()
    
    violations.forEach((violation: any) => {
      switch (calendarViewBy) {
        case 'Brand':
          if (violation.brand) uniqueSet.add(violation.brand)
          break
        case 'SubBrand':
          if (violation.subBrand) uniqueSet.add(violation.subBrand)
          break
        case 'Hotel':
          uniqueSet.add(violation.hotel)
          break
        case 'Channel':
          uniqueSet.add(violation.channel)
          break
      }
    })
    
    return Array.from(uniqueSet).sort()
  }

  const entityOptions = getEntityOptions()

  const toggleEntity = (entity: string) => {
    const current = filters.selectedEntities || []
    const updated = current.includes(entity)
      ? current.filter(e => e !== entity)
      : [...current, entity]
    onFiltersChange({ ...filters, selectedEntities: updated })
  }

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface rounded-card shadow-elevated w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-border-light">
        <div className="sticky top-0 bg-surface border-b border-border-light px-6 py-5 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Advanced Filters</h2>
            <p className="text-sm text-gray-500 mt-0.5">Refine your search with detailed filters</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-surface-hover rounded-lg transition-colors text-gray-600 hover:text-gray-900"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* View By Selector */}
          <div className="bg-surface-elevated rounded-lg p-4 border border-border-light">
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              View By
            </label>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">View Type</label>
                <select
                  value={calendarViewBy}
                  onChange={(e) => {
                    onFiltersChange({
                      ...filters,
                      calendarViewBy: e.target.value as 'Brand' | 'SubBrand' | 'Hotel' | 'Channel',
                      selectedEntities: [] // Reset selections when view type changes
                    })
                  }}
                  className="w-full px-3 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-surface text-sm"
                >
                  <option value="Brand">Brand</option>
                  <option value="SubBrand">Sub Brand</option>
                  <option value="Hotel">Hotel</option>
                  <option value="Channel">Channel</option>
                </select>
              </div>
              
              {/* Multiselect Dropdown */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Select {calendarViewBy === 'SubBrand' ? 'Sub-Brands' : calendarViewBy === 'Channel' ? 'Channels' : `${calendarViewBy}s`}
                </label>
                <div className="relative">
                  <div 
                    onClick={() => setShowEntityDropdown(!showEntityDropdown)}
                    className="min-h-[42px] border border-gray-300 rounded-lg p-2 bg-white flex flex-wrap gap-2 items-center cursor-pointer hover:border-gray-400"
                  >
                    {selectedEntities.length === 0 ? (
                      <span className="text-sm text-gray-400">Select {calendarViewBy === 'SubBrand' ? 'sub-brands' : calendarViewBy === 'Channel' ? 'channels' : `${calendarViewBy.toLowerCase()}s`}...</span>
                    ) : (
                      selectedEntities.map(entity => (
                        <span
                          key={entity}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-700 rounded text-sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {entity}
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleEntity(entity)
                            }}
                            className="hover:text-primary-900"
                          >
                            ×
                          </button>
                        </span>
                      ))
                    )}
                    <span className="ml-auto text-gray-400">▼</span>
                  </div>
                  
                  {/* Dropdown Options */}
                  {showEntityDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {entityOptions.length > 0 ? (
                        entityOptions.map(option => (
                          <label
                            key={option}
                            className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type="checkbox"
                              checked={selectedEntities.includes(option)}
                              onChange={() => toggleEntity(option)}
                              className="mr-2 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                            <span className="text-sm text-gray-700">{option}</span>
                          </label>
                        ))
                      ) : (
                        <div className="px-4 py-2 text-sm text-gray-500">No options available</div>
                      )}
                    </div>
                  )}
                </div>
                {selectedEntities.length > 0 && (
                  <button
                    onClick={() => onFiltersChange({ ...filters, selectedEntities: [] })}
                    className="mt-2 text-xs text-primary-600 hover:text-primary-700"
                  >
                    Clear all
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Date Range */}
          <div className="bg-surface-elevated rounded-lg p-4 border border-border-light">
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Date Range
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Start Date</label>
                <input
                  type="date"
                  value={filters.dateRange?.start || ''}
                  onChange={(e) => updateFilter('dateRange', { 
                    ...filters.dateRange, 
                    start: e.target.value,
                    end: filters.dateRange?.end || e.target.value
                  })}
                  className="w-full px-3 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-surface text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">End Date</label>
                <input
                  type="date"
                  value={filters.dateRange?.end || ''}
                  onChange={(e) => updateFilter('dateRange', { 
                    ...filters.dateRange, 
                    end: e.target.value,
                    start: filters.dateRange?.start || e.target.value
                  })}
                  className="w-full px-3 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-surface text-sm"
                />
              </div>
            </div>
          </div>

          {/* Channel Type */}
          <div className="bg-surface-elevated rounded-lg p-4 border border-border-light">
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Channel Type
            </label>
            <div className="flex flex-wrap gap-3">
              {['OTA', 'Meta'].map((type) => {
                const isChecked = filters.channelType?.includes(type as any) || false
                return (
                  <label 
                    key={type} 
                    className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg border cursor-pointer transition-all ${
                      isChecked 
                        ? 'bg-primary-50 border-primary-300 text-primary-700' 
                        : 'bg-surface border-border-light text-gray-700 hover:bg-surface-hover'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        const current = filters.channelType || []
                        if (e.target.checked) {
                          updateFilter('channelType', [...current, type as any])
                        } else {
                          updateFilter('channelType', current.filter(t => t !== type))
                        }
                      }}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium">{type}</span>
                  </label>
                )
              })}
            </div>
          </div>

          {/* Rate Range */}
          <div className="bg-surface-elevated rounded-lg p-4 border border-border-light">
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Rate Range
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Min Rate</label>
                <input
                  type="number"
                  value={filters.rate?.min || ''}
                  onChange={(e) => updateFilter('rate', { 
                    ...filters.rate, 
                    min: e.target.value ? Number(e.target.value) : undefined
                  })}
                  className="w-full px-3 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-surface text-sm"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Max Rate</label>
                <input
                  type="number"
                  value={filters.rate?.max || ''}
                  onChange={(e) => updateFilter('rate', { 
                    ...filters.rate, 
                    max: e.target.value ? Number(e.target.value) : undefined
                  })}
                  className="w-full px-3 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-surface text-sm"
                  placeholder="10000"
                />
              </div>
            </div>
          </div>

          {/* LOS Range */}
          <div className="bg-surface-elevated rounded-lg p-4 border border-border-light">
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Length of Stay (LOS)
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Min LOS</label>
                <input
                  type="number"
                  value={filters.los?.min || ''}
                  onChange={(e) => updateFilter('los', { 
                    ...filters.los, 
                    min: e.target.value ? Number(e.target.value) : undefined
                  })}
                  className="w-full px-3 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-surface text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Max LOS</label>
                <input
                  type="number"
                  value={filters.los?.max || ''}
                  onChange={(e) => updateFilter('los', { 
                    ...filters.los, 
                    max: e.target.value ? Number(e.target.value) : undefined
                  })}
                  className="w-full px-3 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-surface text-sm"
                />
              </div>
            </div>
          </div>

          {/* Severity */}
          <div className="bg-surface-elevated rounded-lg p-4 border border-border-light">
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Severity
            </label>
            <div className="grid grid-cols-4 gap-3">
              {['Critical', 'High', 'Medium', 'Low'].map((severity) => {
                const isChecked = filters.severity?.includes(severity as any) || false
                const severityColors = {
                  Critical: 'bg-red-50 border-red-300 text-red-700',
                  High: 'bg-orange-50 border-orange-300 text-orange-700',
                  Medium: 'bg-yellow-50 border-yellow-300 text-yellow-700',
                  Low: 'bg-gray-50 border-gray-300 text-gray-700',
                }
                return (
                  <label 
                    key={severity} 
                    className={`flex items-center space-x-2 px-3 py-2.5 rounded-lg border cursor-pointer transition-all ${
                      isChecked 
                        ? severityColors[severity as keyof typeof severityColors]
                        : 'bg-surface border-border-light text-gray-700 hover:bg-surface-hover'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        const current = filters.severity || []
                        if (e.target.checked) {
                          updateFilter('severity', [...current, severity as any])
                        } else {
                          updateFilter('severity', current.filter(s => s !== severity))
                        }
                      }}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium">{severity}</span>
                  </label>
                )
              })}
            </div>
          </div>

          {/* Violation Reason */}
          <div className="bg-surface-elevated rounded-lg p-4 border border-border-light">
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Violation Reason
            </label>
            <select
              multiple
              value={filters.violationReason || []}
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions, option => option.value)
                updateFilter('violationReason', selected)
              }}
              className="w-full px-3 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-surface text-sm"
              size={5}
            >
              <option value="Rate plan difference">Rate plan difference</option>
              <option value="Room or board difference">Room or board difference</option>
              <option value="Promotion/discount difference">Promotion/discount difference</option>
              <option value="Bait & switch">Bait & switch</option>
              <option value="Other">Other</option>
            </select>
            <p className="text-xs text-gray-500 mt-2 font-medium">Hold Ctrl/Cmd to select multiple</p>
          </div>
        </div>

        <div className="sticky bottom-0 bg-surface border-t border-border-light px-6 py-4 flex items-center justify-end space-x-3 shadow-nav">
          <button
            onClick={() => onFiltersChange({})}
            className="px-4 py-2.5 text-gray-700 font-medium hover:bg-surface-hover rounded-lg transition-colors"
          >
            Clear All
          </button>
          <button
            onClick={onClose}
            className="btn-primary px-6 py-2.5"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  )
}

