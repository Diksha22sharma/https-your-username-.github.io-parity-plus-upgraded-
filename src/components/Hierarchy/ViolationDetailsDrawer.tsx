import { X, ExternalLink, Eye } from 'lucide-react'
import { Violation } from '../../types'

interface ViolationDetailsDrawerProps {
  isOpen: boolean
  onClose: () => void
  violations: Violation[]
  title: string
}

export default function ViolationDetailsDrawer({
  isOpen,
  onClose,
  violations,
  title
}: ViolationDetailsDrawerProps) {
  if (!isOpen) return null

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return 'bg-red-100 text-red-800'
      case 'High':
        return 'bg-orange-100 text-orange-800'
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'Low':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getChannelTypeColor = (type: string) => {
    switch (type) {
      case 'OTA':
        return 'bg-blue-100 text-blue-700'
      case 'Meta':
        return 'bg-purple-100 text-purple-700'
      case 'Wholesaler':
        return 'bg-orange-100 text-orange-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl z-50 transform transition-transform overflow-hidden flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            <p className="text-sm text-gray-500 mt-1">{violations.length} violation{violations.length !== 1 ? 's' : ''} found</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {violations.map((violation) => (
              <div
                key={violation.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold text-gray-900">{violation.hotel}</h3>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getChannelTypeColor(violation.channelType)}`}>
                        {violation.channelType}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getSeverityColor(violation.severity)}`}>
                        {violation.severity}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">Channel:</span> {violation.channel}
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">Date:</span> {violation.date}
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">Reason:</span> {violation.reason}
                    </p>
                  </div>
                  {violation.revenueLoss && (
                    <div className="text-right">
                      <p className="text-sm font-semibold text-red-600">
                        ${violation.revenueLoss.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">revenue loss</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm mb-3 pt-3 border-t border-gray-100">
                  <div>
                    <span className="text-gray-600">Rate:</span>
                    <span className="ml-2 font-medium">${violation.rate.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Room:</span>
                    <span className="ml-2 font-medium">{violation.room}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Board:</span>
                    <span className="ml-2 font-medium">{violation.board}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">POS:</span>
                    <span className="ml-2 font-medium">{violation.pos}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">LOS:</span>
                    <span className="ml-2 font-medium">{violation.los} night{violation.los !== 1 ? 's' : ''}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Occupancy:</span>
                    <span className="ml-2 font-medium">{violation.occupancy}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-3 border-t border-gray-100">
                  {violation.cacheUrl && (
                    <button
                      onClick={() => window.open(violation.cacheUrl, '_blank')}
                      className="flex items-center space-x-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View Cache</span>
                    </button>
                  )}
                  {violation.liveUrl && (
                    <a
                      href={violation.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 px-3 py-1.5 text-sm text-green-600 hover:bg-green-50 rounded transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Open Live Site</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          {violations.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No violations found</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}



