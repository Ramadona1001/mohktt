import { useQuery } from '@tanstack/react-query'
import api from '../utils/api'
import { FileText, Upload } from 'lucide-react'
import { format } from 'date-fns'

export default function Documents() {
  const { data, isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      const response = await api.get('/documents/')
      return response.data
    },
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'EXPIRED':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) return <div className="text-center py-12">Loading documents...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Documents</h1>
        <button className="btn btn-primary flex items-center space-x-2">
          <Upload className="w-5 h-5" />
          <span>Upload Document</span>
        </button>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Title</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Project</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Side</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Uploaded</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Deadline</th>
              </tr>
            </thead>
            <tbody>
              {data?.results?.map((doc) => (
                <tr key={doc.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-5 h-5 text-gray-400" />
                      <span className="font-medium">{doc.title}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{doc.project_name}</td>
                  <td className="py-3 px-4 text-gray-600">{doc.side}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(doc.status)}`}>
                      {doc.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {format(new Date(doc.uploaded_at), 'MMM dd, yyyy')}
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {doc.review_deadline ? format(new Date(doc.review_deadline), 'MMM dd, yyyy') : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {data?.results?.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No documents found.</p>
        </div>
      )}
    </div>
  )
}

