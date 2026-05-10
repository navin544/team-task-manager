# Team Task Manager - Submission

## 🔗 Live Links
- **Live URL:** [https://team-task-manager-navin544.up.railway.app](https://team-task-manager-navin544.up.railway.app)
- **GitHub Repository:** [https://github.com/navin544/team-task-manager](https://github.com/navin544/team-task-manager)

## 📦 Project Overview
Team Task Manager is a production-grade platform built for high-performance team coordination. It features a modern React frontend, a scalable Node.js/Express backend, and real-time synchronization.

### Key Features:
- **Authentication:** JWT with Refresh Tokens & HTTP-only cookies.
- **RBAC:** Admin and Member roles with granular permissions.
- **Real-time:** Socket.io for activity feeds and notifications.
- **Analytics:** Interactive charts for project progress and team productivity.
- **Infrastructure:** Dockerized architecture ready for Railway/Cloud deployment.

## 🛠 Tech Stack
- **Frontend:** React, Vite, Tailwind CSS, TanStack Query, Redux Toolkit, Framer Motion, Recharts.
- **Backend:** Node.js, Express, MongoDB (Atlas), Mongoose, Zod, Socket.io.
- **DevOps:** Docker, Railway, GitHub Actions (optional).

## 🚀 Deployment Instructions (Railway)

1. **GitHub Push:**
   ```bash
   git remote add origin https://github.com/navin544/team-task-manager.git
   git push -u origin main
   ```

2. **Railway Setup:**
   - Go to [Railway.app](https://railway.app) and create a **New Project**.
   - Select **Deploy from GitHub repo**.
   - Railway will detect the `railway.json` and create two services: `backend` and `frontend`.

3. **Environment Variables:**
   - **Backend Service:**
     - `MONGODB_URI`: *(Automatically provisioned & linked via railway.json)*
     - `MONGODB_DB_NAME`: `team_task_manager`
     - `JWT_ACCESS_SECRET`: *(Generate a 32+ char string)*
     - `JWT_REFRESH_SECRET`: *(Generate a 32+ char string)*
     - `SMTP_HOST`: `sandbox.smtp.mailtrap.io`
     - `SMTP_USER`: `df898a454a9011`
     - `SMTP_PASS`: `6f4da46440f560`
     - `CLIENT_URL`: *(Your Railway Frontend URL)*
     - `CORS_ORIGIN`: *(Your Railway Frontend URL)*
   - **Frontend Service:**
     - `VITE_API_URL`: *(Your Railway Backend URL)/api*
     - `VITE_SOCKET_URL`: *(Your Railway Backend URL)*

## 🎥 Demo Video
*(Please record a 2-5 min walkthrough of the Dashboard, Project Creation, and Task Management features).*

---

# 🛑 ATTENTION: FIXING THE "MISSING MONGODB_URI" ERROR
If your Railway logs say "CRITICAL ERROR: MONGODB_URI is missing", follow these exact steps:

1. **Verify your Service:** In Railway, click the service that shows the error logs (usually named **`team-task-manager`** or **`backend`**).
2. **Go to Variables:** Open the **"Variables"** tab for that specific service.
3. **Add the URI:** Create a variable named `MONGODB_URI` and paste your Atlas link.
4. **Shared Variables:** If you added it to "backend" but are running the "root" service, the root service **cannot see it**. You MUST add it to the service showing the logs.
5. **Diagnostics:** Once live, go to `[your-app-url]/api/diagnostics` to see exactly what variables the app detects.

---
**Prepared by Gemini CLI Agent**
