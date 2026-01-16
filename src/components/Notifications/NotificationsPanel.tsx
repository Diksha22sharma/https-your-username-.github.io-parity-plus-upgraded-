import { useState, useMemo } from 'react'
import { X, Bell, Zap, CheckCircle, AlertCircle, Eye } from 'lucide-react'
import { BuzzNotification, UserRole } from '../../types/notifications'
import { Violation } from '../../types'
import ViolationsDetailsModal from './ViolationsDetailsModal'

interface NotificationsPanelProps {
  isOpen: boolean
  onClose: () => void
  notifications: BuzzNotification[]
  userRole: UserRole
  onViewBuzzCases: () => void
  onViewUpdatedCases: () => void
  onMarkAsRead: (notificationId: string) => void
}

export default function NotificationsPanel({
  isOpen,
  onClose,
  notifications,
  userRole,
  onViewBuzzCases,
  onViewUpdatedCases,
  onMarkAsRead
}: NotificationsPanelProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all')
  const [selectedNotification, setSelectedNotification] = useState<BuzzNotification | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)

  const filteredNotifications = useMemo(() => {
    if (activeTab === 'unread') {
      return notifications.filter(n => !n.read)
    }
    return notifications
  }, [notifications, activeTab])

  const buzzAssignedNotifications = useMemo(() => {
    return filteredNotifications.filter(n => n.type === 'buzz-assigned')
  }, [filteredNotifications])

  const reasonUpdatedNotifications = useMemo(() => {
    return filteredNotifications.filter(n => n.type === 'reason-updated')
  }, [filteredNotifications])

  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.read).length
  }, [notifications])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-end p-4 pt-20">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md h-[calc(100vh-6rem)] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 bg-primary-600 text-white text-xs font-semibold rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'all'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveTab('unread')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${
              activeTab === 'unread'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Unread
            {unreadCount > 0 && (
              <span className="absolute top-2 right-4 w-2 h-2 bg-primary-600 rounded-full"></span>
            )}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <Bell className="w-12 h-12 text-gray-300 mb-4" />
              <p className="text-sm text-gray-500">No notifications</p>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {/* Buzz Assigned Section - For Intermediate/Single Users */}
              {(userRole === 'intermediate' || userRole === 'single-property') && buzzAssignedNotifications.length > 0 && (
                <div>
                   <div className="flex items-center justify-between mb-3">
                     <h3 className="text-sm font-semibold text-gray-900">Buzz Cases Assigned</h3>
                     <button
                       onClick={() => {
                         // Get all violation IDs from buzz assigned notifications
                         const allViolationIds = buzzAssignedNotifications
                           .flatMap(n => n.violationIds || (n.violationId ? [n.violationId] : []))
                         if (allViolationIds.length > 0) {
                           setSelectedNotification({
                             id: 'all-buzz',
                             type: 'buzz-assigned',
                             violationIds: Array.from(new Set(allViolationIds)),
                             count: allViolationIds.length,
                             message: `${allViolationIds.length} Violations have been shared for actioning.`,
                             timestamp: new Date().toISOString(),
                             read: false
                           } as BuzzNotification)
                           setIsDetailsModalOpen(true)
                         } else {
                           onViewBuzzCases()
                         }
                       }}
                       className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center space-x-1"
                     >
                       <Eye className="w-3 h-3" />
                       <span>View All</span>
                     </button>
                   </div>
                   <div className="space-y-2">
                     {buzzAssignedNotifications.slice(0, 5).map((notification) => (
                       <div
                         key={notification.id}
                         className={`p-3 rounded-lg border ${
                           notification.read
                             ? 'bg-gray-50 border-gray-200'
                             : 'bg-primary-50 border-primary-200'
                         }`}
                       >
                         <div className="flex items-start space-x-2">
                           <Zap className={`w-4 h-4 mt-0.5 ${
                             notification.read ? 'text-gray-400' : 'text-primary-600'
                           }`} />
                           <div className="flex-1 min-w-0">
                             {notification.message ? (
                               <>
                                 <p className="text-sm font-medium text-gray-900 mb-2">
                                   {notification.message}
                                 </p>
                                 <button
                                   onClick={() => {
                                     setSelectedNotification(notification)
                                     setIsDetailsModalOpen(true)
                                   }}
                                   className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center space-x-1"
                                 >
                                   <Eye className="w-3 h-3" />
                                   <span>View Details</span>
                                 </button>
                               </>
                             ) : (
                               <>
                                 <p className="text-xs font-medium text-gray-900">
                                   {notification.hotel} - {notification.channel}
                                 </p>
                                 <p className="text-xs text-gray-600 mt-1">
                                   {notification.assignedBy && `Assigned by ${notification.assignedBy}`}
                                 </p>
                               </>
                             )}
                             <p className="text-xs text-gray-500 mt-1">
                               {new Date(notification.timestamp).toLocaleString()}
                             </p>
                           </div>
                           {!notification.read && (
                             <button
                               onClick={() => onMarkAsRead(notification.id)}
                               className="p-1 hover:bg-white rounded transition-colors"
                               title="Mark as read"
                             >
                               <CheckCircle className="w-4 h-4 text-gray-400 hover:text-primary-600" />
                             </button>
                           )}
                         </div>
                       </div>
                     ))}
                   </div>
                </div>
              )}

              {/* Reason Updated Section - For Corporate Users */}
              {userRole === 'corporate' && reasonUpdatedNotifications.length > 0 && (
                <div>
                   <div className="flex items-center justify-between mb-3">
                     <h3 className="text-sm font-semibold text-gray-900">Reason Updates</h3>
                     <button
                       onClick={() => {
                         // Get all violation IDs from reason updated notifications
                         const allViolationIds = reasonUpdatedNotifications
                           .flatMap(n => n.violationIds || (n.violationId ? [n.violationId] : []))
                         if (allViolationIds.length > 0) {
                           setSelectedNotification({
                             id: 'all-updates',
                             type: 'reason-updated',
                             violationIds: Array.from(new Set(allViolationIds)),
                             count: allViolationIds.length,
                             message: `${allViolationIds.length} Violation reasons have been updated.`,
                             timestamp: new Date().toISOString(),
                             read: false
                           } as BuzzNotification)
                           setIsDetailsModalOpen(true)
                         } else {
                           onViewUpdatedCases()
                         }
                       }}
                       className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center space-x-1"
                     >
                       <Eye className="w-3 h-3" />
                       <span>View All</span>
                     </button>
                   </div>
                   <div className="space-y-2">
                     {reasonUpdatedNotifications.slice(0, 5).map((notification) => (
                       <div
                         key={notification.id}
                         className={`p-3 rounded-lg border ${
                           notification.read
                             ? 'bg-gray-50 border-gray-200'
                             : 'bg-green-50 border-green-200'
                         }`}
                       >
                         <div className="flex items-start space-x-2">
                           <AlertCircle className={`w-4 h-4 mt-0.5 ${
                             notification.read ? 'text-gray-400' : 'text-green-600'
                           }`} />
                           <div className="flex-1 min-w-0">
                             {notification.message ? (
                               <>
                                 <p className="text-sm font-medium text-gray-900 mb-2">
                                   {notification.message}
                                 </p>
                                 <button
                                   onClick={() => {
                                     setSelectedNotification(notification)
                                     setIsDetailsModalOpen(true)
                                   }}
                                   className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center space-x-1"
                                 >
                                   <Eye className="w-3 h-3" />
                                   <span>View Details</span>
                                 </button>
                               </>
                             ) : (
                               <>
                                 <p className="text-xs font-medium text-gray-900">
                                   {notification.hotel} - {notification.channel}
                                 </p>
                                 <p className="text-xs text-gray-600 mt-1">
                                   Reason: {notification.reason || 'No reason provided'}
                                 </p>
                                 <p className="text-xs text-gray-500 mt-1">
                                   Updated by {notification.updatedBy}
                                 </p>
                               </>
                             )}
                             <p className="text-xs text-gray-500 mt-1">
                               {new Date(notification.timestamp).toLocaleString()}
                             </p>
                           </div>
                           {!notification.read && (
                             <button
                               onClick={() => onMarkAsRead(notification.id)}
                               className="p-1 hover:bg-white rounded transition-colors"
                               title="Mark as read"
                             >
                               <CheckCircle className="w-4 h-4 text-gray-400 hover:text-green-600" />
                             </button>
                           )}
                         </div>
                       </div>
                     ))}
                   </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Violations Details Modal */}
      {selectedNotification && (
        <ViolationsDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false)
            setSelectedNotification(null)
          }}
          violationIds={selectedNotification.violationIds || (selectedNotification.violationId ? [selectedNotification.violationId] : [])}
          title={
            selectedNotification.type === 'buzz-assigned'
              ? 'Violations Shared for Actioning'
              : 'Updated Violation Reasons'
          }
        />
      )}
    </div>
  )
}
