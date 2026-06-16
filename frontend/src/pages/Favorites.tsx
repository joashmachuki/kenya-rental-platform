import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart, ArrowRight, Loader2 } from 'lucide-react'
import { usePropertyStore } from '../store/propertyStore'
import PropertyCard from '../components/PropertyCard'
import api from '../services/api'

export default function Favorites() {
  const { favorites } = usePropertyStore()
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFavorites()
  }, [favorites])

  const fetchFavorites = async () => {
    if (favorites.length === 0) {
      setLoading(false)
      return
    }
    try {
      const res = await api.get('/api/properties/search')
      const allProperties = res.data.properties || []
      const favProperties = allProperties.filter((p: any) => favorites.includes(p.id))
      setProperties(favProperties)
    } catch (err) {
      console.error('Failed to fetch favorites')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      <div className="bg-dark-900/50 border-b border-dark-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-white">My Favorites</h1>
          <p className="text-dark-400 mt-1">Properties you've saved for later</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
          </div>
        ) : properties.length === 0 ? (
          <div className="glass-card p-16 text-center">
            <Heart className="w-16 h-16 text-dark-700 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-dark-200 mb-2">No favorites yet</h3>
            <p className="text-dark-500 mb-6">Start browsing and save properties you like</p>
            <Link to="/search" className="btn-primary">
              Browse Properties
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {properties.map((property, i) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <PropertyCard property={property} variant="compact" />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
