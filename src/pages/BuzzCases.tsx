import { useState, useMemo } from 'react'
import { Zap, ArrowLeft, CheckCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { BuzzNotification, UserRole } from '../types/notifications'
import { Violation } from '../types'

interface BuzzCasesProps {
  notifications: BuzzNotification[]
  userRole: UserRole
  violations: Violation[]
  onReasonUpdate: (violationId: string, newReason: string) => void
  onMarkAsRead: (notificationId: string) => void
}

export default function BuzzCases({
  notifications,
  userRole: propUserRole,
  violations: propViolations,
  onReasonUpdate: propOnReasonUpdate,
  onMarkAsRead: propOnMarkAsRead
}: BuzzCasesProps) {
  const { notifications: contextNotifications, userRole: contextUserRole, addNotification, markAsRead } = useNotifications()
  const notificationsToUse = notifications.length > 0 ? notifications : contextNotifications
  const userRole = propUserRole || contextUserRole
  const [violations, setViolations] = useState<Violation[]>(propViolations.length > 0 ? propViolations : [])
  const onReasonUpdate = propOnReasonUpdate || ((violationId: string, newReason: string) => {
    updateViolation(violationId, { reason: newReason })
    setViolations(getViolations())
  })
  const onMarkAsRead = propOnMarkAsRead || markAsRead
  
  // Load violations from store on mount
  useEffect(() => {
    if (violations.length === 0) {
      const storeViolations = getViolations()
      if (storeViolations.length > 0) {
        setViolations(storeViolations)
      }
    }
  }, [])
  const navigate = useNavigate()
  const [editingReasonId, setEditingReasonId] = useState<string | null>(null)
  const [editingReasonValue, setEditingReasonValue] = useState('')
  
  const reasonOptions = ['--', 'Rate plan difference', 'Room or board difference', 'Promotion/discount difference', 'Bait & switch', 'Other']

  const buzzCases = useMemo(() => {
    if (userRole === 'corporate') {
      // Corporate users see cases where reasons were updated
      return notificationsToUse
        .filter(n => n.type === 'reason-updated')
        .map(notification => {
          const violation = violations.find(v => v.id === notification.violationId)
          return { notification, violation }
        })
        .filter(item => item.violation)
    } else {
      // Intermediate/Single users see cases assigned to them
      return notificationsToUse
        .filter(n => n.type === 'buzz-assigned')
        .map(notification => {
          const violation = violations.find(v => v.id === notification.violationId)
          return { notification, violation }
        })
        .filter(item => item.violation)
    }
  }, [notificationsToUse, violations, userRole])

  const handleReasonEdit = (violationId: string, currentReason: string) => {
    setEditingReasonId(violationId)
    setEditingReasonValue(currentReason === '' || currentReason === null ? '--' : currentReason)
  }

  const handleReasonSave = (violationId: string) => {
    const reasonToSave = editingReasonValue === '--' ? '' : editingReasonValue
    onReasonUpdate(violationId, reasonToSave)
    setEditingReasonId(null)
    setEditingReasonValue('')
    
    // Mark related notification as read
    const relatedNotification = notificationsToUse.find(n => n.violationId === violationId)
    if (relatedNotification) {
      onMarkAsRead(relatedNotification.id)
    }
    
    // Send notification to corporate user when intermediate/single-property user updates reason
    if (userRole === 'intermediate' || userRole === 'single-property') {
      const violation = violations.find(v => v.id === violationId)
      if (violation) {
        addNotification({
          type: 'reason-updated',
          violationId: violation.id,
          hotel: violation.hotel,
          channel: violation.channel,
          date: violation.date,
          severity: violation.severity,
          revenueLoss: violation.revenueLoss,
          reason: reasonToSave,
          updatedBy: userRole === 'intermediate' ? 'Intermediate User' : 'Single Property User'
        })
      }
    }
  }

  const handleReasonCancel = () => {
    setEditingReasonId(null)
    setEditingReasonValue('')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {userRole === 'corporate' ? 'Updated Buzz Cases' : 'Assigned Buzz Cases'}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {userRole === 'corporate' 
                ? 'Cases where reasons have been updated by intermediate or single property users'
                : 'Buzz cases assigned to you that require reason updates'}
            </p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Hotel</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Channel</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Severity</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Revenue Loss</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Reason</th>
                {userRole !== 'corporate' && (
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {buzzCases.length === 0 ? (
                <tr>
                  <td colSpan={userRole === 'corporate' ? 6 : 7} className="px-4 py-8 text-center text-sm text-gray-500">
                    No buzz cases available
                  </td>
                </tr>
              ) : (
                buzzCases.map(({ notification, violation }) => {
                  if (!violation) return null
                  
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
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          violation.severity === 'Critical' ? 'bg-red-100 text-red-800' :
                          violation.severity === 'Major' ? 'bg-orange-100 text-orange-800' :
                          violation.severity === 'Minor' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {violation.severity}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {violation.revenueLoss ? `$${violation.revenueLoss.toFixed(2)}` : '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {editingReasonId === violation.id ? (
                          <div className="flex items-center space-x-2">
                            <select
                              value={editingReasonValue}
                              onChange={(e) => setEditingReasonValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleReasonSave(violation.id)
                                else if (e.key === 'Escape') handleReasonCancel()
                              }}
                              className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                              autoFocus
                            >
                              {reasonOptions.map(option => (
                                <option key={option} value={option}>{option}</option>
                              ))}
                            </select>
                            <button
                              onClick={() => handleReasonSave(violation.id)}
                              className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                              title="Save"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={handleReasonCancel}
                              className="p-1 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                              title="Cancel"
                            >
                              ×
                            </button>
                          </div>
                        ) : (
                          <div
                            onClick={() => {
                              if (userRole !== 'corporate') {
                                handleReasonEdit(violation.id, violation.reason || '')
                              }
                            }}
                            className={`text-sm ${
                              userRole !== 'corporate' ? 'cursor-pointer hover:text-primary-600' : ''
                            }`}
                            title={userRole !== 'corporate' ? 'Click to edit' : ''}
                          >
                            <span>{violation.reason === '' || !violation.reason ? '--' : violation.reason}</span>
                            {userRole !== 'corporate' && (
                              <span className="ml-2 text-gray-400">✎</span>
                            )}
                          </div>
                        )}
                      </td>
                      {userRole !== 'corporate' && (
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            violation.reason && violation.reason.trim() !== '' && violation.reason !== '--'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {violation.reason && violation.reason.trim() !== '' && violation.reason !== '--'
                              ? 'Completed'
                              : 'Pending'}
                          </span>
                        </td>
                      )}
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
