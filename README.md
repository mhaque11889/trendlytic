# Trendlytic

Trendlytic is a research-trends playground: a TypeScript monorepo that imports research papers, extracts keywords, builds thematic clusters and connectivity graphs, and provides interactive visualizations and admin tooling.

This README summarizes the project's purpose, architecture, how to run it locally, important runtime configuration, major source locations, key API endpoints, developer notes and common troubleshooting tips. (This file is self-contained and does not link to other docs.)

---

## Quick overview

- Backend: Express + TypeScript + Mongoose (MongoDB)
- Frontend: React + TypeScript (Vite)
- Visualizations: vis-network for connectivity/knowledge graphs
- Typical development ports: backend 4000, frontend 5173/5174 (Vite may pick a different free port)

Purpose: ingest CSV/XLSX paper lists, extract authors/keywords, run trend analysis (clustering, connectivity graphs, knowledge graph), and present interactive reports. Admins can manage users and clear/import data.

---

## Prerequisites

- Node.js 18+ (or compatible LTS)
- A MongoDB server reachable from your dev machine (local or remote)
- Git (for cloning and contributing)

---

## Repository layout (high level)

- backend/
  - src/
    - app.ts, server.ts — app bootstrap and server entry
    - db/connection.ts — Mongoose connection
    - models/ — Mongoose models (Author, Paper, Keyword, KeywordTrend, Conference, Track, User)
    - routes/ — Express routers (auth, admin, conferences, dashboard, import, trends, index/reports)
    - scripts/seedAdmin.ts — helper to seed initial admin user

- frontend/
  - src/
    - main.tsx, App.tsx — app entry
    - api/client.ts — small API client wrapper used by the UI
    - components/ — key UI pieces (Dashboard, TrendAnalysis, DataVisualization, Reports, GraphVisualization, UserManagement, ConferencesList, etc.)
  - public/ — static assets
  - index.html, vite.config.ts

- Top-level docs/notes: DEV_SETTINGS.md, TREND_ANALYSIS_DOCS.md, TREND_ANALYSIS_QUICKSTART.md, TREND_ANALYSIS_UI_DESIGN.md (contain design and implementation notes)

---

## Configuration and environment variables

Create environment files in each package as needed. Example values are below — do NOT commit secrets.

- Backend: `backend/.env`

```
MONGODB_URI=mongodb://<user>:<password>@<host>:<port>/trendlytic?authSource=admin
PORT=4000
```

- Frontend: `frontend/.env` (optional, defaults to http://localhost:4000)

```
VITE_API_URL=http://localhost:4000
```

---

## Install & run (development)

1. Install dependencies for both packages:

```bash
# from repository root
cd backend
npm install

cd ../frontend
npm install
```

2. Start the backend server (development mode):

```bash
cd backend
npm run dev
```

By default the backend listens on the port defined in `process.env.PORT` (commonly 4000). You can verify a simple health probe at `/health` when running.

3. Start the frontend dev server:

```bash
cd frontend
npm run dev
```

Vite will report a local URL (usually http://localhost:5173 or 5174). Open that URL to view the app.

---

## Important backend endpoints (summary)

The app exposes a number of REST endpoints. Here are the main ones you will use during development and testing:

- Authentication
  - POST `/api/auth/login` — login (returns a token)
  - GET `/api/auth/me` — get current user (requires Authorization header)

- Admin / user management
  - GET `/api/admin/users` — list users (password fields are omitted)
  - POST `/api/admin/users` — create a user (email, password, role)
  - PUT `/api/admin/users/:id` — update user (protected; first user is protected from deletion/edits in some fields)
  - DELETE `/api/admin/users/:id` — delete user (first created user is protected and cannot be deleted)

- Import & data
  - POST `/api/import/upload` — upload file for preview (CSV/XLSX)
  - POST `/api/import/process` — process and import uploaded file

- Data & configuration
  - GET `/api/dashboard` — returns basic statistics (total papers, authors, keywords)
  - Conferences CRUD routes under `/api/conferences` (list/create/update/delete)

- Trend / Reports
  - Routes under `/api/trends` and `/api/reports` provide access to trend analysis, cluster listings, connectivity graphs and knowledge graph data used by the frontend reporting UI.
    - Expect cluster objects to include keyword lists and (where available) `paper_titles` arrays that are shown in the thematic cluster overview.
    - The reports generation flow may accept a keyword-limit parameter (used to restrict analysis to the first N keywords). If you plan to run very large analyses, consider using a smaller keyword limit (e.g., 20, 50, 100) while testing.

Security note: admin routes should be protected by auth in production. During development, confirm that the auth middleware is active if you expect role checks.

---

## Frontend notes (developer)

- The UI is implemented in React + TypeScript. Key components:
  - `Dashboard` — home screen (module cards, stats). The layout uses a responsive CSS grid and provides quick links to modules.
  - `Reports` — reporting UI (Overview, Thematic Clusters, Connectivity Graphs, Knowledge Graph). The connectivity graph uses `vis-network` for interactive node/edge exploration.
  - `DataVisualization` and `TrendAnalysis` — specialized visualization pages.
  - `UserManagement` — admin UI for creating/editing users. The UI prevents deleting the first seeded admin user.

- API calls use `frontend/src/api/client.ts` which reads `VITE_API_URL` by default.
- The frontend expects certain API shapes (for example, clusters containing a `paper_titles` array). Confirm the backend returns these fields when implementing changes.

UX notes applied in this repo:
- The dashboard uses a centered 3-column grid on wide screens and collapses to 2/1 columns on narrower viewports.
- Module card primary buttons show pointer cursors and can be made fully clickable if desired (small UX improvement).

---

## Development tips and troubleshooting

- Ports: Vite may select the default 5173; if in use it will try next available port (e.g., 5174) — check the console output.
- If the frontend shows no data after generating reports, confirm the backend completed the long-running job and that the reports endpoints return populated cluster/graph objects. A short retry/delay is sometimes necessary after generation to allow data persistence.
- If you add or change models, restart the backend dev server.
- Lint/typecheck: the project uses TypeScript — run the TypeScript compiler or your editor's typecheck to catch type errors early.

Commands that are useful during development:

```bash
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm run dev

# Run tests (if any are added later)
npm test
```

---

## Notes about features & future work

- Keyword limiting: the UI has a plan to allow running the report-generation over a subset of keywords (first 20/50/100) to keep visualizations fast during exploration. If you want that to be enforced server-side, add a `keywordLimit` option to the generation route and ensure the clustering logic respects it.
- Graph performance: vis-network works well for moderately sized graphs; for very large graphs consider using server-side reduction (e.g., top-k nodes or sampling) before rendering.
- Access control: ensure admin routes are protected with role checks in production.

---

If you want, I can also: add a short CONTRIBUTING section, set up a small CI step to run typecheck, or create a script that runs the backend + frontend concurrently for local dev.

Happy hacking — open an issue or ping here with what you'd like next.
