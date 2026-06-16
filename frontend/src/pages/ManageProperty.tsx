import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Home, Eye, MessageSquare, Heart, TrendingUp, Trash2, Edit3, CheckCircle, XCircle, Loader2, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function ManageProperty() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, token } = useAuthStore();
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchProperty();
  }, [id, user]);

  const fetchProperty = async () => {
    try {
      const res = await fetch(`${API_URL}/api/properties/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch property');
      const data = await res.json();
      setProperty(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async () => {
    setActionLoading(true);
    const newStatus = property.status === 'available' ? 'rented' : 'available';
    try {
      const res = await fetch(`${API_URL}/api/properties/${id}/status?status=${newStatus}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to update status');
      setProperty({ ...property, status: newStatus });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const deleteProperty = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/properties/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete');
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-slate-400">Property not found</div>
      </div>
    );
  }

  const isAvailable = property.status === 'available' || property.status === 'AVAILABLE';

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <main className="pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Header */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(`/property/${id}`)}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">Manage Property</h1>
                <p className="text-slate-400">{property.title}</p>
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
                {error}
              </div>
            )}

            {/* Status Card */}
            <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Home className="w-5 h-5 text-emerald-500" />
                  Property Status
                </h2>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  isAvailable ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {isAvailable ? 'VACANT' : 'RENTED'}
                </span>
              </div>
              <p className="text-slate-400 mb-4">
                {isAvailable 
                  ? 'Your property is visible to renters. Mark as rented when you find a tenant.'
                  : 'Your property is hidden from search. Mark as available when the tenant moves out.'}
              </p>
              <button
                onClick={toggleStatus}
                disabled={actionLoading}
                className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  isAvailable 
                    ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                } disabled:opacity-50`}
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                  isAvailable ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />
                )}
                {isAvailable ? 'Mark as Rented' : 'Mark as Available'}
              </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
                <div className="flex items-center gap-3 mb-2">
                  <Eye className="w-5 h-5 text-blue-500" />
                  <span className="text-slate-400">Views</span>
                </div>
                <p className="text-3xl font-bold text-white">{property.views || 0}</p>
              </div>
              <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
                <div className="flex items-center gap-3 mb-2">
                  <MessageSquare className="w-5 h-5 text-purple-500" />
                  <span className="text-slate-400">Inquiries</span>
                </div>
                <p className="text-3xl font-bold text-white">{property.inquiries || 0}</p>
              </div>
              <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
                <div className="flex items-center gap-3 mb-2">
                  <Heart className="w-5 h-5 text-pink-500" />
                  <span className="text-slate-400">Saved</span>
                </div>
                <p className="text-3xl font-bold text-white">{property.favorites_count || 0}</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
              <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => navigate(`/edit-property/${id}`)}
                  className="p-4 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors flex items-center gap-3 text-left"
                >
                  <Edit3 className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-white font-medium">Edit Property</p>
                    <p className="text-slate-400 text-sm">Update details, photos, price</p>
                  </div>
                </button>
                <button
                  onClick={() => navigate(`/property/${id}`)}
                  className="p-4 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors flex items-center gap-3 text-left"
                >
                  <Eye className="w-5 h-5 text-emerald-400" />
                  <div>
                    <p className="text-white font-medium">Preview Listing</p>
                    <p className="text-slate-400 text-sm">See how renters view it</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Feature Listing */}
            <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-5 h-5 text-yellow-500" />
                <h2 className="text-lg font-semibold text-white">Boost Visibility</h2>
              </div>
              <p className="text-slate-400 mb-4">
                Feature your property to appear at the top of search results and get more views.
              </p>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 rounded-lg bg-yellow-500/20 text-yellow-400 font-medium hover:bg-yellow-500/30 transition-colors"
              >
                Go to Dashboard to Feature
              </button>
            </div>

            {/* Danger Zone */}
            <div className="bg-slate-900 rounded-2xl p-6 border border-red-500/20">
              <h2 className="text-lg font-semibold text-red-400 flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5" />
                Danger Zone
              </h2>
              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-6 py-3 rounded-lg bg-red-500/20 text-red-400 font-medium hover:bg-red-500/30 transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Property
                </button>
              ) : (
                <div className="space-y-4">
                  <p className="text-slate-400">
                    Are you sure? This will permanently delete your property listing. This action cannot be undone.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={deleteProperty}
                      disabled={actionLoading}
                      className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      Yes, Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
