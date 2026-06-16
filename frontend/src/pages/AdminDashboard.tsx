import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  DollarSign, Users, Home, TrendingUp, Shield,
  LogOut, CheckCircle, XCircle, AlertTriangle,
  BarChart3, CreditCard, Star, Flag, Ban, EyeOff
} from 'lucide-react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || ''

interface RevenueData {
  total_unlocks: number
  total_subscriptions: number
  total_featured: number
  unlock_revenue: number
  subscription_revenue: number
  featured_revenue: number
  total_revenue: number
}

interface ReportItem {
  id: number
  property_id: number
  property_title: string
  property_location: string
  landlord_name: string
  reason: string
  description: string
  status: string
  created_at: string
  property_status: string
  property_is_hidden: boolean
  reports_count: number
}

interface PendingListing {
  id: number
  title: string
  landlord: string
  location: string
  price: number
  created_at: string
}

interface PendingVerification {
  id: number
  name: string
  phone: string
  id_number: string
  id_document: string
  submitted_at: string
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [revenue, setRevenue] = useState<RevenueData | null>(null)
  const [reports, setReports] = useState<ReportItem[]>([])
  const [pendingListings, setPendingListings] = useState<PendingListing[]>([])
  const [pendingVerifications, setPendingVerifications] = useState<PendingVerification[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [reportsLoading, setReportsLoading] = useState(false)
  const [listingsLoading, setListingsLoading] = useState(false)
  const [verificationsLoading, setVerificationsLoading] = useState(false)

  useEffect(() => {
    const adminAuth = localStorage.getItem('admin_auth')
    if (!adminAuth) {
      navigate('/')
      return
    }
    fetchRevenue()
    fetchReports()
    fetchPendingListings()
    fetchPendingVerifications()
  }, [])

  const getToken = () => localStorage.getItem('token')

  const fetchRevenue = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/security/admin/revenue`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      })
      setRevenue(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchReports = async () => {
    setReportsLoading(true)
    try {
      const res = await axios.get(`${API_URL}/api/security/admin/reports`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      })
      setReports(res.data.reports || [])
    } catch (err) {
      console.error(err)
    } finally {
      setReportsLoading(false)
    }
  }

  const fetchPendingListings = async () => {
    setListingsLoading(true)
    try {
      const res = await axios.get(`${API_URL}/api/security/admin/pending-listings`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      })
      setPendingListings(res.data.listings || [])
    } catch (err) {
      console.error(err)
    } finally {
      setListingsLoading(false)
    }
  }

  const fetchPendingVerifications = async () => {
    setVerificationsLoading(true)
    try {
      const res = await axios.get(`${API_URL}/api/security/admin/pending-verifications`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      })
      setPendingVerifications(res.data.verifications || [])
    } catch (err) {
      console.error(err)
    } finally {
      setVerificationsLoading(false)
    }
  }

  const handleApproveListing = async (listingId: number) => {
    try {
      await axios.post(`${API_URL}/api/security/admin/approve-listing/${listingId}`, {}, {
        headers: { Authorization: `Bearer ${getToken()}` }
      })
      fetchPendingListings()
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to approve listing')
    }
  }

  const handleRejectListing = async (listingId: number) => {
    if (!confirm('Reject this listing? It will be hidden from public view.')) return
    try {
      await axios.post(`${API_URL}/api/security/admin/reports/${listingId}/hide-property`, {}, {
        headers: { Authorization: `Bearer ${getToken()}` }
      })
      fetchPendingListings()
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to reject listing')
    }
  }

  const handleApproveLandlord = async (userId: number) => {
    try {
      await axios.post(`${API_URL}/api/security/admin/verify-landlord/${userId}`, {}, {
        headers: { Authorization: `Bearer ${getToken()}` }
      })
      fetchPendingVerifications()
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to approve landlord')
    }
  }

  const handleDismiss = async (reportId: number) => {
    try {
      await axios.post(`${API_URL}/api/security/admin/reports/${reportId}/dismiss`, {}, {
        headers: { Authorization: `Bearer ${getToken()}` }
      })
      fetchReports()
    } catch (err) {
      alert('Failed to dismiss report')
    }
  }

  const handleHideProperty = async (reportId: number) => {
    try {
      await axios.post(`${API_URL}/api/security/admin/reports/${reportId}/hide-property`, {}, {
        headers: { Authorization: `Bearer ${getToken()}` }
      })
      fetchReports()
    } catch (err) {
      alert('Failed to hide property')
    }
  }

  const handleBanLandlord = async (reportId: number) => {
    if (!confirm('Are you sure? This will ban the landlord and hide all their properties.')) return
    try {
      await axios.post(`${API_URL}/api/security/admin/reports/${reportId}/ban-landlord`, {}, {
        headers: { Authorization: `Bearer ${getToken()}` }
      })
      fetchReports()
    } catch (err) {
      alert('Failed to ban landlord')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_auth')
    localStorage.removeItem('token')
    navigate('/')
  }

  const stats = [
    {
      title: 'Total Revenue',
      value: revenue ? `KSh ${revenue.total_revenue.toLocaleString()}` : 'KSh 0',
      icon: DollarSign,
      color: 'text-green-400',
      bg: 'bg-green-500/10'
    },
    {
      title: 'Unlock Payments',
      value: revenue ? revenue.total_unlocks.toString() : '0',
      icon: CreditCard,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10'
    },
    {
      title: 'Subscriptions',
      value: revenue ? revenue.total_subscriptions.toString() : '0',
      icon: Star,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10'
    },
    {
      title: 'Featured Listings',
      value: revenue ? revenue.total_featured.toString() : '0',
      icon: TrendingUp,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10'
    }
  ]

  const recentActivity = [
    { action: 'New unlock payment', user: 'User #123', amount: 'KSh 50', time: '2 min ago', status: 'success' },
    { action: 'Landlord subscription', user: 'User #456', amount: 'KSh 1,500', time: '15 min ago', status: 'success' },
    { action: 'Featured listing boost', user: 'User #789', amount: 'KSh 300', time: '1 hour ago', status: 'success' },
    { action: 'Listing reported', user: 'User #321', amount: '-', time: '2 hours ago', status: 'warning' },
  ]

  const getReasonLabel = (reason: string) => {
    const labels: Record<string, string> = {
      fake_listing: 'Fake Listing',
      wrong_price: 'Wrong Price',
      scam: 'Scam',
      already_rented: 'Already Rented',
      wrong_location: 'Wrong Location',
      other: 'Other'
    }
    return labels[reason] || reason
  }

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-dark-900 border-r border-dark-800 z-40">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold">KejaFind</h2>
              <p className="text-dark-500 text-xs">Admin Portal</p>
            </div>
          </div>

          <nav className="space-y-1">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'listings', label: 'Listings', icon: Home },
              { id: 'verifications', label: 'Verifications', icon: Shield },
              { id: 'reports', label: 'Reports', icon: Flag },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'payments', label: 'Payments', icon: DollarSign },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  activeTab === item.id
                    ? 'bg-brand-600/20 text-brand-400'
                    : 'text-dark-400 hover:text-white hover:bg-dark-800'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
                {item.id === 'reports' && reports.filter(r => r.status === 'pending').length > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {reports.filter(r => r.status === 'pending').length}
                  </span>
                )}
                {item.id === 'verifications' && pendingVerifications.length > 0 && (
                  <span className="ml-auto bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {pendingVerifications.length}
                  </span>
                )}
                {item.id === 'listings' && pendingListings.length > 0 && (
                  <span className="ml-auto bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {pendingListings.length}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-dark-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-dark-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white capitalize">{activeTab}</h1>
            <p className="text-dark-500 mt-1">Welcome back, Administrator</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-brand-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">J</span>
            </div>
          </div>
        </div>

        {activeTab === 'overview' && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, index) => (
                <div key={index} className="bg-dark-900 border border-dark-800 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center`}>
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                  <p className="text-dark-500 text-sm mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <div className="bg-dark-900 border border-dark-800 rounded-xl p-6">
                <h3 className="text-white font-semibold mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between py-3 border-b border-dark-800 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          activity.status === 'success' ? 'bg-green-500' : 'bg-amber-500'
                        }`} />
                        <div>
                          <p className="text-white text-sm font-medium">{activity.action}</p>
                          <p className="text-dark-500 text-xs">{activity.user}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white text-sm font-medium">{activity.amount}</p>
                        <p className="text-dark-500 text-xs">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Revenue Breakdown */}
              <div className="bg-dark-900 border border-dark-800 rounded-xl p-6">
                <h3 className="text-white font-semibold mb-4">Revenue Breakdown</h3>
                <div className="space-y-4">
                  {revenue && [
                    { label: 'Unlock Fees', value: revenue.unlock_revenue, color: 'bg-blue-500' },
                    { label: 'Subscriptions', value: revenue.subscription_revenue, color: 'bg-amber-500' },
                    { label: 'Featured Boosts', value: revenue.featured_revenue, color: 'bg-purple-500' },
                  ].map((item, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-dark-300 text-sm">{item.label}</span>
                        <span className="text-white text-sm font-medium">KSh {item.value.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-dark-800 rounded-full h-2">
                        <div
                          className={`${item.color} h-2 rounded-full transition-all`}
                          style={{ width: `${revenue.total_revenue > 0 ? (item.value / revenue.total_revenue) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'listings' && (
          <div className="bg-dark-900 border border-dark-800 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-dark-800">
              <h3 className="text-white font-semibold">Pending Listings</h3>
            </div>
            {listingsLoading ? (
              <div className="p-12 text-center text-dark-500">Loading listings...</div>
            ) : pendingListings.length === 0 ? (
              <div className="p-12 text-center">
                <Home className="w-12 h-12 text-dark-700 mx-auto mb-4" />
                <p className="text-dark-500">No pending listings</p>
              </div>
            ) : (
              <div className="divide-y divide-dark-800">
                {pendingListings.map((listing) => (
                  <div key={listing.id} className="p-6 flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">{listing.title}</p>
                      <p className="text-dark-500 text-sm">{listing.landlord} · {listing.location} · KSh {listing.price.toLocaleString()}</p>
                      <p className="text-dark-600 text-xs mt-1">
                        Submitted {new Date(listing.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400">
                        pending
                      </span>
                      <button
                        onClick={() => handleApproveListing(listing.id)}
                        className="p-2 bg-green-500/10 text-green-400 rounded-lg hover:bg-green-500/20 transition-all"
                        title="Approve listing"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRejectListing(listing.id)}
                        className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-all"
                        title="Reject listing"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'verifications' && (
          <div className="bg-dark-900 border border-dark-800 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-dark-800">
              <h3 className="text-white font-semibold">Pending Landlord Verifications</h3>
            </div>
            {verificationsLoading ? (
              <div className="p-12 text-center text-dark-500">Loading verifications...</div>
            ) : pendingVerifications.length === 0 ? (
              <div className="p-12 text-center">
                <Shield className="w-12 h-12 text-dark-700 mx-auto mb-4" />
                <p className="text-dark-500">No pending verifications</p>
              </div>
            ) : (
              <div className="divide-y divide-dark-800">
                {pendingVerifications.map((v) => (
                  <div key={v.id} className="p-6 flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">{v.name}</p>
                      <p className="text-dark-500 text-sm">{v.phone} · ID: {v.id_number}</p>
                      <p className="text-dark-600 text-xs mt-1">
                        Submitted {new Date(v.submitted_at).toLocaleDateString()}
                      </p>
                      {v.id_document && (
                        <a
                          href={`${API_URL}${v.id_document}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-brand-400 text-xs hover:underline mt-1 inline-block"
                        >
                          View ID Document
                        </a>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400">
                        pending
                      </span>
                      <button
                        onClick={() => handleApproveLandlord(v.id)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-medium transition-all"
                      >
                        Approve
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold text-lg">Reported Listings</h3>
              <span className="text-dark-500 text-sm">{reports.length} total reports</span>
            </div>

            {reportsLoading ? (
              <div className="text-center py-12 text-dark-500">Loading reports...</div>
            ) : reports.length === 0 ? (
              <div className="bg-dark-900 border border-dark-800 rounded-xl p-12 text-center">
                <Flag className="w-12 h-12 text-dark-700 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-dark-300 mb-2">No reports yet</h3>
                <p className="text-dark-500">Reported listings will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reports.map((report) => (
                  <div key={report.id} className={`bg-dark-900 border rounded-xl p-6 ${
                    report.status === 'pending' ? 'border-red-500/30' : 'border-dark-800'
                  }`}>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-white font-semibold">{report.property_title}</h4>
                          {report.property_is_hidden && (
                            <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full">HIDDEN</span>
                          )}
                          <span className={`px-2 py-0.5 text-xs rounded-full ${
                            report.status === 'pending'
                              ? 'bg-amber-500/20 text-amber-400'
                              : report.status === 'resolved'
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-gray-500/20 text-gray-400'
                          }`}>
                            {report.status}
                          </span>
                        </div>
                        <p className="text-dark-500 text-sm">{report.property_location}</p>
                        <p className="text-dark-500 text-sm">Landlord: {report.landlord_name}</p>
                      </div>
                      <div className="text-right">
                        <span className="px-3 py-1 bg-red-500/10 text-red-400 rounded-full text-xs font-medium">
                          {getReasonLabel(report.reason)}
                        </span>
                        <p className="text-dark-600 text-xs mt-1">
                          {new Date(report.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {report.description && (
                      <div className="bg-dark-950 rounded-lg p-3 mb-4">
                        <p className="text-dark-400 text-sm">{report.description}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <span className="text-dark-500 text-xs">
                        {report.reports_count} report{report.reports_count !== 1 ? 's' : ''} on this property
                      </span>
                    </div>

                    {report.status === 'pending' && (
                      <div className="flex gap-2 mt-4 pt-4 border-t border-dark-800">
                        <button
                          onClick={() => handleDismiss(report.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-dark-800 hover:bg-dark-700 text-dark-300 rounded-lg text-sm transition-all"
                        >
                          <XCircle className="w-4 h-4" />
                          Dismiss
                        </button>
                        <button
                          onClick={() => handleHideProperty(report.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 rounded-lg text-sm transition-all"
                        >
                          <EyeOff className="w-4 h-4" />
                          Hide Property
                        </button>
                        <button
                          onClick={() => handleBanLandlord(report.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg text-sm transition-all"
                        >
                          <Ban className="w-4 h-4" />
                          Ban Landlord
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-dark-900 border border-dark-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">All Users</h3>
            {users.length === 0 ? (
              <p className="text-dark-500">No users found</p>
            ) : (
              <div className="space-y-3">
                {users.map((u) => (
                  <div key={u.id} className="bg-dark-950 border border-dark-800 rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">{u.name}</p>
                      <p className="text-dark-500 text-sm">{u.email} | {u.phone}</p>
                      <p className="text-dark-600 text-xs">Role: {u.role} | Trust: {u.trust_score} | Reports: {u.report_count}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {u.is_banned ? (
                        <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">Banned</span>
                      ) : (
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">Active</span>
                      )}
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        u.verified === 'verified'
                          ? 'bg-green-500/20 text-green-400'
                          : u.verified === 'pending'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {u.verified}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="bg-dark-900 border border-dark-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <p className="text-amber-400 text-sm">Detailed payment history coming in next update</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
