import api from '../utils/api'

/**
 * Task Service
 * Handles all task, time entry, and attachment-related API calls
 */

// Get all tasks
export const getTasks = async (params = {}) => {
  const response = await api.get('/tasks/', { params })
  return response.data
}

// Get task by ID
export const getTask = async (taskId) => {
  const response = await api.get(`/tasks/${taskId}/`)
  return response.data
}

// Create task
export const createTask = async (taskData) => {
  const response = await api.post('/tasks/', taskData)
  return response.data
}

// Update task
export const updateTask = async (taskId, taskData) => {
  const response = await api.patch(`/tasks/${taskId}/`, taskData)
  return response.data
}

// Delete task
export const deleteTask = async (taskId) => {
  const response = await api.delete(`/tasks/${taskId}/`)
  return response.data
}

// Log time for task
export const logTime = async (taskId, timeData) => {
  const response = await api.post(`/tasks/${taskId}/log_time/`, timeData)
  return response.data
}

// Add comment to task
export const addComment = async (taskId, commentData) => {
  const response = await api.post(`/tasks/${taskId}/add_comment/`, commentData)
  return response.data
}

// Upload attachment to task
export const uploadAttachment = async (taskId, file) => {
  const formData = new FormData()
  formData.append('file', file)
  const response = await api.post(`/tasks/${taskId}/upload_attachment/`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

// Update task status
export const updateTaskStatus = async (taskId, status) => {
  const response = await api.patch(`/tasks/${taskId}/update_status/`, { status })
  return response.data
}

// Get my tasks
export const getMyTasks = async (params = {}) => {
  const response = await api.get('/tasks/my_tasks/', { params })
  return response.data
}

// Get overdue tasks
export const getOverdueTasks = async (params = {}) => {
  const response = await api.get('/tasks/overdue/', { params })
  return response.data
}

// Get task statistics
export const getTaskStatistics = async (params = {}) => {
  const response = await api.get('/tasks/statistics/', { params })
  return response.data
}

// Time Entry Service
// Get all time entries
export const getTimeEntries = async (params = {}) => {
  const response = await api.get('/tasks/time-entries/', { params })
  return response.data
}

// Get time entry by ID
export const getTimeEntry = async (timeEntryId) => {
  const response = await api.get(`/tasks/time-entries/${timeEntryId}/`)
  return response.data
}

// Create time entry
export const createTimeEntry = async (timeEntryData) => {
  const response = await api.post('/tasks/time-entries/', timeEntryData)
  return response.data
}

// Update time entry
export const updateTimeEntry = async (timeEntryId, timeEntryData) => {
  const response = await api.patch(`/tasks/time-entries/${timeEntryId}/`, timeEntryData)
  return response.data
}

// Delete time entry
export const deleteTimeEntry = async (timeEntryId) => {
  const response = await api.delete(`/tasks/time-entries/${timeEntryId}/`)
  return response.data
}

