// API Client for Supabase Edge Functions
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nzmscqfrmxqcukhshsok.supabase.co'
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56bXNjcWZybXhxY3VraHNoc29rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyMTg1NDMsImV4cCI6MjA3MTc5NDU0M30.o0zQtPEjsuJnfQnY2MiakuM2EvTlVuRO9yeoajrwiLU'

const getBaseUrl = () => {
  // Always use Supabase Edge Functions if configured
  if (SUPABASE_URL && SUPABASE_URL !== 'https://your-project.supabase.co') {
    return `${SUPABASE_URL}/functions/v1`
  }
  
  // Fallback to local API for development
  return '/api'
}

const getHeaders = () => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }
  
  // Always add Supabase auth header if available
  if (SUPABASE_ANON_KEY && SUPABASE_ANON_KEY !== 'your-anon-key-here') {
    headers['Authorization'] = `Bearer ${SUPABASE_ANON_KEY}`
  }
  
  return headers
}

interface ApiOptions extends RequestInit {
  params?: Record<string, string>
}

export const apiClient = {
  baseUrl: getBaseUrl(),
  
  async request(endpoint: string, options: ApiOptions = {}) {
    const { params, ...fetchOptions } = options
    
    let url = `${this.baseUrl}${endpoint}`
    
    if (params) {
      const queryString = new URLSearchParams(params).toString()
      url += `?${queryString}`
    }
    
    const response = await fetch(url, {
      ...fetchOptions,
      headers: {
        ...getHeaders(),
        ...fetchOptions.headers,
      },
    })
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }))
      throw new Error(error.error || `Request failed with status ${response.status}`)
    }
    
    return response.json()
  },
  
  // Products API
  products: {
    async getAll(params?: { category?: string; search?: string; limit?: number; offset?: number }) {
      const endpoint = process.env.NODE_ENV === 'production' ? '/products' : '/products'
      return apiClient.request(endpoint, {
        params: params as Record<string, string>,
      })
    },
    
    async getById(id: string) {
      const endpoint = process.env.NODE_ENV === 'production' ? `/products/${id}` : `/products/${id}`
      return apiClient.request(endpoint)
    },
    
    async create(data: any) {
      const endpoint = process.env.NODE_ENV === 'production' ? '/products' : '/products'
      return apiClient.request(endpoint, {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },
    
    async update(id: string, data: any) {
      const endpoint = process.env.NODE_ENV === 'production' ? `/products/${id}` : `/products/${id}`
      return apiClient.request(endpoint, {
        method: 'PUT',
        body: JSON.stringify(data),
      })
    },
    
    async delete(id: string) {
      const endpoint = process.env.NODE_ENV === 'production' ? `/products/${id}` : `/products/${id}`
      return apiClient.request(endpoint, {
        method: 'DELETE',
      })
    },
  },
  
  // Admin API
  admin: {
    async login(email: string, password: string) {
      const endpoint = process.env.NODE_ENV === 'production' ? '/admin/auth' : '/admin/auth'
      return apiClient.request(endpoint, {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
    },
    
    async getStats() {
      const endpoint = process.env.NODE_ENV === 'production' ? '/admin/stats' : '/admin/stats'
      const token = localStorage.getItem('adminToken')
      return apiClient.request(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
    },
    
    async getAdmins() {
      const endpoint = process.env.NODE_ENV === 'production' ? '/admin' : '/admin'
      const token = localStorage.getItem('adminToken')
      return apiClient.request(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
    },
    
    async createAdmin(data: any) {
      const endpoint = process.env.NODE_ENV === 'production' ? '/admin' : '/admin'
      const token = localStorage.getItem('adminToken')
      return apiClient.request(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data),
      })
    },
    
    async updateAdmin(id: string, data: any) {
      const endpoint = process.env.NODE_ENV === 'production' ? '/admin' : '/admin'
      const token = localStorage.getItem('adminToken')
      return apiClient.request(endpoint, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id, ...data }),
      })
    },
    
    async deleteAdmin(id: string) {
      const endpoint = process.env.NODE_ENV === 'production' ? '/admin' : '/admin'
      const token = localStorage.getItem('adminToken')
      return apiClient.request(endpoint, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id }),
      })
    },
  },
  
  // Orders API
  orders: {
    async getAll(params?: { status?: string; limit?: number; offset?: number }) {
      const endpoint = process.env.NODE_ENV === 'production' ? '/orders' : '/orders'
      return apiClient.request(endpoint, {
        params: params as Record<string, string>,
      })
    },
    
    async create(data: any) {
      const endpoint = process.env.NODE_ENV === 'production' ? '/orders' : '/orders'
      return apiClient.request(endpoint, {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },
    
    async update(id: string, data: any) {
      const endpoint = process.env.NODE_ENV === 'production' ? '/orders' : '/orders'
      return apiClient.request(endpoint, {
        method: 'PUT',
        body: JSON.stringify({ id, ...data }),
      })
    },
    
    async delete(id: string) {
      const endpoint = process.env.NODE_ENV === 'production' ? '/orders' : '/orders'
      return apiClient.request(endpoint, {
        method: 'DELETE',
        body: JSON.stringify({ id }),
      })
    },
  },
  
  // Upload API
  upload: {
    async uploadFiles(files: File[]) {
      const endpoint = process.env.NODE_ENV === 'production' ? '/upload' : '/upload'
      const formData = new FormData()
      
      for (const file of files) {
        formData.append('files', file)
      }
      
      const headers: HeadersInit = {}
      if (process.env.NODE_ENV === 'production' && SUPABASE_ANON_KEY) {
        headers['Authorization'] = `Bearer ${SUPABASE_ANON_KEY}`
      }
      
      const response = await fetch(`${apiClient.baseUrl}${endpoint}`, {
        method: 'POST',
        headers,
        body: formData,
      })
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Upload failed' }))
        throw new Error(error.error || 'Upload failed')
      }
      
      return response.json()
    },
    
    async deleteImage(imageUrl: string) {
      const endpoint = process.env.NODE_ENV === 'production' ? '/upload' : '/upload'
      return apiClient.request(`${endpoint}?url=${encodeURIComponent(imageUrl)}`, {
        method: 'DELETE',
      })
    },
  },
}

export default apiClient