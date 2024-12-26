// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const authMiddleware = require('../middlewares/auth');  // Optional: protect routes with JWT

// Public routes
router.post('/register', UserController.createUser);
router.post('/login', UserController.loginUser);

// Protected route (JWT required)
router.get('/profile', authMiddleware, (req, res) => {
    res.json({ message: 'User profile', user: req.user });
});

module.exports = router;
