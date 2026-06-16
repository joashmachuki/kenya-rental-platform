export interface User {
  id: number
  email: string
  phone: string | null
  full_name: string
  role: 'renter' | 'landlord' | 'admin'
  avatar_url: string | null
  is_verified: boolean
  location: string | null
  bio: string | null
  created_at: string
  id_document_url?: string;
}

export interface Property {
  id: number
  title: string
  description: string
  property_type: string
  county: string
  sub_county: string
  ward: string
  town: string | null
  street_address: string | null
  monthly_rent: number
  deposit_amount: number
  negotiable: boolean
  bedrooms: number
  bathrooms: number
  furnished: boolean
  square_footage: number | null
  floor_number: number | null
  total_floors: number | null
  year_built: number | null
  amenities: string[]
  images: string[]
  contact_phone: string | null
  contact_email: string | null
  preferred_contact: string
  status: string
  is_featured: boolean
  view_count: number
  inquiry_count: number
  owner_id: number
  created_at: string
  updated_at: string | null
  owner?: User
}

export interface Message {
  id: number
  property_id: number
  sender_id: number
  receiver_id: number
  content: string
  is_read: boolean
  created_at: string
  sender_name?: string
  sender_avatar?: string | null
  property_title?: string
}

export interface Conversation {
  property_id: number
  property_title: string
  property_image: string | null
  other_user_id: number
  other_user_name: string
  other_user_avatar: string | null
  last_message: string
  last_message_time: string
  unread_count: number
}

export interface SearchFilters {
  county?: string
  sub_county?: string
  ward?: string
  property_type?: string
  min_price?: number
  max_price?: number
  bedrooms?: number
  furnished?: boolean
  query?: string
  sort_by?: string
}
