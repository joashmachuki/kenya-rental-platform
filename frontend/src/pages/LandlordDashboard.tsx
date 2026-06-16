import { useState, useEffect } from 'react';
import { formatPrice } from "../utils/formatters"
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  PlusCircle, Home, TrendingUp, Eye, MessageSquare, 
  Building2, ArrowRight, CheckCircle2, XCircle, 
  ShieldCheck, AlertTriangle, Lock, Edit3, Trash2,
  Phone, Mail, User
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import axios from 'axios'
import toast from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_URL || ''

export default function LandlordDashboard() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [properties, setProperties] = useState<any[]>([])
  const [stats, setStats] = useState({
    totalProperties: 0,
    totalViews: 0,
    totalInquiries: 0,
    occupancyRate: 0
  })
  const [loading, setLoading] = useState(true)

  const canListProperty = user?.verification_status === 'verified' && user?.phone_verified

  useEffect(() => {
    fetchLandlordData()
  }, [])

  const fetchLandlordData = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await axios.get(`${API_URL}/api/properties/my-properties`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const props = res.data.properties || []
      setProperties(props)
      
      const totalViews = props.reduce((sum: number, p: any) => sum + (p.view_count || 0), 0)
      const totalInquiries = props.reduce((sum: number, p: any) => sum + (p.inquiry_count || 0), 0)
      const rentedCount = props.filter((p: any) => p.status === 'rented').length
      const occupancyRate = props.length > 0 ? Math.round((rentedCount / props.length) * 100) : 0
      
      setStats({
        totalProperties: props.length,
        totalViews,
        totalInquiries,
        occupancyRate
      })
    } catch (err) {
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const markAsTaken = async (id: number) => {
    try {
      const token = localStorage.getItem('token')
      await axios.put(`${API_URL}/api/properties/${id}/status?status=rented`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toast.success('Property marked as TAKEN')
      fetchLandlordData()
    } catch {
      toast.error('Failed to update status')
    }
  }

  const markAsAvailable = async (id: number) => {
    try {
      const token = localStorage.getItem('token')
      await axios.put(`${API_URL}/api/properties/${id}/status?status=available`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toast.success('Property marked as VACANT')
      fetchLandlordData()
    } catch {
      toast.error('Failed to update status')
    }
  }

  const deleteProperty = async (id: number) => {
    if (!confirm('Are you sure you want to delete this property?')) return
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`${API_URL}/api/properties/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toast.success('Property deleted')
      fetchLandlordData()
    } catch {
      toast.error('Failed to delete')
    }
  }

  const statCards = [
    { label: 'Properties', value: stats.totalProperties, icon: Building2, color: 'text-brand-400' },
    { label: 'Total Views', value: stats.totalViews, icon: Eye, color: 'text-blue-400' },
    { label: 'Inquiries', value: stats.totalInquiries, icon: MessageSquare, color: 'text-purple-400' },
    { label: 'Occupancy', value: `${stats.occupancyRate}%`, icon: TrendingUp, color: 'text-green-400' },
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Welcome back, {user?.full_name?.split(' ')[0]}!</h1>
            <p className="mt-1 text-dark-400">Manage your properties and connect with renters</p>
          </div>
          {canListProperty ? (
            <Link 
              to="/list-property"
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-medium transition-all hover:shadow-lg hover:shadow-brand-500/20"
            >
              <PlusCircle className="w-5 h-5" />
              List New Property
            </Link>
          ) : (
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-dark-800 text-dark-400 rounded-xl font-medium cursor-not-allowed">
              <Lock className="w-5 h-5" />
              Verification Required
            </div>
          )}
        </div>

        {/* Verification Alert */}
        {!canListProperty && (
          <div className="glass-card p-6 mb-8 border border-amber-500/20 bg-amber-500/5">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-amber-400 mb-1">Verification Required</h3>
                <p className="text-dark-400 text-sm mb-3">
                  Complete these steps to start listing properties:
                </p>
                <div className="space-y-2">
                  {!user?.phone_verified && (
                    <Link to="/verify-phone" className="flex items-center gap-2 text-sm text-brand-400 hover:text-brand-300">
                      <Phone className="w-4 h-4" />
                      Verify phone number
                    </Link>
                  )}
                  {user?.phone_verified && user?.verification_status !== 'verified' && (
                    <Link to="/verify-identity" className="flex items-center gap-2 text-sm text-brand-400 hover:text-brand-300">
                      <ShieldCheck className="w-4 h-4" />
                      Upload ID for identity verification
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card p-6"
            >
              <div className="flex items-center justify-between mb-2">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-dark-500 text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Properties */}
        <div className="glass-card">
          <div className="flex items-center justify-between p-6 border-b border-dark-800/50">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Home className="w-5 h-5 text-brand-400" />
              My Properties
            </h2>
            {canListProperty ? (
              <Link to="/list-property" className="text-brand-400 hover:text-brand-300 text-sm font-medium">
                + Add New
              </Link>
            ) : (
              <span className="text-dark-600 text-sm">Complete verification to add</span>
            )}
          </div>

          {loading ? (
            <div className="p-8 text-center text-dark-400">Loading...</div>
          ) : properties.length === 0 ? (
            <div className="p-12 text-center">
              <Building2 className="w-16 h-16 text-dark-700 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-dark-300 mb-2">No properties yet</h3>
              <p className="text-dark-500 mb-6">Start by listing your first property</p>
              {canListProperty && (
                <Link to="/list-property" className="btn-primary">
                  List Your First Property
                </Link>
              )}
            </div>
          ) : (
            <div className="divide-y divide-dark-800/50">
              {properties.map((property) => (
                <div key={property.id} className={`p-6 flex items-center gap-4 hover:bg-dark-900/50 transition-all ${property.status === 'rented' ? 'opacity-60' : ''}`}>
                  <img 
                    src={property.images?.[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=200&q=80'} 
                    alt={property.title}
                    className="w-24 h-24 rounded-xl object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-white truncate">{property.title}</h3>
                      {property.status === 'rented' && (
                        <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded-full">TAKEN</span>
                      )}
                      {property.status === 'available' && (
                        <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">VACANT</span>
                      )}
                      {property.approval_status === 'pending' && (
                        <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full">PENDING APPROVAL</span>
                      )}
                    </div>
                    <p className="text-dark-400 text-sm">{property.county}, {property.sub_county}</p>
                    <p className="text-white font-medium mt-1">{formatPrice(property.monthly_rent)}/mo</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-dark-500">
                      <span>{property.view_count || 0} views</span>
                      <span>{property.inquiry_count || 0} inquiries</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {property.status === 'available' ? (
                      <button
                        onClick={() => markAsTaken(property.id)}
                        className="px-3 py-2 bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 rounded-lg text-sm font-medium transition-all flex items-center gap-1"
                      >
                        <XCircle className="w-4 h-4" />
                        Mark Taken
                      </button>
                    ) : (
                      <button
                        onClick={() => markAsAvailable(property.id)}
                        className="px-3 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg text-sm font-medium transition-all flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Mark Vacant
                      </button>
                    )}
                    <button
                      onClick={() => navigate(`/property/${property.id}`)}
                      className="p-2 bg-dark-800 hover:bg-dark-700 text-dark-400 hover:text-white rounded-lg transition-all"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteProperty(property.id)}
                      className="p-2 bg-dark-800 hover:bg-red-600/20 text-dark-400 hover:text-red-400 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
