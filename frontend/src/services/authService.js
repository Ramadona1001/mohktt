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

