import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import Overview, { mockInsights } from './pages/Overview'
import Reports from './pages/Reports'
import TestBookings from './pages/TestBookings'
import Settings from './pages/Settings'
import BuzzCases from './pages/BuzzCases'
import { AIInsight } from './types'
import { useNotifications } from './contexts/NotificationContext'
import { useState } from 'react'

function AppContent() {
  const { notifications, userRole, markAsRead, addNotification } = useNotifications()
  const [allViolations, setAllViolations] = useState<any[]>([])
  
  const handleInsightClick = (_insight: AIInsight) => {
    // Apply filters from insight
    // You can also navigate to Overview page if needed
    // navigate('/')
  }
  
  const handleReasonUpdate = (violationId: string, newReason: string) => {
    // Update violation in the list
    setAllViolations(prev => prev.map(v => 
      v.id === violationId ? { ...v, reason: newReason } : v
    ))
    
    // Send notification to corporate user when intermediate/single-property user updates reason
    const violation = allViolations.find(v => v.id === violationId)
    if (violation && (userRole === 'intermediate' || userRole === 'single-property')) {
      addNotification({
        type: 'reason-updated',
        violationId: violation.id,
        hotel: violation.hotel,
        channel: violation.channel,
        date: violation.date,
        severity: violation.severity,
        revenueLoss: violation.revenueLoss,
        reason: newReason,
        updatedBy: userRole === 'intermediate' ? 'Intermediate User' : 'Single Property User'
      })
    }
  }

  return (
    <Layout insights={mockInsights} onInsightClick={handleInsightClick}>
      <Routes>
        <Route path="/" element={<Overview />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/test-bookings" element={<TestBookings />} />
        <Route path="/settings" element={<Settings />} />
        <Route 
          path="/buzz-cases" 
          element={
            <BuzzCases 
              notifications={notifications}
              userRole={userRole}
              violations={allViolations}
              onReasonUpdate={handleReasonUpdate}
              onMarkAsRead={markAsRead}
            />
          } 
        />
      </Routes>
    </Layout>
  )
}

function App() {
  return (
    <Router basename={import.meta.env.BASE_URL}>
      <AppContent />
    </Router>
  )
}

export default App
