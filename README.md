# LocalGems 💎

> A talent discovery and booking platform connecting clients with local performers, teachers, athletes, and more.

---

## Architecture Overview

```
localgems/
├── backend/                 # Node.js + Express + MongoDB
│   ├── config/
│   │   └── database.js      # MongoDB connection
│   ├── controllers/         # Business logic (auth, talent, booking, review, event, admin, chat)
│   ├── middleware/
│   │   ├── auth.middleware.js    # JWT protect + role authorize
│   │   └── validate.middleware.js
│   ├── models/              # Mongoose schemas
│   │   ├── User.model.js
│   │   ├── TalentProfile.model.js
│   │   ├── Booking.model.js
│   │   ├── Review.model.js
│   │   ├── EventRequest.model.js
│   │   └── Conversation.model.js
│   ├── routes/              # Express routers
│   ├── scripts/
│   │   └── seed.js          # Seed with dummy data
│   ├── tests/
│   │   └── auth.test.js     # Jest + Supertest unit tests
│   ├── server.js            # Express app entry
│   └── .env.example
│
└── frontend/               # React + Vite + Tailwind
    ├── src/
    │   ├── components/
    │   │   ├── common/      # Navbar, Footer, Layout, StarRating, LoadingScreen
    │   │   ├── talent/      # TalentCard
    │   │   └── booking/     # BookingStatusBadge
    │   ├── context/
    │   │   └── AuthContext.jsx  # Global auth state + JWT management
    │   ├── pages/
    │   │   ├── auth/        # LoginPage, RegisterPage
    │   │   ├── client/      # HomePage, TalentListPage, TalentProfilePage,
    │   │   │                  MyBookingsPage, BookingDetailPage, ChatPage, EventsPage
    │   │   ├── talent/      # TalentDashboardPage, EditProfilePage,
    │   │   │                  ManageAvailabilityPage, TalentBookingsPage
    │   │   └── admin/       # AdminDashboardPage, AdminUsersPage
    │   ├── services/
    │   │   └── api.js       # Axios instance + all API calls
    │   └── App.jsx          # React Router config
    └── tailwind.config.js
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, React Router 6, Tailwind CSS |
| State | React Context + useReducer |
| Backend | Node.js 18+, Express 4 |
| Database | MongoDB 7+, Mongoose 8 |
| Auth | JWT (jsonwebtoken), bcryptjs |
| Testing | Jest, Supertest |
| Validation | express-validator |

---

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### 1. Clone & install

```bash
# Backend
cd localgems/backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# Frontend
cd ../frontend
npm install
```

### 2. Environment variables

**backend/.env**
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/localgems
JWT_SECRET=change_this_to_a_long_random_secret
JWT_EXPIRES_IN=7d
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

### 3. Seed the database

```bash
cd backend
npm run seed
```

This creates sample users, talent profiles, bookings, and reviews.

**Demo credentials:**
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@localgems.com | password123 |
| Client | alice@example.com | password123 |
| TalentProvider | david@example.com | password123 |

### 4. Start dev servers

```bash
# Terminal 1 — Backend
cd backend
npm run dev   # Runs on http://localhost:5000

# Terminal 2 — Frontend
cd frontend
npm run dev   # Runs on http://localhost:5173
```

### 5. Run tests

```bash
cd backend
npm test
```

---

## API Reference

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | Public | Register with role (Client/TalentProvider) |
| POST | `/api/auth/login` | Public | Login, returns JWT |
| GET | `/api/auth/me` | JWT | Get current user + talent profile |
| PATCH | `/api/auth/profile` | JWT | Update name, phone, location |
| PATCH | `/api/auth/change-password` | JWT | Change password |

### Talent
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/talent` | Public | Search with ?skill_type=Singer&location=LA&ratingMin=4&budgetMax=200 |
| GET | `/api/talent/:id` | Public | Get talent profile |
| POST | `/api/talent` | TalentProvider | Create or update own profile |
| GET | `/api/talent/me` | TalentProvider | Get own profile |
| PATCH | `/api/talent/:id/availability` | TalentProvider | Update availability slots |

