import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { login } from '../store/slices/authSlice'
import { getCompanyByEmail } from '../services/authService'
import toast from 'react-hot-toast'

export default function Login() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  })
  const [companyLogo, setCompanyLogo] = useState(null)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading } = useSelector((state) => state.auth)

  // Check if username/email is a company email and fetch logo
  useEffect(() => {
    const checkCompanyEmail = async () => {
      if (formData.username && formData.username.includes('@')) {
        try {
          const company = await getCompanyByEmail(formData.username)
          if (company?.logo_url) {
            setCompanyLogo(company.logo_url)
          } else {
            setCompanyLogo(null)
          }
        } catch (error) {
          // Not a company email or company doesn't exist
          setCompanyLogo(null)
        }
      } else {
        setCompanyLogo(null)
      }
    }

    const timeoutId = setTimeout(checkCompanyEmail, 500) // Debounce
    return () => clearTimeout(timeoutId)
  }, [formData.username])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const result = await dispatch(login(formData)).unwrap()
      toast.success('Login successful!')
      
      // Redirect based on user role
      const user = result.user
      if (user?.is_superuser) {
        navigate('/super-admin')
      } else if (user?.role === 'COMPANY_ADMIN' || user?.role === 'PROJECT_MANAGER') {
        navigate('/company-admin')
      } else if (user?.role === 'CONTRACTOR') {
        navigate('/contractor')
      } else if (user?.role === 'WORKER') {
        navigate('/worker')
      } else {
        navigate('/')
      }
    } catch (error) {
      toast.error(error.detail || 'Login failed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-6 sm:p-8">
        <div className="text-center mb-6 sm:mb-8">
          {companyLogo ? (
            <div className="mb-4">
              <img 
                src={companyLogo} 
                alt="Company Logo" 
                className="h-16 sm:h-20 w-auto mx-auto object-contain"
                onError={() => setCompanyLogo(null)}
              />
            </div>
          ) : (
            <h1 className="text-2xl sm:text-3xl font-bold text-primary-600 mb-2">Mukhattat</h1>
          )}
          <p className="text-sm sm:text-base text-gray-600">Real Estate Project Management</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Username or Email
            </label>
            <input
              id="username"
              type="text"
              required
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="input w-full"
              placeholder="Enter your username or company email"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="input w-full"
              placeholder="Enter your password"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="mt-4 sm:mt-6 text-center text-xs sm:text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
            Register
          </Link>
        </p>
      </div>
    </div>
  )
}

