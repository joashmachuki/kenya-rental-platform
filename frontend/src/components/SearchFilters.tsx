import { useState, useEffect } from 'react'
import { Search, SlidersHorizontal, X, MapPin, Home, DollarSign, BedDouble } from 'lucide-react'
import { usePropertyStore } from '../store/propertyStore'
import { propertyTypeLabel } from '../utils/formatters'

const propertyTypes = [
  'apartment', 'bedsitter', 'studio', '1_bedroom', '2_bedroom', 
  '3_bedroom', '4_plus_bedroom', 'townhouse', 'villa', 'commercial'
]

const priceRanges = [
  { label: 'Any Price', min: undefined, max: undefined },
  { label: 'Under KES 10K', min: 0, max: 10000 },
  { label: 'KES 10K - 20K', min: 10000, max: 20000 },
  { label: 'KES 20K - 40K', min: 20000, max: 40000 },
  { label: 'KES 40K - 80K', min: 40000, max: 80000 },
  { label: 'KES 80K - 150K', min: 80000, max: 150000 },
  { label: 'KES 150K+', min: 150000, max: undefined },
]

const bedroomOptions = [
  { label: 'Any', value: undefined },
  { label: 'Studio', value: 0 },
  { label: '1 Bed', value: 1 },
  { label: '2 Beds', value: 2 },
  { label: '3 Beds', value: 3 },
  { label: '4+ Beds', value: 4 },
]

