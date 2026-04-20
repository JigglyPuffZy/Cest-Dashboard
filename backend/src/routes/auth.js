const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');

// POST /api/auth/login - User login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    res.json({
      success: true,
      data: {
        user: data.user,
        session: data.session
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/auth/logout - User logout
router.post('/logout', async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) throw error;

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/auth/user - Get current user
router.get('/user', async (req, res) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;