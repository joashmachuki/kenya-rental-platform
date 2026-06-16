import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { 
  Home, Search, PlusCircle, MessageSquare, Heart, 
  User, Menu, X, LogOut, Shield, AlertTriangle 
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [showVerifyModal, setShowVerifyModal] = useState(false)
  const { user, isAuthenticated, logout } = useAuthStore()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setIsOpen(false)
  }, [location])

  const isActive = (path: string) => location.pathname === path

  const isLandlordVerified = () => {
    if (!user || user.role !== 'landlord') return false
    return user.phone_verified && user.verification_status === 'verified'
  }

  const handleListPropertyClick = (e: React.MouseEvent) => {
    if (!isLandlordVerified()) {
      e.preventDefault()
      setShowVerifyModal(true)
    }
  }

  const handleVerifyNow = () => {
    setShowVerifyModal(false)
    if (!user?.phone_verified) {
      navigate('/verify-phone')
    } else {
      navigate('/verify-identity')
    }
  }

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-dark-950/90 backdrop-blur-xl border-b border-dark-800/50' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <img src="/logo.jpg" alt="KejaFind" className="h-9 w-auto rounded-lg" />
              <span className="text-xl font-bold text-white">
                Keja<span className="text-brand-400">Find</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              <Link
                to="/"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive('/') ? 'text-brand-400 bg-brand-500/10' : 'text-dark-300 hover:text-dark-100 hover:bg-dark-800/50'
                }`}
              >
                <Home className="w-4 h-4" />
                Browse Homes
              </Link>

              {isAuthenticated && user?.role === 'landlord' && (
                <>
                  <Link
                    to="/list-property"
                    onClick={handleListPropertyClick}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive('/list-property') ? 'text-brand-400 bg-brand-500/10' : 'text-dark-300 hover:text-dark-100 hover:bg-dark-800/50'
                    }`}
                  >
                    <PlusCircle className="w-4 h-4" />
                    List Property
                    {!isLandlordVerified() && (
                      <span className="w-2 h-2 bg-amber-500 rounded-full ml-1" title="Verification required" />
                    )}
                  </Link>
                  <Link
                    to="/dashboard"
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive('/dashboard') ? 'text-brand-400 bg-brand-500/10' : 'text-dark-300 hover:text-dark-100 hover:bg-dark-800/50'
                    }`}
                  >
                    <Home className="w-4 h-4" />
                    My Properties
                  </Link>
                </>
              )}

              {isAuthenticated && (
                <>
                  <Link
                    to="/messages"
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive('/messages') ? 'text-brand-400 bg-brand-500/10' : 'text-dark-300 hover:text-dark-100 hover:bg-dark-800/50'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4" />
                    Messages
                  </Link>
                  <Link
                    to="/favorites"
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive('/favorites') ? 'text-brand-400 bg-brand-500/10' : 'text-dark-300 hover:text-dark-100 hover:bg-dark-800/50'
                    }`}
                  >
                    <Heart className="w-4 h-4" />
                    Saved
                  </Link>
                </>
              )}
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-dark-800/50 rounded-lg border border-dark-700/30">
                    <div className="w-7 h-7 bg-brand-600 rounded-full flex items-center justify-center text-xs font-bold text-white">
                      {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <span className="text-sm text-dark-200">{user?.full_name?.split(' ')[0]}</span>
                  </div>
                  <button
                    onClick={() => { logout(); navigate('/'); }}
                    className="p-2 text-dark-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <Link to="/login" className="text-dark-300 hover:text-white text-sm font-medium px-4 py-2">Sign In</Link>
                  <Link to="/register" className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-sm font-medium transition-all">
                    Get Started
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 text-dark-300 hover:text-white rounded-lg"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden bg-dark-950/95 backdrop-blur-xl border-t border-dark-800/50">
            <div className="px-4 py-4 space-y-1">
              <Link
                to="/"
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-dark-300 hover:text-dark-100 hover:bg-dark-800/50"
              >
                <Home className="w-5 h-5" />
                Browse Homes
              </Link>

              {isAuthenticated && user?.role === 'landlord' && (
                <>
                  <Link to="/list-property" onClick={handleListPropertyClick} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-dark-300 hover:text-dark-100 hover:bg-dark-800/50">
                    <PlusCircle className="w-5 h-5" />
                    List Property
                    {!isLandlordVerified() && (
                      <span className="w-2 h-2 bg-amber-500 rounded-full ml-1" />
                    )}
                  </Link>
                  <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-dark-300 hover:text-dark-100 hover:bg-dark-800/50">
                    <Home className="w-5 h-5" />
                    My Properties
                  </Link>
                </>
              )}

              {isAuthenticated && (
                <>
                  <Link to="/messages" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-dark-300 hover:text-dark-100 hover:bg-dark-800/50">
                    <MessageSquare className="w-5 h-5" />
                    Messages
                  </Link>
                  <Link to="/favorites" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-dark-300 hover:text-dark-100 hover:bg-dark-800/50">
                    <Heart className="w-5 h-5" />
                    Saved
                  </Link>
                </>
              )}

              {!isAuthenticated && (
                <div className="pt-3 space-y-2">
                  <Link to="/login" className="block w-full text-center px-4 py-3 bg-dark-800 text-white rounded-xl text-sm font-medium">Sign In</Link>
                  <Link to="/register" className="block w-full text-center px-4 py-3 bg-brand-600 text-white rounded-xl text-sm font-medium">Get Started</Link>
                </div>
              )}

              {isAuthenticated && (
                <button
                  onClick={() => { logout(); navigate('/'); }}
                  className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl text-sm font-medium transition-all"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Verification Modal */}
      {showVerifyModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-dark-900 border border-dark-700 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Verification Required</h3>
            </div>
            <p className="text-dark-300 mb-6">
              You need to complete verification before listing properties. This helps keep our platform safe for everyone.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-dark-800/50 rounded-xl">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${user?.phone_verified ? 'bg-green-500/20' : 'bg-dark-700'}`}>
                  {user?.phone_verified ? <span className="text-green-400 text-xs">✓</span> : <span className="text-dark-400 text-xs">1</span>}
                </div>
                <span className={`text-sm ${user?.phone_verified ? 'text-green-400' : 'text-dark-200'}`}>
                  Phone Verification
                </span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-dark-800/50 rounded-xl">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${user?.verification_status === 'verified' ? 'bg-green-500/20' : 'bg-dark-700'}`}>
                  {user?.verification_status === 'verified' ? <span className="text-green-400 text-xs">✓</span> : <span className="text-dark-400 text-xs">2</span>}
                </div>
                <span className={`text-sm ${user?.verification_status === 'verified' ? 'text-green-400' : 'text-dark-200'}`}>
                  Identity Verification
                </span>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowVerifyModal(false)}
                className="flex-1 px-4 py-2.5 bg-dark-800 hover:bg-dark-700 text-dark-200 rounded-xl text-sm font-medium transition-all"
              >
                Later
              </button>
              <button
                onClick={handleVerifyNow}
                className="flex-1 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-sm font-medium transition-all"
              >
                Verify Now
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