### Bookings
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/bookings` | Client | Create booking |
| GET | `/api/bookings/me` | Client/Talent | My bookings (role-filtered) |
| GET | `/api/bookings/:id` | Participant | Get booking details |
| PATCH | `/api/bookings/:id/status` | Talent/Client | Update: Confirmed/Completed/Canceled |

### Reviews
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/reviews` | Client | Review a completed booking |
| GET | `/api/reviews/talent/:id` | Public | Get all reviews for a talent |

### Events
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/events` | Public | List open events |
| POST | `/api/events` | Client | Post event request |
| GET | `/api/events/:id` | Public | Event detail |
| POST | `/api/events/:id/apply` | TalentProvider | Apply to event |
| PATCH | `/api/events/:id/applicants/:aid` | Client | Accept/reject applicant |

### Chat
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/chat/conversations` | JWT | List my conversations |
| POST | `/api/chat/start` | JWT | Start or get conversation |
| GET | `/api/chat/:id` | JWT | Get messages |
| POST | `/api/chat/:id/message` | JWT | Send message |

### Admin
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/admin/analytics` | Admin | Stats, popular categories, recent bookings |
| GET | `/api/admin/users` | Admin | User list with search/filter |
| PATCH | `/api/admin/users/:id/toggle` | Admin | Activate/deactivate user |

---

## User Flows

### Client
1. Register as "Client" → Browse talent at `/talent`
2. Filter by skill, location, budget, rating
3. View talent profile → Read reviews, check availability
4. Click "Message" → Chat to negotiate details
5. Click "Book Now" → Fill booking form
6. Track at `/bookings` → Cancel if needed
7. After event is marked Completed → Leave a review ⭐

### TalentProvider
1. Register as "TalentProvider" → Create profile at `/talent-profile/edit`
2. Add skills, bio, portfolio, hourly rate, availability slots
3. Wait for booking requests at `/talent-bookings`
4. Accept ✓ or Decline ✕ pending bookings
5. After the event → Mark as Completed
6. Apply to open event requests at `/events`

### Admin
1. Login as Admin → View analytics at `/admin`
2. See user stats, booking trends, popular categories
3. Manage users at `/admin/users` → Activate/deactivate accounts

---

## Data Models

### Key Design Decisions
- **Soft delete** via `deletedAt` and `isActive` fields throughout
- **Rating denormalization**: `TalentProfile.rating.{average, count}` updated via `Review` post-save hook for read performance
- **One review per booking** enforced by unique index on `booking_id` in Review schema
- **JWT stateless auth**: token stored in localStorage, attached via Axios interceptor
- **Role-based routing**: React `ProtectedRoute` wraps role-specific pages; Express `authorize()` middleware guards APIs
- **Conflict detection**: Booking controller checks for overlapping Pending/Confirmed bookings before creating new ones

---

## Future Enhancements

| Feature | Notes |
|---------|-------|
| 🔴 Real-time Chat | Replace polling with Socket.io rooms per conversation |
| 📅 Calendar Integration | Google Calendar API for availability sync |
| 💳 Payments | Stripe Connect for escrow-style talent payments |
| 📧 Notifications | Nodemailer / SendGrid email on booking status change |
| 🗺️ Geo Search | MongoDB `$near` for radius-based talent search |
| 📱 Push Notifications | Firebase Cloud Messaging for mobile |
| 🔍 Elasticsearch | Full-text search across bio, tags, skills |
| 📊 Talent Analytics | Profile views, conversion rates, earnings dashboard |
| 🎥 Video Portfolio | Cloudinary upload for video portfolio items |
| 🛡️ Verification | ID verification flow for talent badges |

---

## License

MIT
