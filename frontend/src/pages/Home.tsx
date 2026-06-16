import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  MapPin, Shield, MessageSquare, TrendingUp, 
  Building2, Users, Star, ArrowRight, CheckCircle2 
} from 'lucide-react'
import { usePropertyStore } from '../store/propertyStore'
import PropertyCard from '../components/PropertyCard'
import HeroSearchBar from '../components/HeroSearchBar'

const features = [
  {
    icon: MapPin,
    title: 'All 47 Counties',
    description: 'Search properties across all Kenyan counties with detailed sub-county and ward filters.',
  },
  {
    icon: Shield,
    title: 'Verified Listings',
    description: 'Every listing is reviewed to ensure authenticity and protect renters from scams.',
  },
  {
    icon: MessageSquare,
    title: 'Direct Messaging',
    description: 'Chat directly with landlords through our secure in-platform messaging system.',
  },
  {
    icon: TrendingUp,
    title: 'Smart Pricing',
    description: 'Compare prices across neighborhoods and find the best deals within your budget.',
  },
]

const stats = [
  { icon: Building2, value: '10,000+', label: 'Properties Listed' },
  { icon: Users, value: '50,000+', label: 'Happy Renters' },
  { icon: MapPin, value: '47', label: 'Counties Covered' },
  { icon: Star, value: '98%', label: 'Satisfaction Rate' },
]

const popularCounties = [
  'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Kiambu', 'Kajiado', 'Machakos', 'Uasin Gishu'
]

export default function Home() {
  const { featured, recent, getFeatured, getRecent } = usePropertyStore()

  useEffect(() => {
    getFeatured()
    getRecent()
  }, [])

  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 mesh-gradient" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80')] bg-cover bg-center opacity-10" />
        <div className="absolute inset-0 hero-gradient" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500/10 border border-brand-500/20 rounded-full text-brand-400 text-sm font-medium mb-8">
              <Star className="w-4 h-4" />
              Kenya's #1 Rental Platform
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight tracking-tight">
              Find Your Perfect<br />
              <span className="gradient-text">Home in Kenya</span>
            </h1>

            <p className="mt-6 text-xl text-dark-300 max-w-2xl mx-auto leading-relaxed">
              Browse thousands of verified rental properties across all 47 counties. 
              From Nairobi apartments to Mombasa beach houses — your next home is just a click away.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/search" className="btn-primary text-lg px-8 py-4">
                Search Properties
              </Link>
              <Link to="/register" className="btn-secondary text-lg px-8 py-4">
                List Your Property
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>

          {/* Hero Search Bar with County/Sub-County/Ward Dropdowns */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-16 max-w-5xl mx-auto"
          >
            <HeroSearchBar />
          </motion.div>

          {/* Popular Counties */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-8"
          >
            <p className="text-dark-500 text-sm mb-3">Popular locations:</p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {popularCounties.map((county) => (
                <Link
                  key={county}
                  to={`/search?county=${county}`}
                  className="px-4 py-2 bg-dark-800/50 border border-dark-700/30 rounded-full text-sm text-dark-300 hover:text-brand-400 hover:border-brand-500/30 transition-all"
                >
                  {county}
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 border-y border-dark-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center"
              >
                <div className="w-12 h-12 bg-brand-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-6 h-6 text-brand-500" />
                </div>
                <div className="text-3xl font-bold text-white">{stat.value}</div>
                <div className="text-dark-400 text-sm mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="section-title">Why Choose KejaFind?</h2>
            <p className="section-subtitle">The most trusted way to find rental properties in Kenya</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="glass-card-hover p-8"
              >
                <div className="w-12 h-12 bg-brand-500/10 rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="w-6 h-6 text-brand-500" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-dark-400 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      {featured.length > 0 && (
        <section className="py-24 bg-dark-900/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="section-title">Featured Properties</h2>
                <p className="section-subtitle">Hand-picked premium listings</p>
              </div>
              <Link to="/search" className="btn-ghost hidden sm:flex">
                View All
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recent Properties */}
      {recent.length > 0 && (
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="section-title">Recently Listed</h2>
                <p className="section-subtitle">Fresh properties just added</p>
              </div>
              <Link to="/search" className="btn-ghost hidden sm:flex">
                View All
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {recent.map((property) => (
                <PropertyCard key={property.id} property={property} variant="compact" />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-card p-12 md:p-16 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 to-transparent" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to List Your Property?
              </h2>
              <p className="text-dark-400 text-lg max-w-2xl mx-auto mb-8">
                Join thousands of landlords who trust KejaFind to connect with quality tenants across Kenya.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/register" className="btn-primary text-lg px-8 py-4">
                  Get Started Free
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-dark-400 text-sm">
                {['Free Listing', 'Verified Tenants', 'Direct Messaging', 'No Hidden Fees'].map((item) => (
                  <span key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-500" />
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
