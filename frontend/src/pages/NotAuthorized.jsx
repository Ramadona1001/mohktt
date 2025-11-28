import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Shield, ArrowLeft } from 'lucide-react'

export default function NotAuthorized() {
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)

  const getDashboardPath = () => {
    if (user?.is_superuser) return '/super-admin'
    if (user?.role === 'COMPANY_ADMIN' || user?.role === 'PROJECT_MANAGER') return '/company-admin'
    if (user?.role === 'CONTRACTOR') return '/contractor'
    if (user?.role === 'WORKER') return '/worker'
    return '/login'
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
        <div className="mb-6">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">
            You don't have permission to access this page.
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-600 mb-2">Your current role:</p>
          <p className="text-lg font-semibold text-primary-600">
            {user?.is_superuser ? 'Super Admin' : user?.role?.replace('_', ' ') || 'Unknown'}
          </p>
        </div>
        <button
          onClick={() => navigate(getDashboardPath())}
          className="btn btn-primary w-full flex items-center justify-center space-x-2"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Go to My Dashboard</span>
        </button>
      </div>
    </div>
  )
}

