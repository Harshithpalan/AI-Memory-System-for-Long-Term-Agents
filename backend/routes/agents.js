const express = require('express');
const pool = require('../config/database');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Create a new agent
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, description, agent_type, config } = req.body;
    const userId = req.user.userId;

    // Validate required fields
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const result = await pool.query(
      `INSERT INTO agents (user_id, name, description, agent_type, config)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, name, description, agent_type || 'general', config]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create agent error:', error);
    res.status(500).json({ error: 'Failed to create agent' });
  }
});

// Get all agents for a user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await pool.query(
      `SELECT a.*, COUNT(m.id) as memory_count
       FROM agents a
       LEFT JOIN memories m ON a.id = m.agent_id
       WHERE a.user_id = $1
       GROUP BY a.id
       ORDER BY a.created_at DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get agents error:', error);
    res.status(500).json({ error: 'Failed to get agents' });
  }
});

// Get a specific agent by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const result = await pool.query(
      'SELECT * FROM agents WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get agent error:', error);
    res.status(500).json({ error: 'Failed to get agent' });
  }
});

// Update an agent
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, agent_type, config } = req.body;
    const userId = req.user.userId;

    const result = await pool.query(
      `UPDATE agents
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           agent_type = COALESCE($3, agent_type),
           config = COALESCE($4, config),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5 AND user_id = $6
       RETURNING *`,
      [name, description, agent_type, config, id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update agent error:', error);
    res.status(500).json({ error: 'Failed to update agent' });
  }
});

// Delete an agent
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const result = await pool.query(
      'DELETE FROM agents WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    res.json({ message: 'Agent deleted successfully' });
  } catch (error) {
    console.error('Delete agent error:', error);
    res.status(500).json({ error: 'Failed to delete agent' });
  }
});

// Get memories for a specific agent
router.get('/:id/memories', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    const userId = req.user.userId;

    // Verify agent belongs to user
    const agentCheck = await pool.query(
      'SELECT id FROM agents WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (agentCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    const result = await pool.query(
      'SELECT * FROM memories WHERE agent_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [id, limit, offset]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get agent memories error:', error);
    res.status(500).json({ error: 'Failed to get agent memories' });
  }
});

module.exports = router;
