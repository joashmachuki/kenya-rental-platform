import { create } from 'zustand'
import axios from 'axios'
import toast from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_URL || ''

export interface Property {
  id: number
  title: string
  description: string
  property_type: string
  county: string
  sub_county: string
  ward: string
  town: string | null
  street_address: string | null
  monthly_rent: number
  deposit_amount: number
  negotiable: boolean
  bedrooms: number
  bathrooms: number
  furnished: boolean
  square_footage: number | null
  floor_number: number | null
  total_floors: number | null
  year_built: number | null
  amenities: string[]
  images: string[]
  contact_phone: string | null
  contact_email: string | null
  preferred_contact: string
  status: string
  is_featured: boolean
  view_count: number
  inquiry_count: number
  owner_id: number
  created_at: string
  updated_at: string | null
  owner?: {
    id: number
    full_name: string
    avatar_url: string | null
    phone: string | null
    email: string
  }
}

interface SearchFilters {
  county?: string
  sub_county?: string
  ward?: string
  property_type?: string
  min_price?: number
  max_price?: number
  bedrooms?: number
  furnished?: boolean
  query?: string
  sort_by?: string
}

interface PropertyState {
  properties: Property[]
  featured: Property[]
  recent: Property[]
  currentProperty: Property | null
  favorites: number[]
  total: number
  page: number
  perPage: number
  isLoading: boolean
  filters: SearchFilters
  locations: Record<string, Record<string, string[]>>

  setFilters: (filters: SearchFilters) => void
  searchProperties: (page?: number) => Promise<void>
  getFeatured: () => Promise<void>
  getRecent: () => Promise<void>
  getProperty: (id: number) => Promise<void>
  createProperty: (formData: FormData) => Promise<void>
  updateProperty: (id: number, data: Partial<Property>) => Promise<void>
  deleteProperty: (id: number) => Promise<void>
  toggleFavorite: (id: number) => void
  getLocations: () => Promise<void>
}

export const usePropertyStore = create<PropertyState>((set, get) => ({
  properties: [],
  featured: [],
  recent: [],
  currentProperty: null,
  favorites: JSON.parse(localStorage.getItem('favorites') || '[]'),
  total: 0,
  page: 1,
  perPage: 12,
  isLoading: false,
  filters: {},
  locations: {},

  setFilters: (filters) => set({ filters: { ...get().filters, ...filters }, page: 1 }),

  searchProperties: async (page = 1) => {
    try {
      set({ isLoading: true, page })
      const { filters, perPage } = get()
      const params = new URLSearchParams()

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value))
        }
      })
      params.append('page', String(page))
      params.append('per_page', String(perPage))

      const res = await axios.get(`${API_URL}/api/properties/?${params}`)
      set({ 
        properties: res.data.properties, 
        total: res.data.total,
        isLoading: false 
      })
    } catch (err: any) {
      set({ isLoading: false })
      toast.error(err.response?.data?.detail || 'Search failed')
    }
  },

  getFeatured: async () => {
    try {
      const res = await axios.get(`${API_URL}/api/properties/featured`)
      set({ featured: res.data })
    } catch (err) {
      console.error('Failed to load featured properties')
    }
  },

  getRecent: async () => {
    try {
      const res = await axios.get(`${API_URL}/api/properties/recent`)
      set({ recent: res.data })
    } catch (err) {
      console.error('Failed to load recent properties')
    }
  },

  getProperty: async (id: number) => {
    try {
      set({ isLoading: true })
      const res = await axios.get(`${API_URL}/api/properties/${id}`)
      set({ currentProperty: res.data, isLoading: false })
    } catch (err: any) {
      set({ isLoading: false })
      toast.error(err.response?.data?.detail || 'Property not found')
    }
  },

  createProperty: async (formData: FormData) => {
    try {
      set({ isLoading: true })
      await axios.post(`${API_URL}/api/properties`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      set({ isLoading: false })
      toast.success('Property listed successfully!')
    } catch (err: any) {
      set({ isLoading: false })
      toast.error(err.response?.data?.detail || 'Failed to list property')
      throw err
    }
  },

  updateProperty: async (id: number, data: Partial<Property>) => {
    try {
      await axios.put(`${API_URL}/api/properties/${id}`, data)
      toast.success('Property updated successfully!')
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Update failed')
    }
  },

  deleteProperty: async (id: number) => {
    try {
      await axios.delete(`${API_URL}/api/properties/${id}`)
      toast.success('Property deleted successfully!')
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Delete failed')
    }
  },

  toggleFavorite: (id: number) => {
    set((state) => {
      const favorites = state.favorites.includes(id)
        ? state.favorites.filter((f) => f !== id)
        : [...state.favorites, id]
      localStorage.setItem('favorites', JSON.stringify(favorites))
      return { favorites }
    })
  },

  getLocations: async () => {
    try {
      const res = await axios.get(`${API_URL}/api/locations/all`)
      set({ locations: res.data })
    } catch (err) {
      console.error('Failed to load locations')
    }
  },
}))
