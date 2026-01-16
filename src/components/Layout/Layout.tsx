import { ReactNode, useState } from 'react'
import NavigationRail from './NavigationRail'
import GradientBar from './GradientBar'
import InsightsSidebar from './InsightsSidebar'
import { AIInsight } from '../../types'

interface LayoutProps {
  children: ReactNode
  insights?: AIInsight[]
  onInsightClick?: (insight: AIInsight) => void
}

export default function Layout({ children, insights = [], onInsightClick }: LayoutProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="min-h-screen bg-surface-elevated">
      <GradientBar />
      <div className="flex">
        <NavigationRail collapsed={collapsed} onToggleCollapse={() => setCollapsed(!collapsed)} />
        <main className={`flex-1 ${collapsed ? 'ml-16' : 'ml-rail'} ${sidebarOpen ? 'mr-80' : ''} p-8 transition-all duration-300`}>
          <div className="max-w-[1920px]">
            {children}
          </div>
        </main>
        {insights && insights.length > 0 && (
          <InsightsSidebar
            insights={insights}
            onInsightClick={onInsightClick || (() => {})}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
        )}
      </div>
    </div>
  )
}