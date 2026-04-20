const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');

// GET /api/projects - Get all projects
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        project_components (
          component:components (*)
        ),
        project_community_types (
          community_type:community_types (*)
        )
      `);

    if (error) throw error;

    res.json({
      success: true,
      data: data,
      count: data.length
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/projects - Create new project
router.post('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .insert([req.body])
      .select();

    if (error) throw error;

    res.status(201).json({
      success: true,
      data: data[0]
    });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// PUT /api/projects/:id - Update project
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('projects')
      .update(req.body)
      .eq('id', id)
      .select();

    if (error) throw error;

    res.json({
      success: true,
      data: data[0]
    });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// DELETE /api/projects/:id - Delete project
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;