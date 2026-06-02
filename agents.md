# SJBIT Placement Portal — Project Knowledge

## Overview

A full-stack web application for managing student placement data at SJBIT (SJB Institute of Technology). Students fill in their profile information across multiple sections, and placement coordinators/admins review and approve each section before the data is considered complete.

- **Frontend**: React (Vite) — `frontend/`
- **Backend**: Node.js + Express — `NEW-BACKEND/`
- **Database**: PostgreSQL (pg pool)
- **Brand**: SJBIT (`sjbit.edu.in`)
- **Production domain**: `placementsmadeeasy.xyz`
- **AWS region**: `ap-south-1` (RDS instance at `college-hrd-prod-db-instance-1.c524c6omym6x.ap-south-1.rds.amazonaws.com`)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, React Router v6, Axios |
| Backend | Node.js (ESM), Express |
| Auth | JWT (access token 15m, refresh token 7d), bcryptjs |
| Database | PostgreSQL via `pg` pool |
| Validation | Custom middleware (`inputValidator.js`) |

---

## Repository Layout

```
NEW-SJBIT/
├── NEW-BACKEND/
│   ├── src/
│   │   ├── config/db.js              # pg Pool setup (env vars)
│   │   ├── controllers/
│   │   │   ├── authController.js     # register, verifyOtp, login, logout, refresh, forgotPassword, resetPassword
│   │   │   ├── studentController.js  # all student profile GET/POST endpoints
│   │   │   ├── adminController.js    # admin/staff management endpoints
│   │   │   └── userController.js     # generic CRUD (legacy)
│   │   ├── routes/
│   │   │   ├── authRoutes.js         # /auth/*
│   │   │   ├── studentRoutes.js      # /student/* (all require authMiddleware)
│   │   │   ├── adminRoutes.js        # /admin/* (role-gated per endpoint)
│   │   │   └── userRoutes.js         # /user/* (generic)
│   │   ├── middlewares/
│   │   │   ├── authMiddleware.js     # Bearer JWT → req.user
│   │   │   ├── inputValidator.js     # express-validator rules
│   │   │   └── errorHandler.js       # centralised error responses
│   │   └── data/createUserTable.js   # DB bootstrap + seed (run once on startup)
│   └── .env                          # PORT=5001, DB_*, JWT_*, brand vars
└── frontend/
    ├── src/
    │   ├── api/apiClient.js          # Axios instance with auto token refresh
    │   ├── context/AuthContext.jsx   # Auth state (user, login, logout)
    │   ├── config/
    │   │   ├── roles.js              # ROLES, ROLE_GROUPS, ROLE_COLORS
    │   │   ├── enums.json            # All dropdown enum options
    │   │   └── pagination.json       # Default page size
    │   ├── components/
    │   │   ├── routing/              # ProtectedRoute, GuestRoute, RoleRoute
    │   │   └── ui/                   # DynamicForm, SearchBar, StatusBanner, StudentProfileModal
    │   ├── pages/
    │   │   ├── auth/                 # Login, Register, ForgotPassword
    │   │   ├── Dashboard.jsx         # Role-aware router → AdminDashboard or StudentDashboard
    │   │   └── roles/
    │   │       ├── student/          # StudentDashboard, Sidebar, SubTabNav, DashboardHeader
    │   │       └── admin/            # AdminDashboard, AdminSidebar, UsersTable, Approvals
    │   └── pages/roles/student/config/dashboardConfig.json  # Tab/subtab definitions
    └── .env                          # VITE_API_BASE_URL, VITE_BRAND_*
```

---

## Database Schema

### Enums

| Enum | Values |
|------|--------|
| `user_role` | STUDENT, SPC, FPC, ADMIN, PARENT, SUPER_USER |
| `status_type` | INCOMPLETE, PENDING, APPROVED, REJECTED |
| `department_branch` | CSE, ISE, ECE, EEE, MECH, CIVIL, CSE_DS, MCA, MBA |
| `pursuing_degree` | BE, MTECH, MBA, MCA |
| `gender` | MALE, FEMALE, OTHERS |
| `edu_level` | UG, PG |
| `admission_mode` | CET, COMED-K, PGCET, DIPLOMA_CET, MANAGEMENT, OTHERS |
| `document_type` | RESUME, MARKS_CARD_10TH, MARKS_CARD_12TH, UG_MARKS_CARD_ALL_SEM, PG_MARKS_CARD_ALL_SEM, PAN_CARD, AADHAAR_CARD, PASSPORT_SIZE_PHOTO, COLLEGE_ID_CARD |

### Tables

**`users`** — core auth + status tracking
- `id` UUID PK, `email` UNIQUE, `email_verified`, `password_hash`, `role`, `is_active`
- `sub_tab_statuses` JSONB — maps subtab key → status_type (INCOMPLETE/PENDING/APPROVED/REJECTED)
- `sub_tab_remarks` JSONB — maps subtab key → rejection remark text
- `sub_tab_verified_by` JSONB — maps subtab key → approver user_id

**`refresh_tokens`** — rotated on each use; deleted on logout

