const express = require('express');
const router = express.Router();
const { db, admin } = require('../config/firebase');
const { authenticate } = require('../middleware/auth');

const workOrders = db.collection('workOrders');
const assets = db.collection('assets');

// GET /workorders
router.get('/', authenticate, async (req, res) => {
  try {
    const snapshot = await workOrders.orderBy('createdAt', 'desc').get();
    res.json(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  } catch (e) {
    res.status(500).json({ error: 'db error' });
  }
});

// POST /workorders
router.post('/', authenticate, async (req, res) => {
  const { asset_id, title, description, assigned_to, priority } = req.body;
  if (!title) return res.status(400).json({ error: 'title required' });

  try {
    let asset_tag = null;
    let asset_name = null;
    if (asset_id) {
      const assetDoc = await assets.doc(asset_id).get();
      if (assetDoc.exists) {
        asset_tag = assetDoc.data().tag;
        asset_name = assetDoc.data().name;
      }
    }

    const docRef = await workOrders.add({
      asset_id: asset_id || null,
      asset_tag,
      asset_name,
      title,
      description: description || null,
      created_by: req.user.uid,
      assigned_to: assigned_to || null,
      status: 'open',
      priority: priority || 'normal',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      started_at: null,
      completed_at: null,
    });
    const doc = await docRef.get();
    res.status(201).json({ id: doc.id, ...doc.data() });
  } catch (e) {
    res.status(500).json({ error: 'db error' });
  }
});

// PATCH /workorders/:id - update status or assigned_to
router.patch('/:id', authenticate, async (req, res) => {
  const { status, assigned_to } = req.body;
  const updates = {};

  if (status) {
    updates.status = status;
    if (status === 'in_progress') {
      updates.started_at = admin.firestore.FieldValue.serverTimestamp();
    } else if (status === 'complete') {
      updates.completed_at = admin.firestore.FieldValue.serverTimestamp();
    }
  }
  if (assigned_to !== undefined) {
    updates.assigned_to = assigned_to;
  }

  if (Object.keys(updates).length === 0) return res.status(400).json({ error: 'nothing to update' });

  try {
    const docRef = workOrders.doc(req.params.id);
    const existing = await docRef.get();
    if (!existing.exists) return res.status(404).json({ error: 'not found' });

    await docRef.update(updates);
    const doc = await docRef.get();
    res.json({ id: doc.id, ...doc.data() });
  } catch (e) {
    res.status(500).json({ error: 'db error' });
  }
});

module.exports = router;
