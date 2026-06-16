# KejaFind - Kenya Rental Platform

A modern, full-stack rental property platform for Kenya with all 47 counties, sub-counties, and wards integrated.

## Features

- **User Registration** - Separate accounts for renters and landlords
- **Property Listings** - List properties with images, pricing, amenities
- **Advanced Search** - Filter by county, sub-county, ward, price, bedrooms, property type
- **In-Platform Messaging** - Direct chat between renters and landlords
- **Favorites** - Save properties for later
- **Admin Dashboard** - Moderation tools for fake listings
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Dark Mode UI** - Modern, professional dark theme

## Tech Stack

**Backend:**
- FastAPI (Python)
- SQLAlchemy ORM
- SQLite Database
- JWT Authentication
- Pillow for image processing

**Frontend:**
- React 18 + TypeScript
- Vite (Build tool)
- Tailwind CSS
- Zustand (State management)
- Framer Motion (Animations)
- Lucide React (Icons)

## Quick Start

### Terminal 1 - Backend

```bash
cd /Users/jeremiah/Desktop/kenya-rental-platform/backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Terminal 2 - Frontend

```bash
cd /Users/jeremiah/Desktop/kenya-rental-platform/frontend

# Install dependencies
npm install

# Run the dev server
npm run dev
```

### Open in Browser

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Project Structure

```
kenya-rental-platform/
├── backend/
│   ├── app/
│   │   ├── api/           # API routes (auth, properties, messages, locations)
│   │   ├── core/          # Config, database, security
│   │   ├── models/        # SQLAlchemy models
│   │   ├── schemas/       # Pydantic schemas
│   │   ├── services/      # Business logic
│   │   └── utils/         # Kenya locations data
│   ├── uploads/           # Uploaded images
│   └── requirements.txt
│
└── frontend/
    ├── src/
    │   ├── components/    # Reusable components
    │   ├── pages/         # Page components
    │   ├── store/         # Zustand stores
    │   ├── services/      # API service
    │   ├── types/         # TypeScript types
    │   └── utils/         # Formatters
    └── package.json
```

## Kenya Locations

All 47 Kenyan counties are integrated with their sub-counties and wards:
- Nairobi, Mombasa, Kisumu, Nakuru, Kiambu, Kajiado, Machakos
- And all other 40 counties with full ward-level detail

## User Roles

1. **Renter** - Search properties, save favorites, message landlords
2. **Landlord** - All renter features + list and manage properties
3. **Admin** - Platform moderation, review reports, verify users

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login user |
| GET | /api/auth/me | Get current user |
| PUT | /api/auth/me | Update profile |
| GET | /api/properties/search | Search properties |
| POST | /api/properties | Create property (landlord only) |
| GET | /api/properties/featured | Get featured listings |
| GET | /api/properties/recent | Get recent listings |
| GET | /api/properties/{id} | Get property details |
| GET | /api/locations/counties | Get all counties |
| GET | /api/locations/sub-counties/{county} | Get sub-counties |
| GET | /api/locations/wards/{county}/{sub_county} | Get wards |
| POST | /api/messages | Send message |
| GET | /api/messages/conversations | Get conversations |

## Environment Variables

Create a `.env` file in the backend directory:

```
DATABASE_URL=sqlite:///./rental_platform.db
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

## Screenshots

- **Home Page** - Hero section with search, featured properties, stats
- **Search Page** - Advanced filters with county/sub-county/ward dropdowns
- **Property Detail** - Full details with image gallery, amenities, contact
- **Dashboard** - Landlord stats and property management
- **Messages** - Real-time chat interface
- **Admin Panel** - Platform overview and moderation tools

## License

MIT License
