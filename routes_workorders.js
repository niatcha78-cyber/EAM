const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticate } = require('../middleware/auth');

// GET /workorders
router.get('/', authenticate, (req, res) => {
  db.all('SELECT w.*, a.tag as asset_tag, a.name as asset_name FROM work_orders w LEFT JOIN assets a ON w.asset_id = a.id ORDER BY w.created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'db error' });
    res.json(rows);
  });
});

// POST /workorders
router.post('/', authenticate, (req, res) => {
  const { asset_id, title, description, assigned_to, priority } = req.body;
  if (!title) return res.status(400).json({ error: 'title required' });

  db.run('INSERT INTO work_orders(asset_id, title, description, created_by, assigned_to, priority) VALUES (?, ?, ?, ?, ?, ?)',
    [asset_id || null, title, description || null, req.user.sub, assigned_to || null, priority || 'normal'],
    function (err) {
      if (err) return res.status(500).json({ error: 'db error' });
      db.get('SELECT * FROM work_orders WHERE id = ?', [this.lastID], (e, row) => res.status(201).json(row));
    });
});

// PATCH /workorders/:id - update status or assigned_to
router.patch('/:id', authenticate, (req, res) => {
  const { status, assigned_to } = req.body;
  const updates = [];
  const params = [];

  if (status) {
    updates.push('status = ?');
    params.push(status);
    if (status === 'in_progress') {
      updates.push('started_at = CURRENT_TIMESTAMP');
    } else if (status === 'complete') {
      updates.push('completed_at = CURRENT_TIMESTAMP');
    }
  }
  if (assigned_to !== undefined) {
    updates.push('assigned_to = ?');
    params.push(assigned_to);
  }

  if (updates.length === 0) return res.status(400).json({ error: 'nothing to update' });
  params.push(req.params.id);

  const sql = `UPDATE work_orders SET ${updates.join(', ')} WHERE id = ?`;
  db.run(sql, params, function (err) {
    if (err) return res.status(500).json({ error: 'db error' });
    db.get('SELECT * FROM work_orders WHERE id = ?', [req.params.id], (e, row) => res.json(row));
  });
});

module.exports = router;