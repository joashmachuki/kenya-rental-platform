import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Upload, X, MapPin, Home, DollarSign, Bed, Bath, 
  Check, ChevronRight, ChevronLeft, Loader2, Video, Image as ImageIcon
, Phone, Mail } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import axios from 'axios'
import toast from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_URL || ''

const steps = [
  { number: 1, title: 'Basic Info', description: 'Title, type, description' },
  { number: 2, title: 'Location', description: 'County, sub-county, ward' },
  { number: 3, title: 'Details', description: 'Price, bedrooms, amenities' },
  { number: 4, title: 'Media', description: 'Upload photos & videos' },
  { number: 5, title: 'Contact', description: 'How renters reach you' }
]

const propertyTypes = [
  { value: 'apartment', label: 'Apartment', icon: '🏢' },
  { value: 'bedsitter', label: 'Bedsitter', icon: '🛏️' },
  { value: 'studio', label: 'Studio', icon: '🎨' },
  { value: '1_bedroom', label: '1 Bedroom', icon: '🏠' },
  { value: '2_bedroom', label: '2 Bedroom', icon: '🏠' },
  { value: '3_bedroom', label: '3 Bedroom', icon: '🏠' },
  { value: '4_plus_bedroom', label: '4+ Bedroom', icon: '🏰' },
  { value: 'townhouse', label: 'Townhouse', icon: '🏘️' },
  { value: 'villa', label: 'Villa', icon: '🏡' },
  { value: 'commercial', label: 'Commercial', icon: '🏪' },
  { value: 'office', label: 'Office', icon: '💼' },
  { value: 'warehouse', label: 'Warehouse', icon: '🏭' }
]

const amenityOptions = [
  'WiFi', 'Parking', 'Security', 'Water', 'Electricity', 
  'Gym', 'Swimming Pool', 'Garden', 'Balcony', 'Furnished',
  'Air Conditioning', 'Washing Machine', 'TV', 'Fridge', 'Microwave'
]

