const bcrypt = require('bcrypt');
const db = require('./db');
const { ensureTables } = require('./init');

ensureTables();

const saltRounds = 10;
const adminPassword = 'password';

async function seed() {
  const hash = await bcrypt.hash(adminPassword, saltRounds);

  db.serialize(() => {
    db.run('INSERT OR IGNORE INTO users(username, password_hash, role) VALUES (?, ?, ?)', ['admin', hash, 'admin']);
    db.run('INSERT OR IGNORE INTO assets(tag, name, location, manufacturer, model, installation_date) VALUES (?, ?, ?, ?, ?, ?)',
      ['MILL-01', 'Tissue Rewinder Mill', 'Plant 1 - Line A', 'PaperTech', 'R-2000', '2020-01-15']);
    db.run('INSERT OR IGNORE INTO assets(tag, name, location, manufacturer, model, installation_date) VALUES (?, ?, ?, ?, ?, ?)',
      ['DRY-02', 'Through-Air Dryer', 'Plant 1 - Line B', 'DryCorp', 'TAD-500', '2019-06-20']);
    db.run('INSERT OR IGNORE INTO pm_schedules(asset_id, task, frequency_days, last_performed) VALUES (1, "Replace drive belts & lubrication", 90, date("now", "-100 days"))');
    db.run('INSERT OR IGNORE INTO pm_schedules(asset_id, task, frequency_days, last_performed) VALUES (2, "Inspect dryer felt & bearings", 30, date("now", "-20 days"))');
    db.run('INSERT OR IGNORE INTO inventory_items(sku, name, quantity, location) VALUES ("BR-001", "Drive Belt, 12mm", 25, "Stores A")');
    db.run('INSERT OR IGNORE INTO inventory_items(sku, name, quantity, location) VALUES ("BRG-10", "Bearing 6204", 10, "Stores B")');
  });

  console.log('Seed complete. Admin username: admin password: password');
}

seed().catch((e) => console.error(e));