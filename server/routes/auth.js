const express = require('express');
const router = express.Router();
const { register, login, updateMarks } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.put('/marks', protect, updateMarks);

module.exports = router;
