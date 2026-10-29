# GitHub and Vercel Deployment Guide

## Architecture and production requirements

Deploy the React/Vite frontend on Vercel. Deploy the FastAPI backend as a Python web service (for example, Render).

The entire application uses **MongoDB** as its single, unified database. All user accounts, career profiles, assessments, learning roadmaps, resumes, interview sessions, and progress data are stored natively in MongoDB. No SQL or PostgreSQL database is required.

The backend requires `MONGODB_URI`, `JWT_SECRET_KEY`, and `FRONTEND_ORIGINS` in production. Set `ENVIRONMENT=production`. Set `GEMINI_API_KEY` only if you want Gemini-powered features; keep it in the backend host, never in Vercel. The frontend needs `VITE_API_BASE_URL` set to the backend's HTTPS URL ending in `/api`.

## 1. Run and verify locally

Open PowerShell in the project root. Install frontend dependencies:

```powershell
npm --prefix frontend ci
```

Create and activate a Python environment, then install backend dependencies:

```powershell
py -3.12 -m venv backend/venv
backend/venv/Scripts/Activate.ps1
python -m pip install -r backend/requirements.txt
```

Ensure `backend/.env` has your `MONGODB_URI` and `JWT_SECRET_KEY`. Start the backend in one PowerShell window:

```powershell
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```

Start the frontend in a second window at the project root:

```powershell
npm run dev:frontend
```

Visit `http://localhost:5173`. Check backend health at `http://127.0.0.1:8000/api/health` and API documentation at `http://127.0.0.1:8000/docs`.

Run the project checks from the project root:

```powershell
npm run lint
npm run build
python backend/tests/test_api_suite.py
python backend/tests/test_interview_flow.py
```

## 2. Push to GitHub

Ensure all files are committed and pushed to your GitHub repository:

```powershell
git add .
git status --short
git commit -m "Migrate backend to 100% native MongoDB"
git push origin main
```

## 3. Deploy the backend on Render

Connect your GitHub repository to a new Web Service on Render:

1. In Render, select **New + → Web Service**.
2. Select repository: `AI-Career-Guidance-Platform`.
3. Configure settings:
   - Root directory: *(leave blank / `.`) *
   - Runtime: Python
   - Build command: `pip install -r backend/requirements.txt`
   - Start command: `uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT`
   - Health check path: `/api/health`

Add these environment variables in the backend service dashboard:

| Name | Value |
|---|---|
| `ENVIRONMENT` | `production` |
| `MONGODB_URI` | Your MongoDB Atlas connection string |
| `DATABASE_NAME` | `career_guidance` |
| `JWT_SECRET_KEY` | A secret of at least 32 characters |
| `FRONTEND_ORIGINS` | Your Vercel domain, e.g. `https://your-project.vercel.app` (no trailing slash) |
| `GEMINI_API_KEY` | Optional; set only in backend if using Gemini AI |

Once deployed, copy your Render service URL (e.g. `https://your-service.onrender.com`). Verify by visiting `https://your-service.onrender.com/api/health`.

## 4. Deploy the frontend on Vercel

In Vercel, import your repository:

- Root Directory: `frontend`
- Framework Preset: Vite
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm ci`

Add this environment variable for **Production** (and Preview):

| Name | Value |
|---|---|
| `VITE_API_BASE_URL` | `https://your-service.onrender.com/api` |

Redeploy the frontend in Vercel after adding the variable.
