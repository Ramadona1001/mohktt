import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead, getUnreadCount } from '../services/notificationService'
import { Bell, Check, CheckCheck, Filter } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'

export default function Notifications() {
  const queryClient = useQueryClient()
  const [filter, setFilter] = useState('all') // all, unread, read

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications', filter],
    queryFn: () => getNotifications({ is_read: filter === 'unread' ? false : filter === 'read' ? true : undefined }),
  })

  const { data: unreadCount } = useQuery({
    queryKey: ['unread-count'],
    queryFn: () => getUnreadCount(),
  })

  const markReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications'])
      queryClient.invalidateQueries(['unread-count'])
      toast.success('Notification marked as read')
    },
  })

  const markAllReadMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications'])
      queryClient.invalidateQueries(['unread-count'])
      toast.success('All notifications marked as read')
    },
  })

  const handleMarkRead = (notificationId) => {
    markReadMutation.mutate(notificationId)
  }

  const handleMarkAllRead = () => {
    markAllReadMutation.mutate()
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'TASK_ASSIGNED':
      case 'TASK_COMPLETED':
      case 'TASK_DELAYED':
        return '✅'
      case 'DOCUMENT_UPLOADED':
      case 'DOCUMENT_APPROVED':
      case 'DOCUMENT_REJECTED':
        return '📄'
      case 'BLUEPRINT_UPLOADED':
      case 'BLUEPRINT_APPROVED':
      case 'BLUEPRINT_REJECTED':
        return '📐'
      default:
        return '🔔'
    }
  }

  const getNotificationLink = (notification) => {
    if (notification.content_type === 'task') {
      return `/tasks/${notification.object_id}`
    } else if (notification.content_type === 'document') {
      return `/documents`
    } else if (notification.content_type === 'blueprint') {
      return `/projects/${notification.object_id}`
    }
    return null
  }

  if (isLoading) return <div className="text-center py-12">Loading notifications...</div>

  const notificationList = notifications?.results || notifications || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-1">
            {unreadCount?.unread_count || 0} unread notification{unreadCount?.unread_count !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-white rounded-lg border border-gray-300 p-1">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded text-sm font-medium ${
                filter === 'all' ? 'bg-primary-500 text-white' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1 rounded text-sm font-medium ${
                filter === 'unread' ? 'bg-primary-500 text-white' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Unread
            </button>
            <button
              onClick={() => setFilter('read')}
              className={`px-3 py-1 rounded text-sm font-medium ${
                filter === 'read' ? 'bg-primary-500 text-white' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Read
            </button>
          </div>
          {unreadCount?.unread_count > 0 && (
            <button
              onClick={handleMarkAllRead}
              disabled={markAllReadMutation.isLoading}
              className="btn btn-secondary flex items-center space-x-2"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Mark All Read</span>
            </button>
          )}
        </div>
      </div>

      <div className="card">
        <div className="space-y-2">
          {notificationList.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No notifications found</p>
            </div>
          ) : (
            notificationList.map((notification) => {
              const link = getNotificationLink(notification)
              const NotificationContent = (
                <div
                  className={`p-4 rounded-lg border ${
                    notification.is_read
                      ? 'bg-gray-50 border-gray-200'
                      : 'bg-white border-primary-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="text-2xl mt-1">{getNotificationIcon(notification.notification_type)}</div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                          {!notification.is_read && (
                            <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
                          )}
                        </div>
                        <p className="text-gray-600 mt-1">{notification.message}</p>
                        <p className="text-sm text-gray-500 mt-2">
                          {format(new Date(notification.created_at), 'MMM dd, yyyy HH:mm')}
                        </p>
                      </div>
                    </div>
                    {!notification.is_read && (
                      <button
                        onClick={() => handleMarkRead(notification.id)}
                        className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="Mark as read"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              )

              return link ? (
                <Link key={notification.id} to={link} className="block">
                  {NotificationContent}
                </Link>
              ) : (
                <div key={notification.id}>{NotificationContent}</div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

