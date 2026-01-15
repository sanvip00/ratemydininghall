# RateMyDiningHall

A simple full-stack app where students can sign up, log in, search campus dining halls, and post ratings/reviews stored in Postgres.

> Note: Production has slowed down and may not receive updates for a long time.

---

## Table of Contents
- [Overview](#overview)
- [Visuals](#visuals)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [How It Works](#how-it-works)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Run](#run)
- [Verify](#verify)
- [Troubleshooting](#troubleshooting)
- [Roadmap](#roadmap)
- [Support](#support)
- [Contributing](#contributing)
- [Authors and Acknowledgment](#authors-and-acknowledgment)
- [License](#license)
- [Assumptions](#assumptions)

---

## Overview
RateMyDiningHall is a platform for college students to rate and review their campus dining halls—use it to find the best spot to eat and share experiences.

---

## Visuals
- [Home Page](https://imgur.com/a/vqhancp)  
- [Rating Page](https://imgur.com/ErF1qCU)

---

## Features
- **User Reviews & Ratings** (1–5 stars)  
- **Browse Dining Halls** (by supported schools)  
- **Search** dining halls by name/filters  
- **User Accounts (Auth)**: register/login with JWT (added during this chat)

---

## Tech Stack
**Backend:** Node.js, TypeScript, Express, pg (Postgres), bcrypt, jsonwebtoken (JWT), dotenv, cors, zod  
**Database:** PostgreSQL (Docker or native)  
**Frontend:** Vanilla HTML/CSS/JS (static pages that call the API via `fetch()`)

---

## How It Works
```
Browser (HTML/JS) -> fetch() -> Express API -> Postgres
                   <- JSON   <-           <- SQL rows
```

- Login/register returns a JWT token
- Token is stored in the browser (commonly `localStorage`)
- Protected requests include `Authorization: Bearer <token>`

---

## Project Structure
Typical layout (may vary slightly by repo):
```
ratemydininghall/
├─ api/
│  ├─ src/
│  ├─ sql/
│  ├─ .env
│  └─ package.json
├─ frontend/
│  ├─ css/
│  ├─ js/
│  └─ pages/
└─ docker-compose.yml
```

---

## Prerequisites
- Node.js 18+ (Node 20 used during development in this chat)
- npm
- Docker Desktop **or** local PostgreSQL
- One of:
  - VS Code Live Server extension, or
  - Python (for `python -m http.server`)

---

## Setup

### 1) Start Postgres

#### Option A: Docker (recommended)
From repo root:
```bash
docker compose up -d
```

#### Option B: Native Postgres
Create:
- DB: `ratemy`
- User: `ratemy`
- Password: `ratemy`

---

### 2) Configure backend env
Create/update `api/.env`:
```env
PORT=4000
DATABASE_URL=postgresql://ratemy:ratemy@localhost:5432/ratemy
JWT_SECRET=ratemy
CORS_ORIGIN=*
```

---

### 3) Install backend deps + init DB
```bash
cd api
npm install
npm run db:init
npm run db:seed
```

---

## Run

### 1) Start backend API
```bash
cd api
npm run dev
```
API runs on:
- `http://localhost:4000`

### 2) Serve frontend pages (do NOT double-click HTML files)
#### Option A: VS Code Live Server (recommended)
Open `frontend/pages/ratemydininghall-home.html` → **Open with Live Server**

#### Option B: Python static server
```bash
cd frontend/pages
python -m http.server 5500
```
Open:
- `http://localhost:5500/ratemydininghall-home.html`

---

## Verify

### 1) Confirm API returns dining halls
Open in browser:
```
http://localhost:4000/dining-halls?school=Drexel&query=
```
You should see JSON with a `data` list.

### 2) Register + Login (Postman)
**POST** `http://localhost:4000/auth/register`
```json
{ "email": "test@example.com", "password": "password123" }
```

**POST** `http://localhost:4000/auth/login`
```json
{ "email": "test@example.com", "password": "password123" }
```

If you re-use the same email, you may see:
- `409 Conflict: Email already exists`

### 3) End-to-end check in the UI
- Open the homepage → navigate to signup/login
- Search/select a dining hall → submit a rating + comment
- Refresh → review should still be present (saved in DB)

---

## Troubleshooting
- **CSS/JS not loading (404 in DevTools Network):**  
  Your HTML files are in `frontend/pages/`, so use:
  - CSS: `../css/<file>.css`
  - JS: `../js/<file>.js`

- **CORS / preflight issues:**  
  Set `CORS_ORIGIN=*` in `api/.env` and restart the API.

- **PowerShell `curl` errors:**  
  PowerShell aliases `curl` to `Invoke-WebRequest`. Use `curl.exe` or Postman.

- **Postgres auth failed (`password authentication failed`):**  
  Make sure `DATABASE_URL` matches your DB user/password.  
  If using Docker and you changed credentials after the DB was created:
  ```bash
  docker compose down -v
  docker compose up -d
  ```

- **Port 5432 already in use:**  
  Stop what’s using 5432 or change Docker to `5433:5432` and update `DATABASE_URL`.

- **`npx http-server` fails on Windows (npm ENOENT):**  
  Use Live Server or `python -m http.server` instead.

---

## Roadmap
- Interactive Map  
- User Account System  
- Expand list of Dining Halls and Supported Schools with Database  

---

## Support
If you have questions, suggestions, or feedback, reach out:  
Email: **kl3476@drexel.edu**

---

## Contributing
We welcome contributions.

1. Fork the repository  
2. Create a branch: `git checkout -b feature/YourFeature`  
3. Commit: `git commit -m "Add new feature"`  
4. Push: `git push origin feature/YourFeature`  
5. Open a pull request  

---

## Authors and Acknowledgment
Thanks to professors, TAs, and peers for feedback during development.  
- RateMyDiningHall Team: Kayla Lu, Sanvi Prasad, Julian Hong

---

## License
This project is not licensed. All rights are reserved.

---

## Assumptions
- The backend exposes routes similar to `/auth/register`, `/auth/login`, and `/dining-halls`.
- The database is initialized/seeded by `npm run db:init` and `npm run db:seed`.
- Frontend pages are served through Live Server or a local static server (recommended), not opened via `file://`.
