import { useQuery } from '@tanstack/react-query'
import { getMyTasks } from '../services/taskService'
import { CheckSquare, Clock, AlertCircle, CheckCircle2 } from 'lucide-react'
import { format } from 'date-fns'

export default function WorkerDashboard() {
  const { data: myTasks, isLoading } = useQuery({
    queryKey: ['my-tasks'],
    queryFn: () => getMyTasks(),
  })

  const tasks = myTasks?.results || myTasks || []
  const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length
  const inProgressTasks = tasks.filter(t => t.status === 'IN_PROGRESS').length
  const pendingTasks = tasks.filter(t => t.status === 'PENDING').length
  const overdueTasks = tasks.filter(t => t.is_overdue).length
  const todayTasks = tasks.filter(t => {
    if (!t.due_date) return false
    const dueDate = new Date(t.due_date)
    const today = new Date()
    return dueDate.toDateString() === today.toDateString()
  }).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Worker Dashboard</h1>
        <p className="text-gray-600 mt-2">View your assigned tasks and track your work</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6 bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">My Tasks</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {tasks.length}
              </p>
            </div>
            <CheckSquare className="w-12 h-12 text-blue-600" />
          </div>
        </div>

        <div className="card p-6 bg-gradient-to-br from-yellow-50 to-yellow-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">
                {inProgressTasks}
              </p>
            </div>
            <Clock className="w-12 h-12 text-yellow-600" />
          </div>
        </div>

        <div className="card p-6 bg-gradient-to-br from-green-50 to-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {completedTasks}
              </p>
            </div>
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
        </div>

        <div className="card p-6 bg-gradient-to-br from-red-50 to-red-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Overdue</p>
              <p className="text-3xl font-bold text-red-600 mt-2">
                {overdueTasks}
              </p>
            </div>
            <AlertCircle className="w-12 h-12 text-red-600" />
          </div>
        </div>
      </div>

      {/* Today's Tasks */}
      {todayTasks > 0 && (
        <div className="card p-6 bg-yellow-50 border-l-4 border-yellow-500">
          <div className="flex items-center space-x-3">
            <Clock className="w-6 h-6 text-yellow-600" />
            <div>
              <h3 className="font-semibold text-yellow-900">Today's Tasks</h3>
              <p className="text-sm text-yellow-700">You have {todayTasks} task(s) due today</p>
            </div>
          </div>
        </div>
      )}

      {/* My Tasks */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">My Tasks</h2>
        {isLoading ? (
          <div className="text-center py-8">Loading tasks...</div>
        ) : (
          <div className="space-y-3">
            {tasks.slice(0, 10).map((task) => (
              <div key={task.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{task.title}</h3>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                    <span>{task.project_name}</span>
                    {task.due_date && (
                      <span>Due: {format(new Date(task.due_date), 'MMM dd, yyyy')}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`px-3 py-1 text-xs rounded-full ${
                    task.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                    task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {task.status}
                  </span>
                  {task.is_overdue && (
                    <span className="px-3 py-1 text-xs rounded-full bg-red-100 text-red-800">
                      Overdue
                    </span>
                  )}
                </div>
              </div>
            ))}
            {tasks.length === 0 && (
              <p className="text-center py-8 text-gray-500">No tasks assigned to you</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

