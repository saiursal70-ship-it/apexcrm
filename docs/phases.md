# Project Phases & Roadmap

## 1. Overview
This document outlines the phased development lifecycle of the APEX CRM platform, moving from core system foundations to advanced automation, analytics, and enterprise scalability.

---

## 2. Phase Breakdown

```
Phase 1: Foundation & Auth (Complete)
      │
      ▼
Phase 2: Core CRM Entities & Pipelines (Complete)
      │
      ▼
Phase 3: Task Automation & Kanban Workflows (Complete)
      │
      ▼
Phase 4: Enterprise Administration & Granular RBAC (Active)
      │
      ▼
Phase 5: Advanced Analytics & AI Assistant (Upcoming)
```

---

### Phase 1: Core Foundation & Security
- [x] Initial project setup (React 18 SPA + Express.js backend).
- [x] MySQL database schema initialization (`users`, `roles`).
- [x] JWT-based stateless authentication flow (Register, Login, Token validation).
- [x] Password encryption with `bcryptjs`.
- [x] Global CSS design system and responsive navigation layout.

---

### Phase 2: CRM Entities & Sales Pipeline
- [x] Entity CRUD modules: **Leads**, **Contacts**, **Accounts**, **Deals**, **Products**, **Invoices**, **Appointments**, **Campaigns**, **Tickets**.
- [x] Dynamic filter, search, pagination, and bulk selection across entities.
- [x] Sales pipeline stages & deal value tracking.
- [x] Invoice generation, payment status tracking, and quotations support.

---

### Phase 3: Task Management & Workflow Automation
- [x] Multi-view Task Management: List View, Dynamic Kanban Board, Calendar, and Timeline views.
- [x] Automated background sweep engine for scheduled actions and SLA alerts (`TaskAutomationEngine`).
- [x] Subtask tracking, checklist progress calculation, and task activity audit logs.
- [x] Notification dispatcher for due-date triggers and status changes.

---

### Phase 4: Enterprise Administration & RBAC (Current)
- [x] Multi-user directory management with department assignments and status filters.
- [x] Granular Role-Based Access Control (Admin, Sales Manager, Sales Rep, Support Agent, Read-Only).
- [x] System settings dashboard, profile image customization, and audit history.
- [ ] Multi-tenant isolation and department-level data segregation.
- [ ] Export & import toolkits (CSV/XLSX bulk data migration).

---

### Phase 5: AI-Driven Insights & Integrations (Upcoming)
- [ ] Automated Lead Scoring and Conversion Probability via predictive analytics.
- [ ] Generative AI Email Assistant for sales outreach and client follow-ups.
- [ ] Webhook ingress integrations (Zapier, HubSpot, Mailchimp, Stripe).
- [ ] Real-time WebSocket event streaming for instant multi-user collaboration.
