const db = require('./db');

function ensureTables() {
  const schema = `
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'technician',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS assets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tag TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  location TEXT,
  manufacturer TEXT,
  model TEXT,
  installation_date DATE,
  status TEXT DEFAULT 'operational',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pm_schedules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  asset_id INTEGER NOT NULL,
  task TEXT NOT NULL,
  frequency_days INTEGER NOT NULL,
  last_performed DATE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(asset_id) REFERENCES assets(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS work_orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  asset_id INTEGER,
  title TEXT NOT NULL,
  description TEXT,
  created_by INTEGER,
  assigned_to INTEGER,
  status TEXT DEFAULT 'open',
  priority TEXT DEFAULT 'normal',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  started_at DATETIME,
  completed_at DATETIME,
  FOREIGN KEY(asset_id) REFERENCES assets(id) ON DELETE SET NULL,
  FOREIGN KEY(created_by) REFERENCES users(id),
  FOREIGN KEY(assigned_to) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS maintenance_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  work_order_id INTEGER,
  asset_id INTEGER,
  performed_by INTEGER,
  notes TEXT,
  performed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(work_order_id) REFERENCES work_orders(id),
  FOREIGN KEY(asset_id) REFERENCES assets(id),
  FOREIGN KEY(performed_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS inventory_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sku TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  quantity INTEGER DEFAULT 0,
  location TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`;
  db.exec(schema, (err) => {
    if (err) console.error('Error ensuring tables:', err);
  });
}

module.exports = { ensureTables };