const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const jwt = require('jsonwebtoken');

// Register User
exports.register = async (req, res, next) => {
    try {
      const { username, email, password, name } = req.body;
  
      // Validate required fields
      if (!username || !email || !password) {
        return next(new ErrorResponse('Please provide username, email and password', 400));
      }
  
      // Check if user already exists
      const existingUser = await User.findOne({ $or: [{ email }, { username }] });
      if (existingUser) {
        const field = existingUser.email === email ? 'Email' : 'Username';
        return next(new ErrorResponse(`${field} already registered`, 400));
      }
  
      // Create user
      const user = await User.create({
        username,
        email,
        password,
        name: name || ''
      });
  
      sendTokenResponse(user, 201, res);
  
    } catch (err) {
      console.error('Registration error:', err);
      
      if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(val => val.message);
        return next(new ErrorResponse(messages.join(', '), 400));
      }
      
      next(new ErrorResponse('Registration failed. Please try again.', 500));
    }
  };
// Login User
exports.login = async (req, res, next) => {
    try {
      const { email, password } = req.body;
  
      // Validate input
      if (!email || !password) {
        return next(new ErrorResponse('Please provide email and password', 400));
      }
  
      // Check for user (case insensitive email match)
      const user = await User.findOne({ 
        email: { $regex: new RegExp(`^${email}$`, 'i') } 
      }).select('+password +lastLogin +loginAttempts +isLocked');
      
      // Account lock check
      if (user?.isLocked && user.lockUntil > Date.now()) {
        const retryAfter = Math.ceil((user.lockUntil - Date.now()) / 1000 / 60);
        return next(new ErrorResponse(
          `Account temporarily locked. Try again in ${retryAfter} minutes`, 
          423
        ));
      }
  
      if (!user) {
        return next(new ErrorResponse('Invalid credentials', 401));
      }
  
      // Verify password
      const isMatch = await user.matchPassword(password);
      
      if (!isMatch) {
        // Increment failed attempts
        user.loginAttempts += 1;
        
        // Lock account after 5 failed attempts
        if (user.loginAttempts >= 5) {
          user.isLocked = true;
          user.lockUntil = Date.now() + 30 * 60 * 1000; // 30 minutes lock
        }
        
        await user.save();
        return next(new ErrorResponse('Invalid credentials', 401));
      }
  
      // Reset login attempts on successful login
      if (user.loginAttempts > 0 || user.isLocked) {
        user.loginAttempts = 0;
        user.isLocked = false;
        user.lockUntil = undefined;
      }
  
      // Update last login
      user.lastLogin = Date.now();
      await user.save();
  
      sendTokenResponse(user, 200, res);
  
    } catch (err) {
      console.error('Login error:', err);
      next(new ErrorResponse('Login failed. Please try again.', 500));
    }
  };
// Get current user
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    res.status(200).json({
      success: true,
      data: user
    });

  } catch (err) {
    console.error('GetMe error:', err);
    next(new ErrorResponse('Unable to fetch user data', 500));
  }
};

const sendTokenResponse = (user, statusCode, res) => {
    try {
      const token = user.getSignedJwtToken();
  
      const options = {
        expires: new Date(
          Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      };
  
      res
        .status(statusCode)
        .cookie('token', token, options)
        .json({
          success: true,
          token
        });
  
    } catch (err) {
      console.error('Token response error:', err);
      throw new Error('Failed to generate token response');
    }
  };