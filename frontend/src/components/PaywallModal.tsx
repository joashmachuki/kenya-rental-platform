import React, { useState } from 'react';
import { X, Lock, Phone, MapPin, MessageCircle, CreditCard, Check } from 'lucide-react';
import axios from 'axios';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  listingId: number;
  onUnlock: () => void;
}

const PaywallModal: React.FC<PaywallModalProps> = ({ isOpen, onClose, listingId, onUnlock }) => {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handlePayment = async () => {
    if (!phone || phone.length < 10) {
      alert('Please enter a valid M-Pesa number');
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:8000/api/mock-stk-push',
        {
          phone_number: phone,
          listing_id: listingId,
          payment_type: 'unlock'
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess(true);
      setTimeout(() => {
        onUnlock();
        onClose();
      }, 2000);
    } catch (err) {
      alert('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
            <h3 className="text-xl font-bold text-gray-900 mb-2">Payment Successful!</h3>
            <p className="text-gray-600">Contact details unlocked for 24 hours.</p>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Unlock Contact Details</h3>
              <p className="text-gray-600 text-sm">Pay KSh 50 to get full access to this listing</p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Phone className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-600">Landlord phone number</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <MapPin className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-600">Exact location & directions</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <MessageCircle className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-600">Direct chat with landlord</span>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <CreditCard className="w-4 h-4 inline mr-1" />
                M-Pesa Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 254712345678"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <button
              onClick={handlePayment}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Pay KSh 50 via M-Pesa'}
            </button>

            <p className="text-center text-xs text-gray-500 mt-3">
              Mock payment mode - no real charges
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default PaywallModal;
