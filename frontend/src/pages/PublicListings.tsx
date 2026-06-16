import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, MapPin, BedDouble, Bath, Heart, Filter, Loader2, Home } from 'lucide-react'
import { usePropertyStore } from '../store/propertyStore'
import { useAuthStore } from '../store/authStore'
import { formatPrice, propertyTypeLabel } from '../utils/formatters'
import toast from 'react-hot-toast'
import CountyFilterBar from '../components/CountyFilterBar';

export default function PublicListings() {
  const navigate = useNavigate()
  const { properties, searchProperties, favorites, toggleFavorite, isLoading } = usePropertyStore()
  const { isAuthenticated, user } = useAuthStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [locationFilters, setLocationFilters] = useState<<Record<string, any>>({});
  const [selectedCounty, setSelectedCounty] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200000])
  const [showFilters, setShowFilters] = useState(false)

  // Redirect landlords to their dashboard
  useEffect(() => {
    if (isAuthenticated && user?.role === 'landlord') {
      navigate('/dashboard')
    }
  }, [isAuthenticated, user, navigate])

  useEffect(() => {
    loadProperties()
  }, [])

  const loadProperties = async () => {
    try {
      await searchProperties()
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to load properties'
      toast.error(typeof errorMsg === 'string' ? errorMsg : 'Failed to load properties')
    }
  }

  const filteredProperties = properties.filter((property) => {
    const matchesSearch = !searchQuery || 
      property.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.county?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.sub_county?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCounty = !selectedCounty || property.county === selectedCounty
    const matchesType = !selectedType || property.property_type === selectedType
    const matchesPrice = property.monthly_rent >= priceRange[0] && property.monthly_rent <= priceRange[1]
    
    return matchesSearch && matchesCounty && matchesType && matchesPrice
  })

  const counties = [...new Set(properties.map(p => p.county).filter(Boolean))].sort()
  const types = [...new Set(properties.map(p => p.property_type).filter(Boolean))].sort()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Hero Section */}
      <div className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-white mb-4"
          >
            Find Your Perfect Home
          </motion.h1>
          <p className="text-dark-400 text-lg mb-8 max-w-2xl mx-auto">
            Browse verified rental properties across Kenya. No agent fees, no scams.
          </p>

          <div className="max-w-5xl mx-auto">
            <CountyFilterBar onFilterChange={(filters: Record<string, any>) => setLocationFilters(filters)} />
          </div>

          {showFilters && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto mt-6 p-6 glass-card"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="label">County</label>
                  <select
                    value={selectedCounty}
                    onChange={(e) => setSelectedCounty(e.target.value)}
                    className="input-field w-full"
                  >
                    <option value="">All Counties</option>
                    {counties.map(county => (
                      <option key={county} value={county}>{county}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Property Type</label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="input-field w-full"
                  >
                    <option value="">All Types</option>
                    {types.map(type => (
                      <option key={type} value={type}>{propertyTypeLabel(type)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Max Price: {formatPrice(priceRange[1])}</label>
                  <input
                    type="range"
                    min="0"
                    max="200000"
                    step="5000"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([0, Number(e.target.value)])}
                    className="w-full"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Property Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">
            {filteredProperties.length} Properties
          </h2>
        </div>

        {filteredProperties.length === 0 ? (
          <div className="text-center py-12">
            <Home className="w-16 h-16 text-dark-700 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-dark-300 mb-2">No properties found</h3>
            <p className="text-dark-500">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                isFavorite={favorites.includes(property.id)}
                onToggleFavorite={() => toggleFavorite(property.id)}
                onClick={() => navigate(`/property/${property.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function PropertyCard({ property, isFavorite, onToggleFavorite, onClick }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="glass-card overflow-hidden cursor-pointer group"
      onClick={onClick}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={property.images?.[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80'}
          alt={property.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-transparent to-transparent" />
        
        <button
          onClick={(e) => {
            e.stopPropagation()
            onToggleFavorite()
          }}
          className="absolute top-3 right-3 p-2 bg-dark-900/80 backdrop-blur-sm rounded-xl text-white hover:bg-dark-800 transition-all"
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'text-red-500 fill-red-500' : ''}`} />
        </button>

        <div className="absolute bottom-3 left-3 right-3">
          <div className="flex items-center gap-2">
            <span className="badge-brand">{propertyTypeLabel(property.property_type)}</span>
            {property.negotiable && (
              <span className="badge bg-amber-500/10 text-amber-400 border border-amber-500/20">Negotiable</span>
            )}
          </div>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-white mb-1 truncate">{property.title}</h3>
        <div className="flex items-center gap-1 text-dark-400 text-sm mb-3">
          <MapPin className="w-3.5 h-3.5 text-brand-500" />
          <span>{property.sub_county}, {property.county}</span>
        </div>

        <div className="flex items-center gap-4 text-dark-400 text-sm mb-4">
          {property.bedrooms > 0 && (
            <div className="flex items-center gap-1">
              <BedDouble className="w-4 h-4 text-brand-500" />
              <span>{property.bedrooms}</span>
            </div>
          )}
          {property.bathrooms > 0 && (
            <div className="flex items-center gap-1">
              <Bath className="w-4 h-4 text-brand-500" />
              <span>{property.bathrooms}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-xl font-bold text-white">{formatPrice(property.monthly_rent)}</span>
            <span className="text-dark-500 text-sm">/mo</span>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            property.status === 'available' 
              ? 'bg-green-500/20 text-green-400' 
              : 'bg-amber-500/20 text-amber-400'
          }`}>
            {property.status === 'available' ? 'VACANT' : 'TAKEN'}
          </span>
        </div>
      </div>
    </motion.div>
  )
}