**`student_profiles`** — rigid core fields + flexible JSONB
- Rigid: `usn`, `full_name`, `first_name`, `middle_name`, `last_name`, `department`, `pursuing_degree`, `mobile_number`, `whatsapp_number`, `gender`, `dob`, `mentor_id`, `ug_pg`
- JSONB: `personal_info` (family details, address), `official_info` (PAN, Aadhaar)

**`non_student_profiles`** — for FPC/SPC/Admin accounts
- `department_branches department_branch[]` — which branches the FPC can see

**`student_academics`**
- SSLC/PUC scores + metadata, admission mode, competitive ranking
- Current CGPA, SGPAs (JSONB array), gap year info, backlog counts
- UG percentage, PG specialization (for PG students)

**`student_documents`**
- `documents` JSONB — maps doc key (e.g. `resume`, `pan_card`) → URL string

**`student_offers`**
- Per-company offer records: `company_name`, `salary_lpa`, `offer_letter_url`, `is_accepted`

**`email_otps`**
- Unified OTP table for `registration` and `password_reset` purposes; unique on `(email, purpose)`

### Seeded accounts (on first run)
- `admin@sjbit.edu.in` / role `ADMIN`
- `superuser@sjbit.edu.in` / role `SUPER_USER`
- Passwords set via `DEFAULT_ADMIN_PASSWORD` / `DEFAULT_SUPER_USER_PASSWORD` env vars

---

## Authentication Flow

1. **Register** — POST `/auth/register`: creates unverified user, stores OTP in `email_otps` (currently hardcoded `123456`)
2. **Verify OTP** — POST `/auth/verify-otp`: marks `email_verified = true`, deletes OTP record
3. **Login** — POST `/auth/login`: returns `accessToken` (15m) + `refreshToken` (7d), saves refresh token to DB
4. **Refresh** — POST `/auth/refresh`: rotates refresh token in DB, returns new pair
5. **Logout** — POST `/auth/logout`: deletes refresh token from DB
6. **Forgot Password** — POST `/auth/forgot-password`: stores OTP with purpose `password_reset` (generic response to avoid email enumeration)
7. **Reset Password** — POST `/auth/reset-password`: validates OTP, updates password hash, deletes OTP

`authMiddleware.js` — extracts Bearer token, verifies JWT, fetches live user from DB, checks `is_active`, attaches to `req.user`.

Tokens stored client-side in `localStorage` (`accessToken`, `refreshToken`, `user`). `apiClient.js` auto-retries once on 401 using the refresh token before redirecting to `/login`.

---

## Role System

| Role | Description |
|------|-------------|
| `SUPER_USER` | Full access, can manage all roles including ADMIN |
| `ADMIN` | Manage users, roles, FPCs; approve/reject all departments |
| `FPC` | Faculty Placement Coordinator — scoped to assigned `department_branches[]` |
| `SPC` | Student Placement Coordinator — scoped to their own department |
| `STUDENT` | Fills own profile; submits subtabs for approval |
| `PARENT` | Defined in roles, not yet used in routing |

**`ROLE_GROUPS`** in `roles.js`:
- `ADMIN`: [ADMIN, SUPER_USER, FPC] — see admin dashboard
- `STAFF`: [SPC]
- `STUDENT`: [STUDENT]

Dashboard routing in `Dashboard.jsx`: `ROLE_GROUPS.ADMIN` → `AdminDashboard`, otherwise → `StudentDashboard`.

---

## Student Profile — Tabs & Subtabs

Defined data-driven in `dashboardConfig.json`. Each subtab has `fetchEndpoint`, `saveEndpoint`, and a `fields` array used by `DynamicForm`.

### Personal Tab
- **core_info** — USN, names, department, degree, contacts, gender, DOB, edu level, mentor
- **personal_info** — Father/mother details, addresses, native place, state, PIN
- **official_info** — PAN number, Aadhaar number

### Academics Tab
- **schooling** — SSLC %, PUC %, boards, year of passing, admission mode, competitive ranking
- **current_scores** — CGPA, SGPA per semester (1–8), backlogs, gap year info
- **previous_edu** — only shown if `ug_pg = 'PG'`; UG %, PG specialization, UG university

### Documents Tab (vertical orientation)
- resume, marks_card_10th, marks_card_12th, ug_marks_card, pg_marks_card, pan_card, aadhaar_card, passport_photo, college_id
- Documents are stored as URLs (Google Drive / OneDrive shareable links)

**`dependsOn`** — `previous_edu` subtab only renders if `core_info.ug_pg === 'PG'`

---

## API Routes

### `/auth`
| Method | Path | Description |
|--------|------|-------------|
| POST | `/register` | Register (sends OTP) |
| POST | `/verify-otp` | Verify OTP, activate account |
| POST | `/login` | Login, get tokens |
| POST | `/logout` | Invalidate refresh token |
| POST | `/refresh` | Rotate tokens |
| POST | `/forgot-password` | Request password reset OTP |
| POST | `/reset-password` | Reset password with OTP |

