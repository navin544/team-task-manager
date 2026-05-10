# Setup Guide

## Prerequisites

- Node.js 20+
- npm 10+
- Docker Desktop or Docker Engine
- MongoDB Atlas connection string or local MongoDB container

## Local Setup

### 1. Install dependencies

```bash
npm install
npm install --prefix backend
npm install --prefix frontend
```

### 2. Configure environment files

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Populate at minimum:

- `backend/.env`
  - `MONGODB_URI`
  - `MONGODB_DB_NAME`
  - `JWT_ACCESS_SECRET`
  - `JWT_REFRESH_SECRET`
  - `CORS_ORIGIN`
  - `CLIENT_URL`
- `frontend/.env`
  - `VITE_API_URL`
  - `VITE_SOCKET_URL`

### 3. Start local MongoDB with Docker

```bash
docker compose up -d mongo
```

### 4. Seed demo data

```bash
npm run seed --prefix backend
```

### 5. Start development servers

```bash
npm run dev
```

### 6. Access the application

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`
- Health: `http://localhost:5000/health`

## Demo Credentials

- Admin: `admin@teamtaskmanager.dev` / `Admin@12345`
- Member: `member@teamtaskmanager.dev` / `Member@12345`

## Useful Commands

```bash
# Run backend tests
npm run test --prefix backend

# Run lint checks
npm run lint

# Seed demo data again
npm run seed --prefix backend
```
