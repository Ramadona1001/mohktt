import api from '../utils/api'

/**
 * Notification Service
 * Handles all notification-related API calls
 */

// Get all notifications
export const getNotifications = async (params = {}) => {
  // Convert is_read boolean to string for query param
  const queryParams = { ...params }
  if (queryParams.is_read !== undefined) {
    queryParams.is_read = queryParams.is_read.toString()
  }
  const response = await api.get('/notifications/', { params: queryParams })
  return response.data
}

// Get notification by ID
export const getNotification = async (notificationId) => {
  const response = await api.get(`/notifications/${notificationId}/`)
  return response.data
}

// Mark notification as read
export const markNotificationAsRead = async (notificationId) => {
  const response = await api.post(`/notifications/${notificationId}/mark_read/`)
  return response.data
}

// Mark all notifications as read
export const markAllNotificationsAsRead = async () => {
  const response = await api.post('/notifications/mark_all_read/')
  return response.data
}

// Get unread count
export const getUnreadCount = async () => {
  const response = await api.get('/notifications/unread_count/')
  return response.data
}

// Delete notification
export const deleteNotification = async (notificationId) => {
  const response = await api.delete(`/notifications/${notificationId}/`)
  return response.data
}

