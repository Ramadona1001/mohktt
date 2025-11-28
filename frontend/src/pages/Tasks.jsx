import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getTasks, createTask, updateTaskStatus } from '../services/taskService'
import { CheckSquare, Plus, LayoutGrid, List } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import KanbanBoard from '../components/KanbanBoard'
import TaskDetailModal from '../components/TaskDetailModal'

export default function Tasks() {
  const queryClient = useQueryClient()
  const [viewMode, setViewMode] = useState('kanban') // 'kanban' or 'list'
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedTaskId, setSelectedTaskId] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    status: 'PENDING',
  })

  const { data, isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => getTasks(),
  })

  const createMutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks'])
      toast.success('Task created successfully!')
      setShowCreateModal(false)
      setFormData({ title: '', description: '', priority: 'MEDIUM', status: 'PENDING' })
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to create task')
    },
  })

  const statusMutation = useMutation({
    mutationFn: ({ taskId, status }) => updateTaskStatus(taskId, status),
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks'])
      toast.success('Task status updated!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to update task status')
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    createMutation.mutate(formData)
  }

  const handleStatusChange = (taskId, newStatus) => {
    statusMutation.mutate({ taskId, status: newStatus })
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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'URGENT':
        return 'text-red-600'
      case 'HIGH':
        return 'text-orange-600'
      case 'MEDIUM':
        return 'text-yellow-600'
      default:
        return 'text-gray-600'
    }
  }

  if (isLoading) return <div className="text-center py-12">Loading tasks...</div>

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Tasks</h1>
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-2 rounded ${
                viewMode === 'kanban'
                  ? 'bg-white shadow-sm text-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Kanban View"
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${
                viewMode === 'list'
                  ? 'bg-white shadow-sm text-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="List View"
            >
              <List className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary flex items-center space-x-2 flex-1 sm:flex-initial"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">New Task</span>
            <span className="sm:hidden">New</span>
          </button>
        </div>
      </div>

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl sm:text-2xl font-bold mb-4">Create New Task</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <button
                  type="submit"
                  disabled={createMutation.isLoading}
                  className="btn btn-primary flex-1"
                >
                  {createMutation.isLoading ? 'Creating...' : 'Create Task'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Kanban View */}
      {viewMode === 'kanban' ? (
        <div className="card p-0 overflow-hidden">
          <KanbanBoard
            tasks={data}
            onStatusChange={handleStatusChange}
            isLoading={isLoading}
          />
        </div>
      ) : (
        /* List View */
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Title</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Project</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Department</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Priority</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Due Date</th>
                </tr>
              </thead>
              <tbody>
                {data?.results?.map((task) => (
                  <tr key={task.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 cursor-pointer" onClick={() => setSelectedTaskId(task.id)}>
                      <button className="font-medium text-primary-600 hover:text-primary-700 text-left">
                        {task.title}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{task.project_name}</td>
                    <td className="py-3 px-4 text-gray-600">{task.department_name || 'N/A'}</td>
                    <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task.id, e.target.value)}
                        className={`px-2 py-1 text-xs rounded-full border-0 ${getStatusColor(task.status)} cursor-pointer`}
                      >
                        <option value="PENDING">Pending</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="DELAYED">Delayed</option>
                      </select>
                    </td>
                    <td className={`py-3 px-4 font-medium ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {task.due_date ? format(new Date(task.due_date), 'MMM dd, yyyy') : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {data?.results?.length === 0 && (
        <div className="text-center py-12">
          <CheckSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No tasks found.</p>
        </div>
      )}

      {/* Task Detail Modal */}
      {selectedTaskId && (
        <TaskDetailModal
          taskId={selectedTaskId}
          onClose={() => setSelectedTaskId(null)}
        />
      )}
    </div>
  )
}

