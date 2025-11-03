# Trendlytic (MERN, TypeScript)

Monorepo: `backend` (Express + Mongoose) and `frontend` (Vite + React).

## Prerequisites
- Node.js 18+
- An existing MongoDB server and credentials

## Backend
1. Create `backend/.env` with:

```
MONGODB_URI=mongodb://trendlyticNew:trendlyticNew2025@<host>:<port>/trendlyticNew?authSource=admin
PORT=4000
```

2. Install and run:

```
cd backend
npm install
npm run dev
```

API health: `GET http://localhost:4000/health`

Conferences CRUD: `http://localhost:4000/conferences`

## Frontend
1. Configure API URL (optional): create `frontend/.env`:

```
VITE_API_URL=http://localhost:4000
```

2. Install and run:

```
cd frontend
npm install
npm run dev
```

App: `http://localhost:5173`

## Notes
- Models included: `Conference`, `Track`, `Author`, `Paper` (base schemas)
- Next steps: add CSV import, keyword extraction jobs, visualizations, auth

