import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, MapPin, ChevronDown } from 'lucide-react'

interface LocationData {
  [county: string]: {
    [subCounty: string]: string[]
  }
}

export default function HeroSearchBar() {
  const [locations, setLocations] = useState<LocationData>({})
  const [selectedCounty, setSelectedCounty] = useState('')
  const [selectedSubCounty, setSelectedSubCounty] = useState('')
  const [selectedWard, setSelectedWard] = useState('')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetch('/api/locations')
      .then(r => r.json())
      .then((data: LocationData) => {
        setLocations(data || {})
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const counties = Object.keys(locations).sort()
  const subCounties = selectedCounty ? Object.keys(locations[selectedCounty] || {}).sort() : []
  const wards = selectedCounty && selectedSubCounty ? (locations[selectedCounty]?.[selectedSubCounty] || []) : []

  const handleCountyChange = (county: string) => {
    setSelectedCounty(county)
    setSelectedSubCounty('')
    setSelectedWard('')
  }

  const handleSubCountyChange = (subCounty: string) => {
    setSelectedSubCounty(subCounty)
    setSelectedWard('')
  }

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (selectedCounty) params.set('county', selectedCounty)
    if (selectedSubCounty) params.set('sub_county', selectedSubCounty)
    if (selectedWard) params.set('ward', selectedWard)
    navigate(`/search?${params.toString()}`)
  }

  if (loading) {
    return (
      <div className="glass-card p-4 text-center text-dark-400">
        Loading locations...
      </div>
    )
  }

  return (
    <div className="glass-card p-2">
      <div className="flex flex-col lg:flex-row gap-2">
        
        {/* County Dropdown */}
        <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-dark-800/50 rounded-lg relative min-w-[200px]">
          <MapPin className="w-5 h-5 text-brand-500 flex-shrink-0" />
          <select
            value={selectedCounty}
            onChange={(e) => handleCountyChange(e.target.value)}
            className="bg-transparent text-dark-100 focus:outline-none w-full appearance-none cursor-pointer text-sm"
          >
            <option value="">All Counties</option>
            {counties.map((county) => (
              <option key={county} value={county}>{county}</option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-dark-500 absolute right-3 pointer-events-none" />
        </div>

        {/* Sub-County Dropdown */}
        <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-dark-800/50 rounded-lg relative min-w-[200px]">
          <MapPin className="w-5 h-5 text-brand-500 flex-shrink-0" />
          <select
            value={selectedSubCounty}
            onChange={(e) => handleSubCountyChange(e.target.value)}
            disabled={!selectedCounty}
            className="bg-transparent text-dark-100 focus:outline-none w-full appearance-none cursor-pointer text-sm disabled:text-dark-500 disabled:cursor-not-allowed"
          >
            <option value="">{selectedCounty ? 'All Sub-Counties' : 'Select County First'}</option>
            {subCounties.map((sub) => (
              <option key={sub} value={sub}>{sub}</option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-dark-500 absolute right-3 pointer-events-none" />
        </div>

        {/* Ward Dropdown */}
        <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-dark-800/50 rounded-lg relative min-w-[200px]">
          <MapPin className="w-5 h-5 text-brand-500 flex-shrink-0" />
          <select
            value={selectedWard}
            onChange={(e) => setSelectedWard(e.target.value)}
            disabled={!selectedSubCounty}
            className="bg-transparent text-dark-100 focus:outline-none w-full appearance-none cursor-pointer text-sm disabled:text-dark-500 disabled:cursor-not-allowed"
          >
            <option value="">{selectedSubCounty ? 'All Wards/Areas' : 'Select Sub-County First'}</option>
            {wards.map((ward) => (
              <option key={ward} value={ward}>{ward}</option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-dark-500 absolute right-3 pointer-events-none" />
        </div>

        {/* Search Button */}
        <button 
          onClick={handleSearch}
          className="btn-primary py-3 px-8 rounded-lg whitespace-nowrap"
        >
          <Search className="w-5 h-5" />
          Search
        </button>
      </div>
    </div>
  )
}