### `/student` (all require auth)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/statuses` | Get all subtab statuses for logged-in student |
| GET/POST | `/core-info` | Core profile fields |
| GET/POST | `/personal-info` | Family/address info |
| GET/POST | `/official-info` | PAN, Aadhaar |
| GET/POST | `/academics/schooling` | SSLC/PUC academics |
| GET/POST | `/academics/current-scores` | CGPA, SGPAs, backlogs |
| GET/POST | `/academics/previous-edu` | UG/PG history (PG students) |
| GET/POST | `/document/:docKey` | Document URL by key |

### `/admin` (require auth + role check)
| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/search` | ADMIN, SUPER_USER, FPC, SPC | Search students by name/USN |
| GET | `/users` | ADMIN, SUPER_USER, FPC | List users by role (paginated) |
| GET | `/pending-approvals` | ADMIN, SUPER_USER, FPC, SPC | Students with PENDING subtabs |
| GET | `/student-data/:userId/:subtabKey` | Staff+ | Get subtab data for review |
| POST | `/approve/:userId/:subtabKey` | Staff+ | Mark subtab APPROVED |
| POST | `/reject/:userId/:subtabKey` | Staff+ | Mark subtab REJECTED with remarks |
| PATCH | `/users/:id/role` | ADMIN, SUPER_USER | Change user role |
| PATCH | `/users/:id/fpc-departments` | ADMIN, SUPER_USER | Update FPC's department list |
| POST | `/users/bulk-fpcs` | ADMIN, SUPER_USER | Bulk create FPC accounts |
| DELETE | `/users/:id` | ADMIN, SUPER_USER | Delete user |

---

## Approval Workflow

1. Student fills a subtab form and saves → `sub_tab_statuses[subtabKey]` is set to `PENDING`
2. FPC/SPC/Admin sees the student in the **Pending Approvals** list
3. Reviewer opens the `StudentProfileModal`, views the data, and clicks Approve or Reject
4. On approve → `sub_tab_statuses[subtabKey] = 'APPROVED'`, `sub_tab_verified_by[subtabKey] = approverId`
5. On reject → same plus `sub_tab_remarks[subtabKey] = remarks`
6. Offer subtabs (`offer_*` keys) are filtered out of the pending-approvals list — they follow a separate FPC-managed flow

**Scoping rules:**
- FPC only sees students whose `sp.department` is in the FPC's `department_branches[]`
- SPC only sees students whose `sp.department` matches the SPC's own department

---

## Frontend Architecture

### Routing
- `/` → redirect to `/login`
- Guest routes (only if NOT logged in): `/login`, `/register`, `/forgot-password`
- Protected route (only if logged in): `/dashboard`

### Auth Context (`AuthContext.jsx`)
- Stores `user` object (`id`, `email`, `role`) in state and `localStorage`
- Provides `login(userData, tokens)` and `logout()` helpers

### API Client (`apiClient.js`)
- Axios instance with `baseURL = VITE_API_BASE_URL`
- Request interceptor: injects `Authorization: Bearer <accessToken>` from `localStorage`
- Response interceptor: on 401, attempts one silent refresh token rotation; on failure, clears storage and redirects to `/login`

### DynamicForm (`components/ui/DynamicForm.jsx`)
- Data-driven form renderer — reads `fields[]` from `dashboardConfig.json`
- Field types: `text`, `tel`, `date`, `number`, `select`, `textarea`, `url`
- Select fields reference `enums.json` via `enumKey` or inline `options`
- Supports dot-notation field names (e.g. `sgpas.0`, `sslc_meta.year_of_passing`) for JSONB path writes

---

## Environment Variables

### Backend (`NEW-BACKEND/.env`)
```
PORT=5001
DB_USER, DB_HOST, DB_NAME, DB_PORT, DB_PASSWORD
DEFAULT_ADMIN_PASSWORD, DEFAULT_SUPER_USER_PASSWORD
JWT_SECRET, JWT_REFRESH_SECRET
BRAND_NAME=SJBIT
BRAND_DOMAIN=sjbit.edu.in
```

### Frontend (`frontend/.env`)
```
VITE_API_BASE_URL=http://localhost:5001/api
VITE_BRAND_NAME=SJBIT
VITE_BRAND_DOMAIN=sjbit.edu.in
```

---

## Known Conventions & Patterns

- Backend uses ES Modules (`import/export`), not CommonJS
- All admin controller responses go through `handleResponse(res, status, message, data)` helper
- OTPs are hardcoded to `123456` (email sending not yet implemented)
- FPC bulk-create sets default password `Password123!`
- `sub_tab_statuses` JSONB in `users` table is the single source of truth for approval state — no separate approval table
- Document URLs are stored as plain strings inside a single `documents` JSONB column per student
- Offer subtabs use the key pattern `offer_<uuid>` and are excluded from the standard approval flow
- DB bootstrap (`createUserTable.js`) is idempotent — safe to run on every server start
- FPC sees `ADMIN`/`SUPER_USER`/`FPC` user list restricted (403) to prevent privilege escalation
