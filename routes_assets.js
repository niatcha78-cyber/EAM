const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticate } = require('../middleware/auth');

// GET /assets
router.get('/', authenticate, (req, res) => {
  db.all('SELECT * FROM assets ORDER BY id DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'db error' });
    res.json(rows);
  });
});

// GET /assets/:id
router.get('/:id', authenticate, (req, res) => {
  db.get('SELECT * FROM assets WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: 'db error' });
    if (!row) return res.status(404).json({ error: 'not found' });
    res.json(row);
  });
});

// POST /assets
router.post('/', authenticate, (req, res) => {
  const { tag, name, location, manufacturer, model, installation_date } = req.body;
  if (!tag || !name) return res.status(400).json({ error: 'tag and name required' });
  db.run('INSERT INTO assets(tag,name,location,manufacturer,model,installation_date) VALUES (?, ?, ?, ?, ?, ?)',
    [tag, name, location || null, manufacturer || null, model || null, installation_date || null],
    function (err) {
      if (err) return res.status(500).json({ error: 'db error' });
      db.get('SELECT * FROM assets WHERE id = ?', [this.lastID], (e, row) => res.status(201).json(row));
    });
});

module.exports = router;