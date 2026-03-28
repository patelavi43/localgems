require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');  
const connectDB = require('./config/database');

// Route imports
const authRoutes = require('./routes/auth.routes');
const talentRoutes = require('./routes/talent.routes');
const bookingRoutes = require('./routes/booking.routes');
const reviewRoutes = require('./routes/review.routes');
const eventRoutes = require('./routes/event.routes');
const adminRoutes = require('./routes/admin.routes');
const chatRoutes = require('./routes/chat.routes');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); 
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/talent', talentRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// 404 handler
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 LocalGems server running on port ${PORT}`));

module.exports = app;
