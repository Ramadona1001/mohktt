import { createSlice } from '@reduxjs/toolkit'

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    unreadCount: 0,
    notifications: [],
  },
  reducers: {
    setUnreadCount: (state, action) => {
      state.unreadCount = action.payload
    },
    setNotifications: (state, action) => {
      state.notifications = action.payload
    },
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload)
      state.unreadCount += 1
    },
    markAsRead: (state, action) => {
      const notification = state.notifications.find(n => n.id === action.payload)
      if (notification && !notification.is_read) {
        notification.is_read = true
        state.unreadCount = Math.max(0, state.unreadCount - 1)
      }
    },
  },
})

export const { setUnreadCount, setNotifications, addNotification, markAsRead } = notificationSlice.actions
export default notificationSlice.reducer

