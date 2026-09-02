const db = require('./config/db');
const bcrypt = require('bcryptjs');

async function runTaskAutomationMigrations() {
    console.log('🚀 Starting Task Automation Database Migrations...');

    try {
        // 1. Upgrade `users` table schema: Add department & status
        const [userCols] = await db.query("SHOW COLUMNS FROM users LIKE 'department'");
        if (userCols.length === 0) {
            await db.query("ALTER TABLE users ADD COLUMN department VARCHAR(100) DEFAULT 'Engineering'");
            console.log("✅ Added 'department' column to users table.");
        }

        const [statusCols] = await db.query("SHOW COLUMNS FROM users LIKE 'status'");
        if (statusCols.length === 0) {
            await db.query("ALTER TABLE users ADD COLUMN status VARCHAR(30) DEFAULT 'Active'");
            console.log("✅ Added 'status' column to users table.");
        }

        // 2. Ensure Seeded Team Members exist in `users` table
        const defaultPassword = await bcrypt.hash('admin123', 10);
        const seedUsers = [
            {
                name: 'Sai Ursal',
                email: 'sai@apexdev.io',
                role: 'Admin',
                department: 'Engineering',
                status: 'Active',
                profile_image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'
            },
            {
                name: 'Elena Rostova',
                email: 'elena@apexdev.io',
                role: 'Sales Lead',
                department: 'Sales',
                status: 'Active',
                profile_image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'
            },
            {
                name: 'Sarah Jenkins',
                email: 'sarah@apexdev.io',
                role: 'Account Executive',
                department: 'Sales',
                status: 'Active',
                profile_image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150'
            },
            {
                name: 'Claire Redfield',
                email: 'claire@apexdev.io',
                role: 'Support Lead',
                department: 'Support',
                status: 'Active',
                profile_image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150'
            },
            {
                name: 'Michael Vance',
                email: 'michael@apexdev.io',
                role: 'Tech Lead',
                department: 'Engineering',
                status: 'Active',
                profile_image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150'
            }
        ];

        for (const u of seedUsers) {
            const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [u.email]);
            if (existing.length === 0) {
                await db.query(
                    'INSERT INTO users (name, email, password, role, department, status, profile_image) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [u.name, u.email, defaultPassword, u.role, u.department, u.status, u.profile_image]
                );
                console.log(`✅ Seeded user: ${u.name} (${u.role}, ${u.department})`);
            } else {
                await db.query(
                    'UPDATE users SET name = ?, role = ?, department = ?, status = ?, profile_image = ? WHERE id = ?',
                    [u.name, u.role, u.department, u.status, u.profile_image, existing[0].id]
                );
            }
        }

        // 3. Create `enterprise_tasks` Table
        await db.query(`
            CREATE TABLE IF NOT EXISTS enterprise_tasks (
                id INT AUTO_INCREMENT PRIMARY KEY,
                task_key VARCHAR(50) NOT NULL UNIQUE,
                title VARCHAR(255) NOT NULL,
                description LONGTEXT,
                project VARCHAR(150) DEFAULT 'Beyond Gravity',
                assignees JSON,
                created_by VARCHAR(150) DEFAULT 'Sai Ursal',
                department VARCHAR(100) DEFAULT 'Engineering',
                priority VARCHAR(30) DEFAULT 'Medium',
                status VARCHAR(50) DEFAULT 'To Do',
                due_date DATETIME NULL,
                start_date DATETIME NULL,
                estimated_hours DECIMAL(6,2) DEFAULT 4.00,
                tags JSON,
                checklist JSON,
                attachments JSON,
                comments JSON,
                recurrence VARCHAR(50) DEFAULT 'None',
                depends_on JSON,
                history JSON,
                is_escalated BOOLEAN DEFAULT FALSE,
                completion_time DATETIME NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                deleted_at TIMESTAMP NULL DEFAULT NULL
            )
        `);
        console.log('✅ Created or verified table: enterprise_tasks');

        // 4. Create `task_notifications` Table
        await db.query(`
            CREATE TABLE IF NOT EXISTS task_notifications (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id VARCHAR(100),
                user_email VARCHAR(150),
                task_id VARCHAR(50),
                type VARCHAR(50) DEFAULT 'assigned',
                title VARCHAR(200) NOT NULL,
                message TEXT NOT NULL,
                read_status BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Created or verified table: task_notifications');

        // 5. Create `task_automation_logs` Table
        await db.query(`
            CREATE TABLE IF NOT EXISTS task_automation_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                rule_name VARCHAR(150) NOT NULL,
                trigger_event VARCHAR(100) NOT NULL,
                task_key VARCHAR(50),
                details TEXT,
                executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Created or verified table: task_automation_logs');

        // 6. Seed Sample Enterprise Tasks if table is empty
        const [taskRows] = await db.query('SELECT COUNT(*) as count FROM enterprise_tasks WHERE deleted_at IS NULL');
        if (taskRows[0].count === 0) {
            const now = new Date();
            const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
            const inThreeDays = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
            const overdueTwoDays = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
            const overdueThreeDays = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

            const initialTasks = [
                {
                    task_key: 'TSK-1001',
                    title: 'Refactor Stripe verification webhook and token rotation',
                    description: 'Refactor Stripe signature checking to prevent timeouts on slow network connections and log failed attempts to audit trail.',
                    project: 'Beyond Gravity',
                    assignees: JSON.stringify([
                        { id: 4, name: 'Claire Redfield', email: 'claire@apexdev.io', role: 'Support Lead', department: 'Support', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150' },
                        { id: 5, name: 'Michael Vance', email: 'michael@apexdev.io', role: 'Tech Lead', department: 'Engineering', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150' }
                    ]),
                    created_by: 'Sai Ursal',
                    department: 'Engineering',
                    priority: 'High',
                    status: 'In Progress',
                    due_date: tomorrow.toISOString().slice(0, 19).replace('T', ' '),
                    start_date: now.toISOString().slice(0, 19).replace('T', ' '),
                    estimated_hours: 8,
                    tags: JSON.stringify(['Stripe', 'Security', 'Backend']),
                    checklist: JSON.stringify([
                        { text: 'Add idempotency key cache', done: true },
                        { text: 'Validate webhook HMAC sha256', done: true },
                        { text: 'Write regression unit tests', done: false }
                    ]),
                    attachments: JSON.stringify([]),
                    comments: JSON.stringify([
                        { id: 'c1', userId: '1', userName: 'Sai Ursal', userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150', text: 'Please ensure webhook tests include retry simulations @Michael Vance', timestamp: new Date(Date.now() - 3600000).toISOString() }
                    ]),
                    recurrence: 'None',
                    depends_on: JSON.stringify([]),
                    history: JSON.stringify([
                        { action: 'CREATED', userName: 'Sai Ursal', timestamp: now.toISOString(), details: 'Task created and assigned to Claire Redfield and Michael Vance' }
                    ]),
                    is_escalated: false
                },
                {
                    task_key: 'TSK-1002',
                    title: 'Q3 Enterprise Sales Strategy & Lead Assignment Playbook',
                    description: 'Draft the automated lead routing and quota distribution model for Q3 enterprise accounts and present to leadership.',
                    project: 'Apex CRM Core',
                    assignees: JSON.stringify([
                        { id: 2, name: 'Elena Rostova', email: 'elena@apexdev.io', role: 'Sales Lead', department: 'Sales', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150' }
                    ]),
                    created_by: 'Sai Ursal',
                    department: 'Sales',
                    priority: 'Urgent',
                    status: 'To Do',
                    due_date: inThreeDays.toISOString().slice(0, 19).replace('T', ' '),
                    start_date: now.toISOString().slice(0, 19).replace('T', ' '),
                    estimated_hours: 12,
                    tags: JSON.stringify(['Strategy', 'Sales', 'Q3']),
                    checklist: JSON.stringify([
                        { text: 'Analyze Q2 conversion bottleneck', done: false },
                        { text: 'Set territory tiering guidelines', done: false },
                        { text: 'Create onboarding deck for new SDRs', done: false }
                    ]),
                    attachments: JSON.stringify([]),
                    comments: JSON.stringify([]),
                    recurrence: 'Monthly',
                    depends_on: JSON.stringify([]),
                    history: JSON.stringify([
                        { action: 'CREATED', userName: 'Sai Ursal', timestamp: now.toISOString(), details: 'Task initialized with monthly recurrence' }
                    ]),
                    is_escalated: false
                },
                {
                    task_key: 'TSK-1003',
                    title: 'Customer Onboarding & SLA Guarantee Documentation',
                    description: 'Standardize customer onboarding checklist and tier 1 support response guarantees for SLA tier A clients.',
                    project: 'Apex CRM Core',
                    assignees: JSON.stringify([
                        { id: 3, name: 'Sarah Jenkins', email: 'sarah@apexdev.io', role: 'Account Executive', department: 'Sales', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150' }
                    ]),
                    created_by: 'Elena Rostova',
                    department: 'Sales',
                    priority: 'High',
                    status: 'In Progress',
                    due_date: overdueTwoDays.toISOString().slice(0, 19).replace('T', ' '),
                    start_date: now.toISOString().slice(0, 19).replace('T', ' '),
                    estimated_hours: 6,
                    tags: JSON.stringify(['Documentation', 'SLA', 'Client']),
                    checklist: JSON.stringify([
                        { text: 'Draft SLA tiers and response table', done: true },
                        { text: 'Manager approval from Elena', done: false }
                    ]),
                    attachments: JSON.stringify([]),
                    comments: JSON.stringify([]),
                    recurrence: 'None',
                    depends_on: JSON.stringify([]),
                    history: JSON.stringify([
                        { action: 'CREATED', userName: 'Elena Rostova', timestamp: now.toISOString(), details: 'Assigned to Sarah Jenkins' }
                    ]),
                    is_escalated: true
                },
                {
                    task_key: 'TSK-1004',
                    title: 'Multi-destination Search UI with Real-time Filters',
                    description: 'Implement responsive search filters with animated faceted pills and mobile drawer filter sheet.',
                    project: 'Mobile App v2',
                    assignees: JSON.stringify([
                        { id: 4, name: 'Claire Redfield', email: 'claire@apexdev.io', role: 'Support Lead', department: 'Support', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150' }
                    ]),
                    created_by: 'Michael Vance',
                    department: 'Support',
                    priority: 'Medium',
                    status: 'In Review',
                    due_date: tomorrow.toISOString().slice(0, 19).replace('T', ' '),
                    start_date: now.toISOString().slice(0, 19).replace('T', ' '),
                    estimated_hours: 5,
                    tags: JSON.stringify(['UI/UX', 'Search', 'Frontend']),
                    checklist: JSON.stringify([
                        { text: 'Build faceted pill buttons', done: true },
                        { text: 'Keyboard shortcuts (Ctrl+K)', done: true },
                        { text: 'Mobile responsive drawer', done: true }
                    ]),
                    attachments: JSON.stringify([]),
                    comments: JSON.stringify([]),
                    recurrence: 'None',
                    depends_on: JSON.stringify([]),
                    history: JSON.stringify([
                        { action: 'STATUS_CHANGE', userName: 'Claire Redfield', timestamp: now.toISOString(), details: 'Checklist completed. Moved to In Review.' }
                    ]),
                    is_escalated: false
                },
                {
                    task_key: 'TSK-1005',
                    title: 'Database connection pool optimization & query caching',
                    description: 'Tuning MySQL pool size and indexing high-traffic deal and invoice queries.',
                    project: 'Beyond Gravity',
                    assignees: JSON.stringify([
                        { id: 5, name: 'Michael Vance', email: 'michael@apexdev.io', role: 'Tech Lead', department: 'Engineering', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150' }
                    ]),
                    created_by: 'Sai Ursal',
                    department: 'Engineering',
                    priority: 'Low',
                    status: 'Done',
                    due_date: now.toISOString().slice(0, 19).replace('T', ' '),
                    start_date: now.toISOString().slice(0, 19).replace('T', ' '),
                    estimated_hours: 4,
                    tags: JSON.stringify(['Database', 'Performance']),
                    checklist: JSON.stringify([
                        { text: 'Add compound indexes', done: true },
                        { text: 'Set max connection pool to 20', done: true }
                    ]),
                    attachments: JSON.stringify([]),
                    comments: JSON.stringify([]),
                    recurrence: 'None',
                    depends_on: JSON.stringify([]),
                    history: JSON.stringify([
                        { action: 'COMPLETED', userName: 'Michael Vance', timestamp: now.toISOString(), details: 'Marked Done and verified query benchmarks.' }
                    ]),
                    is_escalated: false,
                    completion_time: now.toISOString().slice(0, 19).replace('T', ' ')
                },
                {
                    task_key: 'TSK-1006',
                    title: 'Automated Invoice Generation and Email Dispatch Engine',
                    description: 'Blocked until Stripe payment provider refactoring is completed.',
                    project: 'Beyond Gravity',
                    assignees: JSON.stringify([
                        { id: 1, name: 'Sai Ursal', email: 'sai@apexdev.io', role: 'Admin', department: 'Engineering', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150' }
                    ]),
                    created_by: 'Sai Ursal',
                    department: 'Engineering',
                    priority: 'Medium',
                    status: 'Blocked',
                    due_date: inThreeDays.toISOString().slice(0, 19).replace('T', ' '),
                    start_date: now.toISOString().slice(0, 19).replace('T', ' '),
                    estimated_hours: 6,
                    tags: JSON.stringify(['Invoicing', 'Automation']),
                    checklist: JSON.stringify([
                        { text: 'Invoice PDF template engine', done: false },
                        { text: 'SMTP mailer queue', done: false }
                    ]),
                    attachments: JSON.stringify([]),
                    comments: JSON.stringify([]),
                    recurrence: 'None',
                    depends_on: JSON.stringify(['TSK-1001']),
                    history: JSON.stringify([
                        { action: 'CREATED', userName: 'Sai Ursal', timestamp: now.toISOString(), details: 'Blocked by TSK-1001 dependency.' }
                    ]),
                    is_escalated: false
                }
            ];

            for (const t of initialTasks) {
                await db.query(`
                    INSERT INTO enterprise_tasks (
                        task_key, title, description, project, assignees, created_by,
                        department, priority, status, due_date, start_date, estimated_hours,
                        tags, checklist, attachments, comments, recurrence, depends_on,
                        history, is_escalated, completion_time
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    t.task_key, t.title, t.description, t.project, t.assignees, t.created_by,
                    t.department, t.priority, t.status, t.due_date, t.start_date, t.estimated_hours,
                    t.tags, t.checklist, t.attachments, t.comments, t.recurrence, t.depends_on,
                    t.history, t.is_escalated, t.completion_time || null
                ]);
            }
            console.log('✅ Seeded 6 comprehensive enterprise sample tasks.');
        }

        // 7. Seed Initial Notifications
        const [notifRows] = await db.query('SELECT COUNT(*) as count FROM task_notifications');
        if (notifRows[0].count === 0) {
            await db.query(`
                INSERT INTO task_notifications (user_id, user_email, task_id, type, title, message, read_status) VALUES
                ('4', 'claire@apexdev.io', 'TSK-1001', 'assigned', 'New Task Assigned', 'You have been assigned to "Refactor Stripe verification webhook"', 0),
                ('3', 'sarah@apexdev.io', 'TSK-1003', 'overdue', 'Task Overdue Notice', 'Task "Customer Onboarding & SLA Guarantee" is overdue by 48h and has been escalated', 0),
                ('5', 'michael@apexdev.io', 'TSK-1001', 'comment', 'New Mention in Task', 'Sai Ursal mentioned you in a comment on TSK-1001', 0)
            `);
            console.log('✅ Seeded initial task notifications.');
        }

        console.log('\n🎉 ALL TASK AUTOMATION DATABASE MIGRATIONS COMPLETED SUCCESSFULLY!\n');
        process.exit(0);
    } catch (err) {
        console.error('❌ Task Migration Error:', err);
        process.exit(1);
    }
}

runTaskAutomationMigrations();
