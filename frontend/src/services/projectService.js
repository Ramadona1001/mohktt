import api from '../utils/api'

/**
 * Project Service
 * Handles all project and blueprint-related API calls
 */

// Get all projects
export const getProjects = async (params = {}) => {
  const response = await api.get('/projects/', { params })
  return response.data
}

// Get project by ID
export const getProject = async (projectId) => {
  const response = await api.get(`/projects/${projectId}/`)
  return response.data
}

// Create project
export const createProject = async (projectData) => {
  const response = await api.post('/projects/', projectData)
  return response.data
}

// Update project
export const updateProject = async (projectId, projectData) => {
  const response = await api.patch(`/projects/${projectId}/`, projectData)
  return response.data
}

// Delete project
export const deleteProject = async (projectId) => {
  const response = await api.delete(`/projects/${projectId}/`)
  return response.data
}

// Upload blueprint
export const uploadBlueprint = async (projectId, file) => {
  const formData = new FormData()
  formData.append('file', file)
  const response = await api.post(`/projects/${projectId}/upload_blueprint/`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

// Delete blueprint
export const deleteBlueprint = async (projectId) => {
  const response = await api.delete(`/projects/${projectId}/delete_blueprint/`)
  return response.data
}

// Approve blueprint
export const approveBlueprint = async (projectId, notes = '') => {
  const response = await api.post(`/projects/${projectId}/approve_blueprint/`, { notes })
  return response.data
}

// Reject blueprint
export const rejectBlueprint = async (projectId, notes = '') => {
  const response = await api.post(`/projects/${projectId}/reject_blueprint/`, { notes })
  return response.data
}

// Request blueprint modification
export const requestBlueprintModification = async (projectId, notes = '') => {
  const response = await api.post(`/projects/${projectId}/request_blueprint_modification/`, { notes })
  return response.data
}

// Get project statistics
export const getProjectStatistics = async (projectId) => {
  const response = await api.get(`/projects/${projectId}/statistics/`)
  return response.data
}

// Get all pins
export const getPins = async (params = {}) => {
  const response = await api.get('/projects/pins/', { params })
  return response.data
}

// Get pin by ID
export const getPin = async (pinId) => {
  const response = await api.get(`/projects/pins/${pinId}/`)
  return response.data
}

// Create pin
export const createPin = async (pinData) => {
  const response = await api.post('/projects/pins/', pinData)
  return response.data
}

// Update pin
export const updatePin = async (pinId, pinData) => {
  const response = await api.patch(`/projects/pins/${pinId}/`, pinData)
  return response.data
}

// Delete pin
export const deletePin = async (pinId) => {
  const response = await api.delete(`/projects/pins/${pinId}/`)
  return response.data
}

// Create task from blueprint location
export const createTaskFromLocation = async (projectId, taskData) => {
  const response = await api.post(`/projects/${projectId}/create_task_from_location/`, taskData)
  return response.data
}

