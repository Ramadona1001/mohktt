import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import api from '../utils/api'
import { Plus, FolderKanban } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Projects() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await api.get('/projects/')
      return response.data
    },
  })

  if (isLoading) return <div className="text-center py-12">Loading projects...</div>
  if (error) return <div className="text-center py-12 text-red-600">Error loading projects</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
        <button className="btn btn-primary flex items-center space-x-2">
          <Plus className="w-5 h-5" />
          <span>New Project</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data?.results?.map((project) => (
          <Link
            key={project.id}
            to={`/projects/${project.id}`}
            className="card hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <FolderKanban className="w-8 h-8 text-primary-600" />
              <span className={`px-2 py-1 text-xs rounded-full ${
                project.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                project.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {project.status}
              </span>
            </div>
            <h3 className="text-xl font-semibold mb-2">{project.name}</h3>
            <p className="text-gray-600 text-sm mb-4">{project.company_name}</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Progress</span>
                <span className="font-medium">{project.progress_percentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full"
                  style={{ width: `${project.progress_percentage}%` }}
                />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {data?.results?.length === 0 && (
        <div className="text-center py-12">
          <FolderKanban className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No projects found. Create your first project!</p>
        </div>
      )}
    </div>
  )
}

