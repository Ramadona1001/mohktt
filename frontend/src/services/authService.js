import api from '../utils/api'

/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

// Login
export const login = async (credentials) => {
  const response = await api.post('/auth/login/', credentials)
  return response.data
}

// Register
export const register = async (userData) => {
  const response = await api.post('/auth/register/register/', userData)
  return response.data
}

// Refresh token
export const refreshToken = async (refreshToken) => {
  const response = await api.post('/auth/refresh/', { refresh: refreshToken })
  return response.data
}

// Get current user
export const getCurrentUser = async () => {
  const response = await api.get('/auth/users/me/')
  return response.data
}

// Get user profile
export const getUserProfile = async (userId) => {
  const response = await api.get(`/auth/users/${userId}/`)
  return response.data
}

// Update user profile
export const updateUserProfile = async (userId, userData) => {
  const response = await api.patch(`/auth/users/${userId}/`, userData)
  return response.data
}

// Change password
export const changePassword = async (passwordData) => {
  const response = await api.post('/auth/users/change-password/', passwordData)
  return response.data
}

// Get all users (admin only)
export const getUsers = async (params = {}) => {
  const response = await api.get('/auth/users/', { params })
  return response.data
}

// Create user (admin only)
export const createUser = async (userData) => {
  const response = await api.post('/auth/users/', userData)
  return response.data
}

// Delete user (admin only)
export const deleteUser = async (userId) => {
  const response = await api.delete(`/auth/users/${userId}/`)
  return response.data
}

// Get companies
export const getCompanies = async (params = {}) => {
  const response = await api.get('/auth/companies/', { params })
  return response.data
}

// Create company
export const createCompany = async (companyData) => {
  const response = await api.post('/auth/companies/', companyData)
  return response.data
}

// Get contractors
export const getContractors = async (params = {}) => {
  const response = await api.get('/auth/contractors/', { params })
  return response.data
}

// Create contractor
export const createContractor = async (contractorData) => {
  const response = await api.post('/auth/contractors/', contractorData)
  return response.data
}

// ========== Super Admin Functions ==========

// Get Super Admin dashboard statistics
export const getSuperAdminStats = async () => {
  const response = await api.get('/auth/super-admin/dashboard_stats/')
  return response.data
}

// Get all companies (Super Admin only)
export const getAllCompanies = async () => {
  const response = await api.get('/auth/super-admin/all_companies/')
  return response.data
}

// Get all users (Super Admin only)
export const getAllUsers = async () => {
  const response = await api.get('/auth/super-admin/all_users/')
  return response.data
}

// Get all contractors (Super Admin only)
export const getAllContractors = async () => {
  const response = await api.get('/auth/super-admin/all_contractors/')
  return response.data
}

// Activate/Deactivate company
export const toggleCompanyStatus = async (companyId, isActive) => {
  const response = await api.post(`/auth/super-admin/companies/${companyId}/activate/`, {
    is_active: isActive
  })
  return response.data
}

// Update user role and permissions
export const updateUserRole = async (userId, roleData) => {
  const response = await api.post(`/auth/super-admin/users/${userId}/update-role/`, roleData)
  return response.data
}

// Assign user to company
export const assignUserToCompany = async (userId, companyId) => {
  const response = await api.post(`/auth/super-admin/users/${userId}/assign-company/`, {
    company_id: companyId
  })
  return response.data
}

// Create company (Super Admin)
export const createCompanyAsSuperAdmin = async (companyData) => {
  // If companyData is FormData, send as multipart/form-data
  if (companyData instanceof FormData) {
    const response = await api.post('/auth/super-admin/create_company/', companyData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  }
  // Otherwise send as JSON
  const response = await api.post('/auth/super-admin/create_company/', companyData)
  return response.data
}

// Create user (Super Admin)
export const createUserAsSuperAdmin = async (userData) => {
  const response = await api.post('/auth/super-admin/create_user/', userData)
  return response.data
}

// Create contractor (Super Admin)
export const createContractorAsSuperAdmin = async (contractorData) => {
  const response = await api.post('/auth/super-admin/create_contractor/', contractorData)
  return response.data
}

// Get company by email (for login page)
export const getCompanyByEmail = async (email) => {
  const response = await api.get('/auth/super-admin/company-by-email/', {
    params: { email }
  })
  return response.data
}

// Update company (Super Admin)
export const updateCompanyAsSuperAdmin = async (companyId, companyData) => {
  // If companyData is FormData, send as multipart/form-data
  if (companyData instanceof FormData) {
    const response = await api.patch(`/auth/companies/${companyId}/`, companyData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  }
  // Otherwise send as JSON
  const response = await api.patch(`/auth/companies/${companyId}/`, companyData)
  return response.data
}

// Delete company (Super Admin)
export const deleteCompanyAsSuperAdmin = async (companyId) => {
  const response = await api.delete(`/auth/companies/${companyId}/`)
  return response.data
}

// Update user (Super Admin)
export const updateUserAsSuperAdmin = async (userId, userData) => {
  const response = await api.patch(`/auth/users/${userId}/`, userData)
  return response.data
}

// Delete user (Super Admin)
export const deleteUserAsSuperAdmin = async (userId) => {
  const response = await api.delete(`/auth/users/${userId}/`)
  return response.data
}

// Update contractor (Super Admin)
export const updateContractorAsSuperAdmin = async (contractorId, contractorData) => {
  const response = await api.patch(`/auth/contractors/${contractorId}/`, contractorData)
  return response.data
}

// Delete contractor (Super Admin)
export const deleteContractorAsSuperAdmin = async (contractorId) => {
  const response = await api.delete(`/auth/contractors/${contractorId}/`)
  return response.data
}

// Get roles and permissions (Super Admin)
export const getRolesPermissions = async () => {
  const response = await api.get('/auth/super-admin/roles_permissions/')
  return response.data
}

// Update role permissions (Super Admin)
export const updateRolePermissions = async (role, permissions) => {
  const response = await api.post('/auth/super-admin/update_role_permissions/', {
    role,
    permissions
  })
  return response.data
}

// Reset role permissions to defaults (Super Admin)
export const resetRolePermissions = async (role) => {
  const response = await api.post('/auth/super-admin/reset_role_permissions/', {
    role
  })
  return response.data
}

// Departments (Super Admin)
export const getAllDepartments = async () => {
  const response = await api.get('/auth/super-admin/all_departments/')
  return response.data
}

export const createDepartmentAsSuperAdmin = async (departmentData) => {
  const response = await api.post('/auth/super-admin/create_department/', departmentData)
  return response.data
}

export const updateDepartmentAsSuperAdmin = async (departmentId, departmentData) => {
  const response = await api.patch(`/auth/super-admin/update_department/${departmentId}/`, departmentData)
  return response.data
}

export const deleteDepartmentAsSuperAdmin = async (departmentId) => {
  const response = await api.delete(`/auth/super-admin/delete_department/${departmentId}/`)
  return response.data
}

export const assignWorkersToDepartment = async (departmentId, workerIds) => {
  const response = await api.post(`/auth/super-admin/assign_workers_to_department/${departmentId}/`, {
    worker_ids: workerIds
  })
  return response.data
}

// Super Admin Notifications
export const getSuperAdminNotifications = async (isRead = null) => {
  const params = isRead !== null ? `?is_read=${isRead}` : ''
  const response = await api.get(`/auth/super-admin/notifications/${params}`)
  return response.data
}

export const getSuperAdminUnreadNotificationsCount = async () => {
  const response = await api.get('/auth/super-admin/unread_notifications_count/')
  return response.data
}

