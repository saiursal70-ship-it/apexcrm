# Database Schema & Data Dictionary

## 1. Overview
The CRM relies on a relational **MySQL** database (`crm_db`) utilizing the InnoDB storage engine for ACID compliance, referential integrity, and efficient row-level locking.

---

## 2. Entity-Relationship Overview

```
                      +-------------------+
                      |       USERS       |
                      +---------+---------+
                                | 1
                                |
             +------------------+------------------+
             | N                                   | N
    +--------v--------+                   +--------v--------+
    |      LEADS      |                   |      TASKS      |
    +--------+--------+                   +--------+--------+
             |                                     | 1
             | (Converts To)                       |
             v                                     | N
    +-----------------+                   +--------v--------+
    |    ACCOUNTS     |                   |    SUBTASKS     |
    +---+--------+----+                   +-----------------+
        | 1      | 1
        |        |
        | N      | N
+-------v---+  +-v-----------+
| CONTACTS  |  |    DEALS    |
+-----------+  +---+---------+
                   | 1
                   | N
               +---v---------+
               |  INVOICES   |
               +-------------+
```

---

## 3. Core Table Specifications

### `users`
Stores user credentials, role assignments, and organizational profile data.
| Field | Type | Modifiers | Description |
| :--- | :--- | :--- | :--- |
| `id` | `INT` | `PK, AUTO_INCREMENT` | Unique user identifier |
| `name` | `VARCHAR(100)` | `NOT NULL` | Full name |
| `email` | `VARCHAR(150)` | `NOT NULL, UNIQUE` | Login email address |
| `password` | `VARCHAR(255)` | `NOT NULL` | Bcrypt hashed password |
| `role` | `VARCHAR(50)` | `DEFAULT 'Admin'` | Access level (Admin, Manager, Rep) |
| `department` | `VARCHAR(100)` | `DEFAULT 'Engineering'` | Department assignment |
| `status` | `VARCHAR(30)` | `DEFAULT 'Active'` | Active / Inactive status |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Creation timestamp |

---

### `leads`
Prospects captured from marketing channels prior to qualification.
| Field | Type | Modifiers | Description |
| :--- | :--- | :--- | :--- |
| `id` | `INT` | `PK, AUTO_INCREMENT` | Primary key |
| `lead_name` | `VARCHAR(100)` | `NOT NULL` | Lead contact name |
| `company_name` | `VARCHAR(150)` | `NULL` | Prospective company |
| `email` | `VARCHAR(150)` | `NULL` | Contact email |
| `phone` | `VARCHAR(20)` | `NULL` | Phone number |
| `source` | `VARCHAR(50)` | `NULL` | Lead origin (Website, Referral, Inbound) |
| `lead_status` | `VARCHAR(50)` | `DEFAULT 'New'` | Status (New, Contacted, Qualified, Lost) |
| `assigned_to` | `VARCHAR(100)` | `NULL` | Assigned sales agent |

---

### `accounts` & `contacts`
Qualified organizations and individual people associated with accounts.
- **`accounts`**: `id`, `company_name`, `industry`, `website`, `address`, `gst_tax_id`, `company_size`, `account_owner`, `notes`.
- **`contacts`**: `id`, `contact_name`, `company_name`, `email`, `phone`, `designation`, `relationship`, `address`, `notes`.

---

### `deals`
Revenue opportunities tracked through sequential pipeline stages.
| Field | Type | Modifiers | Description |
| :--- | :--- | :--- | :--- |
| `id` | `INT` | `PK, AUTO_INCREMENT` | Deal ID |
| `deal_name` | `VARCHAR(150)` | `NOT NULL` | Title of opportunity |
| `account_name` | `VARCHAR(150)` | `NULL` | Related company account |
| `value` | `DECIMAL(12,2)` | `DEFAULT 0` | Monetary amount |
| `stage` | `VARCHAR(50)` | `DEFAULT 'New Leads'` | Pipeline stage (Proposal, Negotiation, Won, Lost) |
| `probability` | `INT` | `DEFAULT 0` | Win probability percentage (0–100) |
| `expected_close_date` | `DATE` | `NULL` | Target close date |
| `assigned_to` | `VARCHAR(100)` | `NULL` | Account executive |

---

### `tasks`, `task_subtasks` & `task_activities`
Full enterprise activity tracking with sub-item checklists and audit trails.
- **`tasks`**: `id`, `task_name`, `related_to`, `type`, `due_date`, `priority`, `status`, `assigned_to`, `estimated_hours`, `actual_hours`.
- **`task_subtasks`**: `id`, `task_id (FK)`, `title`, `is_completed`, `order_index`.
- **`task_activities`**: `id`, `task_id (FK)`, `user_name`, `action_type`, `description`, `created_at`.

---

### Supporting Entities
- **`invoices`**: Financial billing with `invoice_number`, `client_account`, `amount`, `payment_status`, `payment_mode`.
- **`quotations`**: Pre-sales price quotes and formal cost estimates.
- **`appointments`**: Scheduled meetings with date, time, participant, and status.
- **`tickets`**: Client support cases with priority, status, and resolution logs.
- **`notifications`**: User alert queue for reminders and system triggers.

---

## 4. Indexing & Optimization Strategy
1. **Unique Indices**: `users.email` is uniquely indexed for O(1) authentication lookups.
2. **Composite Filter Indices**: `(assigned_to, status)` on `tasks` and `leads` for fast dashboard queries.
3. **Foreign Key Relations**: Cascade deletes configured on subtasks and activity logs tied to parent task lifecycle.
