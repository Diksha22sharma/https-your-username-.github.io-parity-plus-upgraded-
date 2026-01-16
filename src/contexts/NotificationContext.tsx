import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { BuzzNotification, UserRole } from '../types/notifications'

interface NotificationContextType {
  notifications: BuzzNotification[]
  unreadCount: number
  userRole: UserRole
  setUserRole: (role: UserRole) => void
  addNotification: (notification: Omit<BuzzNotification, 'id' | 'timestamp' | 'read'>) => void
  markAsRead: (notificationId: string) => void
  markAllAsRead: () => void
  clearNotifications: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

// Mock notifications data
const getMockNotifications = (userRole: UserRole): BuzzNotification[] => {
  const now = new Date()
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
  const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000)
  const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000)
  
  if (userRole === 'corporate') {
    // Corporate users see reason updates
    return [
      {
        id: 'mock-1',
        type: 'reason-updated',
        violationIds: ['violation-1', 'violation-2', 'violation-3', 'violation-4', 'violation-5', 'violation-6', 'violation-7', 'violation-8', 'violation-9', 'violation-10', 'violation-11', 'violation-12', 'violation-13', 'violation-14', 'violation-15', 'violation-16', 'violation-17', 'violation-18', 'violation-19', 'violation-20', 'violation-21', 'violation-22', 'violation-23'],
        count: 23,
        message: '23 Violation reasons have been updated.',
        updatedBy: 'Intermediate User',
        timestamp: oneHourAgo.toISOString(),
        read: false
      },
      {
        id: 'mock-2',
        type: 'reason-updated',
        violationIds: ['violation-24', 'violation-25', 'violation-26', 'violation-27', 'violation-28', 'violation-29', 'violation-30', 'violation-31', 'violation-32', 'violation-33', 'violation-34', 'violation-35', 'violation-36', 'violation-37', 'violation-38', 'violation-39', 'violation-40', 'violation-41', 'violation-42', 'violation-43'],
        count: 20,
        message: '20 Violation reasons have been updated.',
        updatedBy: 'Single Property User',
        timestamp: twoHoursAgo.toISOString(),
        read: false
      },
      {
        id: 'mock-3',
        type: 'reason-updated',
        violationIds: ['violation-44', 'violation-45', 'violation-46', 'violation-47', 'violation-48'],
        count: 5,
        message: '5 Violation reasons have been updated.',
        updatedBy: 'Intermediate User',
        timestamp: threeHoursAgo.toISOString(),
        read: true
      }
    ]
  } else if (userRole === 'intermediate') {
    // Intermediate users see buzz assignments
    return [
      {
        id: 'mock-4',
        type: 'buzz-assigned',
        violationIds: ['violation-1', 'violation-2', 'violation-3', 'violation-4', 'violation-5', 'violation-6', 'violation-7', 'violation-8', 'violation-9', 'violation-10', 'violation-11', 'violation-12', 'violation-13', 'violation-14', 'violation-15', 'violation-16', 'violation-17', 'violation-18', 'violation-19', 'violation-20', 'violation-21', 'violation-22', 'violation-23'],
        count: 23,
        message: '23 Violations have been shared for actioning.',
        assignedBy: 'Corporate User',
        assignedTo: 'Intermediate User',
        timestamp: oneHourAgo.toISOString(),
        read: false
      },
      {
        id: 'mock-5',
        type: 'buzz-assigned',
        violationIds: ['violation-24', 'violation-25', 'violation-26', 'violation-27', 'violation-28'],
        count: 5,
        message: '5 Violations have been shared for actioning.',
        assignedBy: 'Corporate User',
        assignedTo: 'Intermediate User',
        timestamp: twoHoursAgo.toISOString(),
        read: false
      }
    ]
  } else {
    // Single property users see buzz assignments
    return [
      {
        id: 'mock-6',
        type: 'buzz-assigned',
        violationIds: ['violation-1', 'violation-2', 'violation-3', 'violation-4', 'violation-5', 'violation-6', 'violation-7', 'violation-8', 'violation-9', 'violation-10', 'violation-11', 'violation-12', 'violation-13', 'violation-14', 'violation-15', 'violation-16', 'violation-17', 'violation-18', 'violation-19', 'violation-20', 'violation-21', 'violation-22', 'violation-23'],
        count: 23,
        message: '23 Violations have been shared for actioning.',
        assignedBy: 'Corporate User',
        assignedTo: 'Single Property User',
        timestamp: oneHourAgo.toISOString(),
        read: false
      },
      {
        id: 'mock-7',
        type: 'buzz-assigned',
        violationIds: ['violation-24', 'violation-25', 'violation-26', 'violation-27', 'violation-28', 'violation-29', 'violation-30'],
        count: 7,
        message: '7 Violations have been shared for actioning.',
        assignedBy: 'Intermediate User',
        assignedTo: 'Single Property User',
        timestamp: twoHoursAgo.toISOString(),
        read: false
      }
    ]
  }
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [userRole, setUserRole] = useState<UserRole>('corporate') // Default to corporate, can be changed in settings
  const [notifications, setNotifications] = useState<BuzzNotification[]>(() => getMockNotifications('corporate'))

  // Update notifications when user role changes
  const handleSetUserRole = useCallback((role: UserRole) => {
    setUserRole(role)
    setNotifications(getMockNotifications(role))
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  const addNotification = useCallback((notification: Omit<BuzzNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: BuzzNotification = {
      ...notification,
      id: `notification-${Date.now()}-${Math.random()}`,
      timestamp: new Date().toISOString(),
      read: false
    }
    setNotifications(prev => [newNotification, ...prev])
  }, [])

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    )
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }, [])

  const clearNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        userRole,
        setUserRole: handleSetUserRole,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}
