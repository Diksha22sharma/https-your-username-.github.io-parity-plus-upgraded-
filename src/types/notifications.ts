export type UserRole = 'corporate' | 'intermediate' | 'single-property'

export interface BuzzNotification {
  id: string
  type: 'buzz-assigned' | 'reason-updated'
  violationId?: string  // Optional for summary notifications
  violationIds?: string[]  // Array of violation IDs for summary notifications
  hotel?: string
  channel?: string
  date?: string
  severity?: 'Critical' | 'Major' | 'Minor' | 'Trivial'
  revenueLoss?: number
  reason?: string
  assignedBy?: string
  assignedTo?: string
  updatedBy?: string
  timestamp: string
  read: boolean
  count?: number  // Number of violations in this notification
  message?: string  // Display message
}

export interface NotificationState {
  notifications: BuzzNotification[]
  unreadCount: number
}
