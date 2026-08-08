-- MySQL Database Indexing & Performance Optimizations Script
-- Run this script in MySQL Workbench or terminal (`mysql -u root -p crm_db < schema_optimizations.sql`)

USE crm_db;

-- 1. Indexing Leads table
ALTER TABLE `leads` ADD INDEX `idx_leads_status` (`status`);
ALTER TABLE `leads` ADD INDEX `idx_leads_email` (`email`);
ALTER TABLE `leads` ADD INDEX `idx_leads_created_at` (`created_at`);

-- 2. Indexing Contacts table
ALTER TABLE `contacts` ADD INDEX `idx_contacts_account` (`account_id`);
ALTER TABLE `contacts` ADD INDEX `idx_contacts_email` (`email`);

-- 3. Indexing Accounts table
ALTER TABLE `accounts` ADD INDEX `idx_accounts_industry` (`industry`);

-- 4. Indexing Deals table
ALTER TABLE `deals` ADD INDEX `idx_deals_stage` (`stage`);
ALTER TABLE `deals` ADD INDEX `idx_deals_account` (`account_id`);
ALTER TABLE `deals` ADD INDEX `idx_deals_created_at` (`created_at`);

-- 5. Indexing Tasks table
ALTER TABLE `tasks` ADD INDEX `idx_tasks_status` (`status`);
ALTER TABLE `tasks` ADD INDEX `idx_tasks_due_date` (`due_date`);

-- 6. Indexing Invoices table
ALTER TABLE `invoices` ADD INDEX `idx_invoices_status` (`status`);
ALTER TABLE `invoices` ADD INDEX `idx_invoices_created_at` (`created_at`);

-- 7. Indexing Support Tickets table
ALTER TABLE `tickets` ADD INDEX `idx_tickets_status` (`status`);
ALTER TABLE `tickets` ADD INDEX `idx_tickets_priority` (`priority`);
