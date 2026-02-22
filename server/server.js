require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth');
const testRoutes = require('./routes/test');
const resultRoutes = require('./routes/result');

const app = express();

// Connect to MongoDB
connectDB();

// CORS configuration - restrict origin via environment variable in production
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// JSON body parser
app.use(express.json());

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/test', testRoutes);
app.use('/api/result', resultRoutes);

// Health check route
app.get('/', (req, res) => {
  res.json({ message: 'StreamWise AI Server Running' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`StreamWise AI Server running on port ${PORT}`);
});
