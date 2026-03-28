# Intelligent Tutoring System and Simulator for Digital Logic Circuit Design

Full-stack graduation project for designing, simulating, and tutoring digital logic circuits.

## Stack

- Frontend: React + TypeScript + Vite
- Backend: Node.js + Express + TypeScript
- AI service: OpenRouter using `meta-llama/llama-3.3-70b-instruct:free`

## Deployment mode

This project now supports both local development and production deployment.

- Local development:
  - Frontend dev server runs on `http://localhost:5173`
  - Backend API runs on `http://localhost:5001`
  - Vite proxies `/api` requests to the backend automatically
- Single-server deployment:
  - Build the frontend into `frontend/dist`
  - Start the backend
  - Express serves the built frontend and the `/api` routes from one domain
- Split deployment:
  - Deploy frontend and backend separately
  - Set `VITE_API_BASE_URL` in the frontend to your backend API URL
  - Set `ALLOWED_ORIGINS` in the backend to your frontend domain

## Windows setup

1. Install Node.js LTS (Node 20+ recommended).
   - Option A: `winget install OpenJS.NodeJS.LTS`
   - Option B: Install Node.js LTS from the official website
2. If PowerShell blocks npm scripts, run:
   - `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`
3. Open two PowerShell windows.

## Environment variables

### Frontend

Create `frontend\.env` if you want to override the default API path:

```env
VITE_API_BASE_URL=/api
```

- Local development:
  - Keep `/api`
- Separate frontend deployment example:
  - `VITE_API_BASE_URL=https://your-backend-domain.com/api`

## Backend

```powershell
cd C:\Users\Administrator\Desktop\projec\intelligent-logic-tutor\backend
npm install
npm run dev
```

Set `backend\.env` first:

```env
OPENROUTER_API_KEY=YOUR_KEY
OPENROUTER_MODEL=meta-llama/llama-3.3-70b-instruct:free
OPENROUTER_URL=https://openrouter.ai/api/v1/chat/completions
PORT=5001
ALLOWED_ORIGINS=http://localhost:5173
APP_SITE_URL=http://localhost:5173
APP_TITLE=Intelligent Logic Tutor
```

## Frontend

```powershell
cd C:\Users\Administrator\Desktop\projec\intelligent-logic-tutor\frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173` and calls the backend at `http://localhost:5001/api`.

## Root scripts

You can also work from the project root:

```powershell
cd C:\Users\Administrator\Desktop\projec\intelligent-logic-tutor
npm run install:all
```

```powershell
npm run dev:backend
```

```powershell
npm run dev:frontend
```

## Production build

For single-server deployment:

```powershell
cd C:\Users\Administrator\Desktop\projec\intelligent-logic-tutor
npm run install:all
npm run build
npm run start
```

Then open:

- `http://your-server-domain-or-ip:5001`

In production, the backend will automatically serve the built frontend from `frontend/dist` if that folder exists.

## Separate deployment

If you deploy frontend and backend to different platforms:

1. Frontend:
   - Set `VITE_API_BASE_URL=https://your-backend-domain.com/api`
   - Run `npm run build` inside `frontend`
2. Backend:
   - Set `ALLOWED_ORIGINS=https://your-frontend-domain.com`
   - Set `APP_SITE_URL=https://your-frontend-domain.com`
   - Run `npm run build` and `npm run start` inside `backend`

## Features

- ReactFlow-based logic canvas with draggable nodes and wiring
- Toolbox for INPUT, OUTPUT, AND, OR, NOT, NAND, NOR, XOR
- Zustand state management
- Circuit validation and truth table generation
- AI tutor panel with Analyze, Explain, Practice, and free-form chat
- Express API routes: `/analyze`, `/explain`, `/practice`, `/chat`
