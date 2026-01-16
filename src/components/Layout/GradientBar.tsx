import { Bell, Search, User } from 'lucide-react'
import { useState } from 'react'
import { useNotifications } from '../../contexts/NotificationContext'
import NotificationsPanel from '../Notifications/NotificationsPanel'
import { useNavigate } from 'react-router-dom'

export default function GradientBar() {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const { notifications, unreadCount, userRole, markAsRead } = useNotifications()
  const navigate = useNavigate()

  const handleViewBuzzCases = () => {
    setIsNotificationsOpen(false)
    navigate('/buzz-cases')
  }

  const handleViewUpdatedCases = () => {
    setIsNotificationsOpen(false)
    navigate('/buzz-cases')
  }

  return (
    <>
      <div className="gradient-bar h-16 flex items-center justify-between px-8 shadow-nav sticky top-0 z-50">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30 shadow-soft">
            <span className="text-white font-bold text-lg">P+</span>
          </div>
          <div>
            <h1 className="text-white text-xl font-semibold tracking-tight">Parity+</h1>
            <p className="text-white/90 text-xs font-medium">Rate Parity Monitoring</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/90 hover:text-white">
            <Search className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsNotificationsOpen(true)}
            className="relative p-2 rounded-lg hover:bg-white/10 transition-colors text-white/90 hover:text-white"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-400 rounded-full border-2 border-white"></span>
            )}
          </button>
          <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center cursor-pointer hover:bg-white/30 transition-colors">
            <User className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>

      <NotificationsPanel
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        userRole={userRole}
        onViewBuzzCases={handleViewBuzzCases}
        onViewUpdatedCases={handleViewUpdatedCases}
        onMarkAsRead={markAsRead}
      />
    </>
  )
}

