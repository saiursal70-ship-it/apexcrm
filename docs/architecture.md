# System Architecture Documentation

## 1. Overview
The APEX CRM Platform is an enterprise-grade Customer Relationship Management solution designed for high scalability, real-time task automation, pipeline management, and robust team collaboration.

The architecture follows a modular, decoupled **Client-Server Architecture**:
- **Frontend**: Single Page Application (SPA) powered by React 18, React Router v6, Lucide Icons, and Anime.js / Three.js for interactive visualizations.
- **Backend**: Node.js & Express.js REST API layer with modular routing, middleware-based security, and background automation engines.
- **Database**: Relational MySQL database managed with connection pooling (`mysql2/promise`) and structured schema migrations.

```
+-------------------------------------------------------------+
|                      React 18 Frontend                      |
| (Entity Views | Kanban | Admin Workspace | Reports | Auth) |
+------------------------------+------------------------------+
                               | HTTPS / REST / JSON
+------------------------------v------------------------------+
|                   Node.js / Express API                      |
|  +---------------------+  +-------------------------------+  |
|  | Auth & Security     |  | Task & Workflow Engine        |  |
|  | (JWT, RBAC, Bcrypt) |  | (Periodic Sweeps, Triggers)   |  |
|  +---------------------+  +-------------------------------+  |
|  +---------------------+  +-------------------------------+  |
|  | Entity CRUD Routers |  | Dashboard & Reporting Routers |  |
|  +---------------------+  +-------------------------------+  |
+------------------------------+------------------------------+
                               | Parameterized SQL Queries
+------------------------------v------------------------------+
|                         MySQL Database                       |
|   (Users, Leads, Accounts, Deals, Tasks, Invoices, Logs)    |
+-------------------------------------------------------------+
```

---

## 2. Technology Stack

### Frontend
| Component | Technology | Version / Tooling |
| :--- | :--- | :--- |
| **Framework** | React.js | 18.3.1 |
| **Routing** | React Router DOM | 6.24.0 |
| **Data Fetching** | Axios | 1.7.2 |
| **Charts & Visuals** | Recharts, Three.js, Anime.js | Recharts 2.12+, Three 0.185+ |
| **Styling** | Vanilla CSS3 Design System | Flexbox, CSS Grid, Custom Design Tokens |

### Backend
| Component | Technology | Version / Tooling |
| :--- | :--- | :--- |
| **Runtime** | Node.js | >= 18.x |
| **Framework** | Express.js | 4.19.2 |
| **Database Driver** | `mysql2` | 3.11.0 (Connection Pooling & Promises) |
| **Authentication** | `jsonwebtoken`, `bcryptjs` | JWT 9.0+, Bcrypt 2.4+ |
| **Configuration** | `dotenv` | Environment Variable Isolation |

### Database & Storage
| Layer | Specification | Details |
| :--- | :--- | :--- |
| **RDBMS** | MySQL 8.0+ / MariaDB | InnoDB engine, UTF8mb4 encoding |
| **Connection Pooling** | `mysql2/promise` Pool | Max 10–25 connections, automatic reconnection |

---

## 3. Directory Layout

```
crm-app/
├── backend/
│   ├── config/             # DB Connection pool & environment configs
│   ├── controllers/        # Business logic handlers
│   ├── middleware/         # Auth, RBAC, validation & error middlewares
│   ├── routes/             # REST route declarations (Auth, Tasks, Leads, etc.)
│   ├── utils/              # Automation engines, cron utilities, helpers
│   ├── schema.sql          # Base database DDL definitions
│   └── server.js           # Server bootstrap & process lifecycle
├── frontend/
│   ├── public/             # Static HTML, favicons, manifests
│   └── src/
│       ├── api/            # Centralized API service clients
│       ├── components/     # Reusable UI components (Modals, Dispatchers, Tables)
│       ├── context/        # React Context providers (Auth, Theme, Notifications)
│       ├── pages/          # Full page views (Dashboard, EntityPage, AdminWorkspace)
│       ├── styles/         # Global & component stylesheet modular tokens
│       └── utils/          # Formatting, validation & export helpers
└── docs/                   # System documentation & technical specifications
```

---

## 4. Key Architectural Patterns

1. **Decoupled REST API**: All frontend interactions communicate through stateless HTTP endpoints using standard RESTful verbs (`GET`, `POST`, `PUT`, `DELETE`).
2. **Background Automation Sweep Pattern**: The backend includes an active `TaskAutomationEngine` that runs non-blocking recurring sweeps (default: 60s intervals) to evaluate overdue tasks, trigger workflow alerts, and escalate critical SLA deals.
3. **Optimistic & Synchronous UI State**: Frontend utilizes React state management with real-time feedback loops and toast notifications for user actions.
4. **Connection Pool Abstraction**: MySQL queries utilize promise-based connection pools with automatic connection release to prevent socket exhaustion.
