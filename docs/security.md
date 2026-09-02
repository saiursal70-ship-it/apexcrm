# Security & Compliance Architecture

## 1. Overview
This document specifies the security controls, authentication mechanisms, data protection standards, and vulnerability mitigation practices implemented in the CRM platform.

---

## 2. Authentication & Session Management

### JSON Web Tokens (JWT)
- **Token Format**: Standard RFC 7519 signed JWTs using `HMAC-SHA256`.
- **Payload**: Contains non-sensitive identity metadata (`id`, `email`, `role`, `department`).
- **Expiration**: Short-lived access tokens with secure authorization header transmission (`Bearer <token>`).
- **Secret Management**: Stored strictly via environment variable (`JWT_SECRET`) in `.env` and never committed to source control.

### Password Hashing
- **Algorithm**: `bcryptjs` with salt rounds set to `10`.
- **Protection**: Passwords are never stored in plaintext or logged in server telemetry.

---

## 3. Role-Based Access Control (RBAC)

The system enforces multi-tiered authorization via Express middleware:

| Role | Permissions |
| :--- | :--- |
| **Super Admin / Admin** | Full access to all entities, user management, system settings, migrations, and audit logs. |
| **Sales Manager** | Read/Write access across all Leads, Deals, Tasks, Reports, and Team assignments. |
| **Sales Representative** | Access restricted to assigned Leads, Deals, Contacts, and personal Tasks. |
| **Support Agent** | Read/Write access to Tickets, Contacts, and Task queues; read-only access to Deals. |
| **Read Only** | View-only permissions across reporting and assigned dashboard items. |

---

## 4. Threat Mitigation & Defense-in-Depth

### A. SQL Injection (SQLi) Defense
All database interactions in the backend utilize parameterized queries via `mysql2/promise`:
```javascript
// ✅ Secure parameterized query
const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

// ❌ Never allowed
// const [rows] = await db.query(`SELECT * FROM users WHERE email = '${email}'`);
```

### B. Cross-Origin Resource Sharing (CORS)
- Explicit CORS origin whitelisting configured in `server.js` using `cors()`.
- API rejects unauthorized cross-domain requests.

### C. Cross-Site Scripting (XSS) & Input Sanitization
- React's JSX engine automatically escapes values rendered to the DOM.
- Form inputs validate required data types and length constraints before backend dispatch.

---

## 5. Security Checklist for Deployments

- [ ] Ensure `.env` is listed in `.gitignore` and never pushed to remote repositories.
- [ ] Enforce HTTPS / TLS 1.3 on all production web server configurations (e.g., Nginx reverse proxy).
- [ ] Rotate database credentials and `JWT_SECRET` periodically.
- [ ] Configure rate-limiting middleware (`express-rate-limit`) on public authentication endpoints (`/api/auth/login`, `/api/auth/register`).
