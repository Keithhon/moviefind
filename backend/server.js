require('dotenv').config();
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increase payload limit

// Detailed request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Server error', error: err.message });
});

// Import Routes
const authRoutes = require('./routes/auth');
const moviesRoutes = require('./routes/movies');

// Route Middlewares
app.use('/api/auth', authRoutes);
app.use('/api/movies', moviesRoutes);

// Basic route for testing
app.get('/', (req, res) => {
  res.send('MovieFind API is running');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
