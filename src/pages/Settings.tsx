import { useState, useMemo } from 'react'
import { Save, Users, AlertTriangle, Sliders, Shield, BarChart3, Settings as SettingsIcon, ShoppingCart, Zap, ChevronDown, ChevronUp, Mail, User, Edit2, X, Check, Globe, Pencil } from 'lucide-react'
import { mockHierarchy } from '../components/Filters/HierarchicalViewBy'

export default function Settings() {
  const [activeTab, setActiveTab] = useState<'user' | 'configurations' | 'test-booking' | 'auto-fix'>('configurations')
  
  const [severityThresholds, setSeverityThresholds] = useState({
    trivial: { min: 0, max: 2 },
    minor: { min: 2, max: 5 },
    major: { min: 5, max: 10 },
    critical: { min: 10, max: 100 }
  })

  const [tolerancePercent, setTolerancePercent] = useState(5)
  const [toleranceLevel, setToleranceLevel] = useState<'overall' | 'region' | 'channel'>('overall')
  const [isToleranceSettingsExpanded, setIsToleranceSettingsExpanded] = useState(false)
  const [isViolationReasonsExpanded, setIsViolationReasonsExpanded] = useState(false)
  const [isWholesalersExpanded, setIsWholesalersExpanded] = useState(false)
  
  // Region-level tolerance settings
  const [regionTolerances, setRegionTolerances] = useState<Record<string, number>>({
    'North America': 3,
    'Europe': 4,
    'Asia Pacific': 5,
    'Middle East': 3,
  })
  
  // Channel-level tolerance settings
  const [channelTolerances, setChannelTolerances] = useState<Record<string, number>>({
    'Booking.com': 3,
    'Expedia': 4,
    'Agoda': 3,
    'TripAdvisor': 5,
    'Hotels.com': 3,
    'Priceline': 4,
    'Trivago': 5,
    'Google Hotels': 3,
  })

  const [violationReasons, setViolationReasons] = useState([
    'Rate plan difference',
    'Room or board difference',
    'Promotion/discount difference',
    'Bait & switch',
    'Other'
  ])

  const [newReason, setNewReason] = useState('')
  
  // Test Booking Settings - Wholesalers
  const [wholesalers, setWholesalers] = useState([
    'Booking.com',
    'Expedia',
    'Agoda',
    'Hotels.com',
    'Priceline'
  ])
  const [newWholesaler, setNewWholesaler] = useState('')
  const [wholesalerSettings, setWholesalerSettings] = useState<Record<string, { properties: string; emails: string }>>({
    'Booking.com': { properties: 'Hotel Manhattan, Hotel Central Park', emails: 'ops@booking.com, rate@booking.com' },
    'Expedia': { properties: 'Hotel Beverly Hills, Hotel Hollywood', emails: 'support@expedia.com' },
    'Agoda': { properties: 'Hotel Times Square', emails: 'partner@agoda.com' },
    'Hotels.com': { properties: 'Hotel Toronto Downtown', emails: 'contracts@hotels.com' },
    'Priceline': { properties: 'Hotel Berlin Central', emails: 'poc@priceline.com' }
  })
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false)
  const [activeWholesalerForProperties, setActiveWholesalerForProperties] = useState<string | null>(null)
  
  // Test Booking Settings - Wholesaler Reasons
  const [wholesalerReasons, setWholesalerReasons] = useState([
    'Rate not available',
    'Booking failed',
    'Payment issue',
    'Inventory mismatch',
    'Other'
  ])
  const [newWholesalerReason, setNewWholesalerReason] = useState('')
  const [isWholesalerReasonsExpanded, setIsWholesalerReasonsExpanded] = useState(false)
  
  // Test Booking Settings - Contracted Booking
  const [contractedBookingLevel, setContractedBookingLevel] = useState<'brand' | 'property'>('brand')
  const [isContractedBookingExpanded, setIsContractedBookingExpanded] = useState(false)
  const [brandYearlyBookings, setBrandYearlyBookings] = useState(1000)
  const [brandStartDate, setBrandStartDate] = useState('2024-01-01')
  const [propertyBookings, setPropertyBookings] = useState<Array<{ property: string; yearlyBookings: number; startDate: string }>>([
    { property: 'Hotel A', yearlyBookings: 200, startDate: '2024-01-01' },
    { property: 'Hotel B', yearlyBookings: 150, startDate: '2024-01-01' },
    { property: 'Hotel C', yearlyBookings: 300, startDate: '2024-01-01' },
    { property: 'Hotel D', yearlyBookings: 180, startDate: '2024-01-01' },
    { property: 'Hotel E', yearlyBookings: 250, startDate: '2024-01-01' },
    { property: 'Hotel F', yearlyBookings: 120, startDate: '2024-01-01' },
    { property: 'Hotel G', yearlyBookings: 220, startDate: '2024-01-01' },
    { property: 'Hotel H', yearlyBookings: 190, startDate: '2024-01-01' },
    { property: 'Hotel I', yearlyBookings: 280, startDate: '2024-01-01' },
    { property: 'Hotel J', yearlyBookings: 160, startDate: '2024-01-01' },
    { property: 'Hotel K', yearlyBookings: 210, startDate: '2024-01-01' },
    { property: 'Hotel L', yearlyBookings: 140, startDate: '2024-01-01' }
  ])

  const [emailTemplates, setEmailTemplates] = useState<Array<{ id: string; name: string; subject: string; cc: string; attachment: string; body: string }>>([
    {
      id: 'notify',
      name: 'Notify',
      subject: 'Test Booking Notification - {{bookingId}}',
      cc: 'ops@brand.com',
      attachment: 'test-booking-details.docx',
      body: 'Hi {{wholesaler}},\n\nWe detected a test booking for {{hotel}} ({{bookingId}}) with check-in {{checkIn}} and check-out {{checkOut}}.\n\nPlease review the booking details and share your confirmation.\n\nThanks,\nRateGain Team'
    },
    {
      id: 'warn',
      name: 'Warn',
      subject: 'Warning: Test Booking Follow-up - {{bookingId}}',
      cc: 'revenue@brand.com',
      attachment: 'test-booking-details.docx',
      body: 'Hi {{wholesaler}},\n\nThis is a follow-up regarding the test booking {{bookingId}} for {{hotel}} ({{checkIn}} to {{checkOut}}).\n\nWe have not received confirmation yet. Please respond within 24 hours to avoid escalation.\n\nThanks,\nRateGain Team'
    },
    {
      id: 'final',
      name: 'Final Notice',
      subject: 'Final Notice: Test Booking - {{bookingId}}',
      cc: 'ops@brand.com, revenue@brand.com',
      attachment: 'test-booking-details.docx',
      body: 'Hi {{wholesaler}},\n\nFinal notice for test booking {{bookingId}} at {{hotel}} ({{checkIn}} to {{checkOut}}).\n\nIf we do not receive confirmation within 12 hours, this will be escalated.\n\nThanks,\nRateGain Team'
    }
  ])
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null)

  const [parityScoreDisplay, setParityScoreDisplay] = useState({
    win: true,
    meet: true,
    loss: false
  })

  const [isChannelSettingsExpanded, setIsChannelSettingsExpanded] = useState(false)
  const [isSeveritySettingsExpanded, setIsSeveritySettingsExpanded] = useState(false)
  const [isMetaSubChannelExpanded, setIsMetaSubChannelExpanded] = useState(false)
  const [editingChannelId, setEditingChannelId] = useState<string | null>(null)
  const [editingField, setEditingField] = useState<'type' | 'contractStatus' | null>(null)
  const [isAutoBuzzExpanded, setIsAutoBuzzExpanded] = useState(false)
  const [autoBuzzRules, setAutoBuzzRules] = useState<Array<{
    id: string
    type: 'rate' | 'availability'
    channels: string[]
    properties: string[]
    variance: number
    severity: string
  }>>([
    {
      id: 'auto-buzz-rate',
      type: 'rate',
      channels: ['Booking.com', 'Expedia'],
      properties: ['Hotel Manhattan'],
      variance: 5,
      severity: 'Major'
    },
    {
      id: 'auto-buzz-availability',
      type: 'availability',
      channels: ['Agoda'],
      properties: ['Hotel Beverly Hills'],
      variance: 0,
      severity: 'Critical'
    }
  ])

  // Mock channel data - now mutable
  const [channels, setChannels] = useState([
    { id: '1', name: 'Booking.com', type: 'OTA', contractStatus: 'Contracted' },
    { id: '2', name: 'Expedia', type: 'OTA', contractStatus: 'Contracted' },
    { id: '3', name: 'Agoda', type: 'OTA', contractStatus: 'Contracted' },
    { id: '4', name: 'TripAdvisor', type: 'OTA', contractStatus: 'Non-Contracted' },
    { id: '5', name: 'Hotels.com', type: 'OTA', contractStatus: 'Contracted' },
    { id: '6', name: 'Priceline', type: 'OTA', contractStatus: 'Non-Contracted' },
    { id: '7', name: 'Trivago', type: 'Meta', contractStatus: 'Contracted' },
    { id: '8', name: 'Google Hotels', type: 'Meta', contractStatus: 'Contracted' },
    { id: '9', name: 'Kayak', type: 'Meta', contractStatus: 'Non-Contracted' },
    { id: '10', name: 'MakeMyTrip', type: 'OTA', contractStatus: 'Contracted' },
    { id: '11', name: 'Goibibo', type: 'OTA', contractStatus: 'Contracted' },
    { id: '12', name: 'Yatra', type: 'OTA', contractStatus: 'Non-Contracted' },
  ])

  const [metaSubChannelExclusions, setMetaSubChannelExclusions] = useState<Record<string, string[]>>({
    'Trivago': ['Expedia'],
    'Google Hotels': ['Booking.com'],
    'Kayak': []
  })
  const [newMetaSubChannel, setNewMetaSubChannel] = useState<Record<string, string>>({})

  const handleChannelUpdate = (channelId: string, field: 'type' | 'contractStatus', value: string) => {
    setChannels(channels.map(channel => 
      channel.id === channelId ? { ...channel, [field]: value } : channel
    ))
    setEditingChannelId(null)
    setEditingField(null)
  }

  const [editingMemberId, setEditingMemberId] = useState<string | null>(null)
  const [editingAccess, setEditingAccess] = useState<{
    level: 'full-brand' | 'sub-brand' | 'region' | 'country' | 'city' | 'property'
    selectedItems: string[]
  } | null>(null)

  // Mock member data with access information
  const allMembers = [
    { id: '1', name: 'John Smith', email: 'john.smith@company.com', status: 'Active', accessLevel: 'full-brand', accessDetails: 'All Properties', propertyCount: 150 },
    { id: '2', name: 'Sarah Johnson', email: 'sarah.johnson@company.com', status: 'Active', accessLevel: 'sub-brand', accessDetails: 'Luxury Collection, Premium Hotels', propertyCount: 45 },
    { id: '3', name: 'Michael Chen', email: 'michael.chen@company.com', status: 'Active', accessLevel: 'region', accessDetails: 'North America, Europe', propertyCount: 78 },
    { id: '4', name: 'Emily Davis', email: 'emily.davis@company.com', status: 'Inactive', accessLevel: 'country', accessDetails: 'United States, Canada', propertyCount: 32 },
    { id: '5', name: 'David Wilson', email: 'david.wilson@company.com', status: 'Active', accessLevel: 'city', accessDetails: 'New York, Los Angeles', propertyCount: 12 },
    { id: '6', name: 'Lisa Anderson', email: 'lisa.anderson@company.com', status: 'Active', accessLevel: 'property', accessDetails: 'Grand Hotel NYC, Plaza Hotel LA', propertyCount: 2 },
    { id: '7', name: 'Robert Taylor', email: 'robert.taylor@company.com', status: 'Active', accessLevel: 'sub-brand', accessDetails: 'Budget Inn Chain', propertyCount: 28 },
    { id: '8', name: 'Jennifer Brown', email: 'jennifer.brown@company.com', status: 'Active', accessLevel: 'property', accessDetails: 'Downtown Hotel', propertyCount: 1 },
    { id: '9', name: 'William Martinez', email: 'william.martinez@company.com', status: 'Active', accessLevel: 'full-brand', accessDetails: 'All Properties', propertyCount: 150 },
    { id: '10', name: 'Patricia Lee', email: 'patricia.lee@company.com', status: 'Active', accessLevel: 'region', accessDetails: 'Asia Pacific', propertyCount: 65 },
  ]

  // Categorize members into segments
  const corporateMembers = allMembers.filter(m => m.accessLevel === 'full-brand' || m.propertyCount >= 150)
  const intermediateMembers = allMembers.filter(m => m.propertyCount > 1 && m.propertyCount < 150)
  const singlePropertyMembers = allMembers.filter(m => m.propertyCount === 1)

  const [activeSegment, setActiveSegment] = useState<'corporate' | 'intermediate' | 'single-property'>('corporate')

  const getCurrentMembers = () => {
    switch (activeSegment) {
      case 'corporate':
        return corporateMembers
      case 'intermediate':
        return intermediateMembers
      case 'single-property':
        return singlePropertyMembers
      default:
        return []
    }
  }

  // Helper function to calculate property count based on access level and selected items
  const calculatePropertyCount = (level: string, selectedItems: string[]): number => {
    // This would normally query the hierarchy, but for now we'll use mock counts
    const mockCounts: Record<string, number> = {
      'full-brand': 150,
      'sub-brand': selectedItems.length * 15, // Average 15 properties per sub-brand
      'region': selectedItems.length * 25, // Average 25 properties per region
      'country': selectedItems.length * 16, // Average 16 properties per country
      'city': selectedItems.length * 6, // Average 6 properties per city
      'property': selectedItems.length, // 1 property per selection
    }
    return mockCounts[level] || 0
  }

  const handleEditAccess = (memberId: string) => {
    const member = allMembers.find(m => m.id === memberId)
    if (member) {
      setEditingMemberId(memberId)
      setEditingAccess({
        level: member.accessLevel as any,
        selectedItems: member.accessDetails.split(', ').map(s => s.trim())
      })
    }
  }

  const handleSaveAccess = () => {
    if (editingMemberId && editingAccess) {
      // In a real app, this would save to backend
      // For now, we'll just close the editor
      setEditingMemberId(null)
      setEditingAccess(null)
    }
  }

  const handleCancelEdit = () => {
    setEditingMemberId(null)
    setEditingAccess(null)
  }

  const getAccessLevelLabel = (level: string) => {
    const labels: Record<string, string> = {
      'full-brand': 'Full Brand (All Properties)',
      'sub-brand': 'Sub Brand',
      'region': 'Region',
      'country': 'Country',
      'city': 'City',
      'property': 'Property'
    }
    return labels[level] || level
  }

  // Extract options from hierarchy based on access level
  const getOptionsForLevel = (level: string): string[] => {
    const options: string[] = []
    
    if (level === 'sub-brand') {
      mockHierarchy.forEach(brand => {
        brand.children?.forEach(subBrand => {
          if (!options.includes(subBrand.name)) {
            options.push(subBrand.name)
          }
        })
      })
    } else if (level === 'region') {
      mockHierarchy.forEach(brand => {
        brand.children?.forEach(subBrand => {
          subBrand.children?.forEach(region => {
            if (!options.includes(region.name)) {
              options.push(region.name)
            }
          })
        })
      })
    } else if (level === 'country') {
      mockHierarchy.forEach(brand => {
        brand.children?.forEach(subBrand => {
          subBrand.children?.forEach(region => {
            region.children?.forEach(country => {
              if (!options.includes(country.name)) {
                options.push(country.name)
              }
            })
          })
        })
      })
    } else if (level === 'city') {
      mockHierarchy.forEach(brand => {
        brand.children?.forEach(subBrand => {
          subBrand.children?.forEach(region => {
            region.children?.forEach(country => {
              country.children?.forEach(city => {
                if (!options.includes(city.name)) {
                  options.push(city.name)
                }
              })
            })
          })
        })
      })
    } else if (level === 'property') {
      mockHierarchy.forEach(brand => {
        brand.children?.forEach(subBrand => {
          subBrand.children?.forEach(region => {
            region.children?.forEach(country => {
              country.children?.forEach(city => {
                city.children?.forEach(property => {
                  if (!options.includes(property.name)) {
                    options.push(property.name)
                  }
                })
              })
            })
          })
        })
      })
    }
    
    return options.sort()
  }

  const availableOptions = useMemo(() => {
    if (!editingAccess) return []
    return getOptionsForLevel(editingAccess.level)
  }, [editingAccess?.level])

  const propertyOptions = useMemo(() => {
    const options: string[] = []
    const walk = (nodes: typeof mockHierarchy) => {
      nodes.forEach(node => {
        if (node.children && node.children.length > 0) {
          walk(node.children)
        } else {
          options.push(node.name)
        }
      })
    }
    walk(mockHierarchy)
    return options.sort()
  }, [])

  const updateAutoBuzzRule = (
    ruleId: string,
    updates: Partial<{ channels: string[]; properties: string[]; variance: number; severity: string; type: 'rate' | 'availability' }>
  ) => {
    setAutoBuzzRules(prev =>
      prev.map(rule => (rule.id === ruleId ? { ...rule, ...updates } : rule))
    )
  }

  const metaChannels = useMemo(() => channels.filter(c => c.type === 'Meta').map(c => c.name), [channels])

  const addExcludedSubChannel = (metaChannel: string) => {
    const value = (newMetaSubChannel[metaChannel] || '').trim()
    if (!value) return
    setMetaSubChannelExclusions(prev => {
      const existing = prev[metaChannel] || []
      if (existing.includes(value)) return prev
      return { ...prev, [metaChannel]: [...existing, value] }
    })
    setNewMetaSubChannel(prev => ({ ...prev, [metaChannel]: '' }))
  }

  const removeExcludedSubChannel = (metaChannel: string, subChannel: string) => {
    setMetaSubChannelExclusions(prev => ({
      ...prev,
      [metaChannel]: (prev[metaChannel] || []).filter(item => item !== subChannel)
    }))
  }

  const addAutoBuzzRule = () => {
    setAutoBuzzRules(prev => [
      ...prev,
      {
        id: `auto-buzz-${Date.now()}`,
        type: 'rate',
        channels: [],
        properties: [],
        variance: 5,
        severity: 'Major'
      }
    ])
  }

  const removeAutoBuzzRule = (ruleId: string) => {
    setAutoBuzzRules(prev => prev.filter(rule => rule.id !== ruleId))
  }

  const getSelectedProperties = (wholesaler: string) => {
    const raw = wholesalerSettings[wholesaler]?.properties || ''
    return raw
      .split(',')
      .map(item => item.trim())
      .filter(Boolean)
  }

  const togglePropertySelection = (wholesaler: string, property: string) => {
    const current = new Set(getSelectedProperties(wholesaler))
    if (current.has(property)) {
      current.delete(property)
    } else {
      current.add(property)
    }
    setWholesalerSettings(prev => ({
      ...prev,
      [wholesaler]: {
        ...prev[wholesaler],
        properties: Array.from(current).join(', ')
      }
    }))
  }

  const openPropertyModal = (wholesaler: string) => {
    setActiveWholesalerForProperties(wholesaler)
    setIsPropertyModalOpen(true)
  }

  const closePropertyModal = () => {
    setIsPropertyModalOpen(false)
    setActiveWholesalerForProperties(null)
  }

  const addReason = () => {
    if (newReason.trim() && !violationReasons.includes(newReason.trim())) {
      setViolationReasons([...violationReasons, newReason.trim()])
      setNewReason('')
    }
  }

  const removeReason = (reason: string) => {
    setViolationReasons(violationReasons.filter(r => r !== reason))
  }

  const addWholesaler = () => {
    if (newWholesaler.trim() && !wholesalers.includes(newWholesaler.trim())) {
      const wholesalerName = newWholesaler.trim()
      setWholesalers([...wholesalers, wholesalerName])
      setWholesalerSettings(prev => ({
        ...prev,
        [wholesalerName]: { properties: '', emails: '' }
      }))
      setNewWholesaler('')
    }
  }

  const removeWholesaler = (wholesaler: string) => {
    setWholesalers(wholesalers.filter(w => w !== wholesaler))
    setWholesalerSettings(prev => {
      const next = { ...prev }
      delete next[wholesaler]
      return next
    })
  }

  const addWholesalerReason = () => {
    if (newWholesalerReason.trim() && !wholesalerReasons.includes(newWholesalerReason.trim())) {
      setWholesalerReasons([...wholesalerReasons, newWholesalerReason.trim()])
      setNewWholesalerReason('')
    }
  }

  const removeWholesalerReason = (reason: string) => {
    setWholesalerReasons(wholesalerReasons.filter(r => r !== reason))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2">
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('user')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'user'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>User Settings</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('configurations')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'configurations'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <SettingsIcon className="w-4 h-4" />
              <span>Configurations</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('test-booking')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'test-booking'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <ShoppingCart className="w-4 h-4" />
              <span>Test Booking Settings</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('auto-fix')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'auto-fix'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4" />
              <span>Auto-fix Settings</span>
            </div>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {/* User Settings Tab */}
        {activeTab === 'user' && (
          <div className="space-y-6">
      <div className="card">
        <div className="flex items-center space-x-2 mb-6">
                <Users className="w-5 h-5 text-primary-600" />
                <h2 className="text-lg font-semibold text-gray-900">User Access Management</h2>
        </div>
        <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> User access management allows you to configure property access levels for each member.
                    Access can be set at Full Brand, Sub Brand, Region, Country, City, or Property level.
                  </p>
                </div>

                {/* Segment Tabs */}
                <div className="border-b border-gray-200">
                  <nav className="flex space-x-8" aria-label="Segments">
                    <button
                      onClick={() => setActiveSegment('corporate')}
                      className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeSegment === 'corporate'
                          ? 'border-primary-600 text-primary-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Corporate ({corporateMembers.length})
                    </button>
                    <button
                      onClick={() => setActiveSegment('intermediate')}
                      className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeSegment === 'intermediate'
                          ? 'border-primary-600 text-primary-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Intermediate ({intermediateMembers.length})
                    </button>
                    <button
                      onClick={() => setActiveSegment('single-property')}
                      className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeSegment === 'single-property'
                          ? 'border-primary-600 text-primary-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Single Property ({singlePropertyMembers.length})
                    </button>
                  </nav>
                </div>
                
                {/* Members Table */}
                <div className="overflow-x-auto mt-4">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Member</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Access Level</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Access Details</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Property Count</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {getCurrentMembers().length > 0 ? (
                        getCurrentMembers().map((member) => (
                          <tr key={member.id} className="hover:bg-gray-50">
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                                  <User className="w-5 h-5 text-primary-600" />
                                </div>
          <div>
                                  <p className="text-sm font-medium text-gray-900">{member.name}</p>
                                  <p className="text-xs text-gray-500">{member.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <span className="text-sm text-gray-900">{getAccessLevelLabel(member.accessLevel)}</span>
                            </td>
                            <td className="px-4 py-4">
                              <span className="text-sm text-gray-700">{member.accessDetails}</span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <span className="text-sm font-medium text-gray-900">{member.propertyCount}</span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs font-medium rounded ${
                                member.status === 'Active'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                {member.status}
                              </span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <button
                                onClick={() => handleEditAccess(member.id)}
                                className="text-primary-600 hover:text-primary-800 transition-colors"
                                title="Edit Access"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                            No members found in this segment
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Edit Access Modal */}
                {editingMemberId && editingAccess && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-6">
                          <div>
                            <h2 className="text-xl font-semibold text-gray-900">Edit Access Level</h2>
                            <p className="text-sm text-gray-600 mt-1">
                              {allMembers.find(m => m.id === editingMemberId)?.name}
                            </p>
                          </div>
                          <button
                            onClick={handleCancelEdit}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>

                        {/* Access Level Selector */}
                        <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Access Level
            </label>
                          <div className="grid grid-cols-3 gap-2">
                            {(['full-brand', 'sub-brand', 'region', 'country', 'city', 'property'] as const).map((level) => (
                              <button
                                key={level}
                                onClick={() => setEditingAccess({ ...editingAccess, level, selectedItems: [] })}
                                className={`p-2 border-2 rounded-lg text-left transition-colors ${
                                  editingAccess.level === level
                                    ? 'border-primary-600 bg-primary-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                              >
                                <p className="text-xs font-medium text-gray-900">{getAccessLevelLabel(level)}</p>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Multi-Select Dropdown */}
                        {editingAccess.level !== 'full-brand' && (
                          <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Select {editingAccess.level === 'sub-brand' ? 'Sub Brands' : 
                                      editingAccess.level === 'region' ? 'Regions' :
                                      editingAccess.level === 'country' ? 'Countries' :
                                      editingAccess.level === 'city' ? 'Cities' : 'Properties'}
                            </label>
                            <div className="relative">
                              <div className="border border-gray-300 rounded-lg bg-white max-h-[300px] overflow-y-auto">
                                <div className="p-2 space-y-1">
                                  {/* Select All Option */}
                                  <label className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
            <input
                                      type="checkbox"
                                      checked={editingAccess.selectedItems.length === availableOptions.length && availableOptions.length > 0}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setEditingAccess({ ...editingAccess, selectedItems: availableOptions })
                                        } else {
                                          setEditingAccess({ ...editingAccess, selectedItems: [] })
                                        }
                                      }}
                                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                    />
                                    <span className="text-sm font-medium text-gray-900">Select All</span>
                                  </label>
                                  <div className="border-t border-gray-200 my-1"></div>
                                  {/* Individual Options */}
                                  {availableOptions.map((option) => (
                                    <label
                                      key={option}
                                      className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                                    >
                                      <input
                                        type="checkbox"
                                        checked={editingAccess.selectedItems.includes(option)}
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            setEditingAccess({
                                              ...editingAccess,
                                              selectedItems: [...editingAccess.selectedItems, option]
                                            })
                                          } else {
                                            setEditingAccess({
                                              ...editingAccess,
                                              selectedItems: editingAccess.selectedItems.filter(item => item !== option)
                                            })
                                          }
                                        }}
                                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                      />
                                      <span className="text-sm text-gray-700">{option}</span>
                                    </label>
                                  ))}
            </div>
          </div>
                              <p className="text-xs text-gray-500 mt-2">
                                {editingAccess.selectedItems.length} of {availableOptions.length} selected
                              </p>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                              Estimated Property Count: {calculatePropertyCount(editingAccess.level, editingAccess.selectedItems)}
                            </p>
                          </div>
                        )}

                        {editingAccess.level === 'full-brand' && (
                          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm text-blue-800">
                              Full Brand access provides access to all properties under the brand.
                              Estimated Property Count: {calculatePropertyCount('full-brand', [])}
                            </p>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                          <button
                            onClick={handleCancelEdit}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleSaveAccess}
                            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
                          >
                            <Check className="w-4 h-4" />
                            <span>Save Changes</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Security Settings */}
            <div className="card">
              <div className="flex items-center space-x-2 mb-6">
                <Shield className="w-5 h-5 text-primary-600" />
                <h2 className="text-lg font-semibold text-gray-900">Security & Preferences</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
          <div>
                    <p className="font-medium text-gray-900">Email Notifications</p>
                    <p className="text-xs text-gray-500">Receive alerts for critical violations</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Auto-refresh Dashboard</p>
                    <p className="text-xs text-gray-500">Automatically refresh data every 15 minutes</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Configurations Tab */}
        {activeTab === 'configurations' && (
          <div className="space-y-6">
            {/* Parity Score Display Settings */}
            <div className="card">
              <div className="flex items-center space-x-2 mb-4">
                <BarChart3 className="w-4 h-4 text-primary-600" />
                <h2 className="text-base font-semibold text-gray-900">Parity Score Display</h2>
              </div>
              <div className="space-y-3">
                <p className="text-xs text-gray-600">
                  Select which categories you want to display for Parity Score:
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <label className="flex items-center space-x-2 p-2.5 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors border border-gray-200">
            <input
                      type="checkbox"
                      checked={parityScoreDisplay.win}
                      onChange={(e) => setParityScoreDisplay({ ...parityScoreDisplay, win: e.target.checked })}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <div className="flex-1 flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">Win</span>
                      <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded">Win</span>
          </div>
            </label>
                  <label className="flex items-center space-x-2 p-2.5 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors border border-gray-200">
            <input
                      type="checkbox"
                      checked={parityScoreDisplay.meet}
                      onChange={(e) => setParityScoreDisplay({ ...parityScoreDisplay, meet: e.target.checked })}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <div className="flex-1 flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">Meet</span>
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded">Meet</span>
          </div>
            </label>
                  <label className="flex items-center space-x-2 p-2.5 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors border border-gray-200">
            <input
                      type="checkbox"
                      checked={parityScoreDisplay.loss}
                      onChange={(e) => setParityScoreDisplay({ ...parityScoreDisplay, loss: e.target.checked })}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <div className="flex-1 flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">Loss</span>
                      <span className="px-2 py-0.5 bg-red-100 text-red-800 text-xs font-medium rounded">Loss</span>
          </div>
                  </label>
                </div>
                {!parityScoreDisplay.win && !parityScoreDisplay.meet && !parityScoreDisplay.loss && (
                  <div className="p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-xs text-yellow-800">
                      <strong>Warning:</strong> At least one category must be selected.
                    </p>
                  </div>
                )}
        </div>
      </div>

            {/* Channel Settings */}
      <div className="card">
              <button
                onClick={() => setIsChannelSettingsExpanded(!isChannelSettingsExpanded)}
                className="w-full flex items-center justify-between mb-4"
              >
                <div className="flex items-center space-x-2">
                  <Globe className="w-4 h-4 text-primary-600" />
                  <h2 className="text-base font-semibold text-gray-900">Channel Settings</h2>
        </div>
                {isChannelSettingsExpanded ? (
                  <ChevronUp className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                )}
              </button>
              
              {isChannelSettingsExpanded && (
                <div className="mt-4">
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="relative max-h-[300px] overflow-y-auto">
                      <table className="w-full border-collapse">
                        <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Channel Name</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">OTA/Meta</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Contracted/Non-Contracted</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {channels.map((channel) => (
                            <tr key={channel.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span className="text-sm font-medium text-gray-900">{channel.name}</span>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                {editingChannelId === channel.id && editingField === 'type' ? (
                                  <select
                                    value={channel.type}
                                    onChange={(e) => handleChannelUpdate(channel.id, 'type', e.target.value)}
                                    onBlur={() => {
                                      setEditingChannelId(null)
                                      setEditingField(null)
                                    }}
                                    autoFocus
                                    className="text-xs border-2 border-primary-500 rounded px-2 py-1 focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white shadow-sm"
                                  >
                                    <option value="OTA">OTA</option>
                                    <option value="Meta">Meta</option>
                                  </select>
                                ) : (
                                  <div
                                    onClick={() => {
                                      setEditingChannelId(channel.id)
                                      setEditingField('type')
                                    }}
                                    className={`group inline-flex items-center space-x-1.5 px-2 py-1.5 text-xs font-medium rounded cursor-pointer transition-all border border-transparent hover:border-gray-300 hover:shadow-sm ${
                                      channel.type === 'OTA'
                                        ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                                        : 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                                    }`}
                                    title="Click to edit"
                                  >
                                    <span>{channel.type}</span>
                                    <Pencil className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                {editingChannelId === channel.id && editingField === 'contractStatus' ? (
                                  <select
                                    value={channel.contractStatus}
                                    onChange={(e) => handleChannelUpdate(channel.id, 'contractStatus', e.target.value)}
                                    onBlur={() => {
                                      setEditingChannelId(null)
                                      setEditingField(null)
                                    }}
                                    autoFocus
                                    className="text-xs border-2 border-primary-500 rounded px-2 py-1 focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                                  >
                                    <option value="Contracted">Contracted</option>
                                    <option value="Non-Contracted">Non-Contracted</option>
                                  </select>
                                ) : (
                                  <div
                                    onClick={() => {
                                      setEditingChannelId(channel.id)
                                      setEditingField('contractStatus')
                                    }}
                                    className={`group inline-flex items-center space-x-1.5 px-2 py-1.5 text-xs font-medium rounded cursor-pointer transition-all border border-transparent hover:border-gray-300 hover:shadow-sm ${
                                      channel.contractStatus === 'Contracted'
                                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                    }`}
                                    title="Click to edit"
                                  >
                                    <span>{channel.contractStatus}</span>
                                    <Pencil className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Auto Buzz Settings */}
            <div className="card">
              <button
                onClick={() => setIsAutoBuzzExpanded(!isAutoBuzzExpanded)}
                className="w-full flex items-center justify-between mb-3"
              >
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-primary-600" />
                  <h2 className="text-base font-semibold text-gray-900">Auto Buzz Settings</h2>
                </div>
                {isAutoBuzzExpanded ? (
                  <ChevronUp className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                )}
              </button>

              {isAutoBuzzExpanded && (
                <div className="space-y-4">
                  <p className="text-xs text-gray-600">
                    Configure auto buzz rules for Rate and Availability violations by channel and property with variance and severity thresholds.
                  </p>
                  <div className="space-y-3">
                    {autoBuzzRules.map(rule => (
                      <div key={rule.id} className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium text-gray-900">
                            {rule.type === 'rate' ? 'Rate Violation Rule' : 'Availability Violation Rule'}
                          </span>
                          <button
                            onClick={() => removeAutoBuzzRule(rule.id)}
                            className="px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded"
                          >
                            Remove
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
                            <select
                              value={rule.type}
                              onChange={(e) => updateAutoBuzzRule(rule.id, { type: e.target.value as 'rate' | 'availability' })}
                              className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            >
                              <option value="rate">Rate Violation</option>
                              <option value="availability">Availability Violation</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Channels</label>
                            <select
                              multiple
                              value={rule.channels}
                              onChange={(e) =>
                                updateAutoBuzzRule(rule.id, {
                                  channels: Array.from(e.target.selectedOptions).map(opt => opt.value)
                                })
                              }
                              className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent h-24"
                            >
                              {channels.map(channel => (
                                <option key={channel.id} value={channel.name}>{channel.name}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Properties</label>
                            <select
                              multiple
                              value={rule.properties}
                              onChange={(e) =>
                                updateAutoBuzzRule(rule.id, {
                                  properties: Array.from(e.target.selectedOptions).map(opt => opt.value)
                                })
                              }
                              className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent h-24"
                            >
                              {propertyOptions.map(property => (
                                <option key={property} value={property}>{property}</option>
                              ))}
                            </select>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Variance %</label>
                              <input
                                type="number"
                                value={rule.variance}
                                onChange={(e) => updateAutoBuzzRule(rule.id, { variance: Number(e.target.value) })}
                                className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Severity</label>
                              <select
                                value={rule.severity}
                                onChange={(e) => updateAutoBuzzRule(rule.id, { severity: e.target.value })}
                                className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                              >
                                <option value="Critical">Critical</option>
                                <option value="Major">Major</option>
                                <option value="Minor">Minor</option>
                                <option value="Trivial">Trivial</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={addAutoBuzzRule}
                    className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Add Rule
                  </button>
                </div>
              )}
            </div>

            {/* Meta Sub Channel Exclusion */}
            <div className="card">
              <button
                onClick={() => setIsMetaSubChannelExpanded(!isMetaSubChannelExpanded)}
                className="w-full flex items-center justify-between mb-3"
              >
                <div className="flex items-center space-x-2">
                  <Globe className="w-4 h-4 text-primary-600" />
                  <h2 className="text-base font-semibold text-gray-900">Meta Sub Channel Exclusion</h2>
                </div>
                {isMetaSubChannelExpanded ? (
                  <ChevronUp className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                )}
              </button>

              {isMetaSubChannelExpanded && (
                <div className="space-y-4">
                  <p className="text-xs text-gray-600">
                    Exclude specific sub-channels from parity score calculations for each meta channel.
                  </p>
                  <div className="space-y-3">
                    {metaChannels.map(metaChannel => (
                      <div key={metaChannel} className="p-3 bg-gray-50 border border-gray-200 rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900">{metaChannel}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {(metaSubChannelExclusions[metaChannel] || []).length === 0 ? (
                            <span className="text-xs text-gray-500">No exclusions</span>
                          ) : (
                            (metaSubChannelExclusions[metaChannel] || []).map(subChannel => (
                              <span key={subChannel} className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-white border border-gray-200 rounded-full">
                                {subChannel}
                                <button
                                  onClick={() => removeExcludedSubChannel(metaChannel, subChannel)}
                                  className="text-gray-400 hover:text-gray-600"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            ))
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={newMetaSubChannel[metaChannel] || ''}
                            onChange={(e) => setNewMetaSubChannel(prev => ({ ...prev, [metaChannel]: e.target.value }))}
                            onKeyPress={(e) => e.key === 'Enter' && addExcludedSubChannel(metaChannel)}
                            placeholder="Add excluded sub-channel"
                            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          />
                          <button
                            onClick={() => addExcludedSubChannel(metaChannel)}
                            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Severity Settings */}
            <div className="card">
              <button
                onClick={() => setIsSeveritySettingsExpanded(!isSeveritySettingsExpanded)}
                className="w-full flex items-center justify-between mb-3"
              >
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-primary-600" />
                  <h2 className="text-base font-semibold text-gray-900">Severity Settings</h2>
                </div>
                {isSeveritySettingsExpanded ? (
                  <ChevronUp className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                )}
              </button>
              
              {isSeveritySettingsExpanded && (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full border-collapse">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Severity</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Min %</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Max %</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Range</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {/* Critical */}
                    <tr className="hover:bg-gray-50">
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium rounded bg-red-100 text-red-800">Critical</span>
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={severityThresholds.critical.min}
                          onChange={(e) => setSeverityThresholds({
                            ...severityThresholds,
                            critical: { ...severityThresholds.critical, min: Number(e.target.value) }
                          })}
                          className="w-16 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={severityThresholds.critical.max}
                          onChange={(e) => setSeverityThresholds({
                            ...severityThresholds,
                            critical: { ...severityThresholds.critical, max: Number(e.target.value) }
                          })}
                          className="w-16 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <span className="text-xs text-gray-600">
                          {severityThresholds.critical.min}% - {severityThresholds.critical.max}%
                        </span>
                      </td>
                    </tr>
                    {/* Major */}
                    <tr className="hover:bg-gray-50">
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium rounded bg-orange-100 text-orange-800">Major</span>
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={severityThresholds.major.min}
                          onChange={(e) => setSeverityThresholds({
                            ...severityThresholds,
                            major: { ...severityThresholds.major, min: Number(e.target.value) }
                          })}
                          className="w-16 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={severityThresholds.major.max}
                          onChange={(e) => setSeverityThresholds({
                            ...severityThresholds,
                            major: { ...severityThresholds.major, max: Number(e.target.value) }
                          })}
                          className="w-16 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <span className="text-xs text-gray-600">
                          {severityThresholds.major.min}% - {severityThresholds.major.max}%
                        </span>
                      </td>
                    </tr>
                    {/* Minor */}
                    <tr className="hover:bg-gray-50">
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium rounded bg-yellow-100 text-yellow-800">Minor</span>
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={severityThresholds.minor.min}
                          onChange={(e) => setSeverityThresholds({
                            ...severityThresholds,
                            minor: { ...severityThresholds.minor, min: Number(e.target.value) }
                          })}
                          className="w-16 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={severityThresholds.minor.max}
                          onChange={(e) => setSeverityThresholds({
                            ...severityThresholds,
                            minor: { ...severityThresholds.minor, max: Number(e.target.value) }
                          })}
                          className="w-16 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <span className="text-xs text-gray-600">
                          {severityThresholds.minor.min}% - {severityThresholds.minor.max}%
                        </span>
                      </td>
                    </tr>
                    {/* Trivial */}
                    <tr className="hover:bg-gray-50">
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-800">Trivial</span>
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={severityThresholds.trivial.min}
                          onChange={(e) => setSeverityThresholds({
                            ...severityThresholds,
                            trivial: { ...severityThresholds.trivial, min: Number(e.target.value) }
                          })}
                          className="w-16 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={severityThresholds.trivial.max}
                          onChange={(e) => setSeverityThresholds({
                            ...severityThresholds,
                            trivial: { ...severityThresholds.trivial, max: Number(e.target.value) }
                          })}
                          className="w-16 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <span className="text-xs text-gray-600">
                          {severityThresholds.trivial.min}% - {severityThresholds.trivial.max}%
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
                </div>
              )}
            </div>

            {/* Tolerance Settings */}
            <div className="card">
              <button
                onClick={() => setIsToleranceSettingsExpanded(!isToleranceSettingsExpanded)}
                className="w-full flex items-center justify-between mb-3"
              >
                <div className="flex items-center space-x-2">
                  <Sliders className="w-4 h-4 text-primary-600" />
                  <h2 className="text-base font-semibold text-gray-900">Tolerance Settings</h2>
                </div>
                {isToleranceSettingsExpanded ? (
                  <ChevronUp className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                )}
              </button>
              
              {isToleranceSettingsExpanded && (
                <div className="space-y-4">
                  {/* Tolerance Level Selection */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      Tolerance Level
          </label>
                    <div className="flex items-center space-x-2">
                      <label className={`flex items-center space-x-1.5 cursor-pointer px-3 py-2 rounded-md border-2 transition-all relative ${
                        toleranceLevel === 'overall'
                          ? 'bg-primary-100 border-primary-600 shadow-md'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}>
          <input
                          type="radio"
                          name="toleranceLevel"
                          value="overall"
                          checked={toleranceLevel === 'overall'}
                          onChange={(e) => setToleranceLevel(e.target.value as 'overall' | 'region' | 'channel')}
                          className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                        />
                        <span className={`text-xs font-semibold ${
                          toleranceLevel === 'overall'
                            ? 'text-primary-900'
                            : 'text-gray-700'
                        }`}>Overall</span>
                        {toleranceLevel === 'overall' && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary-600 rounded-full border-2 border-white"></div>
                        )}
                      </label>
                      <label className={`flex items-center space-x-1.5 cursor-pointer px-3 py-2 rounded-md border-2 transition-all relative ${
                        toleranceLevel === 'region'
                          ? 'bg-primary-100 border-primary-600 shadow-md'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}>
                        <input
                          type="radio"
                          name="toleranceLevel"
                          value="region"
                          checked={toleranceLevel === 'region'}
                          onChange={(e) => setToleranceLevel(e.target.value as 'overall' | 'region' | 'channel')}
                          className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                        />
                        <span className={`text-xs font-semibold ${
                          toleranceLevel === 'region'
                            ? 'text-primary-900'
                            : 'text-gray-700'
                        }`}>Region</span>
                        {toleranceLevel === 'region' && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary-600 rounded-full border-2 border-white"></div>
                        )}
                      </label>
                      <label className={`flex items-center space-x-1.5 cursor-pointer px-3 py-2 rounded-md border-2 transition-all relative ${
                        toleranceLevel === 'channel'
                          ? 'bg-primary-100 border-primary-600 shadow-md'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}>
                        <input
                          type="radio"
                          name="toleranceLevel"
                          value="channel"
                          checked={toleranceLevel === 'channel'}
                          onChange={(e) => setToleranceLevel(e.target.value as 'overall' | 'region' | 'channel')}
                          className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                        />
                        <span className={`text-xs font-semibold ${
                          toleranceLevel === 'channel'
                            ? 'text-primary-900'
                            : 'text-gray-700'
                        }`}>Channel</span>
                        {toleranceLevel === 'channel' && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary-600 rounded-full border-2 border-white"></div>
                        )}
                      </label>
                    </div>
                  </div>

                  {/* Overall Tolerance */}
                  {toleranceLevel === 'overall' && (
                    <div className="flex items-center space-x-3 pt-1">
                      <label className="text-xs font-medium text-gray-700 whitespace-nowrap">
                        Tolerance: {tolerancePercent}%
                      </label>
                      <input
                        type="number"
            min="0"
            max="20"
            value={tolerancePercent}
            onChange={(e) => setTolerancePercent(Number(e.target.value))}
                        className="w-20 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
                  )}

                  {/* Region-level Tolerance */}
                  {toleranceLevel === 'region' && (
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="max-h-[250px] overflow-y-auto">
                        <table className="w-full border-collapse">
                          <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                            <tr>
                              <th className="px-2 py-1.5 text-left text-[10px] font-semibold text-gray-700 uppercase tracking-wider">Region</th>
                              <th className="px-2 py-1.5 text-left text-[10px] font-semibold text-gray-700 uppercase tracking-wider">Tolerance %</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {Object.entries(regionTolerances).map(([region, tolerance]) => (
                              <tr key={region} className="hover:bg-gray-50">
                                <td className="px-2 py-1.5 whitespace-nowrap">
                                  <span className="text-xs font-medium text-gray-900">{region}</span>
                                </td>
                                <td className="px-2 py-1.5 whitespace-nowrap">
                                  <input
                                    type="number"
                                    min="0"
                                    max="20"
                                    value={tolerance}
                                    onChange={(e) => setRegionTolerances({
                                      ...regionTolerances,
                                      [region]: Number(e.target.value)
                                    })}
                                    className="w-16 px-1.5 py-0.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-transparent"
                                  />
                                  <span className="text-[10px] text-gray-600 ml-1">%</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Channel-level Tolerance */}
                  {toleranceLevel === 'channel' && (
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="max-h-[250px] overflow-y-auto">
                        <table className="w-full border-collapse">
                          <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                            <tr>
                              <th className="px-2 py-1.5 text-left text-[10px] font-semibold text-gray-700 uppercase tracking-wider">Channel</th>
                              <th className="px-2 py-1.5 text-left text-[10px] font-semibold text-gray-700 uppercase tracking-wider">Tolerance %</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {Object.entries(channelTolerances).map(([channel, tolerance]) => (
                              <tr key={channel} className="hover:bg-gray-50">
                                <td className="px-2 py-1.5 whitespace-nowrap">
                                  <span className="text-xs font-medium text-gray-900">{channel}</span>
                                </td>
                                <td className="px-2 py-1.5 whitespace-nowrap">
                                  <input
                                    type="number"
                                    min="0"
                                    max="20"
                                    value={tolerance}
                                    onChange={(e) => setChannelTolerances({
                                      ...channelTolerances,
                                      [channel]: Number(e.target.value)
                                    })}
                                    className="w-16 px-1.5 py-0.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-transparent"
                                  />
                                  <span className="text-[10px] text-gray-600 ml-1">%</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
      </div>

      {/* Violation Reasons */}
      <div className="card">
              <button
                onClick={() => setIsViolationReasonsExpanded(!isViolationReasonsExpanded)}
                className="w-full flex items-center justify-between mb-3"
              >
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-primary-600" />
                  <h2 className="text-base font-semibold text-gray-900">Violation Reasons</h2>
        </div>
                {isViolationReasonsExpanded ? (
                  <ChevronUp className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                )}
              </button>
              
              {isViolationReasonsExpanded && (
                <div className="space-y-2">
          {violationReasons.map((reason) => (
                    <div key={reason} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <span className="text-xs text-gray-900">{reason}</span>
              {reason !== 'Other' && (
                <button
                  onClick={() => removeReason(reason)}
                          className="px-2 py-0.5 text-xs text-red-600 hover:bg-red-50 rounded transition-colors"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
                  <div className="flex items-center space-x-2 pt-1">
            <input
              type="text"
              value={newReason}
              onChange={(e) => setNewReason(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addReason()}
              placeholder="Add new violation reason"
                      className="flex-1 px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <button
              onClick={addReason}
                      className="px-3 py-1.5 text-xs bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Add
            </button>
          </div>
        </div>
              )}
      </div>
          </div>
        )}

        {/* Test Booking Settings Tab */}
        {activeTab === 'test-booking' && (
          <div className="space-y-6">
            {/* Wholesalers Card */}
      <div className="card">
              <button
                onClick={() => setIsWholesalersExpanded(!isWholesalersExpanded)}
                className="w-full flex items-center justify-between mb-3"
              >
                <div className="flex items-center space-x-2">
                  <Globe className="w-4 h-4 text-primary-600" />
                  <h3 className="text-base font-semibold text-gray-900">Wholesalers</h3>
        </div>
                {isWholesalersExpanded ? (
                  <ChevronUp className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                )}
              </button>
              
              {isWholesalersExpanded && (
        <div className="space-y-4">
                  {wholesalers.map((wholesaler) => (
                    <div key={wholesaler} className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">{wholesaler}</span>
                        <button
                          onClick={() => removeWholesaler(wholesaler)}
                          className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          Remove
                        </button>
          </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Property List</label>
                          <button
                            type="button"
                            onClick={() => openPropertyModal(wholesaler)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg text-left bg-white hover:bg-gray-50 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          >
                            {wholesalerSettings[wholesaler]?.properties
                              ? wholesalerSettings[wholesaler]?.properties
                              : 'Select properties'}
                          </button>
                          <p className="text-[11px] text-gray-500 mt-1">Choose properties from list</p>
              </div>
              <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Point of Contact Emails</label>
                          <input
                            type="email"
                            value={wholesalerSettings[wholesaler]?.emails || ''}
                            onChange={(e) =>
                              setWholesalerSettings(prev => ({
                                ...prev,
                                [wholesaler]: {
                                  ...prev[wholesaler],
                                  emails: e.target.value
                                }
                              }))
                            }
                            placeholder="ops@wholesaler.com, support@wholesaler.com"
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          />
                          <p className="text-[11px] text-gray-500 mt-1">Comma separated emails</p>
              </div>
            </div>
              </div>
                  ))}
                  <div className="flex items-center space-x-2 pt-1">
                    <input
                      type="text"
                      value={newWholesaler}
                      onChange={(e) => setNewWholesaler(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addWholesaler()}
                      placeholder="Add new wholesaler"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <button
                      onClick={addWholesaler}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      Add
                    </button>
            </div>
          </div>
              )}
            </div>

            {/* Wholesaler Reasons Card */}
            <div className="card">
              <button
                onClick={() => setIsWholesalerReasonsExpanded(!isWholesalerReasonsExpanded)}
                className="w-full flex items-center justify-between mb-3"
              >
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-primary-600" />
                  <h3 className="text-base font-semibold text-gray-900">Wholesaler Reasons</h3>
                </div>
                {isWholesalerReasonsExpanded ? (
                  <ChevronUp className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                )}
          </button>
              
              {isWholesalerReasonsExpanded && (
                <div className="space-y-2">
                  {wholesalerReasons.map((reason) => (
                    <div key={reason} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-900">{reason}</span>
                      {reason !== 'Other' && (
                        <button
                          onClick={() => removeWholesalerReason(reason)}
                          className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          Remove
                        </button>
                      )}
        </div>
                  ))}
                  <div className="flex items-center space-x-2 pt-2">
                    <input
                      type="text"
                      value={newWholesalerReason}
                      onChange={(e) => setNewWholesalerReason(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addWholesalerReason()}
                      placeholder="Add new wholesaler reason"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <button
                      onClick={addWholesalerReason}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}
      </div>

            {/* Contracted Booking Card */}
      <div className="card">
              <button
                onClick={() => setIsContractedBookingExpanded(!isContractedBookingExpanded)}
                className="w-full flex items-center justify-between mb-3"
              >
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4 text-primary-600" />
                  <h3 className="text-base font-semibold text-gray-900">Contracted Booking</h3>
        </div>
                {isContractedBookingExpanded ? (
                  <ChevronUp className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                )}
              </button>
              
              {isContractedBookingExpanded && (
        <div className="space-y-4">
                  {/* Booking Level Selection */}
            <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      Booking Level
                    </label>
                    <div className="flex items-center space-x-2">
                      <label className={`flex items-center space-x-1.5 cursor-pointer px-3 py-2 rounded-md border-2 transition-all relative ${
                        contractedBookingLevel === 'brand'
                          ? 'bg-primary-100 border-primary-600 shadow-md'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}>
                        <input
                          type="radio"
                          name="contractedBookingLevel"
                          value="brand"
                          checked={contractedBookingLevel === 'brand'}
                          onChange={(e) => setContractedBookingLevel(e.target.value as 'brand' | 'property')}
                          className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                        />
                        <span className={`text-xs font-semibold ${
                          contractedBookingLevel === 'brand'
                            ? 'text-primary-900'
                            : 'text-gray-700'
                        }`}>Brand Level</span>
                        {contractedBookingLevel === 'brand' && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary-600 rounded-full border-2 border-white"></div>
                        )}
                      </label>
                      <label className={`flex items-center space-x-1.5 cursor-pointer px-3 py-2 rounded-md border-2 transition-all relative ${
                        contractedBookingLevel === 'property'
                          ? 'bg-primary-100 border-primary-600 shadow-md'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}>
                        <input
                          type="radio"
                          name="contractedBookingLevel"
                          value="property"
                          checked={contractedBookingLevel === 'property'}
                          onChange={(e) => setContractedBookingLevel(e.target.value as 'brand' | 'property')}
                          className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                        />
                        <span className={`text-xs font-semibold ${
                          contractedBookingLevel === 'property'
                            ? 'text-primary-900'
                            : 'text-gray-700'
                        }`}>Property Wise</span>
                        {contractedBookingLevel === 'property' && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary-600 rounded-full border-2 border-white"></div>
                        )}
                      </label>
            </div>
                  </div>

                  {/* Brand Level Settings */}
                  {contractedBookingLevel === 'brand' && (
                    <div className="space-y-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">
                          Yearly Contracted Bookings
            </label>
                        <input
                          type="number"
                          min="0"
                          value={brandYearlyBookings}
                          onChange={(e) => setBrandYearlyBookings(Number(e.target.value))}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
          </div>
            <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">
                          Start Date
                        </label>
                        <input
                          type="date"
                          value={brandStartDate}
                          onChange={(e) => setBrandStartDate(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
            </div>
                    </div>
                  )}

                  {/* Property Wise Settings */}
                  {contractedBookingLevel === 'property' && (
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="max-h-[400px] overflow-y-auto">
                        <table className="w-full border-collapse">
                          <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Property</th>
                              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Yearly Bookings</th>
                              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Start Date</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {propertyBookings.map((item, index) => (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="px-3 py-2.5 whitespace-nowrap">
                                  <span className="text-sm font-medium text-gray-900">{item.property}</span>
                                </td>
                                <td className="px-3 py-2.5 whitespace-nowrap">
                                  <input
                                    type="number"
                                    min="0"
                                    value={item.yearlyBookings}
                                    onChange={(e) => {
                                      const updated = [...propertyBookings]
                                      updated[index].yearlyBookings = Number(e.target.value)
                                      setPropertyBookings(updated)
                                    }}
                                    className="w-24 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-transparent"
                                  />
                                </td>
                                <td className="px-3 py-2.5 whitespace-nowrap">
                                  <input
                                    type="date"
                                    value={item.startDate}
                                    onChange={(e) => {
                                      const updated = [...propertyBookings]
                                      updated[index].startDate = e.target.value
                                      setPropertyBookings(updated)
                                    }}
                                    className="w-32 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-transparent"
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Email Templates Card */}
            <div className="card">
              <div className="flex items-center space-x-2 mb-4">
                <Mail className="w-4 h-4 text-primary-600" />
                <h3 className="text-base font-semibold text-gray-900">Email Templates</h3>
              </div>
              <div className="space-y-4">
                {emailTemplates.map(template => (
                  <div key={template.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900">{template.name}</p>
                        <p className="text-xs text-gray-500 truncate">{template.subject}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setActiveTemplateId(template.id)}
                          className="px-3 py-1 text-xs font-medium text-primary-700 bg-primary-50 rounded-lg hover:bg-primary-100"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setEmailTemplates(prev => prev.filter(item => item.id !== template.id))}
                          className="px-3 py-1 text-xs font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Property Selection Modal */}
        {isPropertyModalOpen && activeWholesalerForProperties && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Select Properties</h2>
                  <p className="text-sm text-gray-500 mt-0.5">{activeWholesalerForProperties}</p>
                </div>
                <button
                  onClick={closePropertyModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto pr-1">
                  {propertyOptions.map(property => {
                    const selected = getSelectedProperties(activeWholesalerForProperties).includes(property)
                    return (
                      <label
                        key={property}
                        className={`flex items-center gap-2 p-2 rounded-lg border transition-colors cursor-pointer ${
                          selected ? 'border-primary-400 bg-primary-50' : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => togglePropertySelection(activeWholesalerForProperties, property)}
                          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700">{property}</span>
            </label>
                    )
                  })}
          </div>
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-200">
                  <button
                    onClick={closePropertyModal}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Close
                  </button>
                  <button
                    onClick={closePropertyModal}
                    className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700"
                  >
                    Done
                  </button>
        </div>
      </div>
    </div>
          </div>
        )}

        {/* Email Template Modal */}
        {activeTemplateId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Edit Email Template</h2>
                <button
                  onClick={() => setActiveTemplateId(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <div className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
                {emailTemplates.filter(t => t.id === activeTemplateId).map(template => (
                  <div key={template.id} className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Template Name</label>
                      <input
                        value={template.name}
                        onChange={(e) =>
                          setEmailTemplates(prev =>
                            prev.map(item =>
                              item.id === template.id ? { ...item, name: e.target.value } : item
                            )
                          )
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Subject</label>
                      <input
                        value={template.subject}
                        onChange={(e) =>
                          setEmailTemplates(prev =>
                            prev.map(item =>
                              item.id === template.id ? { ...item, subject: e.target.value } : item
                            )
                          )
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">CC</label>
                      <input
                        value={template.cc}
                        onChange={(e) =>
                          setEmailTemplates(prev =>
                            prev.map(item =>
                              item.id === template.id ? { ...item, cc: e.target.value } : item
                            )
                          )
                        }
                        placeholder="ops@brand.com, revenue@brand.com"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Attachment</label>
                      <input
                        value={template.attachment}
                        onChange={(e) =>
                          setEmailTemplates(prev =>
                            prev.map(item =>
                              item.id === template.id ? { ...item, attachment: e.target.value } : item
                            )
                          )
                        }
                        placeholder="test-booking-details.docx"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                      <p className="text-[11px] text-gray-500 mt-1">File name or URL</p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Body</label>
                      <textarea
                        value={template.body}
                        onChange={(e) =>
                          setEmailTemplates(prev =>
                            prev.map(item =>
                              item.id === template.id ? { ...item, body: e.target.value } : item
                            )
                          )
                        }
                        rows={8}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <p className="text-[11px] text-gray-500">
                      Available placeholders:{' '}
                      <span className="font-mono text-[11px] text-gray-600">{'{{bookingId}}'}</span>,{' '}
                      <span className="font-mono text-[11px] text-gray-600">{'{{hotel}}'}</span>,{' '}
                      <span className="font-mono text-[11px] text-gray-600">{'{{checkIn}}'}</span>,{' '}
                      <span className="font-mono text-[11px] text-gray-600">{'{{checkOut}}'}</span>,{' '}
                      <span className="font-mono text-[11px] text-gray-600">{'{{wholesaler}}'}</span>
                    </p>
                  </div>
                ))}
              </div>
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-2">
                <button
                  onClick={() => setActiveTemplateId(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Close
                </button>
                <button
                  onClick={() => setActiveTemplateId(null)}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Auto-fix Settings Tab */}
        {activeTab === 'auto-fix' && (
          <div className="space-y-6">
            <div className="card">
              <div className="flex items-center space-x-2 mb-6">
                <Zap className="w-5 h-5 text-primary-600" />
                <h2 className="text-lg font-semibold text-gray-900">Auto-fix Settings</h2>
              </div>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Configure automatic fixing of violations.
                </p>
                {/* Add auto-fix specific settings here */}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}



