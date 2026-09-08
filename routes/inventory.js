const express = require('express');
const router = express.Router();
const { db, admin } = require('../config/firebase');
const { authenticate } = require('../middleware/auth');

const inventoryItems = db.collection('inventoryItems');

// GET /inventory
router.get('/', authenticate, async (req, res) => {
  try {
    const snapshot = await inventoryItems.orderBy('name').get();
    res.json(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  } catch (e) {
    res.status(500).json({ error: 'db error' });
  }
});

// POST /inventory
router.post('/', authenticate, async (req, res) => {
  const { sku, name, quantity, location } = req.body;
  if (!sku || !name) return res.status(400).json({ error: 'sku and name required' });

  try {
    const existing = await inventoryItems.where('sku', '==', sku).limit(1).get();
    if (!existing.empty) return res.status(409).json({ error: 'sku already exists' });

    const docRef = await inventoryItems.add({
      sku,
      name,
      quantity: quantity || 0,
      location: location || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    const doc = await docRef.get();
    res.status(201).json({ id: doc.id, ...doc.data() });
  } catch (e) {
    res.status(500).json({ error: 'db error' });
  }
});

module.exports = router;
