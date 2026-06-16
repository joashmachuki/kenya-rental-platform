import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, Phone, Loader2, CheckCircle2 } from 'lucide-react'
import api from '../services/api'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

export default function VerifyPhone() {
  const navigate = useNavigate()
  const { checkAuth } = useAuthStore()
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'phone' | 'otp' | 'success'>('phone')
  const [loading, setLoading] = useState(false)

  const cleanPhone = (p: string) => p.replace(/\s/g, '')

  const handleSendOTP = async () => {
    const cleaned = cleanPhone(phone)
    
    if (!cleaned.match(/^\+?254[0-9]{9}$/)) {
      toast.error('Invalid phone number. Use format: +2547XXXXXXXX')
      return
    }

    setLoading(true)
    try {
      await api.post('/api/security/send-otp', { phone: cleaned })
      toast.success('OTP sent to your phone')
      setStep('otp')
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      toast.error('Enter the 6-digit OTP')
      return
    }

    setLoading(true)
    try {
      const cleaned = cleanPhone(phone)
      await api.post('/api/security/verify-otp', { phone: cleaned, otp })
      
      toast.success('Phone verified successfully')
      
      await checkAuth()
      
      setStep('success')
      setTimeout(() => navigate('/verify-identity'), 1500)
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Invalid OTP')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="glass-card w-full max-w-md p-8">
        {step === 'success' ? (
          <div className="text-center">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Phone Verified</h2>
            <p className="text-dark-400">Redirecting to identity verification...</p>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-brand-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {step === 'phone' ? 'Verify Your Phone' : 'Enter OTP'}
              </h2>
              <p className="text-dark-400 text-sm">
                {step === 'phone'
                  ? 'Required before listing properties'
                  : `Enter the 6-digit code sent to ${cleanPhone(phone)}`}
              </p>
            </div>

            {step === 'phone' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+2547XXXXXXXX"
                      className="input-field pl-10"
                    />
                  </div>
                </div>
                <button
                  onClick={handleSendOTP}
                  disabled={loading}
                  className="btn-primary w-full"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send OTP'}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">OTP Code</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                    placeholder="000000"
                    className="input-field text-center text-2xl tracking-widest"
                    maxLength={6}
                  />
                </div>
                <button
                  onClick={handleVerifyOTP}
                  disabled={loading || otp.length !== 6}
                  className="btn-primary w-full"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify OTP'}
                </button>
                <button
                  onClick={() => setStep('phone')}
                  className="text-dark-500 hover:text-dark-300 text-sm w-full"
                >
                  Change phone number
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
