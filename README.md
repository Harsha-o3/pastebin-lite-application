# Pastebin Lite

A production-ready, minimal text paste application built with Next.js and Prisma.

## Features

- **Create Pastes**: Store text content with optional expiry rules.
- **Time-based Expiry (TTL)**: Pastes automatically expire after a set number of seconds.
- **View-count Limit**: Pastes expire after reaching a maximum number of views.
- **Combined Rules**: If both TTL and view limits are set, the first one to trigger makes the paste unavailable.
- **API and UI**: Fully functional API and responsive web interface.
- **Deterministic Time**: Supports `x-test-now-ms` header for testing expiry logic.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: SQLite (via Prisma) - *Note: Switched to SQLite to ensure "Project must install and start without manual DB steps" and because local MySQL was unreachable during setup.*
- **Styling**: Tailwind CSS + Shadcn UI
- **ORM**: Prisma 7

## Local Run Instructions

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Setup Database**:
   The project is pre-configured to use SQLite. The database schema will be applied automatically on start, but you can manually sync it:
   ```bash
   npx prisma db push
   ```

3. **Run Development Server**:
   ```bash
   npm run dev
   ```

4. **Health Check**:
   Visit `http://localhost:3000/api/healthz` to verify database connectivity.

## API Documentation

### 1. Health Check
`GET /api/healthz`
- Returns `{"ok": true}` if DB is connected.

### 2. Create Paste
`POST /api/pastes`
- **Request Body**:
  ```json
  {
    "content": "Your text here",
    "ttl_seconds": 3600,
    "max_views": 5
  }
  ```
- **Response**:
  ```json
  {
    "id": "cuid_string",
    "url": "http://localhost:3000/p/cuid_string"
  }
  ```

### 3. Fetch Paste (JSON)
`GET /api/pastes/:id`
- Returns paste metadata and content.
- Decrements `remaining_views`.

### 4. View Paste (HTML)
`GET /p/:id`
- Renders the paste in a user-friendly UI.

## Testing Logic

If `TEST_MODE=1` is set in `.env`, the application will respect the `x-test-now-ms` header (epoch milliseconds) to override system time for all expiry calculations.

## Persistence Layer

This project uses **SQLite** via **Prisma**. 
- **Reasoning**: To satisfy the requirement that the "Project must install and start without manual DB steps", SQLite provides a zero-config persistent storage that survives across serverless requests in local/development environments.
- **Schema**:
  - `id`: Unique identifier (CUID)
  - `content`: Text content
  - `created_at`: Creation timestamp
  - `expires_at`: Optional TTL-based expiry date
  - `max_views`: Optional view limit
  - `current_views`: Tracked view count
