import { useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../store/slices/authSlice'
import { 
  LayoutDashboard,
  CheckSquare,
  Clock,
  User,
  LogOut,
  Bell,
  Menu,
  X
} from 'lucide-react'
import { useEffect } from 'react'
import api from '../utils/api'
import { setUnreadCount } from '../store/slices/notificationSlice'

export default function WorkerLayout() {
  const location = useLocation()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const { unreadCount } = useSelector((state) => state.notifications)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await api.get('/notifications/unread_count/')
        dispatch(setUnreadCount(response.data.unread_count))
      } catch (error) {
        console.error('Error fetching unread count:', error)
      }
    }
    fetchUnreadCount()
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [dispatch])

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  const navigation = [
    { name: 'Dashboard', href: '/worker', icon: LayoutDashboard },
    { name: 'My Tasks', href: '/worker/tasks', icon: CheckSquare },
    { name: 'Time Tracking', href: '/worker/time', icon: Clock },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-gradient-to-b from-blue-600 to-blue-800 shadow-lg
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="flex flex-col h-full">
            <div className="p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl lg:text-2xl font-bold text-white">Mukhattat</h1>
                  <p className="text-xs lg:text-sm text-blue-100 mt-1">Worker</p>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="lg:hidden text-white hover:text-blue-200"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            <nav className="flex-1 mt-4 lg:mt-8 overflow-y-auto">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href || 
                  (item.href !== '/worker' && location.pathname.startsWith(item.href))
                return (
                  <button
                    key={item.name}
                    onClick={() => {
                      navigate(item.href)
                      setSidebarOpen(false)
                    }}
                    className={`w-full flex items-center px-4 lg:px-6 py-3 text-left text-blue-100 hover:bg-blue-700 transition-colors ${
                      isActive ? 'bg-blue-700 border-r-4 border-white' : ''
                    }`}
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    <span className="text-sm lg:text-base">{item.name}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 w-full lg:w-auto">
          {/* Header */}
          <header className="bg-white shadow-sm sticky top-0 z-30">
            <div className="flex items-center justify-between px-4 lg:px-8 py-3 lg:py-4">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden text-gray-600 hover:text-gray-900"
                >
                  <Menu className="w-6 h-6" />
                </button>
                <h2 className="text-lg lg:text-xl font-semibold text-gray-800 truncate">
                  {navigation.find(item => 
                    location.pathname === item.href || 
                    (item.href !== '/worker' && location.pathname.startsWith(item.href))
                  )?.name || 'Dashboard'}
                </h2>
              </div>
              <div className="flex items-center space-x-2 lg:space-x-4">
                <Link
                  to="/worker/notifications"
                  className="relative p-2 text-gray-600 hover:text-blue-600"
                >
                  <Bell className="w-5 h-5 lg:w-6 lg:h-6" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>
                <Link
                  to="/worker/profile"
                  className="flex items-center space-x-2 text-gray-700 hover:text-blue-600"
                >
                  <User className="w-5 h-5" />
                  <span className="text-sm font-medium hidden sm:inline">
                    {user?.first_name} {user?.last_name}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-gray-700 hover:text-red-600"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="text-sm hidden lg:inline">Logout</span>
                </button>
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="p-4 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}

