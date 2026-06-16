import { create } from 'zustand'
import axios from 'axios'
import toast from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_URL || ''

interface User {
  id: number
  email: string
  phone: string | null
  full_name: string
  role: string
  avatar_url: string | null
  is_verified: boolean
  phone_verified: boolean
  verification_status: string
  location: string | null
  bio: string | null
  id_document_url?: string;
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  checkAuth: () => Promise<void>
  updateUser: (data: Partial<User>) => void
}

interface RegisterData {
  email: string
  password: string
  confirm_password: string
  full_name: string
  phone: string
  role: string
  location?: string
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem('token'),
  isLoading: true,
  isAuthenticated: !!localStorage.getItem('token'),

  login: async (email: string, password: string) => {
    try {
      set({ isLoading: true })
      const res = await axios.post(`${API_URL}/api/auth/login`, { email, password })
      const { access_token, user } = res.data
      localStorage.setItem('token', access_token)
      set({ user, token: access_token, isAuthenticated: true, isLoading: false })
      toast.success(`Welcome back, ${user.full_name}!`)
    } catch (err: any) {
      set({ isLoading: false })
      toast.error(err.response?.data?.detail || 'Login failed')
      throw err
    }
  },

  register: async (data: RegisterData) => {
    try {
      set({ isLoading: true })
      const res = await axios.post(`${API_URL}/api/auth/register`, data)
      const { access_token, user } = res.data
      localStorage.setItem('token', access_token)
      set({ user, token: access_token, isAuthenticated: true, isLoading: false })
      toast.success(`Welcome, ${user.full_name}!`)
    } catch (err: any) {
      set({ isLoading: false })
      toast.error(err.response?.data?.detail || 'Registration failed')
      throw err
    }
  },

  logout: () => {
    localStorage.removeItem('token')
    set({ user: null, token: null, isAuthenticated: false, isLoading: false })
    toast.success('Logged out successfully')
  },

  checkAuth: async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      set({ isLoading: false })
      return
    }
    try {
      const res = await axios.get(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      set({ user: res.data, token, isAuthenticated: true, isLoading: false })
    } catch {
      localStorage.removeItem('token')
      set({ user: null, token: null, isAuthenticated: false, isLoading: false })
    }
  },

  updateUser: (data: Partial<User>) => {
    set((state) => ({ user: state.user ? { ...state.user, ...data } : null }))
  },
}))

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
