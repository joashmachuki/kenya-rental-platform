import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  ShieldCheck, ShieldAlert, CheckCircle2, XCircle, 
  ArrowLeft, Eye, FileText, User, Clock
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import axios from 'axios'
import toast from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_URL || ''

interface PendingUser {
  id: number
  full_name: string
  email: string
  phone: string
  id_number: string
  id_document_url: string
  verification_submitted_at: string
  created_at: string
}

export default function AdminVerification() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<PendingUser | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectModal, setShowRejectModal] = useState(false)

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/')
      return
    }
    fetchPendingUsers()
  }, [user])

  const fetchPendingUsers = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await axios.get(`${API_URL}/api/admin/pending-verifications`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setPendingUsers(res.data.users || [])
    } catch (err) {
      toast.error('Failed to fetch pending verifications')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (userId: number) => {
    try {
      const token = localStorage.getItem('token')
      await axios.post(`${API_URL}/api/verification/admin/approve/${userId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toast.success('User verified successfully')
      fetchPendingUsers()
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to approve')
    }
  }

  const handleReject = async () => {
    if (!selectedUser || !rejectReason.trim()) return
    try {
      const token = localStorage.getItem('token')
      await axios.post(`${API_URL}/api/verification/admin/reject/${selectedUser.id}?reason=${encodeURIComponent(rejectReason)}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toast.success('Verification rejected')
      setShowRejectModal(false)
      setRejectReason('')
      setSelectedUser(null)
      fetchPendingUsers()
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to reject')
    }
  }

  const openRejectModal = (user: PendingUser) => {
    setSelectedUser(user)
    setShowRejectModal(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-950">
        <div className="w-8 h-8 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-950">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="mb-8">
            <button
              onClick={() => navigate('/admin')}
              className="inline-flex items-center gap-2 text-dark-400 hover:text-white transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Admin
            </button>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white">Identity Verifications</h1>
                <p className="mt-2 text-dark-400">Review and approve landlord identity documents</p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                <Clock className="w-5 h-5 text-amber-400" />
                <span className="text-amber-400 font-medium">{pendingUsers.length} Pending</span>
              </div>
            </div>
          </div>

          {pendingUsers.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <ShieldCheck className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">All Caught Up!</h3>
              <p className="text-dark-400">No pending identity verifications</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingUsers.map((pendingUser) => (
                <motion.div
                  key={pendingUser.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card p-6"
                >
                  <div className="flex items-start gap-6">
                    <div className="w-14 h-14 bg-brand-600 rounded-xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                      {pendingUser.full_name.charAt(0).toUpperCase()}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-semibold text-white">{pendingUser.full_name}</h3>
                          <div className="flex items-center gap-4 mt-1 text-sm text-dark-400">
                            <span className="flex items-center gap-1">
                              <User className="w-3.5 h-3.5" />
                              {pendingUser.email}
                            </span>
                            <span>{pendingUser.phone}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-dark-500">ID: {pendingUser.id_number}</span>
                            <span className="text-xs text-dark-600">|</span>
                            <span className="text-xs text-dark-500">
                              Submitted {new Date(pendingUser.verification_submitted_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => handleApprove(pendingUser.id)}
                            className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-medium transition-all flex items-center gap-2"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            Approve
                          </button>
                          <button
                            onClick={() => openRejectModal(pendingUser)}
                            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-medium transition-all flex items-center gap-2"
                          >
                            <XCircle className="w-4 h-4" />
                            Reject
                          </button>
                        </div>
                      </div>

                      {pendingUser.id_document_url && (
                        <div className="mt-4 p-4 bg-dark-900/50 rounded-xl">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-dark-300">ID Document</span>
                            <a
                              href={`${API_URL}${pendingUser.id_document_url}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-brand-400 hover:text-brand-300 flex items-center gap-1"
                            >
                              <Eye className="w-4 h-4" />
                              View Full Size
                            </a>
                          </div>
                          <img
                            src={`${API_URL}${pendingUser.id_document_url}`}
                            alt="ID Document"
                            className="max-h-64 rounded-lg border border-dark-800"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {showRejectModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card w-full max-w-lg p-6"
          >
            <h3 className="text-xl font-bold text-white mb-2">Reject Verification</h3>
            <p className="text-dark-400 text-sm mb-4">
              Rejecting {selectedUser.full_name}'s identity verification
            </p>
            
            <div className="mb-4">
              <label className="label">Reason for Rejection</label>
              <select
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="input-field w-full mb-3"
              >
                <option value="">Select reason</option>
                <option value="unclear_photo">Unclear photo / blurry</option>
                <option value="wrong_document">Wrong document type</option>
                <option value="expired_id">Expired ID</option>
                <option value="mismatched_name">Name doesn't match account</option>
                <option value="suspicious">Suspicious document</option>
                <option value="other">Other</option>
              </select>
              
              {rejectReason === 'other' && (
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Enter custom reason..."
                  className="input-field w-full h-24 resize-none"
                />
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false)
                  setRejectReason('')
                  setSelectedUser(null)
                }}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim()}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white px-4 py-3 rounded-xl font-medium transition-all disabled:opacity-50"
              >
                Reject Verification
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
