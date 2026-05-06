# Team Task Manager

A production-ready full-stack collaborative task management application with role-based access control, kanban board, and real-time dashboard analytics.

![Tech Stack](https://img.shields.io/badge/React-18-blue) ![Node](https://img.shields.io/badge/Node.js-Express-green) ![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-darkgreen)

## 🚀 Features

- **🔐 Authentication** – JWT auth, bcrypt password hashing, protected routes
- **👥 Role-Based Access** – Admin & Member roles with permission enforcement at API and UI level
- **📁 Project Management** – Create, edit, delete projects; manage members per project
- **✅ Task Management** – Full CRUD tasks with Kanban drag-and-drop, status updates, due dates
- **📊 Dashboard Analytics** – Recharts (Pie + Bar charts), stat cards, overdue tasks, deadlines
- **🌙 Dark Mode** – Full light/dark theme toggle with CSS variables
- **📱 Responsive Design** – Mobile-first with glassmorphism UI

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite, React Router v6, Recharts, Axios |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| Validation | Zod |
| Styling | Vanilla CSS with custom design system |

## 📦 Setup Instructions

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)

### 1. Backend
```bash
cd backend
npm install

# Configure environment
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

npm run dev   # http://localhost:5000
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev   # http://localhost:5173
```

## 🔗 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register user |
| POST | `/api/auth/login` | Login + get JWT |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/logout` | Logout |

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | List projects |
| POST | `/api/projects` | Create project (Admin) |
| PUT | `/api/projects/:id` | Update project (Admin) |
| DELETE | `/api/projects/:id` | Delete project (Admin) |
| POST | `/api/projects/:id/members` | Add member (Admin) |
| DELETE | `/api/projects/:id/members/:userId` | Remove member (Admin) |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | List tasks (filtered) |
| POST | `/api/tasks` | Create task (Admin) |
| PUT | `/api/tasks/:id` | Update task (Admin) |
| DELETE | `/api/tasks/:id` | Delete task (Admin) |
| PUT | `/api/tasks/:id/status` | Update status |
| POST | `/api/tasks/assign` | Assign task (Admin) |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/stats` | Get aggregated stats |
| GET | `/api/dashboard/overdue` | Get overdue tasks |

## 🚀 Deployment (Railway)

This repo is a monorepo with separate `backend/` and `frontend/` services.

1. Push code to GitHub.
2. Create a new Railway project and connect your GitHub repository.
3. Add a backend service with root directory `backend`.
   - Service type: Node.js
   - Build command: `npm install`
   - Start command: `npm start`
   - Environment variables:
     - `MONGODB_URI` – your MongoDB Atlas URI
     - `JWT_SECRET` – a strong JWT secret
     - `FRONTEND_URL` – your Railway frontend URL (optional, used for CORS)
4. Add a frontend service with root directory `frontend`.
   - Service type: Static Site or Node.js
   - Build command: `npm install && npm run build`
   - Publish directory: `dist`
   - Environment variables:
     - `VITE_API_URL` – the backend service URL, e.g. `https://your-backend.up.railway.app`
5. In the backend CORS config, `FRONTEND_URL` is used to allow the frontend origin.
6. In the frontend, API requests now use `VITE_API_URL` when defined, falling back to `/api` for local dev.

> If you deploy frontend and backend separately, Railway will serve the frontend from its own domain and the frontend will call the backend via `VITE_API_URL`.

## 📂 Project Structure

```
TEAM TASK MANAGER WEBAPP/
├── backend/
│   ├── server.js           # Express entry point
│   └── src/
│       ├── config/db.js    # MongoDB connection
│       ├── models/         # User, Project, Task
│       ├── routes/         # auth, projects, tasks, users, dashboard
│       └── middleware/     # auth, errorHandler, validate
└── frontend/
    └── src/
        ├── api/            # Axios API service
        ├── context/        # AuthContext, ThemeContext
        ├── pages/          # All page components
        ├── components/     # Layout, Sidebar
        └── styles/         # index.css (design system)
```

## 👤 Demo Credentials

After seeding/creating users:
- **Admin**: admin@demo.com / password123
- **Member**: member@demo.com / password123
