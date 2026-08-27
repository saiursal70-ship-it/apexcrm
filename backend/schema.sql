-- ================================================================
-- CRM Web App - Full Database Schema
-- Open this in MySQL Workbench (File > Open SQL Script) and Execute
-- ================================================================

CREATE DATABASE IF NOT EXISTS crm_db;
USE crm_db;



-- ---------------- USERS (Login/Register) ----------------
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    profile_image VARCHAR(500) DEFAULT 'https://ui-avatars.com/api/?name=Admin+User&background=2563eb&color=fff',
    role VARCHAR(50) DEFAULT 'Admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------- LEADS ----------------
CREATE TABLE IF NOT EXISTS leads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lead_name VARCHAR(100) NOT NULL,
    company_name VARCHAR(150),
    email VARCHAR(150),
    phone VARCHAR(20),
    source VARCHAR(50),
    interested_in VARCHAR(150),
    lead_status VARCHAR(50) DEFAULT 'New',
    assigned_to VARCHAR(100),
    created_date DATE DEFAULT (CURRENT_DATE),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------- CONTACTS ----------------
CREATE TABLE IF NOT EXISTS contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    contact_name VARCHAR(100) NOT NULL,
    company_name VARCHAR(150),
    email VARCHAR(150),
    phone VARCHAR(20),
    designation VARCHAR(100),
    relationship VARCHAR(50),
    address VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------- ACCOUNTS / COMPANIES ----------------
CREATE TABLE IF NOT EXISTS accounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_name VARCHAR(150) NOT NULL,
    industry VARCHAR(100),
    website VARCHAR(150),
    address VARCHAR(255),
    gst_tax_id VARCHAR(50),
    company_size VARCHAR(50),
    account_owner VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------- DEALS / OPPORTUNITIES ----------------
CREATE TABLE IF NOT EXISTS deals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    deal_name VARCHAR(150) NOT NULL,
    account_name VARCHAR(150),
    value DECIMAL(12,2) DEFAULT 0,
    stage VARCHAR(50) DEFAULT 'New Leads',
    probability INT DEFAULT 0,
    expected_close_date DATE,
    source VARCHAR(50),
    assigned_to VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------- TASKS / ACTIVITIES ----------------
CREATE TABLE IF NOT EXISTS tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    task_name VARCHAR(150) NOT NULL,
    related_to VARCHAR(150),
    type VARCHAR(50) DEFAULT 'Call',
    due_date DATE,
    priority VARCHAR(20) DEFAULT 'Medium',
    status VARCHAR(30) DEFAULT 'Pending',
    assigned_to VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------- APPOINTMENTS ----------------
CREATE TABLE IF NOT EXISTS appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    with_person VARCHAR(100),
    appointment_date DATE,
    appointment_time VARCHAR(20),
    location VARCHAR(150),
    status VARCHAR(30) DEFAULT 'Scheduled',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------- PRODUCTS / SERVICES ----------------
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR(150) NOT NULL,
    category VARCHAR(100),
    description TEXT,
    price DECIMAL(10,2) DEFAULT 0,
    unit VARCHAR(30),
    tax DECIMAL(5,2) DEFAULT 0,
    status VARCHAR(30) DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------- INVOICES & PAYMENTS ----------------
CREATE TABLE IF NOT EXISTS invoices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_number VARCHAR(50) NOT NULL,
    client_account VARCHAR(150),
    invoice_date DATE,
    due_date DATE,
    amount DECIMAL(12,2) DEFAULT 0,
    payment_status VARCHAR(30) DEFAULT 'Pending',
    payment_mode VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------- CAMPAIGNS ----------------
