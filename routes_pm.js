const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticate } = require('../middleware/auth');

// GET /pm/due - list PM tasks due based on frequency_days and last_performed
router.get('/due', authenticate, (req, res) => {
  const sub = `
  SELECT *, CASE WHEN last_performed IS NULL THEN 1 WHEN date(last_performed, '+' || frequency_days || ' day') <= date('now') THEN 1 ELSE 0 END as due
  FROM pm_schedules
  `;
  const final = `
  SELECT s.*, a.tag as asset_tag, a.name as asset_name
  FROM (${sub}) s
  JOIN assets a ON a.id = s.asset_id
  WHERE s.due = 1
  ORDER BY s.frequency_days DESC
  `;
  db.all(final, [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'db error' });
    res.json(rows);
  });
});

module.exports = router;