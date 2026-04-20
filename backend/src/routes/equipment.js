const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');

// GET /api/equipment - Get all equipment
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('equipment')
      .select(`
        *,
        project:projects (
          id,
          project_title
        )
      `);

    if (error) throw error;

    res.json({
      success: true,
      data: data,
      count: data.length
    });
  } catch (error) {
    console.error('Error fetching equipment:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/equipment - Create new equipment
router.post('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('equipment')
      .insert([req.body])
      .select();

    if (error) throw error;

    res.status(201).json({
      success: true,
      data: data[0]
    });
  } catch (error) {
    console.error('Error creating equipment:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// PUT /api/equipment/:id - Update equipment
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('equipment')
      .update(req.body)
      .eq('id', id)
      .select();

    if (error) throw error;

    res.json({
      success: true,
      data: data[0]
    });
  } catch (error) {
    console.error('Error updating equipment:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// DELETE /api/equipment/:id - Delete equipment
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('equipment')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({
      success: true,
      message: 'Equipment deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting equipment:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;