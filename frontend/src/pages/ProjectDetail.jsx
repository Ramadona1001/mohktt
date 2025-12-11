import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  getProject, 
  uploadBlueprint, 
  getProjectStatistics, 
  createTaskFromLocation,
  approveBlueprint,
  rejectBlueprint,
  requestBlueprintModification,
  getPins,
  createPin,
  updatePin,
  deletePin
} from '../services/projectService'
import { getDepartments } from '../services/departmentService'
import { getUsers } from '../services/authService'
import { getTasks } from '../services/taskService'
import BlueprintViewer from '../components/BlueprintViewer'
import TaskDetailModal from '../components/TaskDetailModal'
import { 
  Upload, 
  X, 
  Check, 
  XCircle, 
  Edit, 
  Trash2, 
  Pin as PinIcon,
  FileText,
  BarChart3,
  FolderKanban,
  Plus
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function ProjectDetail() {
  const { id } = useParams()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('overview')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [showPinModal, setShowPinModal] = useState(false)
  const [editingPin, setEditingPin] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [clickedLocation, setClickedLocation] = useState(null)
  const [selectedTaskId, setSelectedTaskId] = useState(null)
  const [reviewNotes, setReviewNotes] = useState('')
  const [pinFormData, setPinFormData] = useState({
    label: '',
    description: '',
    x: 0,
    y: 0,
  })
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

  const { data: pins } = useQuery({
    queryKey: ['pins', id],
    queryFn: () => getPins({ project: id }),
    enabled: activeTab === 'pins' && !!id,
  })

  const { data: tasks } = useQuery({
    queryKey: ['project-tasks', id],
    queryFn: () => getTasks({ project: id }),
    enabled: activeTab === 'tasks' && !!id,
  })

  const { data: departmentsData } = useQuery({
    queryKey: ['departments', id],
    queryFn: () => getDepartments(),
    enabled: !!project?.contractor,
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

  const approveMutation = useMutation({
    mutationFn: ({ projectId, notes }) => approveBlueprint(projectId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries(['project', id])
      toast.success('Blueprint approved!')
      setShowReviewModal(false)
      setReviewNotes('')
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to approve blueprint')
    },
  })

  const rejectMutation = useMutation({
    mutationFn: ({ projectId, notes }) => rejectBlueprint(projectId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries(['project', id])
      toast.success('Blueprint rejected!')
      setShowReviewModal(false)
      setReviewNotes('')
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to reject blueprint')
    },
  })

  const requestModificationMutation = useMutation({
    mutationFn: ({ projectId, notes }) => requestBlueprintModification(projectId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries(['project', id])
      toast.success('Modification requested!')
      setShowReviewModal(false)
      setReviewNotes('')
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to request modification')
    },
  })

  const createPinMutation = useMutation({
    mutationFn: (pinData) => createPin({ ...pinData, project: id }),
    onSuccess: () => {
      queryClient.invalidateQueries(['pins', id])
      toast.success('Pin created!')
      setShowPinModal(false)
      setPinFormData({ label: '', description: '', x: 0, y: 0 })
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to create pin')
    },
  })

  const updatePinMutation = useMutation({
    mutationFn: ({ pinId, pinData }) => updatePin(pinId, pinData),
    onSuccess: () => {
      queryClient.invalidateQueries(['pins', id])
      toast.success('Pin updated!')
      setShowPinModal(false)
      setEditingPin(null)
      setPinFormData({ label: '', description: '', x: 0, y: 0 })
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to update pin')
    },
  })

  const deletePinMutation = useMutation({
    mutationFn: (pinId) => deletePin(pinId),
    onSuccess: () => {
      queryClient.invalidateQueries(['pins', id])
      toast.success('Pin deleted!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to delete pin')
    },
  })

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
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

  const handleBlueprintClick = (x, y) => {
    if (activeTab === 'pins') {
      setPinFormData({ ...pinFormData, x, y })
      setShowPinModal(true)
    } else {
      setClickedLocation({ x, y })
      setShowTaskModal(true)
    }
  }

  const handlePinSubmit = (e) => {
    e.preventDefault()
    if (editingPin) {
      updatePinMutation.mutate({ pinId: editingPin.id, pinData: pinFormData })
    } else {
      createPinMutation.mutate(pinFormData)
    }
  }

  const handleEditPin = (pin) => {
    setEditingPin(pin)
    setPinFormData({
      label: pin.label || '',
      description: pin.description || '',
      x: pin.x,
      y: pin.y,
    })
    setShowPinModal(true)
  }

  const handleDeletePin = (pinId) => {
    if (window.confirm('Are you sure you want to delete this pin?')) {
      deletePinMutation.mutate(pinId)
    }
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

  const handleTaskSubmit = (e) => {
    e.preventDefault()
    if (!taskFormData.title.trim()) {
      toast.error('Task title is required')
      return
    }
    
    let formattedDueDate = null
    if (taskFormData.due_date) {
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

  const tabs = [
    { id: 'overview', name: 'Overview', icon: FolderKanban },
    { id: 'blueprint', name: 'Blueprint', icon: FileText },
    { id: 'pins', name: 'Pins', icon: PinIcon },
    { id: 'tasks', name: 'Tasks', icon: Check },
    { id: 'statistics', name: 'Statistics', icon: BarChart3 },
  ]

  if (isLoading) return <div className="text-center py-12">Loading project...</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{project?.name}</h1>
        <p className="text-gray-600 mt-2">{project?.description}</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
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
            <h2 className="text-xl font-semibold mb-4">Tasks Summary</h2>
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
      )}

      {/* Blueprint Tab */}
      {activeTab === 'blueprint' && (
        <div className="space-y-6">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Blueprint</h2>
              <div className="flex items-center space-x-2">
                {project?.blueprint && project?.blueprint_review_status === 'PENDING' && (
                  <button
                    onClick={() => setShowReviewModal(true)}
                    className="btn btn-primary flex items-center space-x-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>Review Blueprint</span>
                  </button>
                )}
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="btn btn-secondary flex items-center space-x-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>{project?.blueprint ? 'Replace' : 'Upload'}</span>
                </button>
              </div>
            </div>

            {project?.blueprint && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-900">Review Status</p>
                    <p className="text-sm text-blue-700">
                      {project.blueprint_review_status === 'APPROVED' && '✅ Approved'}
                      {project.blueprint_review_status === 'REJECTED' && '❌ Rejected'}
                      {project.blueprint_review_status === 'MODIFICATION_REQUESTED' && '⚠️ Modification Requested'}
                      {project.blueprint_review_status === 'PENDING' && '⏳ Pending Review'}
                    </p>
                    {project.blueprint_review_notes && (
                      <p className="text-xs text-blue-600 mt-1">{project.blueprint_review_notes}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {project?.blueprint ? (
              <BlueprintViewer
                blueprint={project.blueprint}
                onAddPin={handleBlueprintClick}
                canEdit={true}
                onPinClick={(pin) => {
                  if (pin.task_count > 0 && pin.tasks && pin.tasks.length > 0) {
                    setSelectedTaskId(pin.tasks[0].id)
                  } else if (pin.task_count > 0) {
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
        </div>
      )}

      {/* Pins Tab */}
      {activeTab === 'pins' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Blueprint Pins</h2>
            <button
              onClick={() => {
                setEditingPin(null)
                setPinFormData({ label: '', description: '', x: 0, y: 0 })
                setShowPinModal(true)
              }}
              className="btn btn-primary flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Pin</span>
            </button>
          </div>

          {project?.blueprint ? (
            <div className="card">
              <BlueprintViewer
                blueprint={project.blueprint}
                onAddPin={handleBlueprintClick}
                canEdit={true}
              />
            </div>
          ) : (
            <div className="card text-center py-12 text-gray-500">
              <p>Upload a blueprint first to manage pins</p>
            </div>
          )}

          <div className="card">
            <h3 className="text-lg font-semibold mb-4">All Pins</h3>
            {pins?.results && pins.results.length > 0 ? (
              <div className="space-y-3">
                {pins.results.map((pin) => (
                  <div key={pin.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{pin.label || `Pin at (${pin.x.toFixed(2)}, ${pin.y.toFixed(2)})`}</p>
                      {pin.description && (
                        <p className="text-sm text-gray-600 mt-1">{pin.description}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">Location: ({pin.x.toFixed(3)}, {pin.y.toFixed(3)})</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditPin(pin)}
                        className="btn btn-sm btn-secondary"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePin(pin.id)}
                        className="btn btn-sm btn-danger"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">No pins created yet</p>
            )}
          </div>
        </div>
      )}

      {/* Tasks Tab */}
      {activeTab === 'tasks' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Project Tasks</h2>
          </div>
          {tasks?.results && tasks.results.length > 0 ? (
            <div className="card">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Task</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned To</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tasks.results.map((task) => (
                      <tr key={task.id}>
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-900">{task.title}</p>
                          {task.description && (
                            <p className="text-sm text-gray-500">{task.description.substring(0, 50)}...</p>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            task.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                            task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                            task.status === 'DELAYED' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {task.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            task.priority === 'URGENT' ? 'bg-red-100 text-red-800' :
                            task.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                            task.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {task.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {task.assigned_to_name || 'Unassigned'}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => setSelectedTaskId(task.id)}
                            className="text-primary-600 hover:text-primary-800 text-sm"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="card text-center py-12 text-gray-500">
              <p>No tasks found for this project</p>
            </div>
          )}
        </div>
      )}

      {/* Statistics Tab */}
      {activeTab === 'statistics' && (
        <div className="space-y-6">
          {statistics && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="card">
                <h3 className="text-lg font-semibold mb-2">Progress</h3>
                <p className="text-3xl font-bold text-primary-600">{statistics.progress_percentage || 0}%</p>
              </div>
              <div className="card">
                <h3 className="text-lg font-semibold mb-2">Total Tasks</h3>
                <p className="text-3xl font-bold text-gray-900">{statistics.total_tasks || 0}</p>
              </div>
              <div className="card">
                <h3 className="text-lg font-semibold mb-2">Completed Tasks</h3>
                <p className="text-3xl font-bold text-green-600">{statistics.completed_tasks || 0}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {selectedTaskId && (
        <TaskDetailModal
          taskId={selectedTaskId}
          onClose={() => setSelectedTaskId(null)}
        />
      )}

      {/* Blueprint Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Review Blueprint</h2>
              <button
                onClick={() => {
                  setShowReviewModal(false)
                  setReviewNotes('')
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Review Notes (Optional)
                </label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows="4"
                  placeholder="Add review notes..."
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => approveMutation.mutate({ projectId: id, notes: reviewNotes })}
                  disabled={approveMutation.isLoading}
                  className="btn btn-primary flex-1 flex items-center justify-center space-x-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Approve</span>
                </button>
                <button
                  onClick={() => rejectMutation.mutate({ projectId: id, notes: reviewNotes })}
                  disabled={rejectMutation.isLoading}
                  className="btn btn-danger flex-1 flex items-center justify-center space-x-2"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject</span>
                </button>
                <button
                  onClick={() => requestModificationMutation.mutate({ projectId: id, notes: reviewNotes })}
                  disabled={requestModificationMutation.isLoading}
                  className="btn btn-secondary flex-1"
                >
                  Request Modification
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pin Modal */}
      {showPinModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">{editingPin ? 'Edit Pin' : 'Create Pin'}</h2>
              <button
                onClick={() => {
                  setShowPinModal(false)
                  setEditingPin(null)
                  setPinFormData({ label: '', description: '', x: 0, y: 0 })
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handlePinSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Label *</label>
                <input
                  type="text"
                  required
                  value={pinFormData.label}
                  onChange={(e) => setPinFormData({ ...pinFormData, label: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Pin label"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={pinFormData.description}
                  onChange={(e) => setPinFormData({ ...pinFormData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows="3"
                  placeholder="Pin description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">X Coordinate</label>
                  <input
                    type="number"
                    step="0.001"
                    value={pinFormData.x}
                    onChange={(e) => setPinFormData({ ...pinFormData, x: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Y Coordinate</label>
                  <input
                    type="number"
                    step="0.001"
                    value={pinFormData.y}
                    onChange={(e) => setPinFormData({ ...pinFormData, y: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={createPinMutation.isLoading || updatePinMutation.isLoading}
                  className="btn btn-primary flex-1"
                >
                  {createPinMutation.isLoading || updatePinMutation.isLoading ? 'Saving...' : editingPin ? 'Update Pin' : 'Create Pin'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPinModal(false)
                    setEditingPin(null)
                    setPinFormData({ label: '', description: '', x: 0, y: 0 })
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

      {/* Create Task Modal - Keep existing implementation */}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Task Title *</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <select
                    value={taskFormData.department}
                    onChange={(e) => setTaskFormData({ ...taskFormData, department: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select Department</option>
                    {departmentsData?.results?.map((dept) => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
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
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Hours</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
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

      {/* Upload Blueprint Modal - Keep existing implementation */}
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
    </div>
  )
}
