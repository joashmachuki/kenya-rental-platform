import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  User, Mail, Phone, MapPin, Edit2, CheckCircle2, 
  Building2, Loader2, Camera
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import api from '../services/api'
import toast from 'react-hot-toast'

export default function Profile() {
  const { user, updateUser } = useAuthStore()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    location: user?.location || '',
    bio: user?.bio || '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      const res = await api.put('/api/auth/me', formData)
      updateUser(res.data)
      setIsEditing(false)
      toast.success('Profile updated successfully')
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Update failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      <div className="bg-dark-900/50 border-b border-dark-800/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-white">My Profile</h1>
          <p className="text-dark-400 mt-1">Manage your account information</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:col-span-1"
          >
            <div className="glass-card p-6 text-center">
              <div className="relative inline-block">
                <div className="w-24 h-24 bg-brand-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto">
                  {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-dark-800 border border-dark-700 rounded-full flex items-center justify-center text-dark-400 hover:text-brand-400 transition-colors">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <h2 className="mt-4 text-xl font-semibold text-white">{user?.full_name}</h2>
              <p className="text-dark-400 text-sm capitalize">{user?.role}</p>
              <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 bg-brand-500/10 border border-brand-500/20 rounded-full text-brand-400 text-xs font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {user?.is_verified ? 'Verified' : 'Unverified'}
              </div>
            </div>
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="md:col-span-2"
          >
            <div className="glass-card p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Account Details</h2>
                <button
                  onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                  disabled={isLoading}
                  className="btn-primary text-sm py-2"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isEditing ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Save Changes
                    </>
                  ) : (
                    <>
                      <Edit2 className="w-4 h-4" />
                      Edit Profile
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="label flex items-center gap-2">
                    <User className="w-4 h-4 text-brand-500" />
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      className="input-field"
                    />
                  ) : (
                    <p className="text-dark-200 py-3">{user?.full_name}</p>
                  )}
                </div>

                <div>
                  <label className="label flex items-center gap-2">
                    <Mail className="w-4 h-4 text-brand-500" />
                    Email Address
                  </label>
                  <p className="text-dark-200 py-3">{user?.email}</p>
                </div>

                <div>
                  <label className="label flex items-center gap-2">
                    <Phone className="w-4 h-4 text-brand-500" />
                    Phone Number
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="input-field"
                    />
                  ) : (
                    <p className="text-dark-200 py-3">{user?.phone || 'Not set'}</p>
                  )}
                </div>

                <div>
                  <label className="label flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-brand-500" />
                    Location
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="e.g., Nairobi, Kenya"
                      className="input-field"
                    />
                  ) : (
                    <p className="text-dark-200 py-3">{user?.location || 'Not set'}</p>
                  )}
                </div>

                <div>
                  <label className="label">Bio</label>
                  {isEditing ? (
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      placeholder="Tell us about yourself..."
                      className="input-field h-24 resize-none"
                    />
                  ) : (
                    <p className="text-dark-200 py-3">{user?.bio || 'No bio added yet'}</p>
                  )}
                </div>

                <div>
                  <label className="label flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-brand-500" />
                    Account Type
                  </label>
                  <p className="text-dark-200 py-3 capitalize">{user?.role}</p>
                </div>

                <div>
                  <label className="label">Member Since</label>
                  <p className="text-dark-200 py-3">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-KE', { 
                      year: 'numeric', month: 'long', day: 'numeric' 
                    }) : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
