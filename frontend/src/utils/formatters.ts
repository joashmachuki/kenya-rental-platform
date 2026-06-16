export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export const formatRelativeTime = (date: string): string => {
  const now = new Date()
  const then = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000)

  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
  return formatDate(date)
}

export const propertyTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    apartment: 'Apartment',
    bedsitter: 'Bedsitter',
    studio: 'Studio',
    '1_bedroom': '1 Bedroom',
    '2_bedroom': '2 Bedroom',
    '3_bedroom': '3 Bedroom',
    '4_plus_bedroom': '4+ Bedroom',
    townhouse: 'Townhouse',
    villa: 'Villa',
    commercial: 'Commercial',
    office: 'Office',
    warehouse: 'Warehouse',
  }
  return labels[type] || type
}

export const amenitiesList = [
  'WiFi', 'Parking', 'Security', 'Water', 'Electricity', 'Gym', 'Swimming Pool',
  'Garden', 'Balcony', 'Furnished', 'Air Conditioning', 'CCTV', 'Generator',
  'Elevator', 'Laundry', 'Play Area', 'Solar Power', 'Borehole', 'Cabinet Water',
  'Intercom', 'Satellite TV', 'Internet Ready', 'Wheelchair Access',
]
