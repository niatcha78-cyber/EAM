const express = require('express');
const router = express.Router();
const { db, admin } = require('../config/firebase');
const { authenticate } = require('../middleware/auth');

const assets = db.collection('assets');

// GET /assets
router.get('/', authenticate, async (req, res) => {
  try {
    const snapshot = await assets.orderBy('createdAt', 'desc').get();
    res.json(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  } catch (e) {
    res.status(500).json({ error: 'db error' });
  }
});

// GET /assets/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const doc = await assets.doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: 'not found' });
    res.json({ id: doc.id, ...doc.data() });
  } catch (e) {
    res.status(500).json({ error: 'db error' });
  }
});

// POST /assets
router.post('/', authenticate, async (req, res) => {
  const { tag, name, location, manufacturer, model, installation_date } = req.body;
  if (!tag || !name) return res.status(400).json({ error: 'tag and name required' });

  try {
    const existing = await assets.where('tag', '==', tag).limit(1).get();
    if (!existing.empty) return res.status(409).json({ error: 'tag already exists' });

    const docRef = await assets.add({
      tag,
      name,
      location: location || null,
      manufacturer: manufacturer || null,
      model: model || null,
      installation_date: installation_date || null,
      status: 'operational',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    const doc = await docRef.get();
    res.status(201).json({ id: doc.id, ...doc.data() });
  } catch (e) {
    res.status(500).json({ error: 'db error' });
  }
});

module.exports = router;
