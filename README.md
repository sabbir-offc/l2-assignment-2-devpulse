# DevPulse

A simple issue tracker backend built with Node.js, Express and PostgreSQL.

**Live URL:** https://devpulse-gamma-nine.vercel.app

## Features

- User registration and login with JWT
- Create, view, update, delete issues
- Two roles: contributor and maintainer
- Filter issues by type and status

## Tech Stack

- Node.js
- TypeScript
- Express.js
- PostgreSQL (pg)
- bcrypt
- jsonwebtoken

## How to run

1. Clone the repo
2. Run `npm install`
3. Copy `.env.example` to `.env` and fill in the values
4. Run `npm run dev`

## Environment Variables

```
PORT=5000
DATABASE_URL=your_postgres_connection_string
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
```

## API Endpoints

### Auth

| Method | Endpoint         | Description         |
| ------ | ---------------- | ------------------- |
| POST   | /api/auth/signup | Register a new user |
| POST   | /api/auth/login  | Login               |

### Issues

| Method | Endpoint        | Access     | Description      |
| ------ | --------------- | ---------- | ---------------- |
| GET    | /api/issues     | Public     | Get all issues   |
| GET    | /api/issues/:id | Public     | Get single issue |
| POST   | /api/issues     | Logged in  | Create issue     |
| PATCH  | /api/issues/:id | Logged in  | Update issue     |
| DELETE | /api/issues/:id | Maintainer | Delete issue     |

**Query params for GET /api/issues**

- `sort` = newest or oldest
- `type` = bug or feature_request
- `status` = open, in_progress, resolved

## Database Schema

**users** - id, name, email, password, role, created_at, updated_at

**issues** - id, title, description, type, status, reporter_id, created_at, updated_at
