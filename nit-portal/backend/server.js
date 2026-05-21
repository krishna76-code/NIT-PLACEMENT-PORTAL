const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');

const app = express();

// --- SECURITY MIDDLEWARE ---
app.use(helmet());

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Global rate limiter — 1000 requests per 15 minutes per IP (increased for dev)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' }
});
app.use(globalLimiter);

app.use(express.json({ limit: '10kb' })); // Prevent large payload attacks

// --- ADMIN SEED (only if no admin exists) ---
async function seedAdmin() {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      const hashed = await bcrypt.hash('nitjsr2026', 12);
      await new User({ username: 'admin', password: hashed, role: 'admin', name: 'Admin' }).save();
      console.log("👤 Default admin created — username: admin, password: nitjsr2026");
      console.log("⚠️  Change this password immediately after first login!");
    }

    const studentExists = await User.findOne({ role: 'student' });
    // Default student logic removed as per user request
  } catch (err) {
    console.error('Seed error:', err.message);
  }
}

// --- DATABASE ---
const connectDB = async () => {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ MongoDB Connected Successfully!');
    await seedAdmin();
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message || err);
    console.log('⚠️ Attempting to spin up an in-memory local MongoDB server...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      console.log(`ℹ️ In-memory MongoDB Server started at: ${mongoUri}`);
      await mongoose.disconnect();
      await mongoose.connect(mongoUri);
      console.log('✅ Connected to In-memory MongoDB Successfully!');
      await seedAdmin();
    } catch (inMemErr) {
      console.error('❌ Failed to start In-memory MongoDB:', inMemErr.message);
    }
  }
};
connectDB();

// --- ROUTES ---
const authRoutes = require('./routes/authRoutes');
const driveRoutes = require('./routes/driveRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const statsRoutes = require('./routes/statsRoutes');
const studentRoutes = require('./routes/studentRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/drives', driveRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'NIT Jamshedpur Placement API v2.0', status: 'running' });
});

// --- 404 HANDLER ---
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// --- GLOBAL ERROR HANDLER ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
 
