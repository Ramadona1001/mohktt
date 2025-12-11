import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { 
  BarChart3, 
  Download, 
  FileText, 
  Calendar,
  TrendingUp,
  DollarSign,
  Clock,
  Building2
} from 'lucide-react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line
} from 'recharts'
import {
  getProjectProgress,
  getTimeTracking,
  getBudgetVsActual,
  getDocumentApprovalTimeline,
  getDepartmentPerformance,
  getDashboardSummary
} from '../services/reportService'
import { getTaskStatistics } from '../services/taskService'
import toast from 'react-hot-toast'

export default function Reports() {
  const [activeTab, setActiveTab] = useState('overview')
  const [dateRange, setDateRange] = useState({
    start_date: '',
    end_date: ''
  })

  // Task Statistics
  const { data: taskStats } = useQuery({
    queryKey: ['task-stats'],
    queryFn: async () => {
      const response = await getTaskStatistics()
      return response
    },
  })

  // Project Progress
  const { data: projectProgress } = useQuery({
    queryKey: ['project-progress', dateRange],
    queryFn: () => getProjectProgress(dateRange),
    enabled: activeTab === 'project-progress',
  })

  // Time Tracking
  const { data: timeTracking } = useQuery({
    queryKey: ['time-tracking', dateRange],
    queryFn: () => getTimeTracking(dateRange),
    enabled: activeTab === 'time-tracking',
  })

  // Budget vs Actual
  const { data: budgetVsActual } = useQuery({
    queryKey: ['budget-vs-actual', dateRange],
    queryFn: () => getBudgetVsActual(dateRange),
    enabled: activeTab === 'budget',
  })

  // Document Approval Timeline
  const { data: docTimeline } = useQuery({
    queryKey: ['doc-timeline', dateRange],
    queryFn: () => getDocumentApprovalTimeline(dateRange),
    enabled: activeTab === 'documents',
  })

  // Department Performance
  const { data: deptPerformance } = useQuery({
    queryKey: ['dept-performance', dateRange],
    queryFn: () => getDepartmentPerformance(dateRange),
    enabled: activeTab === 'departments',
  })

  // Dashboard Summary
  const { data: dashboardSummary } = useQuery({
    queryKey: ['dashboard-summary', dateRange],
    queryFn: () => getDashboardSummary(dateRange),
    enabled: activeTab === 'overview',
  })

  const chartData = [
    { name: 'Pending', value: taskStats?.pending || 0 },
    { name: 'In Progress', value: taskStats?.in_progress || 0 },
    { name: 'Completed', value: taskStats?.completed || 0 },
    { name: 'Delayed', value: taskStats?.delayed || 0 },
  ]

  const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444']

  const handleExport = async (format = 'pdf') => {
    try {
      // In a real implementation, you would call an export API endpoint
      // For now, we'll show a toast message
      toast.success(`Exporting to ${format.toUpperCase()}... (Feature in development)`)
      
      // Example implementation would be:
      // const response = await api.get(`/reports/export/?format=${format}&start_date=${dateRange.start_date}&end_date=${dateRange.end_date}`, {
      //   responseType: 'blob'
      // })
      // const url = window.URL.createObjectURL(new Blob([response.data]))
      // const link = document.createElement('a')
      // link.href = url
      // link.setAttribute('download', `report.${format}`)
      // document.body.appendChild(link)
      // link.click()
    } catch (error) {
      toast.error('Failed to export report')
    }
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'project-progress', name: 'Project Progress', icon: TrendingUp },
    { id: 'time-tracking', name: 'Time Tracking', icon: Clock },
    { id: 'budget', name: 'Budget vs Actual', icon: DollarSign },
    { id: 'documents', name: 'Document Timeline', icon: FileText },
    { id: 'departments', name: 'Department Performance', icon: Building2 },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 border border-gray-300 rounded-md p-1">
            <Calendar className="w-4 h-4 text-gray-500" />
            <input
              type="date"
              value={dateRange.start_date}
              onChange={(e) => setDateRange({ ...dateRange, start_date: e.target.value })}
              className="border-none outline-none text-sm"
              placeholder="Start Date"
            />
            <span className="text-gray-400">to</span>
            <input
              type="date"
              value={dateRange.end_date}
              onChange={(e) => setDateRange({ ...dateRange, end_date: e.target.value })}
              className="border-none outline-none text-sm"
              placeholder="End Date"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleExport('pdf')}
              className="btn btn-primary flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>PDF</span>
            </button>
            <button
              onClick={() => handleExport('excel')}
              className="btn btn-secondary flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Excel</span>
            </button>
          </div>
        </div>
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
        <div className="space-y-6">
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

          {dashboardSummary?.project_status_breakdown && (
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Project Status Breakdown</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dashboardSummary.project_status_breakdown}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* Project Progress Tab */}
      {activeTab === 'project-progress' && (
        <div className="space-y-6">
          {projectProgress ? (
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Project Progress Report</h2>
              {projectProgress.projects && projectProgress.projects.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tasks</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {projectProgress.projects.map((project) => (
                        <tr key={project.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{project.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                                <div 
                                  className="bg-primary-600 h-2 rounded-full" 
                                  style={{ width: `${project.progress_percentage || 0}%` }}
                                ></div>
                              </div>
                              <span className="text-sm text-gray-600">{project.progress_percentage || 0}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {project.completed_tasks || 0} / {project.total_tasks || 0}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              project.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                              project.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {project.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">No project data available</p>
              )}
            </div>
          ) : (
            <div className="card">
              <p className="text-center text-gray-500 py-8">Loading project progress data...</p>
            </div>
          )}
        </div>
      )}

      {/* Time Tracking Tab */}
      {activeTab === 'time-tracking' && (
        <div className="space-y-6">
          {timeTracking ? (
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Time Tracking Report</h2>
              {timeTracking.data && timeTracking.data.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={timeTracking.data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="hours" stroke="#3b82f6" name="Hours Logged" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-gray-500 py-8">No time tracking data available</p>
              )}
            </div>
          ) : (
            <div className="card">
              <p className="text-center text-gray-500 py-8">Loading time tracking data...</p>
            </div>
          )}
        </div>
      )}

      {/* Budget vs Actual Tab */}
      {activeTab === 'budget' && (
        <div className="space-y-6">
          {budgetVsActual ? (
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Budget vs Actual</h2>
              {budgetVsActual.data && budgetVsActual.data.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={budgetVsActual.data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="project" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="budget" fill="#3b82f6" name="Budget" />
                    <Bar dataKey="actual" fill="#10b981" name="Actual" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-gray-500 py-8">No budget data available</p>
              )}
            </div>
          ) : (
            <div className="card">
              <p className="text-center text-gray-500 py-8">Loading budget data...</p>
            </div>
          )}
        </div>
      )}

      {/* Document Timeline Tab */}
      {activeTab === 'documents' && (
        <div className="space-y-6">
          {docTimeline ? (
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Document Approval Timeline</h2>
              {docTimeline.data && docTimeline.data.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={docTimeline.data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="approved" stroke="#10b981" name="Approved" />
                    <Line type="monotone" dataKey="rejected" stroke="#ef4444" name="Rejected" />
                    <Line type="monotone" dataKey="pending" stroke="#f59e0b" name="Pending" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-gray-500 py-8">No document timeline data available</p>
              )}
            </div>
          ) : (
            <div className="card">
              <p className="text-center text-gray-500 py-8">Loading document timeline data...</p>
            </div>
          )}
        </div>
      )}

      {/* Department Performance Tab */}
      {activeTab === 'departments' && (
        <div className="space-y-6">
          {deptPerformance ? (
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Department Performance</h2>
              {deptPerformance.data && deptPerformance.data.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={deptPerformance.data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="department" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="tasks_completed" fill="#10b981" name="Tasks Completed" />
                    <Bar dataKey="tasks_pending" fill="#f59e0b" name="Tasks Pending" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-gray-500 py-8">No department performance data available</p>
              )}
            </div>
          ) : (
            <div className="card">
              <p className="text-center text-gray-500 py-8">Loading department performance data...</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
