const express = require('express');
const router = express.Router();
const { register, login, getProfile, getAllUsers } = require('../controllers/userController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/profile', authenticateToken, getProfile);

// Admin only routes
router.get('/users', authenticateToken, requireAdmin, getAllUsers);

module.exports = router;
