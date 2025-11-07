import { useQuery } from '@tanstack/react-query'
import api from '../utils/api'
import { BarChart3, Download } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

export default function Reports() {
  const { data: taskStats } = useQuery({
    queryKey: ['task-stats'],
    queryFn: async () => {
      const response = await api.get('/tasks/statistics/')
      return response.data
    },
  })

  const chartData = [
    { name: 'Pending', value: taskStats?.pending || 0 },
    { name: 'In Progress', value: taskStats?.in_progress || 0 },
    { name: 'Completed', value: taskStats?.completed || 0 },
    { name: 'Delayed', value: taskStats?.delayed || 0 },
  ]

  const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444']

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
        <button className="btn btn-primary flex items-center space-x-2">
          <Download className="w-5 h-5" />
          <span>Export PDF</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Task Status Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Task Statistics</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Total Tasks</span>
              <span className="font-semibold text-lg">{taskStats?.total || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Total Estimated Hours</span>
              <span className="font-semibold text-lg">{taskStats?.total_estimated_hours || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Total Actual Hours</span>
              <span className="font-semibold text-lg">{taskStats?.total_actual_hours || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Overdue Tasks</span>
              <span className="font-semibold text-lg text-red-600">{taskStats?.overdue || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

