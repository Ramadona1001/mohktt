import { useQuery } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import { getProjects } from '../services/projectService'
import { getTaskStatistics } from '../services/taskService'
import { getDashboardSummary } from '../services/reportService'
import { FolderKanban, CheckSquare, Clock, AlertCircle } from 'lucide-react'
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts'

export default function Dashboard() {
  const { user } = useSelector((state) => state.auth)

  const { data: projectStats } = useQuery({
    queryKey: ['project-stats'],
    queryFn: () => getProjects(),
  })

  const { data: taskStats } = useQuery({
    queryKey: ['task-stats'],
    queryFn: () => getTaskStatistics(),
  })

  const { data: dashboardSummary } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: () => getDashboardSummary(),
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

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Status Pie Chart */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Project Status Distribution</h2>
          {dashboardSummary?.project_status_breakdown && dashboardSummary.project_status_breakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dashboardSummary.project_status_breakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ status, count }) => `${status}: ${count}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {dashboardSummary.project_status_breakdown.map((entry, index) => {
                    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']
                    return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  })}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              No project data available
            </div>
          )}
        </div>

        {/* Task Status Pie Chart */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Task Status Distribution</h2>
          {taskStats && (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Pending', value: taskStats.pending || 0 },
                    { name: 'In Progress', value: taskStats.in_progress || 0 },
                    { name: 'Completed', value: taskStats.completed || 0 },
                    { name: 'Delayed', value: taskStats.delayed || 0 },
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {[
                    { name: 'Pending', value: taskStats.pending || 0 },
                    { name: 'In Progress', value: taskStats.in_progress || 0 },
                    { name: 'Completed', value: taskStats.completed || 0 },
                    { name: 'Delayed', value: taskStats.delayed || 0 },
                  ].map((entry, index) => {
                    const colors = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444']
                    return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  })}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Line Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Progress Over Time */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Project Progress Over Time</h2>
          {dashboardSummary?.progress_over_time && dashboardSummary.progress_over_time.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dashboardSummary.progress_over_time}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month_name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="avg_progress" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="Average Progress %"
                />
                <Line 
                  type="monotone" 
                  dataKey="total_projects" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name="Total Projects"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              No progress data available
            </div>
          )}
        </div>

        {/* Tasks Over Time */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Tasks Over Time</h2>
          {dashboardSummary?.progress_over_time && dashboardSummary.progress_over_time.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dashboardSummary.progress_over_time}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month_name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="total_tasks" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="Total Tasks"
                />
                <Line 
                  type="monotone" 
                  dataKey="completed_tasks" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name="Completed Tasks"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              No task data available
            </div>
          )}
        </div>
      </div>

      {/* Additional Stats */}
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
            {(!projectStats?.results || projectStats.results.length === 0) && (
              <p className="text-center text-gray-500 py-4">No projects found</p>
            )}
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
            {dashboardSummary && (
              <>
                <div className="border-t pt-4 mt-4">
                  <h3 className="font-semibold mb-2">Documents & Blueprints</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Pending Documents</span>
                      <span className="font-semibold">{dashboardSummary.pending_documents || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Overdue Documents</span>
                      <span className="font-semibold text-red-600">{dashboardSummary.overdue_documents || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Pending Blueprints</span>
                      <span className="font-semibold">{dashboardSummary.pending_blueprints || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Overdue Blueprints</span>
                      <span className="font-semibold text-red-600">{dashboardSummary.overdue_blueprints || 0}</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

