import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart } from 'recharts'

interface OTAData {
  name: string
  parityScore: number
  win: number
  meet: number
  loss: number
  rateViolations: number
  availabilityViolations: number
  totalViolations: number
  geoViolations?: GeoViolationData[]
}

interface GeoViolationData {
  region: string
  rateViolations: number
  availabilityViolations: number
  totalViolations: number
}

interface ChannelGeoData {
  channel: string
  regions: {
    region: string
    rateViolations: number
    availabilityViolations: number
  }[]
}

interface MetaData {
  name: string
  parityScore: number
  totalViolations: number
  subChannels: {
    name: string
    violations: number
    parityScore: number
    rateViolations?: number
    availabilityViolations?: number
  }[]
}

interface MostViolatedCardProps {
  otas: OTAData[]
  metas: MetaData[]
}

export default function MostViolatedCard({ otas, metas }: MostViolatedCardProps) {
  const [expandedMetas, setExpandedMetas] = useState<Set<string>>(new Set())
  const [selectedMeta, setSelectedMeta] = useState<string>(metas.length > 0 ? metas[0].name : '')
  const [otaViewBy, setOtaViewBy] = useState<'violations' | 'geo'>('violations')
  const [severityFilter, setSeverityFilter] = useState<'All Cases' | 'Critical' | 'Major' | 'Minor' | 'Trivial'>('All Cases')

  const toggleMeta = (metaName: string) => {
    setExpandedMetas(prev => {
      const newSet = new Set(prev)
      if (newSet.has(metaName)) {
        newSet.delete(metaName)
      } else {
        newSet.add(metaName)
      }
      return newSet
    })
  }

  // Get the selected meta
  const currentMeta = metas.find(meta => meta.name === selectedMeta) || metas[0]

  const getParityColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 75) return 'text-yellow-600'
    return 'text-red-600'
  }

  // Get max violations for scaling
  const maxOTAViolations = Math.max(...otas.map(ota => ota.totalViolations), 1)
  const maxMetaViolations = Math.max(...metas.map(meta => meta.totalViolations), 1)

  const getSeverityMultiplier = (severity: 'All Cases' | 'Critical' | 'Major' | 'Minor' | 'Trivial') => {
    switch (severity) {
      case 'Critical':
        return 0.2
      case 'Major':
        return 0.35
      case 'Minor':
        return 0.55
      case 'Trivial':
        return 0.75
      default:
        return 1
    }
  }

  // Prepare chart data for OTAs - Violations view
  const otaViolationsData = otas.slice(0, 5).map(ota => {
    const multiplier = getSeverityMultiplier(severityFilter)
    return {
      name: ota.name,
      rateViolations: Math.floor(ota.rateViolations * multiplier),
      availabilityViolations: Math.floor(ota.availabilityViolations * multiplier),
      parityScore: ota.parityScore,
      win: ota.win,
      meet: ota.meet,
      loss: ota.loss
    }
  })

  const posLabels = ['US', 'UK', 'EU', 'IN', 'AU']
  const posViolationsData = otas.slice(0, 5).map((ota, index) => {
    const multiplier = getSeverityMultiplier(severityFilter)
    return {
      name: `${posLabels[index] || `POS ${index + 1}`} - ${ota.name}`,
      rateViolations: Math.floor(ota.rateViolations * multiplier),
      availabilityViolations: Math.floor(ota.availabilityViolations * multiplier),
      parityScore: ota.parityScore
    }
  })

  // Prepare chart data for selected Meta's sub-channels (top 5)
  const metaChartData = currentMeta ? currentMeta.subChannels
    .sort((a, b) => b.violations - a.violations) // Sort by violations descending
    .slice(0, 5) // Take top 5
    .map(subChannel => {
      // Calculate rate and availability violations if not provided
      const rateViolations = subChannel.rateViolations || Math.floor(subChannel.violations * 0.6)
      const availabilityViolations = subChannel.availabilityViolations || Math.floor(subChannel.violations * 0.4)
      
      // Remove meta name prefix from sub-channel name (e.g., "Google Hotels - Booking.com" -> "Booking.com")
      const displayName = subChannel.name.includes(' - ') 
        ? subChannel.name.split(' - ').slice(1).join(' - ')
        : subChannel.name
      
      return {
        name: displayName,
        totalViolations: subChannel.violations,
        rateViolations: rateViolations,
        availabilityViolations: availabilityViolations,
        parityScore: subChannel.parityScore
      }
    }) : []

  // Prepare geo violation data - group by channel with regions
  const geoViolationData = (() => {
    // Get top channels (OTAs) sorted by total violations
    const topChannels = [...otas]
      .sort((a, b) => b.totalViolations - a.totalViolations)
      .slice(0, 5)
    
    // Regions list
    const regions = ['North America', 'Europe', 'Asia Pacific', 'Middle East', 'Latin America', 'Africa']
    
    // Create data structure: channel -> regions with rate and availability violations
    return topChannels.map(ota => {
      // If OTA has geo violations, use them; otherwise generate mock data
      if (ota.geoViolations && ota.geoViolations.length > 0) {
        const regionMap = new Map<string, { rateViolations: number; availabilityViolations: number }>()
        
        ota.geoViolations.forEach(geo => {
          regionMap.set(geo.region, {
            rateViolations: geo.rateViolations,
            availabilityViolations: geo.availabilityViolations
          })
        })
        
        // Fill in missing regions with 0
        const regionsData = regions.map(region => ({
          region,
          rateViolations: regionMap.get(region)?.rateViolations || 0,
          availabilityViolations: regionMap.get(region)?.availabilityViolations || 0
        }))
        
        return {
          channel: ota.name,
          ...regionsData.reduce((acc, r) => {
            acc[`${r.region}_rate`] = r.rateViolations
            acc[`${r.region}_availability`] = r.availabilityViolations
            return acc
          }, {} as Record<string, number>)
        }
      } else {
        // Generate mock data distributed across regions
        const totalRate = ota.rateViolations
        const totalAvailability = ota.availabilityViolations
        
        // Distribute violations across regions with some variation
        const regionsData = regions.map((region, idx) => {
          // Create a distribution pattern
          const weights = [0.25, 0.22, 0.18, 0.15, 0.12, 0.08] // Decreasing weights
          const rateViolations = Math.floor(totalRate * weights[idx] * (0.8 + Math.random() * 0.4))
          const availabilityViolations = Math.floor(totalAvailability * weights[idx] * (0.8 + Math.random() * 0.4))
          
          return {
            region,
            rateViolations,
            availabilityViolations
          }
        })
        
        // Normalize to ensure totals match
        const actualRateTotal = regionsData.reduce((sum, r) => sum + r.rateViolations, 0)
        const actualAvailTotal = regionsData.reduce((sum, r) => sum + r.availabilityViolations, 0)
        
        if (actualRateTotal > 0) {
          regionsData.forEach(r => {
            r.rateViolations = Math.floor((r.rateViolations / actualRateTotal) * totalRate)
          })
        }
        if (actualAvailTotal > 0) {
          regionsData.forEach(r => {
            r.availabilityViolations = Math.floor((r.availabilityViolations / actualAvailTotal) * totalAvailability)
          })
        }
        
        // Convert to flat structure for chart
        const chartData: Record<string, string | number> = { channel: ota.name }
        regionsData.forEach(r => {
          chartData[`${r.region}_rate`] = r.rateViolations
          chartData[`${r.region}_availability`] = r.availabilityViolations
        })
        
        return chartData
      }
    })
  })()
  
  // Get unique regions for creating stacked bars
  const regions = ['North America', 'Europe', 'Asia Pacific', 'Middle East', 'Latin America', 'Africa']

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
      {/* Most Violated OTAs */}
      <div className="card">
        <div className="mb-3">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-gray-900">Most Violated OTAs</h2>
            {otaViewBy === 'violations' && (
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value as 'All Cases' | 'Critical' | 'Major' | 'Minor' | 'Trivial')}
                className="px-2 py-1 text-xs border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {['All Cases', 'Critical', 'Major', 'Minor', 'Trivial'].map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            )}
          </div>
          
          {/* Tabs */}
          <div className="border-b border-gray-200 mb-3">
            <nav className="flex space-x-4">
              <button
                onClick={() => setOtaViewBy('violations')}
                className={`py-2 px-1 border-b-2 font-medium text-xs transition-colors ${
                  otaViewBy === 'violations'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Rate & Availability
              </button>
              <button
                onClick={() => setOtaViewBy('geo')}
                className={`py-2 px-1 border-b-2 font-medium text-xs transition-colors ${
                  otaViewBy === 'geo'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Geo Violations
              </button>
            </nav>
          </div>

          {/* Severity dropdown moved to header */}
        </div>

        {otaViewBy === 'violations' && (
          <ResponsiveContainer width="100%" height={250}>
            <ComposedChart data={otaViolationsData} margin={{ top: 10, right: 20, left: 10, bottom: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
              <XAxis 
                dataKey="name" 
                angle={-20}
                textAnchor="end"
                height={40}
                tick={{ fill: '#6b7280', fontSize: 10 }}
                stroke="#9ca3af"
              />
              <YAxis 
                yAxisId="left"
                label={{ value: 'Rate & Availability Violations', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#6b7280', fontSize: 11 } }}
                tick={{ fill: '#6b7280', fontSize: 10 }}
                stroke="#9ca3af"
                width={50}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                domain={[0, 100]}
                label={{ value: 'Parity Score (%)', angle: 90, position: 'insideRight', style: { textAnchor: 'middle', fill: '#6b7280', fontSize: 11 } }}
                tick={{ fill: '#6b7280', fontSize: 10 }}
                stroke="#9ca3af"
                width={50}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  padding: '8px'
                }}
                labelStyle={{ color: '#374151', fontWeight: 600, marginBottom: '4px', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ paddingTop: '8px', fontSize: '11px' }} />
              {/* Rate and Availability bars per channel */}
              <Bar yAxisId="left" dataKey="rateViolations" stackId="violations" fill="#f59e0b" name="Rate Violations" radius={[0, 0, 0, 0]} />
              <Bar yAxisId="left" dataKey="availabilityViolations" stackId="violations" fill="#ec4899" name="Availability Violations" radius={[4, 4, 0, 0]} />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="parityScore" 
                stroke="#0ea5e9" 
                strokeWidth={2}
                dot={{ fill: '#0ea5e9', r: 4, strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                name="Parity Score (%)"
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}

        {otaViewBy === 'geo' && (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={geoViolationData} margin={{ top: 10, right: 20, left: 10, bottom: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
              <XAxis 
                dataKey="channel" 
                angle={-20}
                textAnchor="end"
                height={40}
                tick={{ fill: '#6b7280', fontSize: 10 }}
                stroke="#9ca3af"
              />
              <YAxis 
                label={{ value: 'Violations', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#6b7280', fontSize: 11 } }}
                tick={{ fill: '#6b7280', fontSize: 10 }}
                stroke="#9ca3af"
                width={50}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  padding: '8px'
                }}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    // Extract region data from payload
                    const regionData: { region: string; rate: number; availability: number }[] = []
                    
                    regions.forEach((region) => {
                      const rateValue = payload.find(p => p.dataKey === `${region}_rate`)?.value as number || 0
                      const availabilityValue = payload.find(p => p.dataKey === `${region}_availability`)?.value as number || 0
                      if (rateValue > 0 || availabilityValue > 0) {
                        regionData.push({
                          region,
                          rate: rateValue,
                          availability: availabilityValue
                        })
                      }
                    })
                    
                    return (
                      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-2">
                        <div className="text-[10px] font-semibold text-gray-700 mb-2 pb-1 border-b border-gray-200">
                          {label}
                        </div>
                        {/* Column Headers */}
                        <div className="grid grid-cols-3 gap-2 text-[9px] font-semibold text-gray-700 mb-1 pb-1 border-b border-gray-200">
                          <div>Region</div>
                          <div className="text-right">Rate</div>
                          <div className="text-right">Availability</div>
                        </div>
                        <div className="space-y-1">
                          {regionData.map((data, idx) => (
                            <div key={idx} className="grid grid-cols-3 gap-2 text-[9px]">
                              <div className="text-gray-600 font-medium">{data.region}</div>
                              <div className="text-gray-700 font-semibold text-right">{data.rate}</div>
                              <div className="text-gray-700 font-semibold text-right">{data.availability}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '8px', fontSize: '11px' }}
                content={() => (
                  <div className="flex items-center justify-center gap-4 pt-2">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-3 rounded flex overflow-hidden">
                        <div className="w-1/4 bg-purple-200"></div>
                        <div className="w-1/4 bg-purple-400"></div>
                        <div className="w-1/4 bg-purple-600"></div>
                        <div className="w-1/4 bg-purple-800"></div>
                      </div>
                      <span className="text-xs text-gray-700 font-medium">Rate</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-3 rounded flex overflow-hidden">
                        <div className="w-1/4 bg-pink-200"></div>
                        <div className="w-1/4 bg-pink-400"></div>
                        <div className="w-1/4 bg-pink-600"></div>
                        <div className="w-1/4 bg-pink-800"></div>
                      </div>
                      <span className="text-xs text-gray-700 font-medium">Availability</span>
                    </div>
                  </div>
                )}
              />
              {/* Stacked Bars for Rate Violations by Region */}
              {regions.map((region, idx) => {
                const colors = ['#f59e0b', '#f97316', '#ea580c', '#dc2626', '#b91c1c', '#991b1b']
                return (
                  <Bar 
                    key={`${region}_rate`}
                    dataKey={`${region}_rate`} 
                    stackId="rate" 
                    fill={colors[idx % colors.length]} 
                    name={`${region} (Rate)`}
                    radius={idx === regions.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                  />
                )
              })}
              {/* Stacked Bars for Availability Violations by Region */}
              {regions.map((region, idx) => {
                const colors = ['#ec4899', '#db2777', '#be185d', '#9f1239', '#831843', '#701a75']
                return (
                  <Bar 
                    key={`${region}_availability`}
                    dataKey={`${region}_availability`} 
                    stackId="availability" 
                    fill={colors[idx % colors.length]} 
                    name={`${region} (Availability)`}
                    radius={idx === regions.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                  />
                )
              })}
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Top Violating Metas */}
      <div className="card">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Top Violating Metas</h2>
          {/* Meta Selector Dropdown */}
          <div className="relative">
            <select
              value={selectedMeta}
              onChange={(e) => setSelectedMeta(e.target.value)}
              className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              {metas.map((meta) => (
                <option key={meta.name} value={meta.name}>
                  {meta.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        {currentMeta && metaChartData.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={250}>
              <ComposedChart data={metaChartData} margin={{ top: 10, right: 20, left: 10, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                <XAxis 
                  dataKey="name" 
                  angle={-20}
                  textAnchor="end"
                  height={40}
                  tick={{ fill: '#6b7280', fontSize: 10 }}
                  stroke="#9ca3af"
                />
                <YAxis 
                  yAxisId="left"
                  label={{ value: 'Violations', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#6b7280', fontSize: 11 } }}
                  tick={{ fill: '#6b7280', fontSize: 10 }}
                  stroke="#9ca3af"
                  width={50}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  domain={[0, 100]}
                  label={{ value: 'Parity Score (%)', angle: 90, position: 'insideRight', style: { textAnchor: 'middle', fill: '#6b7280', fontSize: 11 } }}
                  tick={{ fill: '#6b7280', fontSize: 10 }}
                  stroke="#9ca3af"
                  width={50}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    padding: '8px'
                  }}
                  labelStyle={{ color: '#374151', fontWeight: 600, marginBottom: '4px', fontSize: '12px' }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '8px', fontSize: '11px' }}
                  iconType="line"
                />
                {/* Stacked Bars for violations */}
                <Bar yAxisId="left" dataKey="rateViolations" stackId="violations" fill="#f59e0b" name="Rate Violations" radius={[0, 0, 0, 0]} />
                <Bar yAxisId="left" dataKey="availabilityViolations" stackId="violations" fill="#ec4899" name="Availability Violations" radius={[4, 4, 0, 0]} />
                {/* Line for parity score */}
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="parityScore" 
                  stroke="#0ea5e9" 
                  strokeWidth={3}
                  dot={{ fill: '#0ea5e9', r: 4, strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                  name="Parity Score (%)"
                />
              </ComposedChart>
            </ResponsiveContainer>
            
            {/* Meta Summary Info */}
            <div className="mt-2 pt-2 border-t border-gray-200">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3">
                  <div>
                    <span className="text-gray-600">Total Violations: </span>
                    <span className="font-semibold text-gray-900">{currentMeta.totalViolations}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Parity Score: </span>
                    <span className={`font-semibold ${getParityColor(currentMeta.parityScore)}`}>
                      {currentMeta.parityScore.toFixed(1)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Sub-Channels: </span>
                    <span className="font-semibold text-gray-900">{currentMeta.subChannels.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="h-[280px] flex items-center justify-center text-gray-500 text-sm">
            No data available
          </div>
        )}
      </div>

      {/* Most Violating POS */}
      <div className="card">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Most Violating POS</h2>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value as 'All Cases' | 'Critical' | 'Major' | 'Minor' | 'Trivial')}
            className="px-2 py-1 text-xs border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {['All Cases', 'Critical', 'Major', 'Minor', 'Trivial'].map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={posViolationsData} margin={{ top: 10, right: 20, left: 10, bottom: 30 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
            <XAxis 
              dataKey="name" 
              angle={-20}
              textAnchor="end"
              height={40}
              tick={{ fill: '#6b7280', fontSize: 10 }}
              stroke="#9ca3af"
            />
            <YAxis 
              yAxisId="left"
              label={{ value: 'Rate & Availability Violations', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#6b7280', fontSize: 11 } }}
              tick={{ fill: '#6b7280', fontSize: 10 }}
              stroke="#9ca3af"
              width={50}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              domain={[0, 100]}
              label={{ value: 'Parity Score (%)', angle: 90, position: 'insideRight', style: { textAnchor: 'middle', fill: '#6b7280', fontSize: 11 } }}
              tick={{ fill: '#6b7280', fontSize: 10 }}
              stroke="#9ca3af"
              width={50}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                padding: '8px'
              }}
              labelStyle={{ color: '#374151', fontWeight: 600, marginBottom: '4px', fontSize: '12px' }}
            />
            <Legend wrapperStyle={{ paddingTop: '8px', fontSize: '11px' }} />
            <Bar yAxisId="left" dataKey="rateViolations" stackId="violations" fill="#f59e0b" name="Rate Violations" radius={[0, 0, 0, 0]} />
            <Bar yAxisId="left" dataKey="availabilityViolations" stackId="violations" fill="#ec4899" name="Availability Violations" radius={[4, 4, 0, 0]} />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="parityScore" 
              stroke="#0ea5e9" 
              strokeWidth={2}
              dot={{ fill: '#0ea5e9', r: 4, strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
              name="Parity Score (%)"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
