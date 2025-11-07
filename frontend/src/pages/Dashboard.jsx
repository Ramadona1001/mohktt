import { useQuery } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import api from '../utils/api'
import { FolderKanban, CheckSquare, Clock, AlertCircle } from 'lucide-react'

export default function Dashboard() {
  const { user } = useSelector((state) => state.auth)

  const { data: projectStats } = useQuery({
    queryKey: ['project-stats'],
    queryFn: async () => {
      const response = await api.get('/projects/')
      return response.data
    },
  })

  const { data: taskStats } = useQuery({
    queryKey: ['task-stats'],
    queryFn: async () => {
      const response = await api.get('/tasks/statistics/')
      return response.data
    },
  })

  const stats = [
    {
      name: 'Total Projects',
      value: projectStats?.count || 0,
      icon: FolderKanban,
      color: 'bg-blue-500',
    },
    {
      name: 'Total Tasks',
      value: taskStats?.total || 0,
      icon: CheckSquare,
      color: 'bg-green-500',
    },
    {
      name: 'In Progress',
      value: taskStats?.in_progress || 0,
      icon: Clock,
      color: 'bg-yellow-500',
    },
    {
      name: 'Overdue',
      value: taskStats?.overdue || 0,
      icon: AlertCircle,
      color: 'bg-red-500',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.first_name}!</h1>
        <p className="text-gray-600 mt-2">Here's an overview of your projects and tasks.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Recent Projects</h2>
          <div className="space-y-3">
            {projectStats?.results?.slice(0, 5).map((project) => (
              <div key={project.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{project.name}</p>
                  <p className="text-sm text-gray-600">{project.status}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{project.progress_percentage}%</p>
                  <p className="text-xs text-gray-500">Complete</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Task Overview</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Pending</span>
              <span className="font-semibold">{taskStats?.pending || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">In Progress</span>
              <span className="font-semibold">{taskStats?.in_progress || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Completed</span>
              <span className="font-semibold">{taskStats?.completed || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Delayed</span>
              <span className="font-semibold text-red-600">{taskStats?.delayed || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

