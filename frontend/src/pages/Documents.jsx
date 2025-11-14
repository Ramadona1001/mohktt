import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getDocuments, createDocument, approveDocument, rejectDocument } from '../services/documentService'
import { getProjects } from '../services/projectService'
import { FileText, Upload, Check, X } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

export default function Documents() {
  const queryClient = useQueryClient()
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project: '',
  })

  const { data, isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: () => getDocuments(),
  })

  const { data: projectsData } = useQuery({
    queryKey: ['projects'],
    queryFn: () => getProjects(),
  })

  const uploadMutation = useMutation({
    mutationFn: (documentData) => createDocument(documentData),
    onSuccess: () => {
      queryClient.invalidateQueries(['documents'])
      toast.success('Document uploaded successfully!')
      setShowUploadModal(false)
      setSelectedFile(null)
      setFormData({ title: '', description: '', project: '' })
    },
    onError: (error) => {
      const errorData = error.response?.data
      let errorMsg = 'Failed to upload document'
      
      if (errorData) {
        if (errorData.project) {
          errorMsg = Array.isArray(errorData.project) ? errorData.project[0] : errorData.project
        } else if (errorData.file) {
          errorMsg = Array.isArray(errorData.file) ? errorData.file[0] : errorData.file
        } else if (errorData.detail) {
          errorMsg = errorData.detail
        } else if (typeof errorData === 'string') {
          errorMsg = errorData
        }
      }
      
      toast.error(errorMsg)
    },
  })

  const approveMutation = useMutation({
    mutationFn: (documentId) => approveDocument(documentId),
    onSuccess: () => {
      queryClient.invalidateQueries(['documents'])
      toast.success('Document approved!')
    },
  })

  const rejectMutation = useMutation({
    mutationFn: (documentId) => rejectDocument(documentId),
    onSuccess: () => {
      queryClient.invalidateQueries(['documents'])
      toast.success('Document rejected!')
    },
  })

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size exceeds 10MB limit')
        return
      }
      setSelectedFile(file)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!selectedFile) {
      toast.error('Please select a file')
      return
    }
    if (!formData.project) {
      toast.error('Please select a project')
      return
    }
    uploadMutation.mutate({
      ...formData,
      file: selectedFile,
    })
  }

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
        <button
          onClick={() => setShowUploadModal(true)}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Upload className="w-5 h-5" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Upload Document Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Upload Document</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project *</label>
                <select
                  required
                  value={formData.project}
                  onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select a project</option>
                  {projectsData?.results?.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                  {projectsData && !projectsData.results && projectsData.map && projectsData.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">File (Max 10MB)</label>
                <input
                  type="file"
                  required
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {selectedFile && (
                  <p className="text-sm text-gray-600 mt-1">
                    Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={uploadMutation.isLoading}
                  className="btn btn-primary flex-1"
                >
                  {uploadMutation.isLoading ? 'Uploading...' : 'Upload Document'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(data?.results || data || []).map((doc) => (
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
                  <td className="py-3 px-4">
                    {doc.status === 'PENDING' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => approveMutation.mutate(doc.id)}
                          className="p-1 text-green-600 hover:text-green-700"
                          title="Approve"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => rejectMutation.mutate(doc.id)}
                          className="p-1 text-red-600 hover:text-red-700"
                          title="Reject"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {(!data || (data?.results || data || []).length === 0) && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No documents found.</p>
        </div>
      )}
    </div>
  )
}

