import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getProject, uploadBlueprint, getProjectStatistics, createTaskFromLocation } from '../services/projectService'
import { getDepartments } from '../services/departmentService'
import { getUsers } from '../services/authService'
import BlueprintViewer from '../components/BlueprintViewer'
import TaskDetailModal from '../components/TaskDetailModal'
import { Upload, X } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ProjectDetail() {
  const { id } = useParams()
  const queryClient = useQueryClient()
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [clickedLocation, setClickedLocation] = useState(null)
  const [selectedTaskId, setSelectedTaskId] = useState(null)
  const [taskFormData, setTaskFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    status: 'PENDING',
    department: '',
    assigned_to: '',
    estimated_hours: '',
    due_date: '',
  })

  const { data: project, isLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: () => getProject(id),
  })

  const { data: statistics } = useQuery({
    queryKey: ['project-statistics', id],
    queryFn: () => getProjectStatistics(id),
  })

  const { data: departmentsData } = useQuery({
    queryKey: ['departments', id],
    queryFn: () => getDepartments(),
    enabled: !!project?.contractor, // Only fetch if contractor exists
  })

  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: () => getUsers(),
  })

  const uploadMutation = useMutation({
    mutationFn: ({ projectId, file }) => uploadBlueprint(projectId, file),
    onSuccess: () => {
      queryClient.invalidateQueries(['project', id])
      toast.success('Blueprint uploaded successfully!')
      setShowUploadModal(false)
      setSelectedFile(null)
    },
    onError: (error) => {
      const errorData = error.response?.data
      let errorMsg = 'Failed to upload blueprint'
      
      if (errorData) {
        if (errorData.error) {
          errorMsg = errorData.error
        } else if (errorData.file) {
          errorMsg = Array.isArray(errorData.file) ? errorData.file[0] : errorData.file
        } else if (errorData.detail) {
          errorMsg = errorData.detail
        }
      }
      
      toast.error(errorMsg)
    },
  })

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Check file size (50MB limit for blueprints)
      if (file.size > 50 * 1024 * 1024) {
        toast.error('File size exceeds 50MB limit for blueprints')
        return
      }
      setSelectedFile(file)
    }
  }

  const handleUpload = (e) => {
    e.preventDefault()
    if (!selectedFile) {
      toast.error('Please select a file')
      return
    }
    uploadMutation.mutate({ projectId: id, file: selectedFile })
  }

  const createTaskMutation = useMutation({
    mutationFn: (taskData) => createTaskFromLocation(id, taskData),
    onSuccess: () => {
      queryClient.invalidateQueries(['project', id])
      queryClient.invalidateQueries(['tasks'])
      toast.success('Task created successfully!')
      setShowTaskModal(false)
      setClickedLocation(null)
      setTaskFormData({
        title: '',
        description: '',
        priority: 'MEDIUM',
        status: 'PENDING',
        department: '',
        assigned_to: '',
        estimated_hours: '',
        due_date: '',
      })
    },
    onError: (error) => {
      const errorData = error.response?.data
      let errorMsg = 'Failed to create task'
      
      if (errorData) {
        if (errorData.error) {
          errorMsg = errorData.error
        } else if (errorData.title) {
          errorMsg = Array.isArray(errorData.title) ? errorData.title[0] : errorData.title
        } else if (errorData.detail) {
          errorMsg = errorData.detail
        }
      }
      
      toast.error(errorMsg)
    },
  })

  const handleBlueprintClick = (x, y) => {
    setClickedLocation({ x, y })
    setShowTaskModal(true)
  }

  const handleTaskSubmit = (e) => {
    e.preventDefault()
    if (!taskFormData.title.trim()) {
      toast.error('Task title is required')
      return
    }
    
    // Format due_date if provided
    let formattedDueDate = null
    if (taskFormData.due_date) {
      // Convert datetime-local format to ISO string
      formattedDueDate = new Date(taskFormData.due_date).toISOString()
    }
    
    const taskData = {
      ...taskFormData,
      x: clickedLocation.x,
      y: clickedLocation.y,
      estimated_hours: taskFormData.estimated_hours ? parseFloat(taskFormData.estimated_hours) : null,
      department: taskFormData.department || null,
      assigned_to: taskFormData.assigned_to || null,
      due_date: formattedDueDate,
    }
    
    createTaskMutation.mutate(taskData)
  }

  if (isLoading) return <div className="text-center py-12">Loading project...</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{project?.name}</h1>
        <p className="text-gray-600 mt-2">{project?.description}</p>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Blueprint</h2>
          <button
            onClick={() => setShowUploadModal(true)}
            className="btn btn-primary flex items-center space-x-2"
          >
            <Upload className="w-4 h-4" />
            <span>{project?.blueprint ? 'Replace Blueprint' : 'Upload Blueprint'}</span>
          </button>
        </div>
        {project?.blueprint ? (
          <BlueprintViewer
            blueprint={project.blueprint}
            onAddPin={handleBlueprintClick}
            canEdit={true}
            onPinClick={(pin) => {
              // If pin has tasks, open the first task in modal
              if (pin.task_count > 0 && pin.tasks && pin.tasks.length > 0) {
                setSelectedTaskId(pin.tasks[0].id)
              } else if (pin.task_count > 0) {
                // If we only have task_count but not tasks array, fetch the task
                // For now, just show a message
                toast.info(`Pin has ${pin.task_count} task(s). Click on the pin to view tasks.`)
              }
            }}
          />
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Upload className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p>No blueprint uploaded yet</p>
          </div>
        )}
      </div>

      {/* Task Detail Modal */}
      {selectedTaskId && (
        <TaskDetailModal
          taskId={selectedTaskId}
          onClose={() => setSelectedTaskId(null)}
        />
      )}

      {/* Create Task from Blueprint Location Modal */}
      {showTaskModal && clickedLocation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold">Create Task at Location</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Clicked at: ({clickedLocation.x.toFixed(3)}, {clickedLocation.y.toFixed(3)})
                </p>
              </div>
              <button
                onClick={() => {
                  setShowTaskModal(false)
                  setClickedLocation(null)
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleTaskSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  value={taskFormData.title}
                  onChange={(e) => setTaskFormData({ ...taskFormData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter task title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={taskFormData.description}
                  onChange={(e) => setTaskFormData({ ...taskFormData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows="3"
                  placeholder="Enter task description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={taskFormData.priority}
                    onChange={(e) => setTaskFormData({ ...taskFormData, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={taskFormData.status}
                    onChange={(e) => setTaskFormData({ ...taskFormData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="DELAYED">Delayed</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department
                  </label>
                  <select
                    value={taskFormData.department}
                    onChange={(e) => setTaskFormData({ ...taskFormData, department: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select Department</option>
                    {departmentsData?.results?.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                    {departmentsData && !departmentsData.results && departmentsData.map && departmentsData.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assign To
                  </label>
                  <select
                    value={taskFormData.assigned_to}
                    onChange={(e) => setTaskFormData({ ...taskFormData, assigned_to: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select User</option>
                    {usersData?.results?.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.first_name} {user.last_name} ({user.role})
                      </option>
                    ))}
                    {usersData && !usersData.results && usersData.map && usersData.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.first_name} {user.last_name} ({user.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estimated Hours
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={taskFormData.estimated_hours}
                    onChange={(e) => setTaskFormData({ ...taskFormData, estimated_hours: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="0.0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date
                  </label>
                  <input
                    type="datetime-local"
                    value={taskFormData.due_date}
                    onChange={(e) => setTaskFormData({ ...taskFormData, due_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={createTaskMutation.isLoading}
                  className="btn btn-primary flex-1"
                >
                  {createTaskMutation.isLoading ? 'Creating...' : 'Create Task'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowTaskModal(false)
                    setClickedLocation(null)
                  }}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Blueprint Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">
                {project?.blueprint ? 'Replace Blueprint' : 'Upload Blueprint'}
              </h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {project?.blueprint && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ⚠️ Replacing the blueprint will reset the review status to pending and notify reviewers again.
                </p>
              </div>
            )}
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  File (PDF, JPG, PNG - Max 50MB)
                </label>
                <input
                  type="file"
                  required
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png"
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
                  disabled={uploadMutation.isLoading}
                  className="btn btn-primary flex-1"
                >
                  {uploadMutation.isLoading ? 'Uploading...' : project?.blueprint ? 'Replace Blueprint' : 'Upload Blueprint'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Project Information</h2>
          <div className="space-y-3">
            <div>
              <span className="text-sm text-gray-600">Status:</span>
              <p className="font-medium">{project?.status}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Company:</span>
              <p className="font-medium">{project?.company_name}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Contractor:</span>
              <p className="font-medium">{project?.contractor_name || 'N/A'}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Progress:</span>
              <p className="font-medium">{statistics?.progress_percentage || project?.progress_percentage || 0}%</p>
            </div>
            {statistics && (
              <>
                <div>
                  <span className="text-sm text-gray-600">Total Tasks:</span>
                  <p className="font-medium">{statistics.total_tasks || 0}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Completed Tasks:</span>
                  <p className="font-medium text-green-600">{statistics.completed_tasks || 0}</p>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Tasks</h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Total Tasks</span>
              <span className="font-medium">{project?.task_count || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Completed</span>
              <span className="font-medium text-green-600">{project?.completed_task_count || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

