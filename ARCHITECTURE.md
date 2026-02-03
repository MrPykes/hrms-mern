# HRMS System Architecture Overview

Overview
- Single-tenant HRMS for 1–50 employees, Philippine rules and payroll.
- Monolithic repository with `server/` (Express + MongoDB) and `client/` (React + Vite + Tailwind).

Backend
- REST API built with Express.
- JWT authentication.
- Folder layout: `models/`, `routes/`, `controllers/` (where applicable), `middlewares/`, `utils/`, `cron/`.
- Key models: `User`, `Employee`, `Attendance`, `Leave`, `Payroll`, `Holiday`, `Notification`, `AuditLog`, `Expense`, `Income`.
- Role-based middleware (`middlewares/roles.js`) enforces Admin/HR/Manager/Employee/Finance permissions.

Payroll
- Bi-weekly cutoffs: 1–15 (paid on 16), 16–end (paid on 1). Payday moved to Monday when on weekend.
- `cron/payrollCron.js` runs daily at 00:05 and finalizes payroll for payday.
- `utils/payroll.js` contains payroll computation and government contribution approximations (SSS, PhilHealth, Pag-IBIG). Update tables to match current rates.

Finance
- `Expense` and `Income` modules with approval workflows for Admin/Finance.
- Reports exportable as CSV or PDF (PDF via PDFKit utilities).

Notifications & Audit
- In-app notifications persisted in `Notification` collection.
- Audit logs recorded in `AuditLog` for key actions.

Frontend
- React + Vite + Tailwind UI with pages for Login, Dashboard, Employees, Attendance, Leave, Payroll, Reports, Expenses, Income.
- Calls REST API under `/api/*`.

Deployment
- Single host (Hostinger). Serve built React app statically and run Node server.
- See DEPLOYMENT.md for step-by-step Hostinger notes.
