import axios from 'axios'

// Use relative API path (handled by Vite proxy in dev) or explicit VITE_API_URL
const API_BASE = import.meta.env.VITE_API_URL || ''

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 120000, // 120s timeout for large multi-document RAG generation
})

export const api = {
  // Health & Stats
  getHealth: async () => {
    const res = await apiClient.get('/api/health')
    return res.data
  },

  getStats: async () => {
    const res = await apiClient.get('/api/stats')
    return res.data
  },

  // Document Management
  getDocuments: async () => {
    const res = await apiClient.get('/api/documents')
    return Array.isArray(res.data) ? res.data : (res.data.documents || [])
  },

  uploadDocuments: async (files, onProgress) => {
    const formData = new FormData()
    files.forEach((file) => {
      formData.append('files', file)
    })
    formData.append('auto_index', 'true')

    const res = await apiClient.post('/api/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(percentCompleted)
        }
      },
    })
    return res.data
  },

  indexDocument: async (payload) => {
    const res = await apiClient.post('/api/documents/index', payload)
    return res.data
  },

  deleteDocument: async (documentId) => {
    const res = await apiClient.delete(`/api/documents/${encodeURIComponent(documentId)}`)
    return res.data
  },

  clearKnowledgeBase: async () => {
    const res = await apiClient.post('/api/knowledge-base/clear')
    return res.data
  },

  // Chat
  sendChatMessage: async (message, history = []) => {
    const res = await apiClient.post('/api/chat', {
      message,
      history,
    })
    return res.data
  },
}

export default api
