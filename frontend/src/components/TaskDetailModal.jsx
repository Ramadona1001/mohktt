import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getTask, addComment, logTime, uploadAttachment, updateTaskStatus } from '../services/taskService'
import { format } from 'date-fns'
import { X, MessageSquare, Clock, Paperclip, Send, CheckCircle2, Circle, AlertCircle, Timer } from 'lucide-react'
import toast from 'react-hot-toast'

export default function TaskDetailModal({ taskId, onClose }) {
  const queryClient = useQueryClient()
  const [commentText, setCommentText] = useState('')
  const [showTimeModal, setShowTimeModal] = useState(false)
  const [showAttachmentModal, setShowAttachmentModal] = useState(false)
  const [timeData, setTimeData] = useState({ hours: '', date: new Date().toISOString().split('T')[0], notes: '' })
  const [selectedFile, setSelectedFile] = useState(null)

  const { data: task, isLoading } = useQuery({
    queryKey: ['task', taskId],
    queryFn: () => getTask(taskId),
    enabled: !!taskId,
  })

  const commentMutation = useMutation({
    mutationFn: ({ taskId, commentData }) => addComment(taskId, commentData),
    onSuccess: () => {
      queryClient.invalidateQueries(['task', taskId])
      queryClient.invalidateQueries(['tasks'])
      toast.success('Comment added!')
      setCommentText('')
    },
  })

  const timeMutation = useMutation({
    mutationFn: ({ taskId, timeData }) => logTime(taskId, timeData),
    onSuccess: () => {
      queryClient.invalidateQueries(['task', taskId])
      queryClient.invalidateQueries(['tasks'])
      toast.success('Time logged successfully!')
      setShowTimeModal(false)
      setTimeData({ hours: '', date: new Date().toISOString().split('T')[0], notes: '' })
    },
  })

  const attachmentMutation = useMutation({
    mutationFn: ({ taskId, file }) => uploadAttachment(taskId, file),
    onSuccess: () => {
      queryClient.invalidateQueries(['task', taskId])
      queryClient.invalidateQueries(['tasks'])
      toast.success('Attachment uploaded!')
      setShowAttachmentModal(false)
      setSelectedFile(null)
    },
    onError: (error) => {
      const errorMsg = error.response?.data?.file?.[0] || error.response?.data?.detail || 'Failed to upload attachment'
      toast.error(errorMsg)
    },
  })

  const statusMutation = useMutation({
    mutationFn: ({ taskId, status }) => updateTaskStatus(taskId, status),
    onSuccess: () => {
      queryClient.invalidateQueries(['task', taskId])
      queryClient.invalidateQueries(['tasks'])
      toast.success('Task status updated!')
    },
  })

  const handleCommentSubmit = (e) => {
    e.preventDefault()
    if (!commentText.trim()) return
    commentMutation.mutate({
      taskId,
      commentData: { content: commentText },
    })
  }

  const handleTimeSubmit = (e) => {
    e.preventDefault()
    timeMutation.mutate({
      taskId,
      timeData: {
        hours: parseFloat(timeData.hours),
        date: timeData.date,
        notes: timeData.notes,
      },
    })
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size exceeds 10MB limit')
        return
      }
      setSelectedFile(file)
    }
  }

  const handleAttachmentSubmit = (e) => {
    e.preventDefault()
    if (!selectedFile) {
      toast.error('Please select a file')
      return
    }
    attachmentMutation.mutate({ taskId, file: selectedFile })
  }

  const handleStatusChange = (newStatus) => {
    statusMutation.mutate({ taskId, status: newStatus })
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />
      case 'IN_PROGRESS':
        return <Timer className="w-5 h-5 text-blue-600" />
      case 'DELAYED':
        return <AlertCircle className="w-5 h-5 text-red-600" />
      default:
        return <Circle className="w-5 h-5 text-gray-600" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800'
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800'
      case 'DELAYED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">Loading task...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!task) {
    return null
  }

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
        <div
          className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                {getStatusIcon(task.status)}
                <h2 className="text-2xl font-bold text-gray-900">{task.title}</h2>
              </div>
              {task.description && (
                <p className="text-gray-600 mt-2">{task.description}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Status Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={task.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className={`px-3 py-2 rounded-md border-0 ${getStatusColor(task.status)} cursor-pointer font-medium`}
            >
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="DELAYED">Delayed</option>
            </select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Task Information */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Task Information</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-600">Project:</span>
                  <p className="font-medium">{task.project_name}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Priority:</span>
                  <p className="font-medium">{task.priority}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Department:</span>
                  <p className="font-medium">{task.department_name || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Assigned To:</span>
                  <p className="font-medium">{task.assigned_to_name || 'Unassigned'}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Due Date:</span>
                  <p className="font-medium">
                    {task.due_date ? format(new Date(task.due_date), 'MMM dd, yyyy') : 'N/A'}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Created By:</span>
                  <p className="font-medium">{task.created_by_name || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Time Tracking */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Time Tracking</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-600">Estimated Hours:</span>
                  <p className="font-medium">{task.estimated_hours || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Actual Hours:</span>
                  <p className="font-medium">{task.actual_hours || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Total Logged:</span>
                  <p className="font-medium">{task.total_logged_hours || 0} hours</p>
                </div>
                {task.is_overdue && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800 font-medium">⚠️ This task is overdue</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div className="card mb-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
              <MessageSquare className="w-5 h-5" />
              <span>Comments</span>
            </h3>
            <form onSubmit={handleCommentSubmit} className="mb-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button type="submit" className="btn btn-primary flex items-center space-x-2">
                  <Send className="w-4 h-4" />
                  <span>Send</span>
                </button>
              </div>
            </form>
            <div className="space-y-4 max-h-64 overflow-y-auto">
              {task.comments && task.comments.length > 0 ? (
                task.comments.map((comment) => (
                  <div key={comment.id} className="border-l-4 border-primary-500 pl-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">{comment.user_name}</p>
                      <p className="text-sm text-gray-600">
                        {format(new Date(comment.created_at), 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                    <p className="text-gray-700">{comment.content}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No comments yet</p>
              )}
            </div>
          </div>

          {/* Attachments Section */}
          {task.attachments && task.attachments.length > 0 && (
            <div className="card mb-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                <Paperclip className="w-5 h-5" />
                <span>Attachments</span>
              </h3>
              <div className="space-y-2">
                {task.attachments.map((attachment) => (
                  <div key={attachment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Paperclip className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="font-medium text-sm">{attachment.file_name}</p>
                        <p className="text-xs text-gray-500">
                          Uploaded by {attachment.uploaded_by_name} on{' '}
                          {format(new Date(attachment.uploaded_at), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>
                    <a
                      href={attachment.file.startsWith('http') ? attachment.file : `http://localhost:8000${attachment.file}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700 text-sm"
                    >
                      Download
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={() => setShowTimeModal(true)}
              className="btn btn-secondary flex items-center space-x-2"
            >
              <Clock className="w-4 h-4" />
              <span>Log Time</span>
            </button>
            <button
              onClick={() => setShowAttachmentModal(true)}
              className="btn btn-secondary flex items-center space-x-2"
            >
              <Paperclip className="w-4 h-4" />
              <span>Upload Attachment</span>
            </button>
          </div>
        </div>
      </div>

      {/* Log Time Modal */}
      {showTimeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Log Time</h2>
            <form onSubmit={handleTimeSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hours</label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={timeData.hours}
                  onChange={(e) => setTimeData({ ...timeData, hours: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={timeData.date}
                  onChange={(e) => setTimeData({ ...timeData, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={timeData.notes}
                  onChange={(e) => setTimeData({ ...timeData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows="3"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={timeMutation.isLoading}
                  className="btn btn-primary flex-1"
                >
                  {timeMutation.isLoading ? 'Logging...' : 'Log Time'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowTimeModal(false)}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Attachment Modal */}
      {showAttachmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Upload Attachment</h2>
            <form onSubmit={handleAttachmentSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  File (Max 10MB)
                </label>
                <input
                  type="file"
                  required
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {selectedFile && (
                  <p className="text-sm text-gray-600 mt-1">
                    Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={attachmentMutation.isLoading}
                  className="btn btn-primary flex-1"
                >
                  {attachmentMutation.isLoading ? 'Uploading...' : 'Upload'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAttachmentModal(false)}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

