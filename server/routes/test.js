const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { getQuestions, submitTest } = require('../controllers/testController');
const { protect } = require('../middleware/auth');

// Rate limiter: max 30 test requests per 15 minutes per IP
const testLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { message: 'Too many requests, please try again later.' },
});

router.get('/generate/:stream', testLimiter, getQuestions);
router.post('/submit', testLimiter, protect, submitTest);

module.exports = router;
