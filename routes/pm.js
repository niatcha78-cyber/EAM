const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const { authenticate } = require('../middleware/auth');

// GET /pm/due - list PM tasks due based on frequency_days and last_performed.
// Firestore can't express the "date(last_performed, +frequency_days) <= now"
// comparison in a query, so schedules are fetched and filtered in memory -
// fine at prototype scale.
router.get('/due', authenticate, async (req, res) => {
  try {
    const snapshot = await db.collection('pmSchedules').get();
    const now = new Date();

    const due = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((schedule) => {
        if (!schedule.last_performed) return true;
        const nextDue = new Date(schedule.last_performed);
        nextDue.setDate(nextDue.getDate() + (schedule.frequency_days || 0));
        return nextDue <= now;
      });

    const results = await Promise.all(
      due.map(async (schedule) => {
        if (!schedule.asset_id) return { ...schedule, asset_tag: null, asset_name: null };
        const assetDoc = await db.collection('assets').doc(schedule.asset_id).get();
        return {
          ...schedule,
          asset_tag: assetDoc.exists ? assetDoc.data().tag : null,
          asset_name: assetDoc.exists ? assetDoc.data().name : null,
        };
      })
    );

    results.sort((a, b) => (b.frequency_days || 0) - (a.frequency_days || 0));
    res.json(results);
  } catch (e) {
    res.status(500).json({ error: 'db error' });
  }
});

module.exports = router;
