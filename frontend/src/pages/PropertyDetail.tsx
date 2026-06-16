import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  MapPin, BedDouble, Bath, Maximize, Calendar, User, 
  Phone, Mail, Heart, Share2, Flag, ChevronLeft, ChevronRight,
  MessageSquare, CheckCircle2, ArrowLeft, Loader2, Lock,
  ShieldCheck, ShieldAlert, AlertTriangle, Edit3, Home
} from 'lucide-react'
import { usePropertyStore } from '../store/propertyStore'
import { useAuthStore } from '../store/authStore'
import { formatPrice, propertyTypeLabel, formatDate } from '../utils/formatters'
import api from '../services/api'
import toast from 'react-hot-toast'
import { SecurityBadge } from '../components/security/SecurityBadge'
import { EscrowStatus } from '../components/security/EscrowStatus'
import { ScamWarningBanner } from '../components/security/ScamWarningBanner'

export default function PropertyDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { currentProperty, getProperty, favorites, toggleFavorite, isLoading } = usePropertyStore()
  const { isAuthenticated, user } = useAuthStore()
  const [currentImage, setCurrentImage] = useState(0)
  const [showContactModal, setShowContactModal] = useState(false)
  const [messageText, setMessageText] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)
  const [escrow, setEscrow] = useState<any>(null)
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [reportDetails, setReportDetails] = useState('')
  const [contactRevealed, setContactRevealed] = useState(false)
  const [landlordContact, setLandlordContact] = useState<any>(null)
  const [scamWarning, setScamWarning] = useState<string[] | null>(null)

  useEffect(() => {
    if (id) {
      getProperty(Number(id))
      checkEscrow()
    }
  }, [id])

  const checkEscrow = async () => {
    if (!isAuthenticated || !id) return
    try {
      const res = await api.get(`/api/check-unlock/${id}`)
      if (res.data.unlocked) {
        setEscrow({ status: 'held', amount: 50 })
      }
    } catch {
      // Not unlocked yet
    }
  }

  const property = currentProperty
  const isFavorite = property ? favorites.includes(property.id) : false
  const isOwner = isAuthenticated && user && property && Number(user.id) === Number(property.owner_id)

  const handleUnlock = async () => {
    try {
      const res = await api.post('/api/security/initiate-escrow', {
        property_id: Number(id),
        amount: 50
      })
      setEscrow(res.data)
      toast.success('Payment held in escrow. You can now message the landlord.')
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to unlock')
    }
  }

  const handleConfirmViewing = async () => {
    if (!escrow) return
    try {
      await api.post(`/api/security/confirm-viewing/${escrow.escrow_id || 1}`)
      setEscrow({ ...escrow, status: 'released' })
      toast.success('Viewing confirmed. Payment released to landlord.')
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to confirm')
    }
  }

  const handleDispute = async () => {
    if (!escrow) return
    try {
      await api.post(`/api/security/dispute/${escrow.escrow_id || 1}`, {
        reason: 'Property does not match listing'
      })
      setEscrow({ ...escrow, status: 'disputed' })
      toast.success('Dispute filed. Our team will review within 24 hours.')
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to dispute')
    }
  }

  const handleRevealContact = async () => {
    if (!property?.owner_id) return
    try {
      const res = await api.get(`/api/security/landlord-contact/${property.owner_id}`)
      setLandlordContact(res.data)
      setContactRevealed(true)
    } catch (err: any) {
      if (err.response?.status === 403) {
        toast.error('Pay unlock fee to see contact details')
      }
    }
  }

  const handleSendMessage = async () => {
    if (!messageText.trim()) return
    setSendingMessage(true)
    try {
      const res = await api.post('/api/messages', {
        property_id: property?.id,
        receiver_id: property?.owner_id,
        content: messageText
      })
      if (res.data.warning) {
        setScamWarning(res.data.detected_keywords || [])
      }
      toast.success('Message sent successfully!')
      setMessageText('')
      setShowContactModal(false)
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to send message')
    } finally {
      setSendingMessage(false)
    }
  }

  const handleReport = async () => {
    if (!reportReason) return
    try {
      await api.post('/api/security/report', {
        property_id: property?.id,
        reason: reportReason,
        details: reportDetails
      })
      toast.success('Report submitted. Thank you for keeping the community safe.')
      setShowReportModal(false)
      setReportReason('')
      setReportDetails('')
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to submit report')
    }
  }

  const nextImage = () => {
    if (property?.images) {
      setCurrentImage((prev) => (prev + 1) % property.images.length)
    }
  }

  const prevImage = () => {
    if (property?.images) {
      setCurrentImage((prev) => (prev - 1 + property.images.length) % property.images.length)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
      </div>
    )
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-dark-300 mb-2">Property not found</h2>
          <button onClick={() => navigate('/')} className="btn-primary mt-4">
            Back to Browse
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-950">
      <div className="relative h-[50vh] md:h-[60vh] bg-dark-900">
        <img
          src={property.images?.[currentImage] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80'}
          alt={property.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/20 to-transparent" />
        
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 p-2 bg-dark-900/80 backdrop-blur-sm rounded-xl text-white hover:bg-dark-800 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {property.images && property.images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-dark-900/80 backdrop-blur-sm rounded-xl text-white hover:bg-dark-800 transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-dark-900/80 backdrop-blur-sm rounded-xl text-white hover:bg-dark-800 transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
          <div className="flex gap-2">
            <span className="badge-brand">{propertyTypeLabel(property.property_type)}</span>
            {property.negotiable && <span className="badge bg-amber-500/10 text-amber-400 border border-amber-500/20">Negotiable</span>}
            {property.furnished && <span className="badge bg-purple-500/10 text-purple-400 border border-purple-500/20">Furnished</span>}
            {isOwner && (
              <span className="badge bg-brand-600 text-white border border-brand-500">
                <Home className="w-3 h-3 mr-1" />
                Your Property
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => toggleFavorite(property.id)}
              className="p-2 bg-dark-900/80 backdrop-blur-sm rounded-xl text-white hover:bg-dark-800 transition-all"
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'text-red-500 fill-red-500' : ''}`} />
            </button>
            <button className="p-2 bg-dark-900/80 backdrop-blur-sm rounded-xl text-white hover:bg-dark-800 transition-all">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-white">{property.title}</h1>
              <div className="flex items-center gap-2 mt-2 text-dark-400">
                <MapPin className="w-4 h-4 text-brand-500" />
                <span>{property.ward}, {property.sub_county}, {property.county}</span>
              </div>
            </div>

            <div className="flex items-center gap-6 text-dark-400">
              {property.bedrooms > 0 && (
                <div className="flex items-center gap-2">
                  <BedDouble className="w-5 h-5 text-brand-500" />
                  <span>{property.bedrooms} Bedrooms</span>
                </div>
              )}
              {property.bathrooms > 0 && (
                <div className="flex items-center gap-2">
                  <Bath className="w-5 h-5 text-brand-500" />
                  <span>{property.bathrooms} Bathrooms</span>
                </div>
              )}
              {property.square_footage && (
                <div className="flex items-center gap-2">
                  <Maximize className="w-5 h-5 text-brand-500" />
                  <span>{property.square_footage} sqft</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-brand-500" />
                <span>Listed {formatDate(property.created_at)}</span>
              </div>
            </div>

            <div className="glass-card p-6">
              <h2 className="text-xl font-bold text-white mb-4">Description</h2>
              <p className="text-dark-400 leading-relaxed">{property.description}</p>
            </div>

            {property.amenities && property.amenities.length > 0 && (
              <div className="glass-card p-6">
                <h2 className="text-xl font-bold text-white mb-4">Amenities</h2>
                <div className="flex flex-wrap gap-2">
                  {property.amenities.map((amenity) => (
                    <span key={amenity} className="badge-dark">{amenity}</span>
                  ))}
                </div>
              </div>
            )}

            {isOwner && (
              <div className="glass-card p-6 border border-brand-500/30">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Home className="w-5 h-5 text-brand-400" />
                  Property Management
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-dark-900/50 rounded-xl">
                    <span className="text-dark-400">Status</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      property.status === 'available' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {property.status === 'available' ? 'VACANT' : 'TAKEN'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-dark-900/50 rounded-xl">
                    <span className="text-dark-400">Views</span>
                    <span className="text-white font-medium">{property.view_count || 0}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-dark-900/50 rounded-xl">
                    <span className="text-dark-400">Inquiries</span>
                    <span className="text-white font-medium">{property.inquiry_count || 0}</span>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => navigate(`/edit-property/${property.id}`)}
                      className="flex-1 btn-secondary flex items-center justify-center gap-2"
                    >
                      <Edit3 className="w-4 h-4" />
                      Edit Property
                    </button>
                    <button
                      onClick={() => navigate(`/manage-property/${property.id}`)}
                      className="flex-1 btn-primary flex items-center justify-center gap-2"
                    >
                      <Home className="w-4 h-4" />
                      Dashboard
                    </button>
                  </div>
                </div>
              </div>
            )}

            {scamWarning && (
              <ScamWarningBanner keywords={scamWarning} />
            )}
          </div>

          <div className="space-y-6">
            <div className="glass-card p-6">
              <div className="text-3xl font-bold text-white mb-1">
                {formatPrice(property.monthly_rent)}<span className="text-lg font-normal text-dark-500">/mo</span>
              </div>
              {property.deposit_amount > 0 && (
                <p className="text-dark-400 text-sm">Deposit: {formatPrice(property.deposit_amount)}</p>
              )}
            </div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card p-6 sticky top-24"
            >
              {property.owner && (
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-dark-800/50">
                  <div className="w-12 h-12 bg-brand-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {property.owner.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium text-dark-100">{property.owner.full_name}</div>
                    <SecurityBadge
                      verificationStatus={property.owner.verification_status || 'pending'}
                      trustScore={property.owner.trust_score || 0}
                      reportCount={property.owner.report_count || 0}
                      isBanned={property.owner.is_banned || false}
                      size="sm"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {isOwner ? (
                  <div className="space-y-3">
                    <div className="p-3 bg-brand-500/10 border border-brand-500/20 rounded-xl">
                      <p className="text-brand-400 text-sm font-medium">Your Contact Info</p>
                      <p className="text-dark-400 text-xs mt-1">This is what renters see after unlocking</p>
                    </div>
                    {property.contact_phone && (
                      <a href={`tel:${property.contact_phone}`} className="btn-secondary w-full flex items-center justify-center gap-2">
                        <Phone className="w-4 h-4" />
                        {property.contact_phone}
                      </a>
                    )}
                    {property.contact_email && (
                      <a href={`mailto:${property.contact_email}`} className="btn-secondary w-full flex items-center justify-center gap-2">
                        <Mail className="w-4 h-4" />
                        {property.contact_email}
                      </a>
                    )}
                    <button
                      onClick={() => navigate(`/manage-property/${property.id}`)}
                      className="btn-primary w-full flex items-center justify-center gap-2"
                    >
                      <Home className="w-4 h-4" />
                      Manage Property
                    </button>
                  </div>
                ) : isAuthenticated ? (
                  escrow?.status === 'held' || escrow?.status === 'released' ? (
                    <>
                      <button
                        onClick={() => setShowContactModal(true)}
                        className="btn-primary w-full"
                      >
                        <MessageSquare className="w-4 h-4" />
                        Send Message
                      </button>
                      {contactRevealed && landlordContact ? (
                        <>
                          <a href={`tel:${landlordContact.phone}`} className="btn-secondary w-full flex items-center justify-center gap-2">
                            <Phone className="w-4 h-4" />
                            {landlordContact.phone}
                          </a>
                          {landlordContact.email && (
                            <a href={`mailto:${landlordContact.email}`} className="btn-secondary w-full flex items-center justify-center gap-2">
                              <Mail className="w-4 h-4" />
                              Email Landlord
                            </a>
                          )}
                        </>
                      ) : (
                        <button
                          onClick={handleRevealContact}
                          className="btn-secondary w-full"
                        >
                          <Phone className="w-4 h-4" />
                          Reveal Contact
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-dark-400 text-sm mb-2">Unlock to contact landlord</p>
                      <p className="text-dark-500 text-xs mb-4">KSh 50 held in escrow until you confirm viewing</p>
                      <button onClick={handleUnlock} className="btn-primary w-full">
                        Pay KSh 50 via M-Pesa
                      </button>
                    </div>
                  )
                ) : (
                  <div className="text-center py-4">
                    <p className="text-dark-400 text-sm mb-4">Sign in to contact the landlord</p>
                    <button onClick={() => navigate('/login')} className="btn-primary w-full">
                      Sign In to Contact
                    </button>
                  </div>
                )}
              </div>

              {!isOwner && (
                <div className="mt-6 pt-6 border-t border-dark-800/50">
                  <button
                    onClick={() => setShowReportModal(true)}
                    className="w-full flex items-center justify-center gap-2 text-red-400 hover:text-red-300 text-sm transition-colors"
                  >
                    <Flag className="w-4 h-4" />
                    Report Listing
                  </button>
                </div>
              )}
            </motion.div>

            {escrow && !isOwner && (
              <EscrowStatus
                status={escrow.status}
                amount={escrow.amount || 50}
                onConfirmViewing={handleConfirmViewing}
                onDispute={handleDispute}
              />
            )}
          </div>
        </div>
      </div>

      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card w-full max-w-lg p-6"
          >
            <h3 className="text-xl font-bold text-white mb-4">Message Landlord</h3>
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Hi, I'm interested in this property..."
              className="input-field w-full h-32 resize-none"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowContactModal(false)}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleSendMessage}
                disabled={sendingMessage}
                className="flex-1 btn-primary"
              >
                {sendingMessage ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card w-full max-w-lg p-6"
          >
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              Report Listing
            </h3>
            <select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="input-field w-full mb-4"
            >
              <option value="">Select reason</option>
              <option value="fake">Fake listing</option>
              <option value="scam">Potential scam</option>
              <option value="misleading">Misleading information</option>
              <option value="unavailable">Property no longer available</option>
              <option value="other">Other</option>
            </select>
            <textarea
              value={reportDetails}
              onChange={(e) => setReportDetails(e.target.value)}
              placeholder="Provide details..."
              className="input-field w-full h-32 resize-none mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowReportModal(false)}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleReport}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white px-4 py-3 rounded-xl font-medium transition-all"
              >
                Submit Report
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
