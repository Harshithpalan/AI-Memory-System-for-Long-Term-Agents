const express = require('express');
const pool = require('../config/database');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Create a new memory
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { agent_id, content, memory_type, importance, tags, metadata } = req.body;
    const userId = req.user.userId;

    // Validate required fields
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const result = await pool.query(
      `INSERT INTO memories (agent_id, user_id, content, memory_type, importance, tags, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [agent_id, userId, content, memory_type || 'general', importance || 5, tags, metadata]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create memory error:', error);
    res.status(500).json({ error: 'Failed to create memory' });
  }
});

// Get all memories for a user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { agent_id, memory_type, limit = 50, offset = 0 } = req.query;
    const userId = req.user.userId;

    let query = 'SELECT * FROM memories WHERE user_id = $1';
    const params = [userId];
    let paramCount = 1;

    if (agent_id) {
      paramCount++;
      query += ` AND agent_id = $${paramCount}`;
      params.push(agent_id);
    }

    if (memory_type) {
      paramCount++;
      query += ` AND memory_type = $${paramCount}`;
      params.push(memory_type);
    }

    query += ' ORDER BY created_at DESC LIMIT $' + (paramCount + 1) + ' OFFSET $' + (paramCount + 2);
    params.push(limit, offset);

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get memories error:', error);
    res.status(500).json({ error: 'Failed to get memories' });
  }
});

// Get a specific memory by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const result = await pool.query(
      'SELECT * FROM memories WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Memory not found' });
    }

    // Update accessed_at timestamp
    await pool.query(
      'UPDATE memories SET accessed_at = CURRENT_TIMESTAMP WHERE id = $1',
      [id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get memory error:', error);
    res.status(500).json({ error: 'Failed to get memory' });
  }
});

// Update a memory
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { content, memory_type, importance, tags, metadata } = req.body;
    const userId = req.user.userId;

    const result = await pool.query(
      `UPDATE memories
       SET content = COALESCE($1, content),
           memory_type = COALESCE($2, memory_type),
           importance = COALESCE($3, importance),
           tags = COALESCE($4, tags),
           metadata = COALESCE($5, metadata),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6 AND user_id = $7
       RETURNING *`,
      [content, memory_type, importance, tags, metadata, id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Memory not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update memory error:', error);
    res.status(500).json({ error: 'Failed to update memory' });
  }
});

// Delete a memory
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const result = await pool.query(
      'DELETE FROM memories WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Memory not found' });
    }

    res.json({ message: 'Memory deleted successfully' });
  } catch (error) {
    console.error('Delete memory error:', error);
    res.status(500).json({ error: 'Failed to delete memory' });
  }
});

// Search memories by content or tags
router.get('/search/:query', authMiddleware, async (req, res) => {
  try {
    const { query } = req.params;
    const { agent_id, memory_type } = req.query;
    const userId = req.user.userId;

    let sql = `
      SELECT * FROM memories
      WHERE user_id = $1
      AND (content ILIKE $2 OR $3 = ANY(tags))
    `;
    const params = [userId, `%${query}%`, query];
    let paramCount = 3;

    if (agent_id) {
      paramCount++;
      sql += ` AND agent_id = $${paramCount}`;
      params.push(agent_id);
    }

    if (memory_type) {
      paramCount++;
      sql += ` AND memory_type = $${paramCount}`;
      params.push(memory_type);
    }

    sql += ' ORDER BY created_at DESC LIMIT 100';

    const result = await pool.query(sql, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Search memories error:', error);
    res.status(500).json({ error: 'Failed to search memories' });
  }
});

// Get memories by importance threshold
router.get('/importance/:threshold', authMiddleware, async (req, res) => {
  try {
    const { threshold } = req.params;
    const { agent_id } = req.query;
    const userId = req.user.userId;

    let query = `
      SELECT * FROM memories
      WHERE user_id = $1 AND importance >= $2
    `;
    const params = [userId, threshold];
    let paramCount = 2;

    if (agent_id) {
      paramCount++;
      query += ` AND agent_id = $${paramCount}`;
      params.push(agent_id);
    }

    query += ' ORDER BY importance DESC, created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get memories by importance error:', error);
    res.status(500).json({ error: 'Failed to get memories by importance' });
  }
});

module.exports = router;