export default function ListProperty() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [videos, setVideos] = useState<File[]>([])
  const [videoPreviews, setVideoPreviews] = useState<string[]>([])
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    property_type: '',
    county: '',
    sub_county: '',
    ward: '',
    town: '',
    street_address: '',
    monthly_rent: '',
    deposit_amount: '',
    negotiable: false,
    bedrooms: '',
    bathrooms: '',
    furnished: false,
    square_footage: '',
    floor_number: '',
    total_floors: '',
    distance_from_road: '',
    elevator: false,
    electricity_reliability: 'consistent',
    electricity_token: '',
    security: false,
    balcony: false,
    kitchen_type: 'closed',
    garbage_collection: false,
    nearby_amenities: [] as string[],
    bathroom_type: 'shared',
    pet_policy: 'not_allowed',
    contact_phone: user?.phone || '',
    contact_email: user?.email || '',
    preferred_contact: 'phone'
  })

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (images.length + files.length > 10) {
      toast.error('Maximum 10 images allowed')
      return
    }
    const newImages = [...images, ...files]
    const newPreviews = [...imagePreviews, ...files.map(file => URL.createObjectURL(file))]
    setImages(newImages)
    setImagePreviews(newPreviews)
  }

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (videos.length + files.length > 3) {
      toast.error('Maximum 3 videos allowed')
      return
    }
    for (const file of files) {
      if (file.size > 50 * 1024 * 1024) {
        toast.error(`Video ${file.name} is too large. Max 50MB per video.`)
        return
      }
    }
    const newVideos = [...videos, ...files]
    const newPreviews = [...videoPreviews, ...files.map(file => URL.createObjectURL(file))]
    setVideos(newVideos)
    setVideoPreviews(newPreviews)
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
    setImagePreviews(imagePreviews.filter((_, i) => i !== index))
  }

  const removeVideo = (index: number) => {
    setVideos(videos.filter((_, i) => i !== index))
    setVideoPreviews(videoPreviews.filter((_, i) => i !== index))
  }

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    )
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const data = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          data.append(key, String(value))
        }
      })
      data.append('amenities', selectedAmenities.join(','))
      data.append('nearby_amenities', formData.nearby_amenities.join(','))
      
      images.forEach(img => data.append('images', img))
      videos.forEach(vid => data.append('videos', vid))
      
      await axios.post(`${API_URL}/api/properties/`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      toast.success('Property listed successfully!')
      navigate('/dashboard')
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to list property')
    } finally {
      setLoading(false)
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1: return formData.title && formData.description && formData.property_type
      case 2: return formData.county && formData.sub_county && formData.ward
      case 3: return formData.monthly_rent
      case 4: return images.length > 0
      case 5: return formData.contact_phone || formData.contact_email
      default: return false
    }
  }

  return (
    <div className="min-h-screen bg-dark-950 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`flex flex-col items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    currentStep >= step.number ? 'bg-brand-600 text-white' : 'bg-dark-800 text-dark-400'
                  }`}>
                    {currentStep > step.number ? <Check className="w-5 h-5" /> : step.number}
                  </div>
                  <span className={`mt-2 text-xs font-medium ${currentStep >= step.number ? 'text-brand-400' : 'text-dark-500'}`}>
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-full h-0.5 mx-4 ${currentStep > step.number ? 'bg-brand-600' : 'bg-dark-800'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="glass-card p-8">
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-2xl font-bold text-white mb-6">Basic Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">Property Title</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={e => setFormData({...formData, title: e.target.value})}
                      placeholder="e.g., Modern 2-Bedroom Apartment in Kilimani"
                      className="w-full bg-dark-900 border border-dark-700 rounded-lg px-4 py-3 text-white focus:border-brand-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">Property Type</label>
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                      {propertyTypes.map(type => (
                        <button
                          key={type.value}
                          onClick={() => setFormData({...formData, property_type: type.value})}
                          className={`p-3 rounded-xl border text-center transition-all ${
                            formData.property_type === type.value 
                              ? 'border-brand-500 bg-brand-500/10 text-brand-400' 
                              : 'border-dark-700 bg-dark-900 text-dark-400 hover:border-dark-600'
                          }`}
                        >
                          <div className="text-2xl mb-1">{type.icon}</div>
                          <div className="text-xs font-medium">{type.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      placeholder="Describe your property in detail..."
                      rows={4}
                      className="w-full bg-dark-900 border border-dark-700 rounded-lg px-4 py-3 text-white focus:border-brand-500 focus:outline-none resize-none"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-2xl font-bold text-white mb-6">Location</h2>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-dark-300 mb-2">County</label>
                      <input
                        type="text"
                        value={formData.county}
                        onChange={e => setFormData({...formData, county: e.target.value})}
                        placeholder="e.g., Nairobi"
                        className="w-full bg-dark-900 border border-dark-700 rounded-lg px-4 py-3 text-white focus:border-brand-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-dark-300 mb-2">Sub-County</label>
                      <input
                        type="text"
                        value={formData.sub_county}
                        onChange={e => setFormData({...formData, sub_county: e.target.value})}
                        placeholder="e.g., Westlands"
                        className="w-full bg-dark-900 border border-dark-700 rounded-lg px-4 py-3 text-white focus:border-brand-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">Ward / Area</label>
                    <input
                      type="text"
                      value={formData.ward}
                      onChange={e => setFormData({...formData, ward: e.target.value})}
                      placeholder="e.g., Kilimani"
                      className="w-full bg-dark-900 border border-dark-700 rounded-lg px-4 py-3 text-white focus:border-brand-500 focus:outline-none"
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-dark-300 mb-2">Town (Optional)</label>
                      <input
                        type="text"
                        value={formData.town}
                        onChange={e => setFormData({...formData, town: e.target.value})}
                        placeholder="e.g., Ruiru"
                        className="w-full bg-dark-900 border border-dark-700 rounded-lg px-4 py-3 text-white focus:border-brand-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-dark-300 mb-2">Street Address</label>
                      <input
                        type="text"
                        value={formData.street_address}
                        onChange={e => setFormData({...formData, street_address: e.target.value})}
                        placeholder="e.g., Near Ruiru Bypass"
                        className="w-full bg-dark-900 border border-dark-700 rounded-lg px-4 py-3 text-white focus:border-brand-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-2xl font-bold text-white mb-6">Property Details</h2>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-dark-300 mb-2">Monthly Rent (KES)</label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-3 w-5 h-5 text-dark-500" />
                        <input
                          type="number"
                          value={formData.monthly_rent}
                          onChange={e => setFormData({...formData, monthly_rent: e.target.value})}
                          placeholder="25000"
                          className="w-full bg-dark-900 border border-dark-700 rounded-lg pl-10 pr-4 py-3 text-white focus:border-brand-500 focus:outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-dark-300 mb-2">Deposit (KES)</label>
                      <input
                        type="number"
                        value={formData.deposit_amount}
                        onChange={e => setFormData({...formData, deposit_amount: e.target.value})}
                        placeholder="25000"
                        className="w-full bg-dark-900 border border-dark-700 rounded-lg px-4 py-3 text-white focus:border-brand-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.negotiable}
                      onChange={e => setFormData({...formData, negotiable: e.target.checked})}
                      className="w-5 h-5 rounded border-dark-600 bg-dark-800 text-brand-600"
                    />
                    <label className="text-dark-300">Price is negotiable</label>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-dark-300 mb-2">Bedrooms</label>
                      <div className="relative">
                        <Bed className="absolute left-3 top-3 w-5 h-5 text-dark-500" />
                        <input
                          type="number"
                          value={formData.bedrooms}
                          onChange={e => setFormData({...formData, bedrooms: e.target.value})}
                          placeholder="2"
                          className="w-full bg-dark-900 border border-dark-700 rounded-lg pl-10 pr-4 py-3 text-white focus:border-brand-500 focus:outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-dark-300 mb-2">Bathrooms</label>
                      <div className="relative">
                        <Bath className="absolute left-3 top-3 w-5 h-5 text-dark-500" />
                        <input
                          type="number"
                          value={formData.bathrooms}
                          onChange={e => setFormData({...formData, bathrooms: e.target.value})}
                          placeholder="1"
                          className="w-full bg-dark-900 border border-dark-700 rounded-lg pl-10 pr-4 py-3 text-white focus:border-brand-500 focus:outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-dark-300 mb-2">Size (sq ft)</label>
                      <input
                        type="number"
                        value={formData.square_footage}
                        onChange={e => setFormData({...formData, square_footage: e.target.value})}
                        placeholder="800"
                        className="w-full bg-dark-900 border border-dark-700 rounded-lg px-4 py-3 text-white focus:border-brand-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.furnished}
                      onChange={e => setFormData({...formData, furnished: e.target.checked})}
                      className="w-5 h-5 rounded border-dark-600 bg-dark-800 text-brand-600"
                    />
                    <label className="text-dark-300">Furnished</label>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-dark-300 mb-2">Floor Number</label>
                      <input
                        type="number"
                        value={formData.floor_number}
                        onChange={e => setFormData({...formData, floor_number: e.target.value})}
                        placeholder="e.g., 3"
                        className="w-full bg-dark-900 border border-dark-700 rounded-lg px-4 py-3 text-white focus:border-brand-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-dark-300 mb-2">Total Floors in Building</label>
                      <input
                        type="number"
                        value={formData.total_floors}
                        onChange={e => setFormData({...formData, total_floors: e.target.value})}
                        placeholder="e.g., 5"
                        className="w-full bg-dark-900 border border-dark-700 rounded-lg px-4 py-3 text-white focus:border-brand-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-dark-300 mb-2">Distance from Main Road</label>
                      <input
                        type="text"
                        value={formData.distance_from_road}
                        onChange={e => setFormData({...formData, distance_from_road: e.target.value})}
                        placeholder="e.g., 200 meters"
                        className="w-full bg-dark-900 border border-dark-700 rounded-lg px-4 py-3 text-white focus:border-brand-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-dark-300 mb-2">Bathroom Type</label>
                      <select
                        value={formData.bathroom_type}
                        onChange={e => setFormData({...formData, bathroom_type: e.target.value})}
                        className="w-full bg-dark-900 border border-dark-700 rounded-lg px-4 py-3 text-white focus:border-brand-500 focus:outline-none"
                      >
                        <option value="shared">Shared</option>
                        <option value="ensuite">Ensuite</option>
                        <option value="master">Master</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-dark-300 mb-2">Kitchen Type</label>
                      <select
                        value={formData.kitchen_type}
                        onChange={e => setFormData({...formData, kitchen_type: e.target.value})}
                        className="w-full bg-dark-900 border border-dark-700 rounded-lg px-4 py-3 text-white focus:border-brand-500 focus:outline-none"
                      >
                        <option value="closed">Closed</option>
                        <option value="open">Open Plan</option>
                        <option value="shared">Shared</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-dark-300 mb-2">Electricity Reliability</label>
                      <select
                        value={formData.electricity_reliability}
                        onChange={e => setFormData({...formData, electricity_reliability: e.target.value})}
                        className="w-full bg-dark-900 border border-dark-700 rounded-lg px-4 py-3 text-white focus:border-brand-500 focus:outline-none"
                      >
                        <option value="consistent">Consistent</option>
                        <option value="blackouts">Occasional Blackouts</option>
                        <option value="prepaid">Prepaid Only</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-dark-300 mb-2">Electricity Token / Meter Number</label>
                      <input type="text" value={formData.electricity_token || ''} onChange={e => setFormData({...formData, electricity_token: e.target.value})} placeholder="Enter prepaid token number or meter number" className="w-full bg-dark-900 border border-dark-700 rounded-lg px-4 py-3 text-white focus:border-brand-500 focus:outline-none" />
                      <p className="text-xs text-dark-500 mt-1">For prepaid meters: enter token number. For postpaid: enter meter number.</p>
                    </div>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-dark-300 mb-2">Pet Policy</label>
                      <select
                        value={formData.pet_policy}
                        onChange={e => setFormData({...formData, pet_policy: e.target.value})}
                        className="w-full bg-dark-900 border border-dark-700 rounded-lg px-4 py-3 text-white focus:border-brand-500 focus:outline-none"
                      >
                        <option value="not_allowed">Not Allowed</option>
                        <option value="allowed">Allowed</option>
                        <option value="small_pets_only">Small Pets Only</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={formData.elevator}
                        onChange={e => setFormData({...formData, elevator: e.target.checked})}
                        className="w-5 h-5 rounded border-dark-600 bg-dark-800 text-brand-600"
                      />
                      <label className="text-dark-300">Elevator Available</label>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={formData.security}
                        onChange={e => setFormData({...formData, security: e.target.checked})}
                        className="w-5 h-5 rounded border-dark-600 bg-dark-800 text-brand-600"
                      />
                      <label className="text-dark-300">Security (Guard/CCTV)</label>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={formData.balcony}
                        onChange={e => setFormData({...formData, balcony: e.target.checked})}
                        className="w-5 h-5 rounded border-dark-600 bg-dark-800 text-brand-600"
                      />
                      <label className="text-dark-300">Balcony/Terrace</label>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={formData.garbage_collection}
                        onChange={e => setFormData({...formData, garbage_collection: e.target.checked})}
                        className="w-5 h-5 rounded border-dark-600 bg-dark-800 text-brand-600"
                      />
                      <label className="text-dark-300">Garbage Collection</label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-3">Nearby Amenities</label>
                    <div className="flex flex-wrap gap-2">
                      {['Market', 'Hospital', 'School', 'Church', 'Mosque', 'Police Station', 'Shopping Mall', 'Restaurant', 'ATM', 'Bus Stop'].map(nearby => (
                        <button
                          key={nearby}
                          onClick={() => setFormData(prev => ({
                            ...prev,
                            nearby_amenities: prev.nearby_amenities.includes(nearby)
                              ? prev.nearby_amenities.filter(a => a !== nearby)
                              : [...prev.nearby_amenities, nearby]
                          }))}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            formData.nearby_amenities.includes(nearby)
                              ? 'bg-brand-600 text-white'
                              : 'bg-dark-800 text-dark-400 hover:bg-dark-700'
                          }`}
                        >
                          {nearby}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-dark-300 mb-2">Floor Number</label>
                      <input type="number" value={formData.floor_number} onChange={e => setFormData({...formData, floor_number: e.target.value})} placeholder="e.g., 3" className="w-full bg-dark-900 border border-dark-700 rounded-lg px-4 py-3 text-white focus:border-brand-500 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-dark-300 mb-2">Total Floors in Building</label>
                      <input type="number" value={formData.total_floors} onChange={e => setFormData({...formData, total_floors: e.target.value})} placeholder="e.g., 5" className="w-full bg-dark-900 border border-dark-700 rounded-lg px-4 py-3 text-white focus:border-brand-500 focus:outline-none" />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-dark-300 mb-2">Distance from Main Road</label>
                      <input type="text" value={formData.distance_from_road} onChange={e => setFormData({...formData, distance_from_road: e.target.value})} placeholder="e.g., 200 meters" className="w-full bg-dark-900 border border-dark-700 rounded-lg px-4 py-3 text-white focus:border-brand-500 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-dark-300 mb-2">Bathroom Type</label>
                      <select value={formData.bathroom_type} onChange={e => setFormData({...formData, bathroom_type: e.target.value})} className="w-full bg-dark-900 border border-dark-700 rounded-lg px-4 py-3 text-white focus:border-brand-500 focus:outline-none">
                        <option value="shared">Shared</option>
                        <option value="ensuite">Ensuite</option>
                        <option value="master">Master</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-dark-300 mb-2">Kitchen Type</label>
                      <select value={formData.kitchen_type} onChange={e => setFormData({...formData, kitchen_type: e.target.value})} className="w-full bg-dark-900 border border-dark-700 rounded-lg px-4 py-3 text-white focus:border-brand-500 focus:outline-none">
                        <option value="closed">Closed</option>
                        <option value="open">Open Plan</option>
                        <option value="shared">Shared</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-dark-300 mb-2">Electricity Reliability</label>
                      <select value={formData.electricity_reliability} onChange={e => setFormData({...formData, electricity_reliability: e.target.value})} className="w-full bg-dark-900 border border-dark-700 rounded-lg px-4 py-3 text-white focus:border-brand-500 focus:outline-none">
                        <option value="consistent">Consistent</option>
                        <option value="blackouts">Occasional Blackouts</option>
                        <option value="prepaid">Prepaid Only</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-dark-300 mb-2">Electricity Token / Meter Number</label>
                      <input type="text" value={formData.electricity_token || ''} onChange={e => setFormData({...formData, electricity_token: e.target.value})} placeholder="Enter prepaid token number or meter number" className="w-full bg-dark-900 border border-dark-700 rounded-lg px-4 py-3 text-white focus:border-brand-500 focus:outline-none" />
                      <p className="text-xs text-dark-500 mt-1">For prepaid meters: enter token number. For postpaid: enter meter number.</p>
                    </div>
                    </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-dark-300 mb-2">Pet Policy</label>
                      <select value={formData.pet_policy} onChange={e => setFormData({...formData, pet_policy: e.target.value})} className="w-full bg-dark-900 border border-dark-700 rounded-lg px-4 py-3 text-white focus:border-brand-500 focus:outline-none">
                        <option value="not_allowed">Not Allowed</option>
                        <option value="allowed">Allowed</option>
                        <option value="small_pets_only">Small Pets Only</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3"><input type="checkbox" checked={formData.elevator} onChange={e => setFormData({...formData, elevator: e.target.checked})} className="w-5 h-5 rounded border-dark-600 bg-dark-800 text-brand-600" /><label className="text-dark-300">Elevator Available</label></div>
                    <div className="flex items-center gap-3"><input type="checkbox" checked={formData.security} onChange={e => setFormData({...formData, security: e.target.checked})} className="w-5 h-5 rounded border-dark-600 bg-dark-800 text-brand-600" /><label className="text-dark-300">Security (Guard/CCTV)</label></div>
                    <div className="flex items-center gap-3"><input type="checkbox" checked={formData.balcony} onChange={e => setFormData({...formData, balcony: e.target.checked})} className="w-5 h-5 rounded border-dark-600 bg-dark-800 text-brand-600" /><label className="text-dark-300">Balcony/Terrace</label></div>
                    <div className="flex items-center gap-3"><input type="checkbox" checked={formData.garbage_collection} onChange={e => setFormData({...formData, garbage_collection: e.target.checked})} className="w-5 h-5 rounded border-dark-600 bg-dark-800 text-brand-600" /><label className="text-dark-300">Garbage Collection</label></div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-3">Nearby Amenities</label>
                    <div className="flex flex-wrap gap-2">
                      {['Market', 'Hospital', 'School', 'Church', 'Mosque', 'Police Station', 'Shopping Mall', 'Restaurant', 'ATM', 'Bus Stop'].map(nearby => (
                        <button key={nearby} onClick={() => setFormData(prev => ({...prev, nearby_amenities: prev.nearby_amenities.includes(nearby) ? prev.nearby_amenities.filter(a => a !== nearby) : [...prev.nearby_amenities, nearby]}))} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${formData.nearby_amenities.includes(nearby) ? 'bg-brand-600 text-white' : 'bg-dark-800 text-dark-400 hover:bg-dark-700'}`}>{nearby}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-3">Amenities</label>
                    <div className="flex flex-wrap gap-2">
                      {amenityOptions.map(amenity => (
                        <button key={amenity} onClick={() => toggleAmenity(amenity)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedAmenities.includes(amenity) ? 'bg-brand-600 text-white' : 'bg-dark-800 text-dark-400 hover:bg-dark-700'}`}>{amenity}</button>
                      ))}
                    </div>
                  </div>
              </motion.div>
            )}

            {currentStep === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-2xl font-bold text-white mb-6">Photos & Videos</h2>
                
                {/* Photos Section */}
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <ImageIcon className="w-5 h-5 text-brand-400" />
                    <h3 className="text-lg font-semibold text-white">Photos <span className="text-dark-500 text-sm">({images.length}/10)</span></h3>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative aspect-square rounded-xl overflow-hidden group">
                        <img src={preview} alt="" className="w-full h-full object-cover" />
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 p-1 bg-red-500/80 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <label className="aspect-square rounded-xl border-2 border-dashed border-dark-700 bg-dark-900 flex flex-col items-center justify-center cursor-pointer hover:border-brand-500 transition-colors">
                      <Upload className="w-8 h-8 text-dark-500 mb-2" />
                      <span className="text-xs text-dark-500">Add Photos</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="text-xs text-dark-500">Upload up to 10 photos. First photo will be the cover image.</p>
                </div>

                {/* Videos Section */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Video className="w-5 h-5 text-brand-400" />
                    <h3 className="text-lg font-semibold text-white">Videos <span className="text-dark-500 text-sm">({videos.length}/3)</span></h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {videoPreviews.map((preview, index) => (
                      <div key={index} className="relative rounded-xl overflow-hidden group bg-dark-900">
                        <video 
                          src={preview} 
                          className="w-full aspect-video object-cover"
                          controls
                        />
                        <button
                          onClick={() => removeVideo(index)}
                          className="absolute top-2 right-2 p-1 bg-red-500/80 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <div className="absolute bottom-2 left-2 px-2 py-1 bg-dark-950/80 rounded text-xs text-white">
                          {videos[index]?.name}
                        </div>
                      </div>
                    ))}
                    <label className="aspect-video rounded-xl border-2 border-dashed border-dark-700 bg-dark-900 flex flex-col items-center justify-center cursor-pointer hover:border-brand-500 transition-colors">
                      <Video className="w-8 h-8 text-dark-500 mb-2" />
                      <span className="text-xs text-dark-500">Add Video</span>
                      <span className="text-xs text-dark-600 mt-1">MP4, WebM, max 50MB</span>
                      <input
                        type="file"
                        accept="video/mp4,video/webm,video/ogg"
                        onChange={handleVideoUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="text-xs text-dark-500">Upload up to 3 videos to show your property. Max 50MB per video.</p>
                </div>
              </motion.div>
            )}

            {currentStep === 5 && (
              <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-2xl font-bold text-white mb-6">Contact Information</h2>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-dark-300 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        value={formData.contact_phone}
                        onChange={e => setFormData({...formData, contact_phone: e.target.value})}
                        placeholder="+254 700 000 000"
                        className="w-full bg-dark-900 border border-dark-700 rounded-lg px-4 py-3 text-white focus:border-brand-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-dark-300 mb-2">Email (Optional)</label>
                      <input
                        type="email"
                        value={formData.contact_email}
                        onChange={e => setFormData({...formData, contact_email: e.target.value})}
                        placeholder="your@email.com"
                        className="w-full bg-dark-900 border border-dark-700 rounded-lg px-4 py-3 text-white focus:border-brand-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">Preferred Contact Method</label>
                    <div className="flex gap-4">
                      <button
                        onClick={() => setFormData({...formData, preferred_contact: 'phone'})}
                        className={`flex-1 p-4 rounded-xl border text-center transition-all ${
                          formData.preferred_contact === 'phone'
                            ? 'border-brand-500 bg-brand-500/10 text-brand-400'
                            : 'border-dark-700 bg-dark-900 text-dark-400'
                        }`}
                      >
                        <Phone className="w-6 h-6 mx-auto mb-2" />
                        <div className="font-medium">Phone</div>
                      </button>
                      <button
                        onClick={() => setFormData({...formData, preferred_contact: 'email'})}
                        className={`flex-1 p-4 rounded-xl border text-center transition-all ${
                          formData.preferred_contact === 'email'
                            ? 'border-brand-500 bg-brand-500/10 text-brand-400'
                            : 'border-dark-700 bg-dark-900 text-dark-400'
                        }`}
                      >
                        <Mail className="w-6 h-6 mx-auto mb-2" />
                        <div className="font-medium">Email</div>
                      </button>
                      <button
                        onClick={() => setFormData({...formData, preferred_contact: 'both'})}
                        className={`flex-1 p-4 rounded-xl border text-center transition-all ${
                          formData.preferred_contact === 'both'
                            ? 'border-brand-500 bg-brand-500/10 text-brand-400'
                            : 'border-dark-700 bg-dark-900 text-dark-400'
                        }`}
                      >
                        <Check className="w-6 h-6 mx-auto mb-2" />
                        <div className="font-medium">Both</div>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-dark-800/50">
            <button
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className="flex items-center gap-2 px-6 py-3 bg-dark-800 hover:bg-dark-700 text-white rounded-xl font-medium transition-all disabled:opacity-50"
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </button>
            
            {currentStep < 5 ? (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={!canProceed()}
                className="flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-medium transition-all disabled:opacity-50"
              >
                Next
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!canProceed() || loading}
                className="flex items-center gap-2 px-8 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-medium transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Listing...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    List Property
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
