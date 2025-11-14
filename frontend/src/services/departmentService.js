import api from '../utils/api'

/**
 * Department Service
 * Handles all department-related API calls
 */

// Get all departments
export const getDepartments = async (params = {}) => {
  const response = await api.get('/departments/', { params })
  return response.data
}

// Get department by ID
export const getDepartment = async (departmentId) => {
  const response = await api.get(`/departments/${departmentId}/`)
  return response.data
}

// Create department
export const createDepartment = async (departmentData) => {
  const response = await api.post('/departments/', departmentData)
  return response.data
}

// Update department
export const updateDepartment = async (departmentId, departmentData) => {
  const response = await api.patch(`/departments/${departmentId}/`, departmentData)
  return response.data
}

// Delete department
export const deleteDepartment = async (departmentId) => {
  const response = await api.delete(`/departments/${departmentId}/`)
  return response.data
}

