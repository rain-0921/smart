# Smart Interactive Learning System (SILS)

A web-based learning management system with role-based dashboards for **students**, **instructors**, **advisors**, and **admins**. Built as a final-year project with a React frontend and a Node.js / Express + MySQL backend.

---

## 1. What it does

The system serves four roles from a single frontend:

| Role | What they can do |
|---|---|
| **Student** | Browse courses / modules / lessons, take quizzes (with file-upload assignments), see their progress and grades, receive personalised notifications. |
| **Instructor** | Create and manage their own courses, modules, lessons, quizzes and questions, grade student attempts, view a performance dashboard. |
| **Advisor** | View their advisees' at-risk status, course progress, and recent activity. Read-only overview plus ability to write feedback on quiz attempts. |
| **Admin** | Manage every user in the system (create / edit / deactivate), assign students to advisors, change user roles. |

Key features:
- **Authentication** — JWT login with bcrypt-hashed passwords.
- **Quiz engine** — auto-graded MCQs, manually-graded short answers, file-upload assignments, retakes.
- **At-risk detection** — `student_profile.is_at_risk` is derived from the student's average score on graded quizzes.
- **Notifications** — personal + role-broadcast messages, persisted to the DB, with read / unread state.
- **Activity log** — every login, quiz start/submit, lesson view, and course/quiz creation is recorded.
- **Charts** — instructor dashboard uses Recharts to summarise attempts, scores, and average performance.

---

## 2. Tech Stack

- **Frontend** — React 19 (Create React App), React Router 7, Recharts, Axios. No Redux — all server state is fetched on mount.
- **Backend** — Node.js, Express 5, MySQL2 (promise wrapper), JWT, Multer (file uploads).
- **Database** — MySQL 8 (single schema `smis`).
- **Tooling** — ESLint (extends `react-app` config), bcryptjs for hashing.

---

## 3. Demo accounts

Passwords are shared per role:

| Role | Username | Password |
|---|---|---|
| Admin | `admin01` | `Admin@123` |
| Advisor | `advisor01`, `advisor02` | `Advisor@123` |
| Instructor | `instructor01`, `instructor02`, `instructor03` | `Instr@123` |
| Student | `student01` … `student10` | `Student@123` |

> All seed users have `@smis.edu` email addresses and use the `+60` Malaysian phone-number format.

---

## 4. Running the project

### Prerequisites

- Node.js 18+
- MySQL 8+ running locally on **port 3306**, with an empty database named `smis`
- (Optional) MySQL Workbench or `mysql` CLI for restoring the dump

### 4.1. Start MySQL and import the schema

```bash
# from the project root
mysql -u root -p < backend/smis.sql
```

This creates the `smis` database, all tables, foreign keys, and a few stored helpers. It does **not** seed any user data.

### 4.2. Seed demo data

```bash
cd backend
npm install
npm run seed
# → prints 🌱 SMIS seed starting… and finishes with ✅  Seed complete.
```

The seed script reuses `./config/db.js` for its connection pool, so MySQL credentials are read from there (or fall back to `root` with no password on `localhost`).

### 4.3. Start the backend

```bash
# still in backend/
npm run dev          # nodemon (auto-reload)
# or
npm start            # plain node
```

By default the API listens on **http://localhost:5000**.

### 4.4. Start the frontend

```bash
cd frontend
npm install
npm start
```

The app opens at **http://localhost:3000**. The frontend's axios client is configured to proxy `"/api/*"` to the backend port (see `package.json` — `proxy`), so no manual URL wiring is needed.

---

## 5. Project layout

```
smart/
├── backend/
│   ├── server.js                # Express bootstrap
│   ├── config/db.js             # mysql2 pool (reads .env or uses defaults)
│   ├── controllers/             # one file per role: admin, advisor, instructor, student
│   ├── routes/                  # adminRoutes, advisorRoutes, instructorRoutes, studentRoutes, authRoutes
│   ├── seed.js                  # Demo data (see §3 for accounts)
│   └── smis.sql                 # Empty schema + sample indexes
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── StudentDashboard.jsx
│   │   │   ├── InstructorDashboard.jsx
│   │   │   ├── AdvisorDashboard.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   └── <role>/sections/  # one component per dashboard tab
│   │   ├── services/api.js      # All axios calls (per-role namespaces)
│   │   ├── components/          # Shared Modal, Empty, Spinner, Theme
│   │   └── App.jsx              # Router
│   └── public/
│       ├── index.html           # Title: "Smart Interactive Learning System"
│       └── favicon.svg          # Graduation-cap + book icon
└── README.md
```

---

## 6. API overview

All endpoints are prefixed with `/api`:

| Prefix | Controller | Sample routes |
|---|---|---|
| `/auth` | — | `POST /login`, `POST /register` |
| `/admin` | `adminController` | `GET /users`, `POST /users`, `PATCH /users/:id`, `POST /assign-advisor` |
| `/advisor` | `advisorController` | `GET /advisees`, `GET /at-risk`, `POST /quiz-feedback` |
| `/instructor` | `instructorController` | `GET /dashboard`, `CRUD /courses`, `CRUD /modules`, `CRUD /quizzes`, `GET /attempts` |
| `/student` | `studentController` | `GET /dashboard`, `GET /courses`, `POST /quiz/start`, `POST /quiz/submit`, `GET /notifications`, `GET /progress` |

JWT is sent via the `Authorization: Bearer <token>` header. The backend middleware decodes the token and attaches the user role to `req.user`.

---

## 7. Resetting the database

To wipe seeded data and re-seed (e.g. before a demo):

```bash
mysql -u root -p -e "DROP DATABASE smis;"
mysql -u root -p < backend/smis.sql
cd backend && npm run seed
```

---

## 8. Troubleshooting

| Symptom | Fix |
|---|---|
| `ECONNREFUSED 127.0.0.1:3306` | MySQL isn't running. Start the service. |
| Login fails after seed | Confirm `seed.js` finished without errors; `admin01 / Admin@123` must exist in `user`. |
| Frontend can't reach backend | Make sure backend is on port 5000 and `package.json#proxy` is set. |
| `EADDRINUSE :5000` after restart | Kill the previous node process (`Get-Process node \| Stop-Process -Force` on Windows). |

---

## 9. License & credits

Final-year project. Built with React, Express, and MySQL. The demo content (course titles, lesson descriptions) is illustrative and not from any real institution.
