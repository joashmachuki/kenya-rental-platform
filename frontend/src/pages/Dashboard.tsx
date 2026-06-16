import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Building2, Plus, Eye, MessageSquare, Heart, Search, User,
  MapPin, DollarSign, Calendar, Trash2, Loader2
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { usePropertyStore } from '../store/propertyStore'
import { formatPrice, propertyTypeLabel, formatDate } from '../utils/formatters'
import api from '../services/api'
import toast from 'react-hot-toast'

export default function Dashboard() {
  const { user } = useAuthStore()
  const [myProperties, setMyProperties] = useState<any[]>([])
  const [stats, setStats] = useState({ total: 0, views: 0, inquiries: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMyProperties()
  }, [])

  const fetchMyProperties = async () => {
    try {
      const res = await api.get('/api/properties/my-listings')
      setMyProperties(res.data)
      const totalViews = res.data.reduce((sum: number, p: any) => sum + (p.view_count || 0), 0)
      const totalInquiries = res.data.reduce((sum: number, p: any) => sum + (p.inquiry_count || 0), 0)
      setStats({ total: res.data.length, views: totalViews, inquiries: totalInquiries })
    } catch (err) {
      console.error('Failed to fetch properties')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this property?')) return
    try {
      await api.delete(`/api/properties/${id}`)
      toast.success('Property deleted')
      fetchMyProperties()
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Delete failed')
    }
  }

  const isLandlord = user?.role === 'landlord'

  return (
    <div className="min-h-screen">
      <div className="bg-dark-900/50 border-b border-dark-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-dark-400 mt-1">Welcome back, {user?.full_name}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-dark-500 text-sm">Total Listings</p>
                <p className="text-3xl font-bold text-white mt-1">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-brand-500/10 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-brand-500" />
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-dark-500 text-sm">Total Views</p>
                <p className="text-3xl font-bold text-white mt-1">{stats.views}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                <Eye className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-dark-500 text-sm">Inquiries</p>
                <p className="text-3xl font-bold text-white mt-1">{stats.inquiries}</p>
              </div>
              <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-purple-500" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Actions */}
        {isLandlord && (
          <div className="mb-8">
            <Link to="/list-property" className="btn-primary inline-flex">
              <Plus className="w-5 h-5" />
              List New Property
            </Link>
          </div>
        )}

        {/* My Listings */}
        {isLandlord && (
          <div>
            <h2 className="text-xl font-semibold text-white mb-6">My Listings</h2>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
              </div>
            ) : myProperties.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <Building2 className="w-16 h-16 text-dark-700 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-dark-200 mb-2">No properties yet</h3>
                <p className="text-dark-500 mb-6">Start by listing your first property</p>
                <Link to="/list-property" className="btn-primary">
                  <Plus className="w-4 h-4" />
                  List Property
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {myProperties.map((property) => (
                  <motion.div
                    key={property.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="glass-card p-4 flex flex-col sm:flex-row gap-4"
                  >
                    <img
                      src={property.images?.[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=200&q=80'}
                      alt={property.title}
                      className="w-full sm:w-48 h-32 object-cover rounded-xl"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-semibold text-dark-100 truncate">{property.title}</h3>
                          <div className="flex items-center gap-1 mt-1 text-dark-400 text-sm">
                            <MapPin className="w-3.5 h-3.5" />
                            <span className="truncate">{property.ward}, {property.county}</span>
                          </div>
                        </div>
                        <span className="badge-brand flex-shrink-0">{propertyTypeLabel(property.property_type)}</span>
                      </div>
                      <div className="flex items-center gap-4 mt-3 text-sm text-dark-400">
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4 text-brand-500" />
                          {formatPrice(property.monthly_rent)}/mo
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {property.view_count} views
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-4 h-4" />
                          {property.inquiry_count} inquiries
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(property.created_at)}
                        </span>
                      </div>
                    </div>
                    <div className="flex sm:flex-col gap-2">
                      <Link
                        to={`/property/${property.id}`}
                        className="p-2 bg-dark-800 rounded-lg text-dark-400 hover:text-brand-400 hover:bg-dark-700 transition-all"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(property.id)}
                        className="p-2 bg-dark-800 rounded-lg text-dark-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Renter Dashboard */}
        {!isLandlord && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link to="/search" className="glass-card-hover p-8 text-center">
              <Search className="w-12 h-12 text-brand-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Search Properties</h3>
              <p className="text-dark-400 text-sm">Find your perfect home across all 47 counties</p>
            </Link>
            <Link to="/favorites" className="glass-card-hover p-8 text-center">
              <Heart className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">My Favorites</h3>
              <p className="text-dark-400 text-sm">View and manage your saved properties</p>
            </Link>
            <Link to="/messages" className="glass-card-hover p-8 text-center">
              <MessageSquare className="w-12 h-12 text-purple-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Messages</h3>
              <p className="text-dark-400 text-sm">Chat with landlords about properties</p>
            </Link>
            <Link to="/profile" className="glass-card-hover p-8 text-center">
              <User className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">My Profile</h3>
              <p className="text-dark-400 text-sm">Update your account information</p>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
