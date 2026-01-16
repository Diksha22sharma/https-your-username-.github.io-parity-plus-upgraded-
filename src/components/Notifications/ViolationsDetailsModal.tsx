import { X } from 'lucide-react'
import { Violation } from '../../types'
import { getViolations } from '../../store/violationsStore'

interface ViolationsDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  violationIds: string[]
  title: string
}

// Mock violations data for the modal
const getMockViolations = (): Violation[] => {
  return Array.from({ length: 50 }, (_, i) => {
    const otaRate = 150 + Math.random() * 200
    const brandRate = otaRate * (0.95 + Math.random() * 0.1)
    const channelTypes: ('OTA' | 'Meta')[] = ['OTA', 'Meta']
    const channelType = channelTypes[i % 2]
    const channels = channelType === 'OTA' 
      ? ['Booking.com', 'Expedia', 'Agoda', 'Hotels.com']
      : ['Google Hotels', 'TripAdvisor', 'Trivago', 'Kayak']
    const underlyingOTAs = ['Booking.com', 'Expedia', 'Agoda', 'Hotels.com', 'Priceline']
    
    const reasons = ['Rate plan difference', 'Room or board difference', 'Promotion/discount difference', 'Bait & switch', 'Other']
    const reason = i % 7 === 0 ? '' : reasons[i % 5]
    
    const severities: ('Critical' | 'Major' | 'Minor' | 'Trivial')[] = ['Critical', 'Major', 'Minor', 'Trivial']
    const severity = severities[i % 4]
    
    return {
      id: `violation-${i + 1}`,
      hotel: `Hotel ${(i % 10) + 1}`,
      brand: `Brand ${(i % 3) + 1}`,
      subBrand: i % 2 === 0 ? `Sub Brand ${(i % 2) + 1}` : undefined,
      channel: channels[i % channels.length],
      channelType: channelType,
      underlyingOTA: channelType === 'Meta' ? underlyingOTAs[i % underlyingOTAs.length] : undefined,
      date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      rate: otaRate,
      brandRate: brandRate,
      room: `Room Type ${(i % 3) + 1}`,
      board: ['Room Only', 'Breakfast', 'Half Board', 'Full Board'][i % 4],
      pos: ['US', 'EU', 'UK', 'CA', 'AU'][i % 5],
      los: (i % 7) + 1,
      occupancy: 1 + (i % 4),
      wlm: ['Win', 'Loss', 'Meet'][i % 3] as 'Win' | 'Loss' | 'Meet',
      ra: ['Rate', 'Availability'][i % 2] as 'Rate' | 'Availability',
      severity: severity,
      reason: reason,
      revenueLoss: Math.random() * 500 + 50
    }
  })
}

export default function ViolationsDetailsModal({
  isOpen,
  onClose,
  violationIds,
  title
}: ViolationsDetailsModalProps) {
  if (!isOpen) return null

  const allViolations = getViolations()
  const mockViolations = getMockViolations()
  
  // Use store violations if available, otherwise use mock data
  const violationsToSearch = allViolations.length > 0 ? allViolations : mockViolations
  const violations = violationsToSearch.filter(v => violationIds.includes(v.id))

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return 'bg-red-100 text-red-800'
      case 'Major':
        return 'bg-orange-100 text-orange-800'
      case 'Minor':
        return 'bg-yellow-100 text-yellow-800'
      case 'Trivial':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            <p className="text-sm text-gray-600 mt-1">
              {violations.length} violation{violations.length !== 1 ? 's' : ''} found
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto p-6">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Hotel</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Channel</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Rate</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Brand Rate</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Variance</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Severity</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Revenue Loss</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Reason</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {violations.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-sm text-gray-500">
                      No violations found
                    </td>
                  </tr>
                ) : (
                  violations.map((violation) => {
                    const variance = violation.brandRate 
                      ? ((violation.rate - violation.brandRate) / violation.brandRate) * 100 
                      : null
                    
                    return (
                      <tr key={violation.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900">{violation.hotel}</span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-sm text-gray-900">{violation.channel}</span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-sm text-gray-900">{violation.date}</span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-sm text-gray-900">${violation.rate.toFixed(2)}</span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-sm text-gray-900">
                            {violation.brandRate ? `$${violation.brandRate.toFixed(2)}` : '-'}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`text-sm font-medium ${
                            variance === null ? 'text-gray-500' :
                            variance > 5 ? 'text-red-600' :
                            variance < -5 ? 'text-green-600' : 'text-yellow-600'
                          }`}>
                            {variance !== null ? `${variance > 0 ? '+' : ''}${variance.toFixed(2)}%` : '-'}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(violation.severity)}`}>
                            {violation.severity}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-sm text-gray-900">
                            {violation.revenueLoss ? `$${violation.revenueLoss.toFixed(2)}` : '-'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-900">
                            {violation.reason && violation.reason.trim() !== '' ? violation.reason : '--'}
                          </span>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
