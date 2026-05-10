# Deployment Guide

## Overview

The repository is prepared for:

- Frontend: Vercel or Netlify
- Backend: Render or Railway
- Database: MongoDB Atlas

## Backend Deployment

### Render

1. Create a new Node web service pointing to `backend/`.
2. Set:
   - Build command: `npm install`
   - Start command: `npm start`
3. Add environment variables from `backend/.env.example`.
4. Set `MONGODB_URI` to your MongoDB Atlas connection string.
5. Set `MONGODB_DB_NAME` to your target database name.
6. Set `CORS_ORIGIN` and `CLIENT_URL` to the deployed frontend URL.
7. Set `RESET_PASSWORD_URL` to `https://<frontend-domain>/reset-password`.

You can import `render.yaml` and then fill in the MongoDB values.

### Railway

1. Create a Railway project.
2. Add the `backend/` folder as a service.
3. Configure the same environment variables as Render.
4. Use `npm install` as the build step.
5. Use `npm start` as the start command.
6. Point `MONGODB_URI` at MongoDB Atlas or another managed MongoDB service.

## Frontend Deployment

### Vercel

1. Import the repository.
2. Set root directory to `frontend/`.
3. Set build command to `npm run build`.
4. Set output directory to `dist`.
5. Configure:
   - `VITE_API_URL=https://<backend-domain>/api`
   - `VITE_SOCKET_URL=https://<backend-domain>`

### Netlify

1. Set base directory to `frontend/`.
2. Set build command to `npm run build`.
3. Set publish directory to `frontend/dist`.
4. Add the same `VITE_*` environment variables.
5. `frontend/netlify.toml` already rewrites routes to `index.html`.

## Database Notes

- Use MongoDB Atlas for production.
- Restrict network access to the deployed backend where possible.
- Rotate database credentials if they were ever exposed.
- Prefer a dedicated production database user with least privilege.

## Production Security Checklist

- Replace development JWT secrets with strong random values.
- Enable TLS everywhere.
- Configure SMTP credentials for password reset emails.
- Set `CORS_ORIGIN` to exact frontend domains only.
- Monitor attachment storage growth and move uploads to object storage if needed.
- Consider Redis-backed rate limiting for horizontal scale.
