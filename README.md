# Hotel Management Reception System (V1)

A modern, clean hotel reception management system built with Next.js 14, MongoDB, and shadcn/ui.

## 🎯 Features

### Core Functionality
- **Authentication**: Simple email/password login for reception staff
- **Dashboard**: Real-time overview of hotel operations with key metrics
- **Room Management**: View and manage room status (Available/Occupied)
- **Guest Check-In**: Register guests with automated room assignment and bill estimation
- **Guest Check-Out**: Complete checkout with automatic bill generation
- **Booking Management**: Create and manage future reservations
- **Booking Conversion**: Convert confirmed bookings to active check-ins

### Dashboard Metrics
- Total rooms
- Available rooms
- Occupied rooms
- Today's check-ins
- Today's check-outs

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: MongoDB
- **UI Components**: shadcn/ui + Tailwind CSS
- **Authentication**: JWT-based session management (jose)
- **Validation**: Zod
- **Icons**: Lucide React
- **Date Handling**: date-fns

## 📦 Installation & Setup

### 1. Install Dependencies
```bash
yarn install
```

### 2. Environment Variables
The `.env` file is already configured with:
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=hotel_management
JWT_SECRET=hotel-management-secret-key-2025
NEXT_PUBLIC_BASE_URL=https://hotel-management-project-hub.vercel.app/
CORS_ORIGINS=*
```

### 3. Seed Database
Initialize the database with default data (rooms and admin user):
```bash
yarn seed
```

This creates:
- Default admin user (email: admin@hotel.com, password: password123)
- 15 rooms:
  - 5 Single rooms ($100/night)
  - 5 Double rooms ($150/night)
  - 3 Suite rooms ($250/night)
  - 2 Deluxe rooms ($350/night)

### 4. Start Development Server
```bash
yarn dev
```

The application will be available at `http://localhost:3000`

## 🔑 Login Credentials

**Email**: admin@hotel.com  
**Password**: password123

## 📂 Project Structure

```
/app
├── app/
│   ├── api/
│   │   └── [[...path]]/
│   │       └── route.js          # All API endpoints
│   ├── layout.js                 # Root layout
│   ├── page.js                   # Main application (login + dashboard)
│   └── globals.css               # Global styles
├── lib/
│   ├── mongodb.js                # Database connection
│   ├── auth.js                   # JWT authentication
│   ├── models.js                 # Data schemas documentation
│   └── utils.js                  # Utility functions
├── components/
│   └── ui/                       # shadcn/ui components
├── scripts/
│   └── seed.js                   # Database seeding script
└── package.json
```



## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

### Rooms
- `GET /api/rooms` - Get all rooms
- `PUT /api/rooms/:id` - Update room status

### Check-Ins
- `POST /api/checkins` - Create new check-in
- `GET /api/checkins/active` - Get active check-ins

### Check-Out
- `POST /api/checkout` - Process checkout and generate bill

### Bookings
- `POST /api/bookings` - Create new booking
- `GET /api/bookings` - Get all upcoming bookings
- `POST /api/bookings/convert` - Convert booking to check-in

### Bills
- `GET /api/bills/:checkInId` - Get bill by check-in ID

## 💾 Database Schema

### Collections

#### users
```javascript
{
  id: string (uuid),
  email: string,
  password: string (hashed),
  name: string,
  role: 'reception',
  createdAt: Date
}
```

#### rooms
```javascript
{
  id: string (uuid),
  roomNumber: string,
  roomType: string (Single/Double/Suite/Deluxe),
  pricePerNight: number,
  status: string (Available/Occupied),
  createdAt: Date
}
```

#### guests
```javascript
{
  id: string (uuid),
  name: string,
  phone: string,
  idProof: string,
  createdAt: Date
}
```

#### checkins
```javascript
{
  id: string (uuid),
  guestId: string,
  guestName: string,
  guestPhone: string,
  guestIdProof: string,
  roomId: string,
  roomNumber: string,
  roomType: string,
  pricePerNight: number,
  checkInDate: Date,
  checkOutDate: Date (expected),
  actualCheckOutDate: Date (null until checkout),
  nightsStayed: number,
  estimatedBill: number,
  status: string (Active/Completed),
  createdAt: Date
}
```

#### bookings
```javascript
{
  id: string (uuid),
  guestName: string,
  guestPhone: string,
  roomType: string,
  checkInDate: Date,
  checkOutDate: Date,
  status: string (Pending/Confirmed/Completed/Cancelled),
  notes: string,
  createdAt: Date
}
```

#### bills
```javascript
{
  id: string (uuid),
  checkInId: string,
  guestName: string,
  guestPhone: string,
  roomNumber: string,
  roomType: string,
  pricePerNight: number,
  checkInDate: Date,
  checkOutDate: Date,
  nightsStayed: number,
  totalAmount: number,
  createdAt: Date
}
```

## 🚀 User Workflows

### Check-In Flow
1. Click "New Check-In" button
2. Fill in guest details (name, phone, ID proof)
3. Select available room from dropdown
4. Set stay duration
5. View estimated bill
6. Complete check-in
7. Room status automatically updates to "Occupied"

### Check-Out Flow
1. Click "Checkout Guest" button
2. Select active guest from dropdown
3. Review stay details and estimated bill
4. Complete checkout
5. Bill is automatically generated
6. Room status updates to "Available"
7. View/print bill

### Booking Flow
1. Click "New Booking" button
2. Enter guest details and preferences
3. Select room type
4. Choose check-in and check-out dates
5. Add optional notes
6. Create booking
7. Booking appears in "Upcoming Bookings"

### Convert Booking to Check-In
1. Find booking in "Upcoming Bookings" section
2. Click "Convert to Check-In"
3. Select specific room (filtered by booked room type)
4. Enter guest ID proof
5. Complete conversion
6. Guest is checked in, booking marked as completed

## 🎯 Quality Features

### User Experience
- Clean, modern UI with gradient backgrounds
- Responsive design (desktop-first)
- Real-time toast notifications for all actions
- Loading states for async operations
- Empty states with helpful messages
- Printable bills

### Data Management
- Automatic room status updates
- Automatic bill calculation based on actual stay
- UUID-based IDs (no MongoDB ObjectID serialization issues)
- Zod validation on all inputs
- Proper error handling

### Security
- JWT-based authentication
- HttpOnly cookies
- Session expiration (24 hours)
- Protected API routes





## 🔧 Development Commands

```bash
# Start development server
yarn dev

# Seed/reseed database
yarn seed

# Build for production
yarn build

# Start production server
yarn start
```
