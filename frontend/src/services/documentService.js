import api from '../utils/api'

/**
 * Document Service
 * Handles all document-related API calls
 */

// Get all documents
export const getDocuments = async (params = {}) => {
  const response = await api.get('/documents/', { params })
  return response.data
}

// Get document by ID
export const getDocument = async (documentId) => {
  const response = await api.get(`/documents/${documentId}/`)
  return response.data
}

// Create document (upload)
export const createDocument = async (documentData) => {
  const formData = new FormData()
  Object.keys(documentData).forEach((key) => {
    if (key === 'file') {
      formData.append('file', documentData[key])
    } else {
      formData.append(key, documentData[key])
    }
  })
  const response = await api.post('/documents/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

// Update document
export const updateDocument = async (documentId, documentData) => {
  const formData = new FormData()
  Object.keys(documentData).forEach((key) => {
    if (key === 'file' && documentData[key]) {
      formData.append('file', documentData[key])
    } else if (documentData[key] !== undefined) {
      formData.append(key, documentData[key])
    }
  })
  const response = await api.patch(`/documents/${documentId}/`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

// Delete document
export const deleteDocument = async (documentId) => {
  const response = await api.delete(`/documents/${documentId}/`)
  return response.data
}

// Approve document
export const approveDocument = async (documentId, notes = '') => {
  const response = await api.post(`/documents/${documentId}/approve/`, { notes })
  return response.data
}

// Reject document
export const rejectDocument = async (documentId, notes = '') => {
  const response = await api.post(`/documents/${documentId}/reject/`, { notes })
  return response.data
}

// Request document modification
export const requestDocumentModification = async (documentId, notes = '') => {
  const response = await api.post(`/documents/${documentId}/request_modification/`, { notes })
  return response.data
}

// Upload new document version
export const uploadDocumentVersion = async (documentId, file, changeNotes = '') => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('change_notes', changeNotes)
  const response = await api.post(`/documents/${documentId}/upload_version/`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

// Get documents pending review
export const getPendingReviewDocuments = async (params = {}) => {
  const response = await api.get('/documents/pending_review/', { params })
  return response.data
}

// Get overdue documents
export const getOverdueDocuments = async (params = {}) => {
  const response = await api.get('/documents/overdue/', { params })
  return response.data
}

