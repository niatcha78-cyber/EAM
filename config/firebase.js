const admin = require('firebase-admin');

const DEFAULT_PROJECT_ID = 'chatapp-f13c1';

function loadCredential() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    return admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON));
  }
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    return admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    });
  }
  // Falls back to GOOGLE_APPLICATION_CREDENTIALS or the ambient environment's
  // default service account (e.g. when running on Google Cloud infrastructure).
  return admin.credential.applicationDefault();
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: loadCredential(),
    projectId: process.env.FIREBASE_PROJECT_ID || DEFAULT_PROJECT_ID,
  });
}

const db = admin.firestore();
const auth = admin.auth();

module.exports = { admin, db, auth };
