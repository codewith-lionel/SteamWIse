const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { register, login, updateMarks } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Rate limiter: max 10 auth requests per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Too many requests, please try again later.' },
});

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.put('/marks', authLimiter, protect, updateMarks);

module.exports = router;
