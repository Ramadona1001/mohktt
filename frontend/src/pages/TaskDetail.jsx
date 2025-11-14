import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getTask, addComment, logTime, uploadAttachment } from '../services/taskService'
import { format } from 'date-fns'
import { MessageSquare, Clock, Paperclip, Send } from 'lucide-react'
import toast from 'react-hot-toast'

export default function TaskDetail() {
  const { id } = useParams()
  const queryClient = useQueryClient()
  const [commentText, setCommentText] = useState('')
  const [showTimeModal, setShowTimeModal] = useState(false)
  const [showAttachmentModal, setShowAttachmentModal] = useState(false)
  const [timeData, setTimeData] = useState({ hours: '', date: '', notes: '' })
  const [selectedFile, setSelectedFile] = useState(null)

  const { data: task, isLoading } = useQuery({
    queryKey: ['task', id],
    queryFn: () => getTask(id),
  })

  const commentMutation = useMutation({
    mutationFn: ({ taskId, commentData }) => addComment(taskId, commentData),
    onSuccess: () => {
      queryClient.invalidateQueries(['task', id])
      toast.success('Comment added!')
      setCommentText('')
    },
  })

  const timeMutation = useMutation({
    mutationFn: ({ taskId, timeData }) => logTime(taskId, timeData),
    onSuccess: () => {
      queryClient.invalidateQueries(['task', id])
      toast.success('Time logged successfully!')
      setShowTimeModal(false)
      setTimeData({ hours: '', date: '', notes: '' })
    },
  })

  const attachmentMutation = useMutation({
    mutationFn: ({ taskId, file }) => uploadAttachment(taskId, file),
    onSuccess: () => {
      queryClient.invalidateQueries(['task', id])
      toast.success('Attachment uploaded!')
      setShowAttachmentModal(false)
      setSelectedFile(null)
    },
    onError: (error) => {
      const errorMsg = error.response?.data?.file?.[0] || error.response?.data?.detail || 'Failed to upload attachment'
      toast.error(errorMsg)
    },
  })

  const handleCommentSubmit = (e) => {
    e.preventDefault()
    if (!commentText.trim()) return
    commentMutation.mutate({
      taskId: id,
      commentData: { content: commentText },
    })
  }

  const handleTimeSubmit = (e) => {
    e.preventDefault()
    timeMutation.mutate({
      taskId: id,
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
    attachmentMutation.mutate({ taskId: id, file: selectedFile })
  }

  if (isLoading) return <div className="text-center py-12">Loading task...</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{task?.title}</h1>
        <p className="text-gray-600 mt-2">{task?.description}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Task Information</h2>
          <div className="space-y-3">
            <div>
              <span className="text-sm text-gray-600">Status:</span>
              <p className="font-medium">{task?.status}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Priority:</span>
              <p className="font-medium">{task?.priority}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Department:</span>
              <p className="font-medium">{task?.department_name || 'N/A'}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Assigned To:</span>
              <p className="font-medium">{task?.assigned_to_name || 'Unassigned'}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Due Date:</span>
              <p className="font-medium">
                {task?.due_date ? format(new Date(task.due_date), 'MMM dd, yyyy') : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Time Tracking</h2>
          <div className="space-y-3">
            <div>
              <span className="text-sm text-gray-600">Estimated Hours:</span>
              <p className="font-medium">{task?.estimated_hours || 'N/A'}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Actual Hours:</span>
              <p className="font-medium">{task?.actual_hours || 'N/A'}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Total Logged:</span>
              <p className="font-medium">{task?.total_logged_hours || 0} hours</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Comments</h2>
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
        <div className="space-y-4">
          {task?.comments && task.comments.length > 0 ? (
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

      {/* Log Time Modal */}
      {showTimeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
    </div>
  )
}

