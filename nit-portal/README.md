# NIT Jamshedpur — Placement Portal v2.0

A full-stack placement management portal for the Training & Placement Cell.
Built with React + Vite (frontend) and Node.js + Express + MongoDB (backend).

---

## Features

- **Public Dashboard** — KPI cards, placement goal ring, branch-wise bar chart, live drive feed
- **All Drives page** — searchable, filterable table with pagination
- **Statistics page** — monthly trend line chart, doughnut breakdown, branch summary table
- **Admin Login** — dedicated login page with rate-limited JWT auth
- **Post / Edit / Delete Drives** — full CRUD for authenticated admins/coordinators
- **Dark / Light mode** — toggle in navbar, persists across sessions
- **Responsive** — works on mobile, tablet, and desktop

---

## Project Structure

```
nit-portal/
├── backend/
│   ├── middleware/auth.js       # JWT guard + adminOnly
│   ├── models/User.js           # User schema with roles
│   ├── models/Drive.js          # Drive schema (expanded)
│   ├── routes/authRoutes.js     # POST /login, /register, GET /me
│   ├── routes/driveRoutes.js    # CRUD for drives
│   ├── routes/statsRoutes.js    # Aggregated stats
│   ├── server.js                # Express app, helmet, CORS, rate-limit
│   ├── .env.example             # Copy to .env and fill in
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── context/
    │   │   ├── AuthContext.jsx  # Global auth state
    │   │   └── ThemeContext.jsx # Dark/light toggle
    │   ├── services/api.js      # Axios instance with auto-token
    │   ├── components/
    │   │   ├── Navbar.jsx/css
    │   │   ├── Footer.jsx/css
    │   │   ├── DriveForm.jsx/css
    │   │   └── ProtectedRoute.jsx
    │   ├── pages/
    │   │   ├── Dashboard.jsx/css
    │   │   ├── Drives.jsx/css
    │   │   ├── Stats.jsx/css
    │   │   ├── Login.jsx/css
    │   │   └── NotFound.jsx/css
    │   ├── App.jsx              # React Router root
    │   ├── main.jsx
    │   └── index.css            # CSS variables (light + dark theme)
    ├── index.html
    ├── vite.config.js
    ├── .env.example
    └── package.json
```

---

## Local Setup

### 1. Clone and install

```bash
# Backend
cd nit-portal/backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure environment variables

**Backend** — create `backend/.env` (copy from `.env.example`):
```
MONGO_URI=mongodb+srv://USER:PASS@cluster0.xxxxx.mongodb.net/placement_db
PORT=5000
JWT_SECRET=your_long_random_secret_at_least_32_chars
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

**Frontend** — create `frontend/.env` (copy from `.env.example`):
```
VITE_API_URL=http://localhost:5000
```

### 3. Run both servers

```bash
# Terminal 1 — backend
cd backend
npm run dev

# Terminal 2 — frontend
cd frontend
npm run dev
```

Visit: **http://localhost:5173**

Default admin credentials (auto-created on first run):
- Username: `admin`
- Password: `nitjsr2026`

⚠️ **Change the password immediately after first login!**

---

## Deployment

### Backend → Railway / Render

1. Push `backend/` to a GitHub repo
2. Create a new service on [Railway](https://railway.app) or [Render](https://render.com)
3. Set environment variables in the platform dashboard (same as `.env`)
4. Set `NODE_ENV=production`

### Frontend → Vercel / Netlify

1. Push `frontend/` to a GitHub repo
2. Import on [Vercel](https://vercel.com)
3. Add environment variable: `VITE_API_URL=https://your-backend-url.railway.app`
4. Deploy — Vercel auto-detects Vite

### After deploying backend, update:
- `FRONTEND_URL` in backend env → your Vercel URL (for CORS)
- `VITE_API_URL` in frontend env → your Railway/Render URL

---

## API Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/login` | — | Login, returns JWT |
| POST | `/api/auth/register` | Admin | Create new user |
| GET | `/api/auth/me` | User | Get current user |
| GET | `/api/drives` | — | List drives (search/filter/paginate) |
| GET | `/api/drives/:id` | — | Single drive |
| POST | `/api/drives` | User | Create drive |
| PUT | `/api/drives/:id` | User | Update drive |
| DELETE | `/api/drives/:id` | User | Delete drive |
| GET | `/api/stats?batch=2026` | — | Aggregated statistics |

---

## Security Highlights

- Passwords hashed with **bcrypt** (12 rounds)
- **JWT** tokens expire after 8 hours
- **Rate limiting** on all routes (100/15min global), strict 10/15min on login
- **Helmet.js** sets security headers
- **CORS** restricted to frontend URL only
- Input validated with **express-validator**
- Passwords never returned in API responses
- `.env` excluded from git via `.gitignore`
