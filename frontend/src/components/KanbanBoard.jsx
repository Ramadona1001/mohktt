import { useState } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { GripVertical, Calendar, User } from 'lucide-react'

const STATUS_COLUMNS = [
  { id: 'PENDING', title: 'Pending', color: 'bg-gray-100 border-gray-300' },
  { id: 'IN_PROGRESS', title: 'In Progress', color: 'bg-blue-100 border-blue-300' },
  { id: 'COMPLETED', title: 'Completed', color: 'bg-green-100 border-green-300' },
  { id: 'DELAYED', title: 'Delayed', color: 'bg-red-100 border-red-300' },
]

const PRIORITY_COLORS = {
  URGENT: 'bg-red-500',
  HIGH: 'bg-orange-500',
  MEDIUM: 'bg-yellow-500',
  LOW: 'bg-gray-500',
}

export default function KanbanBoard({ tasks, onStatusChange, isLoading }) {
  const [draggedTask, setDraggedTask] = useState(null)
  const [draggedOverColumn, setDraggedOverColumn] = useState(null)

  const handleDragStart = (e, task) => {
    setDraggedTask(task)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', task.id.toString())
    // Create a custom drag image
    const dragImage = e.currentTarget.cloneNode(true)
    dragImage.style.width = e.currentTarget.offsetWidth + 'px'
    dragImage.style.opacity = '0.8'
    document.body.appendChild(dragImage)
    e.dataTransfer.setDragImage(dragImage, 0, 0)
    setTimeout(() => document.body.removeChild(dragImage), 0)
    e.currentTarget.style.opacity = '0.5'
  }

  const handleDragEnd = (e) => {
    e.currentTarget.style.opacity = '1'
    setDraggedTask(null)
    setDraggedOverColumn(null)
  }

  const handleDragOver = (e, columnId) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDraggedOverColumn(columnId)
  }

  const handleDragLeave = () => {
    setDraggedOverColumn(null)
  }

  const handleDrop = (e, targetStatus) => {
    e.preventDefault()
    setDraggedOverColumn(null)

    if (draggedTask && draggedTask.status !== targetStatus) {
      onStatusChange(draggedTask.id, targetStatus)
    }
    setDraggedTask(null)
  }

  const getTasksByStatus = (status) => {
    // Handle both paginated and non-paginated responses
    const taskList = tasks?.results || tasks || []
    return taskList.filter((task) => task.status === status)
  }

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <p className="mt-4 text-gray-600">Loading tasks...</p>
      </div>
    )
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: '600px' }}>
      {STATUS_COLUMNS.map((column) => {
        const columnTasks = getTasksByStatus(column.id)
        const isDraggedOver = draggedOverColumn === column.id

        return (
          <div
            key={column.id}
            className={`flex-shrink-0 w-80 ${column.color} rounded-lg p-4 transition-all ${
              isDraggedOver ? 'ring-2 ring-primary-500 ring-offset-2' : ''
            }`}
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">
                {column.title}
                <span className="ml-2 text-sm font-normal text-gray-600">
                  ({columnTasks.length})
                </span>
              </h3>
            </div>

            <div className="space-y-3 min-h-[100px]">
              {columnTasks.map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task)}
                  onDragEnd={handleDragEnd}
                  className="bg-white rounded-lg shadow-sm p-4 cursor-grab active:cursor-grabbing hover:shadow-md transition-all border border-gray-200 group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <Link
                      to={`/tasks/${task.id}`}
                      className="font-medium text-gray-900 hover:text-primary-600 flex-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {task.title}
                    </Link>
                    <GripVertical className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  {task.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {task.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.LOW
                        }`}
                        title={task.priority}
                      />
                      <span className="text-xs text-gray-600">{task.priority}</span>
                    </div>
                    {task.project_name && (
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {task.project_name}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    {task.due_date && (
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{format(new Date(task.due_date), 'MMM dd')}</span>
                      </div>
                    )}
                    {task.assigned_to_name && (
                      <div className="flex items-center space-x-1">
                        <User className="w-3 h-3" />
                        <span className="truncate max-w-[100px]">
                          {task.assigned_to_name}
                        </span>
                      </div>
                    )}
                  </div>

                  {task.department_name && (
                    <div className="mt-2">
                      <span className="text-xs text-gray-500">
                        Dept: {task.department_name}
                      </span>
                    </div>
                  )}
                </div>
              ))}

              {columnTasks.length === 0 && (
                <div className="text-center py-8 text-gray-400 text-sm">
                  No tasks in this column
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

