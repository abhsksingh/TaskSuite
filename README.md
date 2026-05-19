# TaskSuite — Team Task Manager

A full-stack project management application with role-based access control, Kanban boards, and real-time collaboration features. Built with a dark, professional UI inspired by Linear and Notion.

## Tech Stack

**Frontend:** React + Vite, Tailwind CSS, React Query, React Router v6, Recharts, Tabler Icons  
**Backend:** Node.js + Express, Prisma ORM, MongoDB, JWT auth with refresh tokens  
**Design:** Dark theme with custom design system, 8px grid, Inter typography, motion animations

## Features

- **Authentication** — Register/login with JWT (15min access + 7d refresh), bcrypt password hashing, rate-limited login
- **Role-Based Access Control** — Global Admin/Member + Project Admin/Member roles, enforced via middleware on every route
- **Project Management** — Create, update, delete projects with member invitations
- **Task Management** — Full CRUD with forward-only status transitions (TODO → IN PROGRESS → DONE), priority levels, due dates
- **Kanban Board** — Drag-and-drop tasks between columns with `@hello-pangea/dnd`
- **Dashboard** — Metric cards, status breakdown bar chart, priority distribution donut chart, overdue tracking
- **My Tasks** — Personal task list grouped by timeframe, filterable by status and priority
- **Validation** — Zod schemas on all inputs, standardized error responses

## Screenshots

| Login | Dashboard | Kanban |
|-------|-----------|--------|
| Dark centered card with grid bg | Metrics + charts + overdue list | 3-column drag-and-drop board |

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas (or local MongoDB) — connection string in `.env`

### Installation

```bash
# Clone the repo
git clone https://github.com/abhsksingh/TaskSuite.git
cd TaskSuite

# Backend setup
cd backend
npm install
# Edit .env and replace DATABASE_URL with your MongoDB connection string
npx prisma db push          # Create collections & indexes
node prisma/seed.js         # Seed demo data
npm run dev                 # Start backend on :3001

# Frontend setup (new terminal)
cd frontend
npm install
npm run dev                 # Start frontend on :5173
```

### Demo Credentials

| Role   | Email                 | Password   |
|--------|-----------------------|------------|
| Admin  | admin@example.com     | Admin1234  |
| Member | member@example.com    | Member1234 |

## API Routes

### Auth
| Method | Route              | Description          |
|--------|--------------------|----------------------|
| POST   | /api/auth/register | Create account       |
| POST   | /api/auth/login    | Sign in              |
| POST   | /api/auth/logout   | Sign out             |
| GET    | /api/auth/me       | Current user         |

### Projects
| Method | Route                              | Description            |
|--------|------------------------------------|------------------------|
| GET    | /api/projects                      | List user's projects   |
| POST   | /api/projects                      | Create project         |
| GET    | /api/projects/:id                  | Project details        |
| PATCH  | /api/projects/:id                  | Update project         |
| DELETE | /api/projects/:id                  | Delete project         |
| POST   | /api/projects/:id/members          | Add member             |
| DELETE | /api/projects/:id/members/:userId  | Remove member          |

### Tasks
| Method | Route                   | Description              |
|--------|-------------------------|--------------------------|
| GET    | /api/projects/:id/tasks | List project tasks       |
| POST   | /api/projects/:id/tasks | Create task              |
| PATCH  | /api/tasks/:id          | Edit task                |
| PATCH  | /api/tasks/:id/status   | Update status            |
| DELETE | /api/tasks/:id          | Delete task              |

### Dashboard
| Method | Route                     | Description          |
|--------|---------------------------|----------------------|
| GET    | /api/dashboard/summary    | Aggregated metrics   |
| GET    | /api/dashboard/overdue    | Overdue tasks        |
| GET    | /api/dashboard/my-tasks   | User's assigned tasks|

## Project Structure

```
TaskSuite/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   └── seed.js            # Demo data seeder
│   ├── src/
│   │   ├── middleware/        # Auth, RBAC, validation, error handler
│   │   ├── routes/            # Express route handlers
│   │   ├── utils/             # Prisma client, JWT helpers
│   │   ├── validators/        # Zod input schemas
│   │   └── index.js           # Server entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.jsx     # Sidebar + top bar shell
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── ui/            # Button, Badge, Input, Skeleton
│   │   ├── context/           # Auth context provider
│   │   ├── lib/               # Axios instance with auto-refresh
│   │   ├── pages/             # Login, Signup, Dashboard, Projects, ProjectDetail, MyTasks
│   │   ├── App.jsx            # Router configuration
│   │   └── main.jsx           # Entry point with providers
│   └── vite.config.js
└── README.md
```

## License

MIT
