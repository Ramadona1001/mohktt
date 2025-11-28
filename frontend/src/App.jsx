import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useEffect } from 'react'
import { getCurrentUser } from './store/slices/authSlice'
import SuperAdminLayout from './components/SuperAdminLayout'
import CompanyAdminLayout from './components/CompanyAdminLayout'
import ContractorLayout from './components/ContractorLayout'
import WorkerLayout from './components/WorkerLayout'
import Login from './pages/Login'
import Register from './pages/Register'
import Projects from './pages/Projects'
import ProjectDetail from './pages/ProjectDetail'
import Tasks from './pages/Tasks'
import TaskDetail from './pages/TaskDetail'
import Documents from './pages/Documents'
import Reports from './pages/Reports'
import Notifications from './pages/Notifications'
import Profile from './pages/Profile'
import SuperAdmin from './pages/SuperAdmin'
import CompanyAdminDashboard from './pages/CompanyAdminDashboard'
import ContractorDashboard from './pages/ContractorDashboard'
import WorkerDashboard from './pages/WorkerDashboard'
import NotAuthorized from './pages/NotAuthorized'

function PrivateRoute({ children, allowedRoles = [], requireSuperAdmin = false }) {
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth)
  const token = localStorage.getItem('access_token')
  
  // Show loading while fetching user data
  if (token && isAuthenticated && !user && loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }
  
  // If requireSuperAdmin is true, only superuser can access
  if (requireSuperAdmin && user && !user.is_superuser) {
    return <NotAuthorized />
  }
  
  // If requireSuperAdmin is true and user is superuser, allow access
  if (requireSuperAdmin && user?.is_superuser) {
    return children
  }
  
  // If no roles specified, check if user is superuser (superuser can access everything except super-admin routes)
  if (allowedRoles.length === 0) {
    return children
  }
  
  // Check if user's role is allowed
  if (user && !allowedRoles.includes(user.role)) {
    return <NotAuthorized />
  }
  
  return children
}

function RoleBasedRedirect() {
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth)
  const token = localStorage.getItem('access_token')
  
  // Show loading while fetching user data
  if (token && isAuthenticated && !user && loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }
  
  if (user?.is_superuser) {
    return <Navigate to="/super-admin" replace />
  } else if (user?.role === 'COMPANY_ADMIN' || user?.role === 'PROJECT_MANAGER') {
    return <Navigate to="/company-admin" replace />
  } else if (user?.role === 'CONTRACTOR') {
    return <Navigate to="/contractor" replace />
  } else if (user?.role === 'WORKER') {
    return <Navigate to="/worker" replace />
  }
  
  return <Navigate to="/login" replace />
}

function App() {
  const dispatch = useDispatch()
  const { isAuthenticated, user } = useSelector((state) => state.auth)

  // Fetch user data on app load if token exists but user data is missing
  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token && !user) {
      dispatch(getCurrentUser())
    }
  }, [dispatch, user])

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<RoleBasedRedirect />} />
        
        {/* Super Admin Routes - Only for superusers */}
        <Route
          path="/super-admin"
          element={
            <PrivateRoute requireSuperAdmin={true}>
              <SuperAdminLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<SuperAdmin />} />
        </Route>

        {/* Company Admin / Project Manager Routes - Only for COMPANY_ADMIN and PROJECT_MANAGER */}
        <Route
          path="/company-admin"
          element={
            <PrivateRoute allowedRoles={['COMPANY_ADMIN', 'PROJECT_MANAGER']} requireSuperAdmin={false}>
              <CompanyAdminLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<CompanyAdminDashboard />} />
          <Route path="projects" element={<Projects />} />
          <Route path="projects/:id" element={<ProjectDetail />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="tasks/:id" element={<TaskDetail />} />
          <Route path="documents" element={<Documents />} />
          <Route path="reports" element={<Reports />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Contractor Routes - Only for CONTRACTOR */}
        <Route
          path="/contractor"
          element={
            <PrivateRoute allowedRoles={['CONTRACTOR']} requireSuperAdmin={false}>
              <ContractorLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<ContractorDashboard />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="tasks/:id" element={<TaskDetail />} />
          <Route path="workers" element={<div>Workers Management</div>} />
          <Route path="reports" element={<Reports />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Worker Routes - Only for WORKER */}
        <Route
          path="/worker"
          element={
            <PrivateRoute allowedRoles={['WORKER']} requireSuperAdmin={false}>
              <WorkerLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<WorkerDashboard />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="tasks/:id" element={<TaskDetail />} />
          <Route path="time" element={<div>Time Tracking</div>} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App

