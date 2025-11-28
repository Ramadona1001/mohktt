import { useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../store/slices/authSlice'
import { 
  Shield,
  Building2,
  Users,
  Briefcase,
  BarChart3,
  User,
  LogOut,
  Home,
  Menu,
  X,
  Settings
} from 'lucide-react'

export default function SuperAdminLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
    { id: 'companies', name: 'Companies', icon: Building2 },
    { id: 'users', name: 'Users', icon: Users },
    { id: 'contractors', name: 'Contractors', icon: Briefcase },
    { id: 'roles-permissions', name: 'Roles & Permissions', icon: Settings },
  ]

  const currentTab = new URLSearchParams(location.search).get('tab') || 'dashboard'

  return (
    <div className="min-h-screen bg-gray-50 flex">
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
        w-64 bg-gradient-to-b from-primary-600 to-primary-800 shadow-xl
        transform transition-transform duration-300 ease-in-out
        h-screen lg:h-auto
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 lg:p-6 flex-shrink-0">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                <Shield className="w-6 h-6 lg:w-8 lg:h-8 text-white flex-shrink-0" />
                <h1 className="text-xl lg:text-2xl font-bold text-white">Super Admin</h1>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-white hover:text-gray-200 flex-shrink-0"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <p className="text-xs lg:text-sm text-primary-100">System Management</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 mt-4 lg:mt-8 overflow-y-auto px-2">
            {navigation.map((item) => {
              const isActive = currentTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    navigate(`/super-admin?tab=${item.id}`)
                    setSidebarOpen(false)
                  }}
                  className={`w-full flex items-center px-4 lg:px-6 py-3 text-left text-gray-100 hover:bg-primary-700 transition-colors rounded-lg mb-1 ${
                    isActive ? 'bg-primary-700 border-r-4 border-white' : ''
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
                  <span className="text-sm lg:text-base whitespace-nowrap">{item.name}</span>
                </button>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 lg:p-6 border-t border-primary-500 flex-shrink-0">
            <Link
              to="/"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center px-4 py-2 text-gray-100 hover:bg-primary-700 rounded-lg transition-colors mb-2"
            >
              <Home className="w-5 h-5 mr-3 flex-shrink-0" />
              <span className="text-sm">Back to Dashboard</span>
            </Link>
            <div className="flex items-center justify-between px-4 py-2 text-gray-100">
              <div className="flex items-center space-x-2 min-w-0">
                <User className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs lg:text-sm truncate">{user?.username}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-100 hover:text-white flex-shrink-0"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-xs lg:text-sm hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-0">
        {/* Header */}
        <header className="bg-white shadow-sm border-b sticky top-0 z-30 flex-shrink-0">
          <div className="flex items-center justify-between px-4 lg:px-8 py-3 lg:py-4">
            <div className="flex items-center space-x-3 min-w-0">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-600 hover:text-gray-900 flex-shrink-0"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h2 className="text-lg lg:text-xl font-semibold text-gray-800 truncate">
                {navigation.find(item => item.id === currentTab)?.name || 'Super Admin Dashboard'}
              </h2>
            </div>
            <div className="flex items-center space-x-2 lg:space-x-4 flex-shrink-0">
              <span className="text-xs lg:text-sm text-gray-600 hidden sm:inline">
                Logged in as: <span className="font-medium text-primary-600">{user?.username}</span>
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

