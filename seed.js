require('dotenv').config();

const { db, auth, admin } = require('./config/firebase');

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'password123';

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

async function seedAdminUser() {
  try {
    const userRecord = await auth.createUser({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
    await auth.setCustomUserClaims(userRecord.uid, { role: 'admin' });
    await db.collection('users').doc(userRecord.uid).set({
      email: ADMIN_EMAIL,
      role: 'admin',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log(`Created admin user: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  } catch (e) {
    if (e.code === 'auth/email-already-exists') {
      console.log(`Admin user ${ADMIN_EMAIL} already exists, skipping creation`);
    } else {
      throw e;
    }
  }
}

async function seedData() {
  const existingAssets = await db.collection('assets').limit(1).get();
  if (!existingAssets.empty) {
    console.log('Sample data already present, skipping asset/PM/inventory seeding');
    return;
  }

  const asset1 = await db.collection('assets').add({
    tag: 'MILL-01',
    name: 'Tissue Rewinder Mill',
    location: 'Plant 1 - Line A',
    manufacturer: 'PaperTech',
    model: 'R-2000',
    installation_date: '2020-01-15',
    status: 'operational',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  const asset2 = await db.collection('assets').add({
    tag: 'DRY-02',
    name: 'Through-Air Dryer',
    location: 'Plant 1 - Line B',
    manufacturer: 'DryCorp',
    model: 'TAD-500',
    installation_date: '2019-06-20',
    status: 'operational',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  await db.collection('pmSchedules').add({
    asset_id: asset1.id,
    task: 'Replace drive belts & lubrication',
    frequency_days: 90,
    last_performed: daysAgo(100),
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  await db.collection('pmSchedules').add({
    asset_id: asset2.id,
    task: 'Inspect dryer felt & bearings',
    frequency_days: 30,
    last_performed: daysAgo(20),
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  await db.collection('inventoryItems').add({
    sku: 'BR-001',
    name: 'Drive Belt, 12mm',
    quantity: 25,
    location: 'Stores A',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  await db.collection('inventoryItems').add({
    sku: 'BRG-10',
    name: 'Bearing 6204',
    quantity: 10,
    location: 'Stores B',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  console.log('Seed data created (assets, pmSchedules, inventoryItems).');
}

async function seed() {
  await seedAdminUser();
  await seedData();
  console.log('Seed complete.');
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
