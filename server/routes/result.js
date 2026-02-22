const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { getFinalResult } = require('../controllers/resultController');
const { protect } = require('../middleware/auth');

// Rate limiter: max 20 result requests per 15 minutes per IP
const resultLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: 'Too many requests, please try again later.' },
});

router.get('/final', resultLimiter, protect, getFinalResult);

module.exports = router;
