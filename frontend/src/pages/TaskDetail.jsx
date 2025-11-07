import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../utils/api'
import { format } from 'date-fns'

export default function TaskDetail() {
  const { id } = useParams()

  const { data: task, isLoading } = useQuery({
    queryKey: ['task', id],
    queryFn: async () => {
      const response = await api.get(`/tasks/${id}/`)
      return response.data
    },
  })

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

      {task?.comments && task.comments.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Comments</h2>
          <div className="space-y-4">
            {task.comments.map((comment) => (
              <div key={comment.id} className="border-l-4 border-primary-500 pl-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium">{comment.user_name}</p>
                  <p className="text-sm text-gray-600">
                    {format(new Date(comment.created_at), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
                <p className="text-gray-700">{comment.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

