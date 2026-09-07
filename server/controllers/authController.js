const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'vinayaka_chanda_jwt_secret_key_2026_samithi';

// Admin Login
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required.',
      });
    }

    const user = await User.findOne({ username: username.trim().toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password',
      });
    }

    const isMatch = await bcrypt.compare(password.trim(), user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password',
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        username: user.username,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        username: user.username,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({
      success: false,
      message: 'Server error during login.',
    });
  }
};

// Check current user token
const getMe = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(200).json({
        success: true,
        user: { role: 'user' },
      });
    }
    res.status(200).json({
      success: true,
      user: {
        username: req.user.username,
        role: req.user.role,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to authenticate current user.',
    });
  }
};

module.exports = {
  login,
  getMe,
};
