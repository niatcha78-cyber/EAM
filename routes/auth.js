const express = require('express');
const router = express.Router();
const { auth, db, admin } = require('../config/firebase');
const { authenticate } = require('../middleware/auth');

const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY;
const IDENTITY_TOOLKIT_URL = 'https://identitytoolkit.googleapis.com/v1/accounts';

// POST /auth/signup -> { email, password, role? } -> creates the Firebase Auth
// user and a matching Firestore profile in users/{uid}.
router.post('/signup', async (req, res) => {
  const { email, password, role } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  if (password.length < 6) return res.status(400).json({ error: 'password must be at least 6 characters' });

  const userRole = role === 'admin' ? 'admin' : 'technician';

  try {
    const userRecord = await auth.createUser({ email, password });
    await auth.setCustomUserClaims(userRecord.uid, { role: userRole });
    await db.collection('users').doc(userRecord.uid).set({
      email,
      role: userRole,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    res.status(201).json({ uid: userRecord.uid, email, role: userRole });
  } catch (e) {
    if (e.code === 'auth/email-already-exists') {
      return res.status(409).json({ error: 'email already in use' });
    }
    res.status(500).json({ error: e.message });
  }
});

// POST /auth/login -> { email, password } -> signs in against Firebase
// Authentication's Identity Toolkit REST API (the Admin SDK cannot verify
// passwords itself) and returns the resulting ID token.
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  if (!FIREBASE_API_KEY) return res.status(500).json({ error: 'server misconfigured: FIREBASE_API_KEY not set' });

  try {
    const response = await fetch(`${IDENTITY_TOOLKIT_URL}:signInWithPassword?key=${FIREBASE_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    });
    const data = await response.json();

    if (!response.ok) {
      return res.status(401).json({ error: data.error?.message || 'invalid credentials' });
    }

    res.json({
      idToken: data.idToken,
      refreshToken: data.refreshToken,
      expiresIn: data.expiresIn,
      uid: data.localId,
      email: data.email,
    });
  } catch (e) {
    res.status(500).json({ error: 'auth request failed' });
  }
});

// GET /auth/me -> the caller's identity + Firestore profile.
router.get('/me', authenticate, async (req, res) => {
  try {
    const doc = await db.collection('users').doc(req.user.uid).get();
    res.json({
      uid: req.user.uid,
      email: req.user.email,
      role: req.user.role,
      profile: doc.exists ? doc.data() : null,
    });
  } catch (e) {
    res.status(500).json({ error: 'db error' });
  }
});

module.exports = router;
