const { auth } = require('../config/firebase');

// Verifies a Firebase Authentication ID token sent as "Authorization: Bearer <idToken>".
// Clients obtain the ID token by signing in with the Firebase client SDK (or the
// /auth/login endpoint below) and refresh it as needed - this middleware never
// handles raw passwords.
async function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'authorization required' });

  const parts = header.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ error: 'invalid auth header' });
  }

  try {
    const decoded = await auth.verifyIdToken(parts[1]);
    req.user = {
      uid: decoded.uid,
      email: decoded.email,
      role: decoded.role || 'technician',
    };
    next();
  } catch (e) {
    return res.status(401).json({ error: 'invalid or expired token' });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'insufficient permissions' });
    }
    next();
  };
}

module.exports = { authenticate, requireRole };
