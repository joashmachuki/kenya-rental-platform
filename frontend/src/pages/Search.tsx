import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search as SearchIcon, SlidersHorizontal, Grid3X3, List, Loader2 } from 'lucide-react'
import { usePropertyStore } from '../store/propertyStore'
import SearchFilters from '../components/SearchFilters'
import PropertyCard from '../components/PropertyCard'

export default function Search() {
  const [searchParams] = useSearchParams()
  const { properties, total, page, perPage, isLoading, filters, setFilters, searchProperties } = usePropertyStore()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    const county = searchParams.get('county')
    if (county) {
      setFilters({ county })
    }
    searchProperties(1)
  }, [])

  const totalPages = Math.ceil(total / perPage)

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-dark-900/50 border-b border-dark-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-white mb-2">Search Properties</h1>
          <p className="text-dark-400">Find your perfect home across all 47 counties</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SearchFilters />

        {/* Results Header */}
        <div className="mt-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-dark-400 text-sm">
              {isLoading ? 'Searching...' : `${total} properties found`}
            </span>
            {isLoading && <Loader2 className="w-4 h-4 text-brand-500 animate-spin" />}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-dark-500 text-sm hidden sm:inline">View:</span>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-brand-500/10 text-brand-400' : 'text-dark-500 hover:text-dark-300'}`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-brand-500/10 text-brand-400' : 'text-dark-500 hover:text-dark-300'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-20">
            <SearchIcon className="w-16 h-16 text-dark-700 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-dark-200 mb-2">No properties found</h3>
            <p className="text-dark-500">Try adjusting your filters or search criteria</p>
          </div>
        ) : (
          <div className={`mt-6 ${viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}`}>
            {properties.map((property, i) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <PropertyCard property={property} variant={viewMode === 'list' ? 'compact' : 'default'} />
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-2">
            <button
              onClick={() => searchProperties(page - 1)}
              disabled={page <= 1}
              className="px-4 py-2 bg-dark-800 text-dark-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-dark-700 transition-all"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => searchProperties(p)}
                className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                  p === page
                    ? 'bg-brand-600 text-white'
                    : 'bg-dark-800 text-dark-300 hover:bg-dark-700'
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => searchProperties(page + 1)}
              disabled={page >= totalPages}
              className="px-4 py-2 bg-dark-800 text-dark-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-dark-700 transition-all"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
