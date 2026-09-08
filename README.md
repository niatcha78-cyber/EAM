# EAM Prototype for Tissue Manufacturing

A minimal Enterprise Asset Management (EAM) prototype aimed at a tissue manufacturing company.

It includes:
- Asset management (machines, lines)
- Work orders (corrective & planned)
- Preventive maintenance (PM) schedules
- Inventory (spare parts)
- Firebase Authentication (email/password)
- Firestore database

## Tech stack

- Node.js + Express
- Firebase Authentication (email/password)
- Firestore
- `firebase-admin` on the server

## How authentication works

The backend never sees or stores passwords itself:

1. A client signs up via `POST /auth/signup`, which uses the Firebase Admin SDK
   to create the user in Firebase Authentication and a matching profile document
   in the Firestore `users` collection (`{ email, role }`).
2. A client logs in via `POST /auth/login`, which calls Firebase's Identity
   Toolkit REST API (`accounts:signInWithPassword`) with the given
   email/password and returns a Firebase ID token.
3. Every protected route requires `Authorization: Bearer <idToken>`. The
   `authenticate` middleware (`middleware/auth.js`) verifies the token with
   `admin.auth().verifyIdToken()`.

You can also sign users in directly from a web/mobile client using the Firebase
client SDK (`signInWithEmailAndPassword`) instead of `POST /auth/login` — either
way, the client ends up with an ID token to send to this API.

## Setup

### 1. Firebase project credentials

This project is configured to use the existing Firebase project **`chatapp-f13c1`**.

1. In the [Firebase Console](https://console.firebase.google.com/project/chatapp-f13c1),
   make sure **Authentication > Sign-in method > Email/Password** is enabled.
2. Create a Firestore database if one doesn't exist yet (**Firestore Database > Create database**).
3. Generate a service account key: **Project settings > Service accounts >
   Generate new private key**. This downloads a JSON file — use its
   `client_email` and `private_key` fields (or the whole file) below.
4. Get the Web API key: **Project settings > General > Web API Key**. This is
   required for `POST /auth/login`.

### 2. Environment variables

Copy `.env.example` to `.env` and fill in the values from step 1:

```
cp .env.example .env
```

### 3. Install dependencies

```
npm install
```

### 4. Seed sample data (optional)

Creates an admin user (`admin@example.com` / `password123` by default, see
`SEED_ADMIN_EMAIL`/`SEED_ADMIN_PASSWORD`) plus sample assets, PM schedules, and
inventory items in Firestore:

```
npm run seed
```

### 5. Start the server

```
npm start
```

Server listens on http://localhost:3000 (or `PORT` env var).

## API overview

- `POST /auth/signup` — `{ email, password, role? }` → creates a Firebase Auth user + Firestore profile
- `POST /auth/login` — `{ email, password }` → `{ idToken, refreshToken, expiresIn, uid, email }`
- `GET /auth/me` — current user's identity + Firestore profile (requires auth)
- `GET /assets`, `GET /assets/:id`, `POST /assets`
- `GET /workorders`, `POST /workorders`, `PATCH /workorders/:id`
- `GET /pm/due`
- `GET /inventory`, `POST /inventory`

All routes other than `/auth/signup` and `/auth/login` require
`Authorization: Bearer <idToken>`.

## Deployment notes

- Set the environment variables from `.env.example` on your host (Railway,
  etc.) — do not commit `.env` or the service account JSON.
- Optionally run `npm run seed` once after deploy to seed Firestore.
