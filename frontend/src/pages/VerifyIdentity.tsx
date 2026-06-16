import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Upload, ShieldCheck, ShieldAlert, Clock, CheckCircle2, 
  XCircle, ArrowLeft, FileText, Camera, AlertTriangle,
  Eye, EyeOff
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import axios from 'axios'
import toast from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_URL || ''

export default function VerifyIdentity() {
  const navigate = useNavigate()
  const { user, updateUser } = useAuthStore()
  const [idNumber, setIdNumber] = useState('')
  const [idFile, setIdFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<string>(user?.verification_status || 'pending')
  const [documentUrl, setDocumentUrl] = useState<string | null>(user?.id_document_url || null)
  const [showPreview, setShowPreview] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchStatus()
  }, [])

  const fetchStatus = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await axios.get(`${API_URL}/api/verification/status`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setStatus(res.data.verification_status)
      setDocumentUrl(res.data.id_document_url)
      setIdNumber(res.data.id_number || '')
    } catch (err) {
      console.error('Failed to fetch status', err)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large. Max 5MB')
      return
    }

    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
    if (!allowed.includes(file.type)) {
      toast.error('Invalid file type. Only JPG, PNG, WebP, PDF allowed')
      return
    }

    setIdFile(file)
    
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => setPreview(e.target?.result as string)
      reader.readAsDataURL(file)
    } else {
      setPreview(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!idNumber.trim()) {
      toast.error('Please enter your ID number')
      return
    }
    
    if (!idFile) {
      toast.error('Please upload your ID document')
      return
    }

    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const formData = new FormData()
      formData.append('id_number', idNumber)
      formData.append('id_file', idFile)

      const res = await axios.post(`${API_URL}/api/verification/upload-id`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      })

      toast.success(res.data.message)
      setStatus('pending')
      setDocumentUrl(res.data.id_document_url)
      updateUser({ verification_status: 'pending' })
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  const getStatusConfig = () => {
    switch (status) {
      case 'verified':
        return {
          icon: ShieldCheck,
          color: 'text-green-400',
          bg: 'bg-green-500/10 border-green-500/20',
          title: 'Identity Verified',
          message: 'Your identity has been verified. You can now list properties.'
        }
      case 'pending':
        return {
          icon: Clock,
          color: 'text-amber-400',
          bg: 'bg-amber-500/10 border-amber-500/20',
          title: 'Verification Pending',
          message: 'Your ID is under review. This usually takes 24-48 hours.'
        }
      case 'rejected':
        return {
          icon: XCircle,
          color: 'text-red-400',
          bg: 'bg-red-500/10 border-red-500/20',
          title: 'Verification Rejected',
          message: 'Your ID was rejected. Please upload a clearer photo and try again.'
        }
      default:
        return {
          icon: ShieldAlert,
          color: 'text-dark-400',
          bg: 'bg-dark-800/50 border-dark-700/50',
          title: 'Not Verified',
          message: 'Upload your national ID to verify your identity and list properties.'
        }
    }
  }

  const statusConfig = getStatusConfig()
  const StatusIcon = statusConfig.icon

  return (
    <div className="min-h-screen bg-dark-950">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <button
              onClick={() => navigate('/landlord-dashboard')}
              className="inline-flex items-center gap-2 text-dark-400 hover:text-white transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold text-white">Identity Verification</h1>
            <p className="mt-2 text-dark-400">Verify your identity to list properties and build trust with renters</p>
          </div>

          <div className={`rounded-xl border p-6 mb-8 ${statusConfig.bg}`}>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl ${statusConfig.bg} flex items-center justify-center`}>
                <StatusIcon className={`w-6 h-6 ${statusConfig.color}`} />
              </div>
              <div>
                <h2 className={`font-semibold ${statusConfig.color}`}>{statusConfig.title}</h2>
                <p className="text-dark-400 text-sm mt-1">{statusConfig.message}</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">Why verify your identity?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-brand-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-brand-400" />
                </div>
                <div>
                  <p className="text-white font-medium text-sm">List Properties</p>
                  <p className="text-dark-500 text-xs mt-1">Only verified landlords can list</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-brand-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-5 h-5 text-brand-400" />
                </div>
                <div>
                  <p className="text-white font-medium text-sm">Build Trust</p>
                  <p className="text-dark-500 text-xs mt-1">Verified badge on your profile</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-brand-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-brand-400" />
                </div>
                <div>
                  <p className="text-white font-medium text-sm">Prevent Scams</p>
                  <p className="text-dark-500 text-xs mt-1">Protect renters from fraud</p>
                </div>
              </div>
            </div>
          </div>

          {status !== 'verified' && (
            <form onSubmit={handleSubmit} className="glass-card p-6">
              <h3 className="text-lg font-semibold text-white mb-6">Upload Your ID</h3>

              <div className="mb-6">
                <label className="label">National ID Number</label>
                <input
                  type="text"
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  placeholder="e.g., 12345678"
                  className="input-field w-full"
                  required
                />
                <p className="text-dark-500 text-xs mt-2">Enter your Kenyan National ID number</p>
              </div>

              <div className="mb-6">
                <label className="label">ID Document Photo</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                    idFile 
                      ? 'border-brand-500/50 bg-brand-500/5' 
                      : 'border-dark-700 hover:border-dark-600 bg-dark-900/50'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  
                  {preview ? (
                    <div className="relative">
                      <img 
                        src={preview} 
                        alt="ID Preview" 
                        className="max-h-48 mx-auto rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setIdFile(null)
                          setPreview(null)
                        }}
                        className="absolute top-2 right-2 p-1 bg-dark-900 rounded-full text-red-400 hover:text-red-300"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Camera className="w-12 h-12 text-dark-600 mx-auto mb-3" />
                      <p className="text-dark-400 text-sm">Click to upload or drag and drop</p>
                      <p className="text-dark-600 text-xs mt-1">JPG, PNG, WebP, PDF up to 5MB</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-dark-900/50 rounded-xl p-4 mb-6">
                <h4 className="text-sm font-medium text-white mb-3">Photo Requirements</h4>
                <ul className="space-y-2 text-sm text-dark-400">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    Clear photo of your original ID (not a copy)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    All corners visible and not cropped
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    Good lighting, no glare or shadows
                  </li>
                  <li className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-400" />
                    No blurry or low-quality images
                  </li>
                </ul>
              </div>

              <button
                type="submit"
                disabled={loading || !idFile || !idNumber}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    Submit for Verification
                  </>
                )}
              </button>
            </form>
          )}

          {status === 'pending' && documentUrl && (
            <div className="glass-card p-6 mt-6">
              <h3 className="text-lg font-semibold text-white mb-4">Submitted Document</h3>
              <div className="flex items-center gap-4 p-4 bg-dark-900/50 rounded-xl">
                <FileText className="w-10 h-10 text-brand-400" />
                <div className="flex-1">
                  <p className="text-white text-sm">ID Document</p>
                  <p className="text-dark-500 text-xs">Submitted for review</p>
                </div>
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="p-2 bg-dark-800 hover:bg-dark-700 rounded-lg text-dark-400 hover:text-white transition-all"
                >
                  {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              
              {showPreview && (
                <div className="mt-4">
                  <img 
                    src={`${API_URL}${documentUrl}`} 
                    alt="ID Document" 
                    className="max-w-full rounded-lg border border-dark-800"
                  />
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
