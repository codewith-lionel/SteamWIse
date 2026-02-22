const express = require('express');
const router = express.Router();
const { getFinalResult } = require('../controllers/resultController');
const { protect } = require('../middleware/auth');

router.get('/final', protect, getFinalResult);

module.exports = router;
