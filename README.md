# NIT Jamshedpur — Placement Portal v2.0

A full-stack, enterprise-grade placement management portal designed for the Training & Placement Cell of NIT Jamshedpur. Built to handle scale, security, and smart automation.

Built with **React + Vite** (frontend) and **Node.js + Express + MongoDB** (backend).

---

## 🌟 Key Features

### 🎓 For Students
- **Smart Dashboard** — Track upcoming deadlines, profile completion progress, and eligible drives based on your CGPA and branch.
- **AI-Powered Resume Analysis** — Upload your resume (PDF) and get an automated ATS match score, keyword extraction, and actionable formatting feedback.
- **Advanced Drive Filtering** — Seamlessly filter placement drives by Offer Type (FTE/Internship), CTC Range (e.g., `10 - 20 LPA`), Drive Type (On/Off Campus), and eligible branches.
- **Real-Time Notifications** — In-app notification bell system for application updates, new drive postings, and profile changes.
- **Domain Security** — Strict validation ensures only authentic `@nitjsr.ac.in` domain emails can register.

### 🏢 For Administrators (T&P Cell)
- **Advanced Drive Creation** — Create detailed drives using multi-select grids for Eligible Branches and Batches, along with Offer Types and Backlog limitations.
- **Data Privacy (Conditional Redaction)** — Drives marked as "Upcoming" or "Cancelled" automatically hide the "Placed Students" metric across the app (showing a "Results Pending" badge) to prevent early leaks of placement data.
- **Analytics & Statistics** — High-level dashboard views featuring application status overviews, branch-wise placement bar charts, doughnut breakdowns, and exact conversion ratios using MongoDB aggregations.
- **Full Application Management** — View and manage student applications dynamically.

### 🎨 UI / UX
- **Dynamic Theming** — Built-in Light and Dark modes that persist across sessions.
- **Fully Responsive** — Optimized for mobile, tablet, and desktop viewing.

---

## 📂 Project Structure

```
nit-portal/
├── backend/
│   ├── middleware/auth.js       # JWT guard + adminOnly
│   ├── models/                  # Schemas (User, Drive, Application, Notification, StudentProfile)
│   ├── routes/                  # API endpoints (auth, drives, applications, stats, notifications)
│   ├── services/                # AI integrations and complex logic
│   ├── server.js                # Express app, helmet, CORS, rate-limit, fallback logic
│   ├── .env.example             # Copy to .env and fill in
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── context/
    │   │   ├── AuthContext.jsx  # Global auth state
    │   │   └── ThemeContext.jsx # Dark/light toggle
    │   ├── services/api.js      # Axios instance with auto-token
    │   ├── components/          # Reusable UI (Navbar, DriveForm, etc.)
    │   ├── pages/               # Views (Dashboard, Drives, Stats, Login, StudentProfile, etc.)
    │   ├── App.jsx              # React Router root
    │   ├── main.jsx
    │   └── index.css            # CSS variables (light + dark theme tokens)
    ├── vite.config.js
    └── package.json
```

---

## 🚀 Local Setup

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
```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/placement_db
PORT=5000
JWT_SECRET=your_long_random_secret_at_least_32_chars
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```
*(Note: Be sure to whitelist your IP address in MongoDB Atlas, otherwise the server gracefully falls back to a volatile in-memory database).*

**Frontend** — create `frontend/.env` (copy from `.env.example`):
```env
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

## ☁️ Deployment

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
- `FRONTEND_URL` in backend env → your Vercel URL (for CORS protection)
- `VITE_API_URL` in frontend env → your Railway/Render URL

---

## 🛡️ Security Highlights

- Passwords hashed with **bcrypt** (12 rounds).
- **JWT** tokens expire after 8 hours.
- **Rate limiting** on all routes (1000/15min global), strict limits on login.
- **Helmet.js** sets automated security headers.
- **CORS** restricted strictly to the authorized frontend URL.
- Input strictly validated using Mongoose Schemas and Enum properties.
- Passwords and sensitive data are never returned in API responses.
- PDF parsing dependencies version-locked to prevent unexpected deployment failures (`pdf-parse@1.1.1`).
