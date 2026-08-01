# CRM Overview — Full Stack CRM Web App
**Stack:** React (frontend) + Node.js/Express (backend) + MySQL (database)

A complete CRM system with a login/register screen, a collapsible sidebar, a header with
search/notifications/profile menu, a dashboard with live charts, and full CRUD for every
module: Leads, Contacts, Accounts, Deals/Opportunities, Tasks, Appointments,
Products/Services, Invoices, Campaigns, and Support Tickets.

```
crm-app/
├── backend/            → Node.js + Express + MySQL API (JWT auth)
│   ├── server.js
│   ├── schema.sql      → open this in MySQL Workbench
│   ├── config/db.js
│   ├── middleware/auth.js
│   ├── controllers/authController.js
│   ├── utils/crudFactory.js   → generic CRUD engine reused by every module
│   └── routes/
└── frontend/            → React app
    ├── public/
    └── src/
        ├── pages/        → Login, Register, Dashboard, EntityPage, Reports, Settings
        ├── components/   → Sidebar, Header, Layout, Icon
        ├── context/       → AuthContext (login/register/logout)
        ├── config/        → navConfig.js (sidebar items), entityConfig.js (CRUD fields)
        └── styles/        → professional CSS theme
```

---

## 1. Prerequisites

| Tool | Check version | Download |
|---|---|---|
| Node.js (v18+) | `node -v` | https://nodejs.org |
| MySQL Server | — | https://dev.mysql.com/downloads/mysql/ |
| MySQL Workbench | — | https://dev.mysql.com/downloads/workbench/ |
| VS Code | — | https://code.visualstudio.com |

---

## 2. Set up the database (MySQL Workbench)

1. Open **MySQL Workbench** and connect to your local MySQL server.
2. **File → Open SQL Script** → select `backend/schema.sql`.
3. Click **⚡ Execute** to run the whole script. This creates:
   - Database `crm_db`
   - Table `users` (for login/register)
   - Tables for every module: `leads`, `contacts`, `accounts`, `deals`, `tasks`,
     `appointments`, `products`, `invoices`, `campaigns`, `tickets`
   - Sample demo data in each table (so your dashboard isn't empty on first run)
4. Refresh the **Schemas** panel to confirm `crm_db` and all tables appear.

> Terminal alternative: `mysql -u root -p < backend/schema.sql`

---

## 3. Open the project in VS Code

1. Unzip the downloaded folder.
2. **File → Open Folder** → select `crm-app`.
3. Open a terminal: **Terminal → New Terminal**.

---

## 4. Set up and run the Backend

```bash
cd backend
npm install
```

Create your `.env` file:

```bash
# Windows (PowerShell)
copy .env.example .env

# Mac / Linux
cp .env.example .env
```

Edit `.env` with your MySQL password and a random JWT secret:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=crm_db
DB_PORT=3306
PORT=5001
JWT_SECRET=any_long_random_string_here
```

Start the backend:

```bash
npm start
```

You should see:
```
✅ MySQL connected successfully
🚀 CRM server running on http://localhost:5001
```

Test it: open `http://localhost:5001/api/health` in your browser.

---

## 5. Set up and run the Frontend

Open a **second terminal** (keep the backend running):

```bash
cd frontend
npm install
npm start
```

This opens `http://localhost:3000` automatically.

---

## 6. Using the app

1. **You'll land on the Login screen.** Since there are no user accounts yet, click
   **"Create one"** to go to Register, fill in your name/email/password (profile image
   URL is optional — a default avatar is generated automatically), and submit.
2. You're logged in and redirected to the **Dashboard** — stat cards (Total Leads, Deals,
   Open Opportunities, Clients, Revenue) and live charts (Sales Pipeline, Leads Source,
   Revenue Overview, Recent Activities, Top Deals, Upcoming Tasks), all pulled from MySQL.
3. **Sidebar** — click the arrow at the top to collapse it to icons-only, or expand it
   again. On mobile, tap the ☰ menu icon in the header to slide it open.
4. **Header** — search box, **+ Add** button (opens the add form for whichever module
   you're on), notification bell, calendar, and your **profile photo** on the right —
   click it to see your account info and the **Logout** button.
5. **Every sidebar module** (Leads, Contacts, Accounts, Deals, Tasks, Appointments,
   Products, Invoices, Campaigns, Support Tickets) is a full CRUD screen: view records in
   a table, click **+ Add New** to create one, **Edit** to update, **Delete** to remove —
   all writing directly to MySQL.
6. **Reports** — additional chart views of the same live data.
7. **Settings** — shows your logged-in account details.

---

## 7. How the CRUD system works

Instead of writing separate code for every module, this project uses a **generic CRUD
engine**:

- **Backend:** `backend/utils/crudFactory.js` creates GET/POST/PUT/DELETE routes for any
  table from a whitelist of allowed columns. `backend/routes/entityRoutes.js` registers
  one line per module (e.g. `router.use('/leads', createCrudRouter('leads', [...]))`).
- **Frontend:** `src/config/entityConfig.js` defines the form fields and table columns
  for each module. `src/pages/EntityPage.js` is one generic component that reads this
  config and renders the whole list + add/edit form for whichever module the sidebar
  link points to.

**To add a new module later:** add a table in MySQL, one line in
`entityRoutes.js`, one entry in `entityConfig.js`, and one link in
`src/config/navConfig.js`. No new page code required.

---

## 8. Common issues

| Problem | Fix |
|---|---|
| MySQL connection failed | Make sure MySQL server is running and `.env` password is correct |
| `Access denied for user 'root'` | Check `DB_PASSWORD` in `.env` |
| Frontend shows "Could not load data" | Make sure the backend terminal is still running on port 5001 |
| Logged out immediately / 401 errors | Check `JWT_SECRET` is set in `.env` and restart the backend |
| Port 5001 or 3000 in use | Close other apps using it, or change `PORT` in `.env` |

---

## 9. Optional next steps

- Add password reset / forgot password flow
- Add role-based permissions (Admin / Sales Rep / Support)
- Add file upload for profile pictures instead of a URL field
- Deploy backend (Render/Railway) and frontend (Vercel/Netlify); update the API base URL
  in `src/api/api.js` from `http://localhost:5001/api` to your deployed backend URL
