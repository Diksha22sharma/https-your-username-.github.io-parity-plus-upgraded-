import { useState, useRef, useEffect } from 'react'
import { ChevronDown, X, Search } from 'lucide-react'

export interface HierarchyOption {
  id: string
  name: string
  children?: HierarchyOption[]
}

interface HierarchicalViewByProps {
  selectedPath: string[]
  onSelectionChange: (path: string[]) => void
  hierarchy: HierarchyOption[]
}

// Mock hierarchy data - in real app, this would come from API
export const mockHierarchy: HierarchyOption[] = [
  {
    id: 'brand1',
    name: 'Brand A',
    children: [
      {
        id: 'subbrand1',
        name: 'Sub Brand A1',
        children: [
          {
            id: 'region1',
            name: 'North America',
            children: [
              {
                id: 'country1',
                name: 'United States',
                children: [
                  {
                    id: 'city1',
                    name: 'New York',
                    children: [
                      { id: 'hotel1', name: 'Hotel Manhattan' },
                      { id: 'hotel2', name: 'Hotel Central Park' },
                      { id: 'hotel3', name: 'Hotel Times Square' }
                    ]
                  },
                  {
                    id: 'city2',
                    name: 'Los Angeles',
                    children: [
                      { id: 'hotel4', name: 'Hotel Hollywood' },
                      { id: 'hotel5', name: 'Hotel Beverly Hills' }
                    ]
                  }
                ]
              },
              {
                id: 'country2',
                name: 'Canada',
                children: [
                  {
                    id: 'city3',
                    name: 'Toronto',
                    children: [
                      { id: 'hotel6', name: 'Hotel Downtown' },
                      { id: 'hotel7', name: 'Hotel CN Tower' }
                    ]
                  }
                ]
              }
            ]
          },
          {
            id: 'region2',
            name: 'Europe',
            children: [
              {
                id: 'country3',
                name: 'United Kingdom',
                children: [
                  {
                    id: 'city4',
                    name: 'London',
                    children: [
                      { id: 'hotel8', name: 'Hotel Westminster' },
                      { id: 'hotel9', name: 'Hotel Thames' }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'subbrand2',
        name: 'Sub Brand A2',
        children: [
          {
            id: 'region3',
            name: 'Asia Pacific',
            children: [
              {
                id: 'country4',
                name: 'India',
                children: [
                  {
                    id: 'city5',
                    name: 'Mumbai',
                    children: [
                      { id: 'hotel10', name: 'Hotel Gateway' },
                      { id: 'hotel11', name: 'Hotel Marine Drive' }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'brand2',
    name: 'Brand B',
    children: [
      {
        id: 'subbrand3',
        name: 'Sub Brand B1',
        children: [
          {
            id: 'region4',
            name: 'Middle East',
            children: [
              {
                id: 'country5',
                name: 'UAE',
                children: [
                  {
                    id: 'city6',
                    name: 'Dubai',
                    children: [
                      { id: 'hotel12', name: 'Hotel Burj Al Arab' },
                      { id: 'hotel13', name: 'Hotel Palm Jumeirah' }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
]

const levelNames = ['Brand', 'Sub Brand', 'Region', 'Country', 'City', 'Hotel']

export default function HierarchicalViewBy({ 
  selectedPath, 
  onSelectionChange,
  hierarchy = mockHierarchy 
}: HierarchicalViewByProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [searchTerms, setSearchTerms] = useState<Record<string, string>>({
    regions: '',
    countries: '',
    cities: '',
    hotels: ''
  })
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Extract flat lists for each level
  const extractLevels = () => {
    const regions = new Set<string>()
    const countries = new Set<string>()
    const cities = new Set<string>()
    const hotels = new Set<string>()

    const traverse = (items: HierarchyOption[], level: number = 0) => {
      items.forEach(item => {
        if (level === 0) {
          // Brand level - skip for now, we'll use regions
        } else if (level === 1) {
          // Sub Brand level - skip
        } else if (level === 2) {
          regions.add(item.name)
        } else if (level === 3) {
          countries.add(item.name)
        } else if (level === 4) {
          cities.add(item.name)
        } else if (level === 5) {
          hotels.add(item.name)
        }

        if (item.children) {
          traverse(item.children, level + 1)
        }
      })
    }

    traverse(hierarchy)

    // Also extract from mock data structure
    const allRegions: string[] = []
    const allCountries: string[] = []
    const allCities: string[] = []
    const allHotels: string[] = []

    hierarchy.forEach(brand => {
      brand.children?.forEach(subBrand => {
        subBrand.children?.forEach(region => {
          if (!allRegions.includes(region.name)) {
            allRegions.push(region.name)
          }
          region.children?.forEach(country => {
            if (!allCountries.includes(country.name)) {
              allCountries.push(country.name)
            }
            country.children?.forEach(city => {
              if (!allCities.includes(city.name)) {
                allCities.push(city.name)
              }
              city.children?.forEach(hotel => {
                if (!allHotels.includes(hotel.name)) {
                  allHotels.push(hotel.name)
                }
              })
            })
          })
        })
      })
    })

    return {
      regions: ['All', ...allRegions.sort()],
      countries: ['All', ...allCountries.sort()],
      cities: ['All', ...allCities.sort()],
      hotels: ['All', ...allHotels.sort()]
    }
  }

  const { regions, countries, cities, hotels } = extractLevels()

  // Filter items based on search
  const filterItems = (items: string[], searchTerm: string) => {
    if (!searchTerm) return items
    return items.filter(item => 
      item.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }

  const handleToggle = (item: string, level: string) => {
    const key = `${level}:${item}`
    const newSelected = new Set(selectedItems)
    
    if (item === 'All') {
      // Toggle all items in this level
      const allInLevel = level === 'regions' ? regions : 
                        level === 'countries' ? countries :
                        level === 'cities' ? cities : hotels
      
      const allSelected = allInLevel.slice(1).every(i => newSelected.has(`${level}:${i}`))
      
      if (allSelected) {
        // Deselect all
        allInLevel.slice(1).forEach(i => newSelected.delete(`${level}:${i}`))
        newSelected.delete(key)
      } else {
        // Select all
        allInLevel.slice(1).forEach(i => newSelected.add(`${level}:${i}`))
        newSelected.add(key)
      }
    } else {
      if (newSelected.has(key)) {
        newSelected.delete(key)
        newSelected.delete(`${level}:All`)
      } else {
        newSelected.add(key)
        // Check if all items are selected
        const allInLevel = level === 'regions' ? regions : 
                          level === 'countries' ? countries :
                          level === 'cities' ? cities : hotels
        const allSelected = allInLevel.slice(1).every(i => 
          i === item || newSelected.has(`${level}:${i}`)
        )
        if (allSelected) {
          newSelected.add(`${level}:All`)
        }
      }
    }
    
    setSelectedItems(newSelected)
  }

  const isSelected = (item: string, level: string) => {
    return selectedItems.has(`${level}:${item}`)
  }

  const getSelectedCount = (level: string) => {
    const allInLevel = level === 'regions' ? regions : 
                      level === 'countries' ? countries :
                      level === 'cities' ? cities : hotels
    return allInLevel.slice(1).filter(item => selectedItems.has(`${level}:${item}`)).length
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleApply = () => {
    // Build selection paths
    const path: string[] = []
    
    // Get all selected items by level
    const selectedRegions = regions.filter(r => r !== 'All' && isSelected(r, 'regions'))
    const selectedCountries = countries.filter(c => c !== 'All' && isSelected(c, 'countries'))
    const selectedCities = cities.filter(c => c !== 'All' && isSelected(c, 'cities'))
    const selectedHotels = hotels.filter(h => h !== 'All' && isSelected(h, 'hotels'))

    // Build paths for selected hotels
    selectedHotels.forEach(hotel => {
      // Find the hotel's path in hierarchy
      const findPath = (items: HierarchyOption[], currentPath: string[] = []): string[] | null => {
        for (const item of items) {
          const newPath = [...currentPath, item.name]
          if (item.name === hotel && !item.children) {
            return newPath
          }
          if (item.children) {
            const result = findPath(item.children, newPath)
            if (result) return result
          }
        }
        return null
      }
      
      const hotelPath = findPath(hierarchy)
      if (hotelPath) {
        path.push(hotelPath.join(' >> '))
      }
    })

    // If no hotels selected, add other selections
    if (path.length === 0) {
      selectedRegions.forEach(r => path.push(r))
      selectedCountries.forEach(c => path.push(c))
      selectedCities.forEach(c => path.push(c))
    }

    onSelectionChange(path)
    setIsOpen(false)
  }

  const handleReset = () => {
    setSelectedItems(new Set())
    setSearchTerms({ regions: '', countries: '', cities: '', hotels: '' })
    onSelectionChange([])
  }

  const handleCancel = () => {
    setIsOpen(false)
  }

  const getDisplayText = () => {
    const hotelCount = getSelectedCount('hotels')
    if (hotelCount > 0) {
      return `${hotelCount} hotel${hotelCount !== 1 ? 's' : ''} selected`
    }
    if (selectedPath.length === 0) {
      return 'All Hotels'
    }
    if (selectedPath.length === 1) {
      return selectedPath[0]
    }
    return `${selectedPath.length} selected`
  }

  const renderColumn = (title: string, items: string[], level: string, count: number) => {
    const filteredItems = filterItems(items, searchTerms[level as keyof typeof searchTerms])
    
    return (
      <div className="flex flex-col border-r border-gray-200 last:border-r-0 flex-1">
        {/* Column Header */}
        <div className="p-3 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-gray-900">{title} ({count})</h4>
          </div>
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerms[level as keyof typeof searchTerms]}
              onChange={(e) => setSearchTerms({ ...searchTerms, [level]: e.target.value })}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>

        {/* Column Items */}
        <div className="flex-1 overflow-y-auto" style={{ maxHeight: '400px' }}>
          {filteredItems.map((item, index) => (
            <label
              key={`${level}-${item}-${index}`}
              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
            >
              <input
                type="checkbox"
                checked={isSelected(item, level)}
                onChange={() => handleToggle(item, level)}
                className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
              />
              <span className="text-sm text-gray-700 flex-1">{item}</span>
            </label>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <span className="truncate max-w-[150px]">{getDisplayText()}</span>
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-[800px] bg-white border border-gray-300 rounded-lg shadow-xl">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900">Select Hotel</h3>
              <button
                onClick={handleCancel}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Table Format with Columns */}
          <div className="flex" style={{ height: '450px' }}>
            {renderColumn('Regions', regions, 'regions', regions.length - 1)}
            {renderColumn('Countries', countries, 'countries', countries.length - 1)}
            {renderColumn('Cities', cities, 'cities', cities.length - 1)}
            {renderColumn('Hotels', hotels, 'hotels', hotels.length - 1)}
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
            <div className="text-sm text-gray-600">
              {getSelectedCount('hotels')} hotel{getSelectedCount('hotels') !== 1 ? 's' : ''} selected
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleReset}
                className="text-sm text-gray-600 hover:text-gray-900 font-medium"
              >
                Reset
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded transition-colors"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
