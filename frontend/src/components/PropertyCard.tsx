import { Link } from 'react-router-dom'
import { MapPin, BedDouble, Bath, Maximize, Heart, Eye } from 'lucide-react'
import { usePropertyStore } from '../store/propertyStore'
import { formatPrice, propertyTypeLabel } from '../utils/formatters'
import type { Property } from '../types'

interface PropertyCardProps {
  property: Property
  variant?: 'default' | 'compact'
}

export default function PropertyCard({ property, variant = 'default' }: PropertyCardProps) {
  const { favorites, toggleFavorite } = usePropertyStore()
  const isFavorite = favorites.includes(property.id)

  if (variant === 'compact') {
    return (
      <Link to={`/property/${property.id}`} className="property-card group">
        <div className="property-card-image">
          <img
            src={property.images?.[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80'}
            alt={property.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3 left-3">
            <span className="badge-brand">{propertyTypeLabel(property.property_type)}</span>
          </div>
          {property.negotiable && (
            <div className="absolute top-3 right-12">
              <span className="badge bg-amber-500/10 text-amber-400 border border-amber-500/20">Negotiable</span>
            </div>
          )}
          <button
            onClick={(e) => { e.preventDefault(); toggleFavorite(property.id); }}
            className="absolute top-3 right-3 w-8 h-8 bg-dark-900/80 backdrop-blur-sm rounded-full flex items-center justify-center transition-all hover:bg-dark-800"
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'text-red-500 fill-red-500' : 'text-white'}`} />
          </button>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-dark-100 truncate group-hover:text-brand-400 transition-colors">{property.title}</h3>
          <div className="flex items-center gap-1 mt-1 text-dark-400 text-sm">
            <MapPin className="w-3.5 h-3.5" />
            <span className="truncate">{property.ward}, {property.county}</span>
          </div>
          <div className="flex items-center justify-between mt-3">
            <span className="text-lg font-bold text-brand-400">{formatPrice(property.monthly_rent)}<span className="text-sm font-normal text-dark-500">/mo</span></span>
            <div className="flex items-center gap-3 text-dark-400 text-xs">
              {property.bedrooms > 0 && (
                <span className="flex items-center gap-1"><BedDouble className="w-3.5 h-3.5" />{property.bedrooms}</span>
              )}
              {property.bathrooms > 0 && (
                <span className="flex items-center gap-1"><Bath className="w-3.5 h-3.5" />{property.bathrooms}</span>
              )}
            </div>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link to={`/property/${property.id}`} className="property-card group">
      <div className="property-card-image">
        <img
          src={property.images?.[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80'}
          alt={property.title}
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="badge-brand">{propertyTypeLabel(property.property_type)}</span>
          {property.furnished && <span className="badge bg-purple-500/10 text-purple-400 border border-purple-500/20">Furnished</span>}
        </div>
        {property.negotiable && (
          <div className="absolute top-3 right-12">
            <span className="badge bg-amber-500/10 text-amber-400 border border-amber-500/20">Negotiable</span>
          </div>
        )}
        <button
          onClick={(e) => { e.preventDefault(); toggleFavorite(property.id); }}
          className="absolute top-3 right-3 w-9 h-9 bg-dark-900/80 backdrop-blur-sm rounded-full flex items-center justify-center transition-all hover:bg-dark-800 hover:scale-110"
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'text-red-500 fill-red-500' : 'text-white'}`} />
        </button>
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-dark-950/90 to-transparent">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-white">{formatPrice(property.monthly_rent)}<span className="text-sm font-normal text-dark-300">/mo</span></span>
            <div className="flex items-center gap-1 text-dark-300 text-sm">
              <Eye className="w-4 h-4" />
              {property.view_count}
            </div>
          </div>
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-semibold text-lg text-dark-100 truncate group-hover:text-brand-400 transition-colors">{property.title}</h3>
        <div className="flex items-center gap-1.5 mt-2 text-dark-400">
          <MapPin className="w-4 h-4 text-brand-500 flex-shrink-0" />
          <span className="text-sm truncate">{property.ward}, {property.sub_county}, {property.county}</span>
        </div>
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-dark-800/50">
          {property.bedrooms > 0 && (
            <div className="flex items-center gap-1.5 text-dark-400 text-sm">
              <BedDouble className="w-4 h-4 text-brand-500" />
              <span>{property.bedrooms} Beds</span>
            </div>
          )}
          {property.bathrooms > 0 && (
            <div className="flex items-center gap-1.5 text-dark-400 text-sm">
              <Bath className="w-4 h-4 text-brand-500" />
              <span>{property.bathrooms} Baths</span>
            </div>
          )}
          {property.square_footage && (
            <div className="flex items-center gap-1.5 text-dark-400 text-sm">
              <Maximize className="w-4 h-4 text-brand-500" />
              <span>{property.square_footage} sqft</span>
            </div>
          )}
        </div>
        {property.amenities && property.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {property.amenities.slice(0, 4).map((amenity) => (
              <span key={amenity} className="badge-dark text-xs">{amenity}</span>
            ))}
            {property.amenities.length > 4 && (
              <span className="badge-dark text-xs">+{property.amenities.length - 4}</span>
            )}
          </div>
        )}
      </div>
    </Link>
  )
}
