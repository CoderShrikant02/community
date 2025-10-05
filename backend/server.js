// server.js
const express = require("express");
const cors = require("cors");
const path = require("path");
require('dotenv').config();
const { testConnection } = require('./config/database');
const authRoutes = require('./routes/auth');
const memberRoutes = require('./routes/members');

const app = express();

// Middleware - Mobile app friendly CORS
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [
        // Mobile app origins (APK)
        /^https?:\/\/.*$/,  // Allow all HTTP/HTTPS for mobile
        /^exp:\/\/.*$/,     // Expo development
        /^exps:\/\/.*$/,    // Expo secure
        'null'              // Mobile app requests
      ]
    : [
        process.env.FRONTEND_URL || 'http://localhost:8081',
        'http://localhost:8081',
        'http://localhost:19006', // Expo web
        'http://10.19.188.135:8081',
        'exp://10.19.188.135:8081',
        // Allow any localhost origin for development
        /^http:\/\/localhost:\d+$/,
        /^http:\/\/127\.0\.0\.1:\d+$/,
        'null' // For mobile apps
      ],
  credentials: true
}));
app.use(express.json());

// Serve static files for uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Test database connection
testConnection();

// Routes
app.get("/", (req, res) => {
  res.json({ message: "MAVS Backend API is " });
});

// Authentication routes
app.use('/api/auth', authRoutes);

// Member routes
app.use('/api/members', memberRoutes);

// Test endpoint for connectivity
app.get("/api/test", (req, res) => {
  res.json({ 
    message: "API connection successful!", 
    timestamp: new Date().toISOString(),
    status: "connected"
  });
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "healthy", 
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler - fixed route pattern
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 MAVS Backend Server running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗄️  Database: ${process.env.DB_HOST || 'localhost'}`);
  
  if (process.env.NODE_ENV === 'production') {
    console.log(`🌐 Production server accessible at the deployed URL`);
  } else {
    console.log(`🔧 Development server accessible at:`);
    console.log(`   - http://localhost:${PORT}`);
    console.log(`   - http://10.19.188.135:${PORT} (for mobile)`);
  }
});
