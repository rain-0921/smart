# Smart Interactive Learning System (SILS)

A web-based learning management system with role-based dashboards for **students**, **instructors**, **advisors**, and **admins**.

**Tech Stack:** React 19 · React Router 7 · Recharts · Axios (frontend) | Node.js · Express 5 · MySQL 8 · JWT · Multer (backend)

---

## Getting Started

### Prerequisites

- Node.js 18+
- MySQL 8 running on port 3306

### 1. Import the database

```bash
mysql -u root -p < backend/smis.sql
```

### 2. Seed demo data

```bash
cd backend
npm install
npm run seed
```

### 3. Start the backend

```bash
# in backend/
npm run dev
```

API runs at **http://localhost:5000**

### 4. Start the frontend

```bash
cd frontend
npm install
npm start
```

App opens at **http://localhost:3000**

---

## Demo Accounts

| Role | Username | Password |
|---|---|---|
| Admin | `admin01` | `Admin@123` |
| Advisor | `advisor01`, `advisor02` | `Advisor@123` |
| Instructor | `instructor01`, `instructor02`, `instructor03` | `Instr@123` |
| Student | `student01` … `student10` | `Student@123` |

---

## Project Structure

```
smart-rain/
├── backend/
│   ├── server.js          # Express entry point
│   ├── config/db.js       # MySQL connection pool
│   ├── controllers/       # admin, advisor, instructor, student
│   ├── routes/            # per-role route files + authRoutes
│   ├── seed.js            # Demo data seeder
│   └── smis.sql           # Database schema
└── frontend/
    └── src/
        ├── pages/         # Role dashboards (Student, Instructor, Advisor, Admin)
        ├── services/api.js # Axios API calls
        ├── components/    # Shared UI components
        └── App.js         # Router
```

---

## Common Issues

| Problem | Fix |
|---|---|
| `ECONNREFUSED 3306` | MySQL isn't running — start the service |
| Login fails after seed | Check that `seed.js` completed without errors |
| Frontend can't reach backend | Ensure backend is on port 5000 and `proxy` is set in `frontend/package.json` |
| `EADDRINUSE :5000` | Kill the existing node process and restart |

