const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

// Register route
router.post(
  '/register',
  [
    check('name', 'Name is required').notEmpty(),
    check('email', 'Please include valid email').isEmail(),
    check('password', 'Password must be 6+ chars').isLength({ min: 6 })
  ],
  (req, res, next) => {
    console.log('Register route hit');
    authController.register(req, res, next);
  }
);

// Login route
router.post(
  '/login',
  [
    check('email', 'Please include valid email').isEmail(),
    check('password', 'Password is required').exists()
  ],
  (req, res, next) => {
    authController.login(req, res, next);
  }
);

// Protected route
router.get(
  '/me',
  (req, res, next) => {
    console.log('Auth middleware executing');
    auth(req, res, next);
  },
  (req, res, next) => {
    authController.getMe(req, res, next);
  }
);

module.exports = router;