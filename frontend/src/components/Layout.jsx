import { Outlet, Link, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../store/slices/authSlice'
import { 
  LayoutDashboard, 
  FolderKanban, 
  CheckSquare, 
  FileText, 
  BarChart3, 
  User,
  LogOut,
  Bell,
  Shield,
  X,
  Check
} from 'lucide-react'
import { useEffect, useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../utils/api'
import { setUnreadCount } from '../store/slices/notificationSlice'
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../services/notificationService'

export default function Layout() {
  const location = useLocation()
  const dispatch = useDispatch()
  const queryClient = useQueryClient()
  const { user } = useSelector((state) => state.auth)
  const { unreadCount } = useSelector((state) => state.notifications)
  const [showNotifications, setShowNotifications] = useState(false)
  const notificationsRef = useRef(null)

  // Fetch notifications
  const { data: notifications = [], isLoading: notificationsLoading } = useQuery({
    queryKey: ['notifications', 'dropdown'],
    queryFn: () => getNotifications({ is_read: false }),
    enabled: showNotifications,
    refetchInterval: 30000, // Refetch every 30 seconds when dropdown is open
  })

  // Mark notification as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications'])
      queryClient.invalidateQueries(['notifications', 'dropdown'])
      // Refresh unread count
      api.get('/notifications/unread_count/').then(response => {
        dispatch(setUnreadCount(response.data.unread_count))
      })
    },
  })

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications'])
      queryClient.invalidateQueries(['notifications', 'dropdown'])
      // Refresh unread count
      api.get('/notifications/unread_count/').then(response => {
        dispatch(setUnreadCount(response.data.unread_count))
      })
    },
  })

  useEffect(() => {
    // Fetch unread notification count
    const fetchUnreadCount = async () => {
      try {
        const response = await api.get('/notifications/unread_count/')
        dispatch(setUnreadCount(response.data.unread_count))
      } catch (error) {
        console.error('Error fetching unread count:', error)
      }
    }
    fetchUnreadCount()
    const interval = setInterval(fetchUnreadCount, 30000) // Poll every 30 seconds
    return () => clearInterval(interval)
  }, [dispatch])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false)
      }
    }

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showNotifications])

  const handleNotificationClick = (notification) => {
    if (!notification.is_read) {
      markAsReadMutation.mutate(notification.id)
    }
    setShowNotifications(false)
  }

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate()
  }

  const handleLogout = () => {
    dispatch(logout())
  }

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Projects', href: '/projects', icon: FolderKanban },
    { name: 'Tasks', href: '/tasks', icon: CheckSquare },
    { name: 'Documents', href: '/documents', icon: FileText },
    { name: 'Reports', href: '/reports', icon: BarChart3 },
  ]
  
  // Add Super Admin link separately if user is superuser
  const superAdminLink = user?.is_superuser ? (
    <Link
      to="/super-admin"
      className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 border-t border-gray-200 mt-auto"
    >
      <Shield className="w-5 h-5 mr-3 text-primary-600" />
      <span className="font-medium text-primary-600">Super Admin</span>
    </Link>
  ) : null

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-lg min-h-screen">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-primary-600">Mukhattat</h1>
            <p className="text-sm text-gray-500 mt-1">Project Management</p>
          </div>
          <nav className="mt-8 flex flex-col h-[calc(100vh-200px)]">
            <div className="flex-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 ${
                      isActive ? 'bg-primary-50 text-primary-600 border-r-2 border-primary-600' : ''
                    }`}
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </Link>
                )
              })}
            </div>
            {superAdminLink}
          </nav>
        </aside>

        {/* Main content */}
        <div className="flex-1">
          {/* Header */}
          <header className="bg-white shadow-sm">
            <div className="flex items-center justify-between px-8 py-4">
              <h2 className="text-xl font-semibold text-gray-800">
                {navigation.find(item => item.href === location.pathname)?.name || 'Dashboard'}
              </h2>
              <div className="flex items-center space-x-4">
                {/* Notifications Dropdown */}
                <div className="relative" ref={notificationsRef}>
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 text-gray-600 hover:text-primary-600 transition-colors"
                  >
                    <Bell className="w-6 h-6" />
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Dropdown Menu */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden flex flex-col">
                      {/* Header */}
                      <div className="flex items-center justify-between p-4 border-b border-gray-200">
                        <h3 className="font-semibold text-gray-900">Notifications</h3>
                        <div className="flex items-center space-x-2">
                          {unreadCount > 0 && (
                            <button
                              onClick={handleMarkAllAsRead}
                              disabled={markAllAsReadMutation.isLoading}
                              className="text-xs text-primary-600 hover:text-primary-700 font-medium disabled:opacity-50"
                            >
                              {markAllAsReadMutation.isLoading ? 'Marking...' : 'Mark all as read'}
                            </button>
                          )}
                          <button
                            onClick={() => setShowNotifications(false)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Notifications List */}
                      <div className="overflow-y-auto flex-1">
                        {notificationsLoading ? (
                          <div className="p-4 text-center text-gray-500 text-sm">Loading...</div>
                        ) : notifications.length === 0 ? (
                          <div className="p-8 text-center text-gray-500 text-sm">
                            <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                            <p>No new notifications</p>
                          </div>
                        ) : (
                          <div className="divide-y divide-gray-100">
                            {notifications.slice(0, 10).map((notification) => (
                              <div
                                key={notification.id}
                                onClick={() => handleNotificationClick(notification)}
                                className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                                  !notification.is_read ? 'bg-primary-50' : ''
                                }`}
                              >
                                <div className="flex items-start space-x-3">
                                  <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                                    !notification.is_read ? 'bg-primary-600' : 'bg-gray-300'
                                  }`} />
                                  <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-medium ${
                                      !notification.is_read ? 'text-gray-900' : 'text-gray-600'
                                    }`}>
                                      {notification.title}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                      {notification.message}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-2">
                                      {new Date(notification.created_at).toLocaleString()}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Footer */}
                      {notifications.length > 0 && (
                        <div className="p-3 border-t border-gray-200 text-center">
                          <Link
                            to="/notifications"
                            onClick={() => setShowNotifications(false)}
                            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                          >
                            View all notifications
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* User Menu */}
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 text-gray-700 hover:text-primary-600"
                >
                  <User className="w-5 h-5" />
                  <span className="text-sm font-medium">
                    {user?.first_name} {user?.last_name}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-gray-700 hover:text-red-600"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="text-sm">Logout</span>
                </button>
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}

