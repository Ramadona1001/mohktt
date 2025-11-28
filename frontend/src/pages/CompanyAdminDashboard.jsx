import { useQuery } from '@tanstack/react-query'
import { getProjects } from '../services/projectService'
import { getTaskStatistics } from '../services/taskService'
import { getDashboardSummary } from '../services/reportService'
import { Building2, CheckSquare, FileText, TrendingUp, Users, Briefcase } from 'lucide-react'

export default function CompanyAdminDashboard() {
  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: getProjects,
  })

  const { data: taskStats } = useQuery({
    queryKey: ['task-statistics'],
    queryFn: getTaskStatistics,
  })

  const { data: dashboardData } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: getDashboardSummary,
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Company Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage your company projects and resources</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Projects</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {projects?.results?.length || projects?.length || 0}
              </p>
            </div>
            <Building2 className="w-12 h-12 text-primary-600" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Tasks</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {taskStats?.total_tasks || 0}
              </p>
            </div>
            <CheckSquare className="w-12 h-12 text-primary-600" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed Tasks</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {taskStats?.completed_tasks || 0}
              </p>
            </div>
            <TrendingUp className="w-12 h-12 text-green-600" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Documents</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">
                {dashboardData?.pending_documents || 0}
              </p>
            </div>
            <FileText className="w-12 h-12 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Recent Projects */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Recent Projects</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Project Name</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Progress</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Tasks</th>
              </tr>
            </thead>
            <tbody>
              {(projects?.results || projects || []).slice(0, 5).map((project) => (
                <tr key={project.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{project.name}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      project.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                      project.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {project.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-primary-600 h-2 rounded-full" 
                          style={{ width: `${project.progress_percentage || 0}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">{project.progress_percentage || 0}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{project.task_count || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

