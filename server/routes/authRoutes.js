const express = require('express');
const router = express.Router();
const { login, getMe } = require('../controllers/authController');
const { parseUser } = require('../middleware/authMiddleware');

router.post('/login', login);
router.get('/me', parseUser, getMe);

module.exports = router;
