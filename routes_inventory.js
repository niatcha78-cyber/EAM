const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticate } = require('../middleware/auth');

// GET /inventory
router.get('/', authenticate, (req, res) => {
  db.all('SELECT * FROM inventory_items ORDER BY name', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'db error' });
    res.json(rows);
  });
});

// POST /inventory
router.post('/', authenticate, (req, res) => {
  const { sku, name, quantity, location } = req.body;
  if (!sku || !name) return res.status(400).json({ error: 'sku and name required' });
  db.run('INSERT INTO inventory_items(sku, name, quantity, location) VALUES (?, ?, ?, ?)',
    [sku, name, quantity || 0, location || null], function (err) {
      if (err) return res.status(500).json({ error: 'db error' });
      db.get('SELECT * FROM inventory_items WHERE id = ?', [this.lastID], (e, row) => res.status(201).json(row));
    });
});

module.exports = router;