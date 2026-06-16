import { useState } from 'react'
import { X, Flag, AlertTriangle, Check } from 'lucide-react'
import api from '../services/api'

interface ReportModalProps {
  isOpen: boolean
  onClose: () => void
  propertyId: number
  propertyTitle: string
}

export default function ReportModal({ isOpen, onClose, propertyId, propertyTitle }: ReportModalProps) {
  const [reason, setReason] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const reasons = [
    { label: 'Fake or misleading listing', value: 'fake_listing' },
    { label: 'Price is suspiciously low', value: 'wrong_price' },
    { label: 'Landlord is unresponsive', value: 'other' },
    { label: 'Property does not exist', value: 'already_rented' },
    { label: 'Scam or fraud', value: 'scam' },
    { label: 'Inappropriate content', value: 'other' },
    { label: 'Other', value: 'other' }
  ]

  const handleSubmit = async () => {
    if (!reason) {
      setError('Please select a reason')
      return
    }

    setLoading(true)
    setError('')
    try {
      await api.post(`/api/security/report-property/${propertyId}`, {
        reason,
        details: description
      })
      setSuccess(true)
      setTimeout(() => {
        onClose()
        setSuccess(false)
        setReason('')
        setDescription('')
      }, 2000)
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError('Please log in to report listings')
      } else {
        setError(err.response?.data?.detail || 'Failed to submit report. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>

        {success ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Report Submitted</h3>
            <p className="text-gray-600">Thank you for helping keep our platform safe.</p>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Flag className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Report Listing</h3>
              <p className="text-gray-600 text-sm">{propertyTitle}</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="space-y-3 mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <AlertTriangle className="w-4 h-4 inline mr-1" />
                Reason for reporting
              </label>
              {reasons.map((r) => (
                <button
                  key={r.value + r.label}
                  onClick={() => setReason(r.value)}
                  className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                    reason === r.value
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Additional details (optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Describe the issue..."
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Report'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
