import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../utils/api'
import BlueprintCanvas from '../components/BlueprintCanvas'

export default function ProjectDetail() {
  const { id } = useParams()

  const { data: project, isLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      const response = await api.get(`/projects/${id}/`)
      return response.data
    },
  })

  if (isLoading) return <div className="text-center py-12">Loading project...</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{project?.name}</h1>
        <p className="text-gray-600 mt-2">{project?.description}</p>
      </div>

      {project?.blueprint && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Blueprint</h2>
          <BlueprintCanvas blueprint={project.blueprint} projectId={id} />
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
              <p className="font-medium">{project?.progress_percentage}%</p>
            </div>
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

