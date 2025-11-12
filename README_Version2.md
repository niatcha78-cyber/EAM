```markdown
# EAM Prototype for Tissue Manufacturing

This is a minimal Enterprise Asset Management (EAM) prototype aimed at a tissue manufacturing company.
It includes:
- Asset management (machines, lines)
- Work orders (corrective & planned)
- Preventive maintenance (PM) schedules
- Inventory (spare parts)
- Maintenance logs
- JWT authentication

Tech stack
- Node.js + Express
- SQLite (for quick demo)
- jsonwebtoken for auth

Quick start (local)
1. Install dependencies
   npm install

2. Seed the database (creates `eam.db`)
   npm run seed

3. Start the server
   npm start

Server listens on http://localhost:3000 (or PORT env var)

API overview (selected endpoints)
- POST /auth/login  -> { username, password }  -> returns { token }
- GET  /assets
- POST /assets
- GET  /workorders
- POST /workorders
- GET  /pm/due
- GET  /inventory

Seeded example credentials (seeded)
- username: admin
- password: password

Railway deployment notes
- Connect repository to Railway
- Set environment variable JWT_SECRET (required)
- Run build (npm install) and start (npm start)
- Optionally run `npm run seed` from Railway’s console once after deploy to seed DB
```