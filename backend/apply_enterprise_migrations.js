const db = require('./config/db');

async function runEnterpriseMigrations() {
    console.log('🚀 Starting Enterprise Database Optimizations & Migrations...');

    const tables = [
        'leads', 'contacts', 'accounts', 'deals', 'tasks',
        'appointments', 'products', 'invoices', 'campaigns',
        'tickets', 'quotations', 'sprint_tasks', 'workspaces', 'workspace_types'
    ];

    try {
        // 1. Add soft delete column `deleted_at` to each table
        for (const table of tables) {
            try {
                const [cols] = await db.query(`SHOW COLUMNS FROM \`${table}\` LIKE 'deleted_at'`);
                if (cols.length === 0) {
                    await db.query(`ALTER TABLE \`${table}\` ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL`);
                    console.log(`✅ Added 'deleted_at' column to table: ${table}`);
                } else {
                    console.log(`ℹ️ Column 'deleted_at' already exists on: ${table}`);
                }
            } catch (err) {
                console.warn(`⚠️ Warning for table ${table}:`, err.message);
            }
        }

        // 2. Create Audit Trail Logs table
        await db.query(`
            CREATE TABLE IF NOT EXISTS audit_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NULL,
                user_email VARCHAR(150) NULL,
                action VARCHAR(50) NOT NULL,
                entity VARCHAR(50) NOT NULL,
                record_id INT NULL,
                details JSON NULL,
                ip_address VARCHAR(45) NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Created or verified table: audit_logs');

        // 3. Create Refresh Tokens table for enhanced JWT security
        await db.query(`
            CREATE TABLE IF NOT EXISTS refresh_tokens (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                token VARCHAR(500) NOT NULL,
                expires_at DATETIME NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Created or verified table: refresh_tokens');

        // 4. Create Workspaces table
        await db.query(`
            CREATE TABLE IF NOT EXISTS workspaces (
                id INT AUTO_INCREMENT PRIMARY KEY,
                workspace_name VARCHAR(150) NOT NULL,
                workspace_code VARCHAR(50) NOT NULL,
                container_type VARCHAR(100) DEFAULT 'Dev',
                description TEXT,
                status VARCHAR(30) DEFAULT 'Active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                deleted_at TIMESTAMP NULL DEFAULT NULL
            )
        `);
        console.log('✅ Created or verified table: workspaces');

        // Seed initial workspace if table is empty
        const [wsRows] = await db.query('SELECT COUNT(*) as count FROM workspaces');
        if (wsRows[0].count === 0) {
            await db.query(`
                INSERT INTO workspaces (workspace_name, workspace_code, container_type, description)
                VALUES ('Development', 'DEV-WEB', 'Dev', 'Default engineering & development workspace hub')
            `);
            console.log('✅ Seeded default workspace (DEV-WEB / Development)');
        }

        // 5. Create Workspace Container Types table
        await db.query(`
            CREATE TABLE IF NOT EXISTS workspace_types (
                id INT AUTO_INCREMENT PRIMARY KEY,
                type_name VARCHAR(100) NOT NULL,
                type_code VARCHAR(50) NOT NULL,
                description VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                deleted_at TIMESTAMP NULL DEFAULT NULL
            )
        `);
        console.log('✅ Created or verified table: workspace_types');

        // Seed initial workspace container types if empty
        const [wtRows] = await db.query('SELECT COUNT(*) as count FROM workspace_types');
        if (wtRows[0].count === 0) {
            await db.query(`
                INSERT INTO workspace_types (type_name, type_code, description) VALUES
                ('Development', 'Dev', 'Engineering, software dev and devops containers'),
                ('Internal Department', 'Dept', 'Company internal divisions and operational departments'),
                ('Client Organization', 'Client', 'External client dedicated workspaces'),
                ('Project Group', 'Proj', 'Multi-disciplinary project workspaces'),
                ('Support Unit', 'Supp', 'Customer success and ticketing operations'),
                ('Sales & Marketing', 'Sales', 'Lead generation and sales pipeline operations')
            `);
            console.log('✅ Seeded default workspace container types (6 items)');
        }

        // 6. Create Clients table
        await db.query(`
            CREATE TABLE IF NOT EXISTS clients (
                id INT AUTO_INCREMENT PRIMARY KEY,
                client_code VARCHAR(50) NOT NULL,
                client_name VARCHAR(150) NOT NULL,
                workspace VARCHAR(150) DEFAULT '',
                email VARCHAR(150) DEFAULT '',
                phone VARCHAR(50) DEFAULT '',
                status VARCHAR(30) DEFAULT 'Active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                deleted_at TIMESTAMP NULL DEFAULT NULL
            )
        `);
        console.log('✅ Created or verified table: clients (enterprise)');

        const [clRows] = await db.query('SELECT COUNT(*) as count FROM clients');
        if (clRows[0].count === 0) {
            await db.query(`
                INSERT INTO clients (client_code, client_name, workspace, email, status) VALUES
                ('CL-ABC', 'ABC Corporation', 'Development', 'contact@abccorp.com', 'Active')
            `);
            console.log('✅ Seeded default client (CL-ABC)');
        }

        // 7. Create Projects table
        await db.query(`
            CREATE TABLE IF NOT EXISTS projects (
                id INT AUTO_INCREMENT PRIMARY KEY,
                project_code VARCHAR(50) NOT NULL,
                project_name VARCHAR(150) NOT NULL,
                workspace VARCHAR(150) DEFAULT '',
                status VARCHAR(30) DEFAULT 'In Progress',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                deleted_at TIMESTAMP NULL DEFAULT NULL
            )
        `);
        console.log('✅ Created or verified table: projects');

        const [pjRows] = await db.query('SELECT COUNT(*) as count FROM projects');
        if (pjRows[0].count === 0) {
            await db.query(`
                INSERT INTO projects (project_code, project_name, workspace, status) VALUES
                ('PRJ-GRAVITY', 'Beyond Gravity', 'Development', 'In Progress')
            `);
            console.log('✅ Seeded default project (PRJ-GRAVITY)');
        }

        // 8. Create Boards table
        await db.query(`
            CREATE TABLE IF NOT EXISTS boards (
                id INT AUTO_INCREMENT PRIMARY KEY,
                board_code VARCHAR(50) NOT NULL,
                board_name VARCHAR(150) NOT NULL,
                project VARCHAR(150) DEFAULT '',
                board_type VARCHAR(50) DEFAULT 'Agile Board',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                deleted_at TIMESTAMP NULL DEFAULT NULL
            )
        `);
        console.log('✅ Created or verified table: boards');

        const [brRows] = await db.query('SELECT COUNT(*) as count FROM boards');
        if (brRows[0].count === 0) {
            await db.query(`
                INSERT INTO boards (board_code, board_name, project, board_type) VALUES
                ('BRD-SPRINT', 'Main Agile Sprint Board', 'Beyond Gravity', 'Agile Board'),
                ('BRD-BUGFIX', 'Triage & Bug Tracker Board', 'Beyond Gravity', 'Bug Tracker')
            `);
            console.log('✅ Seeded default boards (2 items)');
        }

        // 4. Create High-Performance Composite B-Tree Indexes
        const indexQueries = [
            { table: 'deals', name: 'idx_deals_stage_value', query: 'ALTER TABLE deals ADD INDEX idx_deals_stage_value (stage, value)' },
            { table: 'deals', name: 'idx_deals_deleted', query: 'ALTER TABLE deals ADD INDEX idx_deals_deleted (deleted_at)' },
            { table: 'invoices', name: 'idx_invoices_status_date', query: 'ALTER TABLE invoices ADD INDEX idx_invoices_status_date (payment_status, invoice_date)' },
            { table: 'invoices', name: 'idx_invoices_deleted', query: 'ALTER TABLE invoices ADD INDEX idx_invoices_deleted (deleted_at)' },
            { table: 'leads', name: 'idx_leads_status_source', query: 'ALTER TABLE leads ADD INDEX idx_leads_status_source (lead_status, source)' },
            { table: 'leads', name: 'idx_leads_deleted', query: 'ALTER TABLE leads ADD INDEX idx_leads_deleted (deleted_at)' },
            { table: 'tasks', name: 'idx_tasks_status_due', query: 'ALTER TABLE tasks ADD INDEX idx_tasks_status_due (status, due_date)' },
            { table: 'tasks', name: 'idx_tasks_deleted', query: 'ALTER TABLE tasks ADD INDEX idx_tasks_deleted (deleted_at)' },
            { table: 'audit_logs', name: 'idx_audit_entity_record', query: 'ALTER TABLE audit_logs ADD INDEX idx_audit_entity_record (entity, record_id)' },
            { table: 'audit_logs', name: 'idx_audit_created', query: 'ALTER TABLE audit_logs ADD INDEX idx_audit_created (created_at)' }
        ];

        for (const idx of indexQueries) {
            try {
                const [existing] = await db.query(`SHOW INDEX FROM \`${idx.table}\` WHERE Key_name = '${idx.name}'`);
                if (existing.length === 0) {
                    await db.query(idx.query);
                    console.log(`✅ Created index ${idx.name} on ${idx.table}`);
                } else {
                    console.log(`ℹ️ Index ${idx.name} already exists on ${idx.table}`);
                }
            } catch (err) {
                console.warn(`⚠️ Index creation warning for ${idx.name}:`, err.message);
            }
        }

        console.log('\n🎉 ALL ENTERPRISE DATABASE MIGRATIONS COMPLETED SUCCESSFULLY!\n');
        process.exit(0);
    } catch (err) {
        console.error('❌ Migration Error:', err);
        process.exit(1);
    }
}

runEnterpriseMigrations();
