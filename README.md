# HRMS MERN Starter

This workspace contains a minimal starter MERN structure:

- `server/` — Express + Mongoose server
- `client/` — Vite + React client

Quick start (run these in separate terminals):

1. Install server dependencies and start server:

```powershell
cd server
npm install
# create .env from .env.example and set MONGO_URI if you want MongoDB
npm run dev
```

2. Install client dependencies and start dev server:

```powershell
cd client
npm install
npm run dev
```

The client dev server runs on a different port (Vite default). The client will call the backend at `/api/ping` if both are served from the same origin or you can use the full backend URL.

If you'd like, I can:
- install dependencies here now,
- add a root `package.json` with `concurrently` to run both,
- add Docker configs,
- or implement authentication and example CRUD endpoints.
