const express = require('express');
const router = express.Router();
const { getQuestions, submitTest } = require('../controllers/testController');
const { protect } = require('../middleware/auth');

router.get('/generate/:stream', getQuestions);
router.post('/submit', protect, submitTest);

module.exports = router;