export default function SearchFilters() {
  const { filters, setFilters, searchProperties, locations, getLocations } = usePropertyStore()
  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState(filters.query || '')
  const [selectedCounty, setSelectedCounty] = useState(filters.county || '')
  const [selectedSubCounty, setSelectedSubCounty] = useState(filters.sub_county || '')
  const [selectedWard, setSelectedWard] = useState(filters.ward || '')

  useEffect(() => {
    getLocations()
  }, [])

  const counties = Object.keys(locations).sort()
  const subCounties = selectedCounty ? Object.keys(locations[selectedCounty] || {}).sort() : []
  const wards = selectedCounty && selectedSubCounty ? (locations[selectedCounty]?.[selectedSubCounty] || []).sort() : []

  const handleSearch = () => {
    setFilters({ query: searchQuery })
    searchProperties(1)
  }

  const handleCountyChange = (county: string) => {
    setSelectedCounty(county)
    setSelectedSubCounty('')
    setSelectedWard('')
    setFilters({ county: county || undefined, sub_county: undefined, ward: undefined })
  }

  const handleSubCountyChange = (subCounty: string) => {
    setSelectedSubCounty(subCounty)
    setSelectedWard('')
    setFilters({ sub_county: subCounty || undefined, ward: undefined })
  }

  const handleWardChange = (ward: string) => {
    setSelectedWard(ward)
    setFilters({ ward: ward || undefined })
  }

  const activeFiltersCount = [
    filters.county, filters.sub_county, filters.ward, 
    filters.property_type, filters.min_price !== undefined, filters.bedrooms !== undefined, filters.furnished
  ].filter(Boolean).length

  return (
    <div className="space-y-4">
      {/* Main Search Bar */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
          <input
            type="text"
            placeholder="Search by location, property name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="input-field pl-12"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`btn-secondary relative ${showFilters ? 'bg-dark-700 border-brand-500/30' : ''}`}
        >
          <SlidersHorizontal className="w-5 h-5" />
          <span className="hidden sm:inline">Filters</span>
          {activeFiltersCount > 0 && (
            <span className="absolute -top-2 -right-2 w-5 h-5 bg-brand-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </button>
        <button onClick={handleSearch} className="btn-primary">
          <Search className="w-5 h-5" />
          <span className="hidden sm:inline">Search</span>
        </button>
      </div>

      {/* Expanded Filters */}
      {showFilters && (
        <div className="glass-card p-6 animate-slide-down">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* County */}
            <div>
              <label className="label flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-500" />
                County
              </label>
              <select
                value={selectedCounty}
                onChange={(e) => handleCountyChange(e.target.value)}
                className="input-field"
              >
                <option value="">All Counties</option>
                {counties.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Sub-County */}
            <div>
              <label className="label">Sub-County</label>
              <select
                value={selectedSubCounty}
                onChange={(e) => handleSubCountyChange(e.target.value)}
                className="input-field"
                disabled={!selectedCounty}
              >
                <option value="">All Sub-Counties</option>
                {subCounties.map((sc) => (
                  <option key={sc} value={sc}>{sc}</option>
                ))}
              </select>
            </div>

            {/* Ward */}
            <div>
              <label className="label">Ward</label>
              <select
                value={selectedWard}
                onChange={(e) => handleWardChange(e.target.value)}
                className="input-field"
                disabled={!selectedSubCounty}
              >
                <option value="">All Wards</option>
                {wards.map((w) => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>

            {/* Property Type */}
            <div>
              <label className="label flex items-center gap-2">
                <Home className="w-4 h-4 text-brand-500" />
                Property Type
              </label>
              <select
                value={filters.property_type || ''}
                onChange={(e) => setFilters({ property_type: e.target.value || undefined })}
                className="input-field"
              >
                <option value="">All Types</option>
                {propertyTypes.map((t) => (
                  <option key={t} value={t}>{propertyTypeLabel(t)}</option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="label flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-brand-500" />
                Price Range
              </label>
              <select
                value={`${filters.min_price || ''}-${filters.max_price || ''}`}
                onChange={(e) => {
                  const [min, max] = e.target.value.split('-').map(v => v ? Number(v) : undefined)
                  setFilters({ min_price: min, max_price: max })
                }}
                className="input-field"
              >
                {priceRanges.map((r) => (
                  <option key={r.label} value={`${r.min || ''}-${r.max || ''}`}>{r.label}</option>
                ))}
              </select>
            </div>

            {/* Bedrooms */}
            <div>
              <label className="label flex items-center gap-2">
                <BedDouble className="w-4 h-4 text-brand-500" />
                Bedrooms
              </label>
              <select
                value={filters.bedrooms !== undefined ? String(filters.bedrooms) : ''}
                onChange={(e) => setFilters({ bedrooms: e.target.value ? Number(e.target.value) : undefined })}
                className="input-field"
              >
                {bedroomOptions.map((o) => (
                  <option key={o.label} value={o.value !== undefined ? String(o.value) : ''}>{o.label}</option>
                ))}
              </select>
            </div>

            {/* Furnished */}
            <div className="flex items-end">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.furnished || false}
                  onChange={(e) => setFilters({ furnished: e.target.checked || undefined })}
                  className="w-5 h-5 rounded border-dark-600 bg-dark-800 text-brand-500 focus:ring-brand-500/30"
                />
                <span className="text-dark-300 text-sm">Furnished Only</span>
              </label>
            </div>
          </div>

          {/* Active Filters */}
          {activeFiltersCount > 0 && (
            <div className="mt-4 pt-4 border-t border-dark-800/50 flex flex-wrap items-center gap-2">
              <span className="text-sm text-dark-400">Active filters:</span>
              {filters.county && (
                <span className="badge bg-brand-500/10 text-brand-400 border border-brand-500/20 flex items-center gap-1">
                  {filters.county}
                  <button onClick={() => handleCountyChange('')}><X className="w-3 h-3" /></button>
                </span>
              )}
              {filters.property_type && (
                <span className="badge bg-brand-500/10 text-brand-400 border border-brand-500/20 flex items-center gap-1">
                  {propertyTypeLabel(filters.property_type)}
                  <button onClick={() => setFilters({ property_type: undefined })}><X className="w-3 h-3" /></button>
                </span>
              )}
              {(filters.min_price !== undefined || filters.max_price !== undefined) && (
                <span className="badge bg-brand-500/10 text-brand-400 border border-brand-500/20 flex items-center gap-1">
                  Price Filter
                  <button onClick={() => setFilters({ min_price: undefined, max_price: undefined })}><X className="w-3 h-3" /></button>
                </span>
              )}
              {filters.bedrooms !== undefined && (
                <span className="badge bg-brand-500/10 text-brand-400 border border-brand-500/20 flex items-center gap-1">
                  {filters.bedrooms === 0 ? 'Studio' : `${filters.bedrooms} Beds`}
                  <button onClick={() => setFilters({ bedrooms: undefined })}><X className="w-3 h-3" /></button>
                </span>
              )}
              {filters.furnished && (
                <span className="badge bg-brand-500/10 text-brand-400 border border-brand-500/20 flex items-center gap-1">
                  Furnished
                  <button onClick={() => setFilters({ furnished: undefined })}><X className="w-3 h-3" /></button>
                </span>
              )}
              <button
                onClick={() => {
                  setFilters({})
                  setSelectedCounty('')
                  setSelectedSubCounty('')
                  setSelectedWard('')
                  setSearchQuery('')
                }}
                className="text-sm text-red-400 hover:text-red-300 ml-auto"
              >
                Clear All
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
