import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from './store/authStore'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import PublicListings from './pages/PublicListings'
import PropertyDetail from './pages/PropertyDetail'
import Login from './pages/Login'
import Register from './pages/Register'
import LandlordDashboard from './pages/LandlordDashboard'
import EditProperty from './pages/EditProperty'
import ManageProperty from './pages/ManageProperty'
import ListProperty from './pages/ListProperty'
import Messages from './pages/Messages'
import Favorites from './pages/Favorites'
import Profile from './pages/Profile'
import AdminDashboard from './pages/AdminDashboard'
import AdminLogin from './pages/AdminLogin'
import AdminVerification from './pages/AdminVerification'
import VerifyPhone from './pages/VerifyPhone'
import VerifyIdentity from './pages/VerifyIdentity'
import AboutUs from './pages/AboutUs'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsOfService from './pages/TermsOfService'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  const { checkAuth } = useAuthStore()
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin')

  useEffect(() => {
    checkAuth()
  }, [])

  return (
    <div className="min-h-screen bg-dark-950 text-dark-50">
      {!isAdminRoute && <Navbar />}
      <main className={isAdminRoute ? '' : 'pt-16'}>
        <Routes>
          <Route path="/" element={<PublicListings />} />
          <Route path="/property/:id" element={<PropertyDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-phone" element={
            <ProtectedRoute>
              <VerifyPhone />
            </ProtectedRoute>
          } />
          <Route path="/verify-identity" element={
            <ProtectedRoute requireLandlord>
              <VerifyIdentity />
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <LandlordDashboard />
            </ProtectedRoute>
          } />
          <Route path="/edit-property/:id" element={
            <ProtectedRoute>
              <EditProperty />
            </ProtectedRoute>
          } />
          <Route path="/manage-property/:id" element={
            <ProtectedRoute>
              <ManageProperty />
            </ProtectedRoute>
          } />
          <Route path="/list-property" element={
            <ProtectedRoute requireLandlord>
              <ListProperty />
            </ProtectedRoute>
          } />
          <Route path="/messages" element={
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          } />
          <Route path="/favorites" element={
            <ProtectedRoute>
              <Favorites />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/verifications" element={<AdminVerification />} />
        </Routes>
      </main>
      {!isAdminRoute && <Footer />}
    </div>
  )
}

export default App
