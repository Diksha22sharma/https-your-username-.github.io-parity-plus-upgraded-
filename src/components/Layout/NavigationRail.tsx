import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, 
  FileText, 
  ShoppingCart, 
  Settings,
  ChevronRight,
  ChevronLeft
} from 'lucide-react'

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Overview', badge: null },
  { path: '/reports', icon: FileText, label: 'Reports', badge: null },
  { path: '/test-bookings', icon: ShoppingCart, label: 'Test Bookings', badge: '12' },
  { path: '/settings', icon: Settings, label: 'Settings', badge: null },
]

interface NavigationRailProps {
  collapsed: boolean
  onToggleCollapse: () => void
}

export default function NavigationRail({ collapsed, onToggleCollapse }: NavigationRailProps) {
  return (
    <nav className={`fixed left-0 top-16 ${collapsed ? 'w-16' : 'w-rail'} h-[calc(100vh-4rem)] bg-surface border-r border-border-light shadow-nav overflow-y-auto transition-all duration-300`}>
      <div className="p-4 space-y-1">
        {!collapsed && (
          <div className="px-3 py-2 mb-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Navigation</p>
          </div>
        )}
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `nav-item group ${
                  isActive
                    ? 'nav-item-active'
                    : 'nav-item-inactive'
                } ${collapsed ? 'justify-center' : ''}`
              }
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && (
                <>
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs font-semibold rounded-full">
                      {item.badge}
                    </span>
                  )}
                  <ChevronRight className={`w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity ${
                    item.badge ? 'ml-2' : ''
                  }`} />
                </>
              )}
              {collapsed && item.badge && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-primary-600 rounded-full border-2 border-white"></span>
              )}
            </NavLink>
          )
        })}
      </div>
      
      {/* Collapse Toggle Button */}
      <div className="absolute bottom-4 left-0 right-0 px-4">
        <button
          onClick={onToggleCollapse}
          className={`w-full nav-item text-gray-600 hover:bg-surface-hover hover:text-gray-900 ${collapsed ? 'justify-center' : ''}`}
          title={collapsed ? 'Expand Menu' : 'Collapse Menu'}
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5" />
              <span className="flex-1">Collapse Menu</span>
            </>
          )}
        </button>
      </div>
    </nav>
  )
}