CREATE TABLE IF NOT EXISTS campaigns (
    id INT AUTO_INCREMENT PRIMARY KEY,
    campaign_name VARCHAR(150) NOT NULL,
    type VARCHAR(50),
    start_date DATE,
    end_date DATE,
    budget DECIMAL(12,2) DEFAULT 0,
    status VARCHAR(30) DEFAULT 'Planned',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------- SUPPORT TICKETS ----------------
CREATE TABLE IF NOT EXISTS tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subject VARCHAR(150) NOT NULL,
    client_name VARCHAR(100),
    priority VARCHAR(20) DEFAULT 'Medium',
    status VARCHAR(30) DEFAULT 'Open',
    assigned_to VARCHAR(100),
    created_date DATE DEFAULT (CURRENT_DATE),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================== SAMPLE DATA ==================

INSERT INTO leads (lead_name, company_name, email, phone, source, interested_in, lead_status, assigned_to) VALUES
('Bharat Sharma', 'Bharat Industries', 'bharat@bharatind.com', '9876500001', 'Website', 'CRM Software', 'Contacted', 'Admin User'),
('Prakash Rao', 'Prakash Ltd.', 'prakash@prakashltd.com', '9876500002', 'Referral', 'ERP Software', 'New', 'Admin User'),
('Sunrise Team', 'Sunrise Co.', 'contact@sunrise.com', '9876500003', 'Social Media', 'Web Development', 'Qualified', 'Admin User');

INSERT INTO contacts (contact_name, company_name, email, phone, designation, relationship, address) VALUES
('Ramesh Gupta', 'ABC Corp', 'ramesh@abccorp.com', '9876500011', 'CTO', 'Client', 'Mumbai, India'),
('Neha Singh', 'Techno Pvt Ltd', 'neha@techno.com', '9876500012', 'HR Manager', 'Client', 'Delhi, India');

INSERT INTO accounts (company_name, industry, website, address, gst_tax_id, company_size, account_owner) VALUES
('ABC Corporation', 'Manufacturing', 'www.abccorp.com', 'Mumbai, India', 'GST123456', '200-500', 'Admin User'),
('Techno Pvt Ltd', 'IT Services', 'www.techno.com', 'Delhi, India', 'GST654321', '50-200', 'Admin User');

INSERT INTO deals (deal_name, account_name, value, stage, probability, expected_close_date, source, assigned_to) VALUES
('ABC Corp - CRM Deal', 'ABC Corporation', 850000, 'Negotiation', 70, '2026-08-15', 'Website', 'Admin User'),
('Bharat Industries - ERP', 'Bharat Industries', 620000, 'Proposal Sent', 50, '2026-08-20', 'Referral', 'Admin User'),
('Sunrise Co. - Website', 'Sunrise Co.', 410000, 'Qualified', 40, '2026-09-01', 'Social Media', 'Admin User'),
('Techno Pvt Ltd - Support', 'Techno Pvt Ltd', 380000, 'Closed Won', 100, '2026-07-10', 'Email Campaign', 'Admin User'),
('Prakash Ltd - Consulting', 'Prakash Ltd.', 290000, 'Contacted', 20, '2026-09-10', 'Walk-in', 'Admin User');

INSERT INTO tasks (task_name, related_to, type, due_date, priority, status, assigned_to) VALUES
('Follow up with ABC Corp', 'ABC Corporation', 'Call', '2026-07-25', 'High', 'Pending', 'Admin User'),
('Send proposal to Bharat Industries', 'Bharat Industries', 'Email', '2026-07-26', 'High', 'Pending', 'Admin User'),
('Call Prakash Ltd.', 'Prakash Ltd.', 'Call', '2026-07-29', 'Medium', 'Pending', 'Admin User');

INSERT INTO products (product_name, category, description, price, unit, tax, status) VALUES
('CRM Software License', 'Software', 'Annual CRM license per user', 15000, 'Per User', 18, 'Active'),
('Website Development', 'Service', 'Custom business website', 45000, 'Project', 18, 'Active');

INSERT INTO invoices (invoice_number, client_account, invoice_date, due_date, amount, payment_status, payment_mode) VALUES
('INV-1001', 'ABC Corporation', '2026-07-01', '2026-07-15', 850000, 'Paid', 'Bank Transfer'),
('INV-1002', 'Techno Pvt Ltd', '2026-07-05', '2026-07-20', 380000, 'Pending', 'Cheque');

INSERT INTO campaigns (campaign_name, type, start_date, end_date, budget, status) VALUES
('Monsoon Offer 2026', 'Email', '2026-07-01', '2026-07-31', 50000, 'Active');

-- ---------------- QUOTATIONS / ESTIMATIONS ----------------
CREATE TABLE IF NOT EXISTS quotations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    quotation_number VARCHAR(50) NOT NULL,
    client_name VARCHAR(150) NOT NULL,
    project_title VARCHAR(200),
    email VARCHAR(150),
    phone VARCHAR(20),
    total_amount DECIMAL(12,2) DEFAULT 0,
    quotation_date DATE,
    valid_until DATE,
    status VARCHAR(30) DEFAULT 'Draft',
    terms TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO quotations (quotation_number, client_name, project_title, email, phone, total_amount, quotation_date, valid_until, status, terms) VALUES
('QT-1001', 'Bharat Industries', 'Enterprise CRM & Automation Suite', 'bharat@bharatind.com', '9876500001', 650000, '2026-08-01', '2026-08-15', 'Sent', '50% Advance, 50% on project delivery.'),
('QT-1002', 'Prakash Ltd.', 'Cloud Infrastructure Migration', 'prakash@prakashltd.com', '9876500002', 420000, '2026-08-02', '2026-08-17', 'Draft', 'GST (18%) extra as applicable.');

-- ---------------- AGILE SPRINT TASKS (ADMIN WORKSPACE) ----------------
CREATE TABLE IF NOT EXISTS sprint_tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    task_key VARCHAR(30) NOT NULL,
    title TEXT NOT NULL,
    epic VARCHAR(100) DEFAULT 'General',
    task_type VARCHAR(30) DEFAULT 'story',
    points INT DEFAULT 1,
    subtask_count INT DEFAULT 0,
    priority VARCHAR(20) DEFAULT 'Medium',
    status VARCHAR(30) DEFAULT 'TO DO',
    assignee_name VARCHAR(100) DEFAULT 'Admin User',
    assignee_avatar VARCHAR(255) DEFAULT '',
    project_name VARCHAR(100) DEFAULT 'Beyond Gravity',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO sprint_tasks (task_key, title, epic, task_type, points, subtask_count, priority, status, assignee_name, assignee_avatar, project_name) VALUES
('NUC-205', 'Implement feedback collector', 'Feedback', 'story', 9, 0, 'Low', 'TO DO', 'Sarah Jenkins', 'https://i.pravatar.cc/150?u=sarah', 'Beyond Gravity'),
('NUC-206', 'Bump version for new API for billing', 'Billing', 'bug', 3, 0, 'Medium', 'TO DO', 'Alex Dev', 'https://i.pravatar.cc/150?u=alex', 'Beyond Gravity'),
('NUC-208', 'Add NPS feedback to wallboard', 'Feedback', 'task', 1, 0, 'Low', 'TO DO', 'Elena Rostova', 'https://i.pravatar.cc/150?u=elena', 'Beyond Gravity'),
('NUC-213', 'Update T&C copy with v1.9 from the writers guild in all products that have cross country compliance', 'Legal & Compliance', 'bug', 0, 1, 'High', 'IN PROGRESS', 'Sarah Jenkins', 'https://i.pravatar.cc/150?u=sarah', 'Beyond Gravity'),
('NUC-215', 'Tech spike on new stripe integration with paypal', 'Integrations', 'task', 3, 0, 'High', 'IN PROGRESS', 'Michael Vance', 'https://i.pravatar.cc/150?u=michael', 'Beyond Gravity'),
('NUC-216', 'Refactor stripe verification key validator to a single call to avoid timing out on slow connections', 'Integrations', 'story', 3, 0, 'High', 'IN PROGRESS', 'Claire Redfield', 'https://i.pravatar.cc/150?u=claire', 'Beyond Gravity'),
('NUC-217', 'Change phone number field type to ''phone''', 'Core UI', 'task', 0, 1, 'Low', 'IN PROGRESS', 'David Miller', 'https://i.pravatar.cc/150?u=david', 'Beyond Gravity'),
('NUC-338', 'Multi-dest search UI web', 'Search Engine', 'story', 5, 0, 'High', 'IN REVIEW', 'Claire Redfield', 'https://i.pravatar.cc/150?u=claire', 'Beyond Gravity'),
('NUC-336', 'Quick booking for accomodations - web', 'Booking Engine', 'story', 0, 4, 'Low', 'DONE', 'Michael Vance', 'https://i.pravatar.cc/150?u=michael', 'Beyond Gravity'),
('NUC-346', 'Adapt web app no new payments provider', 'Payment Gateway', 'bug', 0, 3, 'Low', 'DONE', 'Sarah Jenkins', 'https://i.pravatar.cc/150?u=sarah', 'Beyond Gravity'),
('NUC-343', 'Fluid booking on tablets', 'Mobile & Tablet', 'story', 5, 0, 'Medium', 'DONE', 'Michael Vance', 'https://i.pravatar.cc/150?u=michael', 'Beyond Gravity'),
('NUC-354', 'Shoping cart purchasing error - quick fix required.', 'Checkout System', 'bug', 1, 0, 'High', 'DONE', 'Elena Rostova', 'https://i.pravatar.cc/150?u=elena', 'Beyond Gravity');

-- ---------------- WORKSPACES & WORKSPACE TYPES ----------------
CREATE TABLE IF NOT EXISTS workspaces (
    id INT AUTO_INCREMENT PRIMARY KEY,
    workspace_name VARCHAR(150) NOT NULL,
    workspace_code VARCHAR(50) NOT NULL,
    container_type VARCHAR(100) DEFAULT 'Dev',
    description TEXT,
    status VARCHAR(30) DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL
);

INSERT INTO workspaces (workspace_name, workspace_code, container_type, description) VALUES
('Development', 'DEV-WEB', 'Dev', 'Default engineering & development workspace hub');

CREATE TABLE IF NOT EXISTS workspace_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type_name VARCHAR(100) NOT NULL,
    type_code VARCHAR(50) NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL
);

INSERT INTO workspace_types (type_name, type_code, description) VALUES
('Development', 'Dev', 'Engineering, software dev and devops containers'),
('Internal Department', 'Dept', 'Company internal divisions and operational departments'),
('Client Organization', 'Client', 'External client dedicated workspaces'),
('Project Group', 'Proj', 'Multi-disciplinary project workspaces'),
('Support Unit', 'Supp', 'Customer success and ticketing operations'),
('Sales & Marketing', 'Sales', 'Lead generation and sales pipeline operations');



