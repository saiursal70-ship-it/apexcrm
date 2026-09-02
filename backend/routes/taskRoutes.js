const express = require('express');
const router = express.Router();
const db = require('../config/db');
const TaskAutomationEngine = require('../utils/taskAutomationEngine');
const authMiddleware = require('../middleware/auth');

// Optional auth helper (extract user from req if token present, fallback to Admin for demo mode)
const resolveUser = (req) => {
    if (req.user && req.user.id) {
        return {
            id: req.user.id,
            name: req.user.name || 'User',
            email: req.user.email || '',
            role: req.user.role || 'Admin',
            department: req.user.department || 'Engineering'
        };
    }
    return {
        id: 1,
        name: 'Sai Ursal',
        email: 'sai@apexdev.io',
        role: 'Admin',
        department: 'Engineering'
    };
};

// -------------------------------------------------------------
// GET /api/tasks - List all enterprise tasks with RBAC & filtering
// -------------------------------------------------------------
router.get('/', async (req, res) => {
    try {
        const currentUser = resolveUser(req);
        const { search, status, department, priority, assignee, project } = req.query;

        let query = 'SELECT * FROM enterprise_tasks WHERE deleted_at IS NULL';
        const params = [];

        // RBAC View Scoping
        // Admin: see all
        // Leads: see all in their department or where they are assigned/creator
        // Employees: see only assigned or created
        if (currentUser.role !== 'Admin' && currentUser.role !== 'System Admin') {
            if (currentUser.role.toLowerCase().includes('lead')) {
                query += ` AND (department = ? OR JSON_SEARCH(assignees, 'one', ?) IS NOT NULL OR created_by = ?)`;
                params.push(currentUser.department, currentUser.email, currentUser.name);
            } else {
                query += ` AND (JSON_SEARCH(assignees, 'one', ?) IS NOT NULL OR created_by = ?)`;
                params.push(currentUser.email, currentUser.name);
            }
        }

        if (status && status !== 'All') {
            query += ' AND status = ?';
            params.push(status);
        }
        if (department && department !== 'All') {
            query += ' AND department = ?';
            params.push(department);
        }
        if (priority && priority !== 'All') {
            query += ' AND priority = ?';
            params.push(priority);
        }
        if (project && project !== 'All') {
            query += ' AND project = ?';
            params.push(project);
        }

        query += ' ORDER BY created_at DESC';

        const [rows] = await db.query(query, params);

        // Apply in-memory search and assignee parsing
        let tasks = rows.map(r => {
            let assignees = [];
            let tags = [];
            let checklist = [];
            let attachments = [];
            let comments = [];
            let dependsOn = [];
            let history = [];

            try { assignees = typeof r.assignees === 'string' ? JSON.parse(r.assignees || '[]') : (r.assignees || []); } catch (e) {}
            try { tags = typeof r.tags === 'string' ? JSON.parse(r.tags || '[]') : (r.tags || []); } catch (e) {}
            try { checklist = typeof r.checklist === 'string' ? JSON.parse(r.checklist || '[]') : (r.checklist || []); } catch (e) {}
            try { attachments = typeof r.attachments === 'string' ? JSON.parse(r.attachments || '[]') : (r.attachments || []); } catch (e) {}
            try { comments = typeof r.comments === 'string' ? JSON.parse(r.comments || '[]') : (r.comments || []); } catch (e) {}
            try { dependsOn = typeof r.depends_on === 'string' ? JSON.parse(r.depends_on || '[]') : (r.depends_on || []); } catch (e) {}
            try { history = typeof r.history === 'string' ? JSON.parse(r.history || '[]') : (r.history || []); } catch (e) {}

            return {
                ...r,
                assignees,
                tags,
                checklist,
                attachments,
                comments,
                depends_on: dependsOn,
                history
            };
        });

        if (search && search.trim() !== '') {
            const q = search.toLowerCase();
            tasks = tasks.filter(t => 
                (t.title && t.title.toLowerCase().includes(q)) ||
                (t.task_key && t.task_key.toLowerCase().includes(q)) ||
                (t.description && t.description.toLowerCase().includes(q)) ||
                t.tags.some(tag => tag.toLowerCase().includes(q)) ||
                t.assignees.some(a => a.name?.toLowerCase().includes(q) || a.email?.toLowerCase().includes(q))
            );
        }

        if (assignee && assignee !== 'All') {
            tasks = tasks.filter(t => t.assignees.some(a => a.name === assignee || a.email === assignee || String(a.id) === String(assignee)));
        }

        return res.json(tasks);
    } catch (err) {
        console.error('Error fetching tasks:', err);
        return res.status(500).json({ error: err.message });
    }
});

// -------------------------------------------------------------
// GET /api/tasks/workload - Team Workload matrix per User Directory
// -------------------------------------------------------------
router.get('/workload', async (req, res) => {
    try {
        const [users] = await db.query("SELECT id, name, email, role, department, status, profile_image FROM users");
        const [tasks] = await db.query("SELECT id, task_key, title, status, priority, due_date, assignees FROM enterprise_tasks WHERE deleted_at IS NULL AND status != 'Done'");
        const now = new Date();

        const workload = users.map(user => {
            const userTasks = tasks.filter(t => {
                try {
                    const assignees = typeof t.assignees === 'string' ? JSON.parse(t.assignees || '[]') : (t.assignees || []);
                    return assignees.some(a => String(a.id) === String(user.id) || a.email === user.email || a.name === user.name);
                } catch (e) { return false; }
            });

            const openCount = userTasks.length;
            const overdueCount = userTasks.filter(t => t.due_date && new Date(t.due_date) < now).length;
            const urgentCount = userTasks.filter(t => t.priority === 'Urgent' || t.priority === 'High').length;
            const capacityLimit = 10;
            const capacityPercentage = Math.min(Math.round((openCount / capacityLimit) * 100), 150);

            return {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    department: user.department || 'Engineering',
                    status: user.status || 'Active',
                    avatar: user.profile_image || ''
                },
                openTasksCount: openCount,
                overdueTasksCount: overdueCount,
                urgentTasksCount: urgentCount,
                capacityPercentage,
                isOverloaded: openCount >= capacityLimit,
                recentTasks: userTasks.slice(0, 4).map(t => ({ task_key: t.task_key, title: t.title, status: t.status, priority: t.priority }))
            };
        });

        return res.json(workload);
    } catch (err) {
        console.error('Workload Error:', err);
        return res.status(500).json({ error: err.message });
    }
});

// -------------------------------------------------------------
// GET /api/tasks/analytics - Overall KPIs & Velocity
// -------------------------------------------------------------
router.get('/analytics', async (req, res) => {
    try {
        const [tasks] = await db.query("SELECT id, status, priority, due_date, is_escalated FROM enterprise_tasks WHERE deleted_at IS NULL");
        const now = new Date();

        const total = tasks.length;
        const todo = tasks.filter(t => t.status === 'To Do').length;
        const inProgress = tasks.filter(t => t.status === 'In Progress').length;
        const inReview = tasks.filter(t => t.status === 'In Review').length;
        const done = tasks.filter(t => t.status === 'Done').length;
        const blocked = tasks.filter(t => t.status === 'Blocked').length;
        const overdue = tasks.filter(t => t.status !== 'Done' && t.due_date && new Date(t.due_date) < now).length;
        const escalated = tasks.filter(t => t.is_escalated).length;
        const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;

        return res.json({
            total,
            todo,
            inProgress,
            inReview,
            done,
            blocked,
            overdue,
            escalated,
            completionRate
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// -------------------------------------------------------------
// GET /api/tasks/automation-logs - Audit trail of automation rules
// -------------------------------------------------------------
router.get('/automation-logs', async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM task_automation_logs ORDER BY executed_at DESC LIMIT 50");
        return res.json(rows);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// -------------------------------------------------------------
// POST /api/tasks/run-automations - Trigger sweeps on-demand
// -------------------------------------------------------------
router.post('/run-automations', async (req, res) => {
    try {
        const results = await TaskAutomationEngine.runScheduledSweeps();
        return res.json({
            success: true,
            message: `Automations executed successfully: ${results.evaluatedTasks} tasks evaluated, ${results.dueSoonNotified} due soon notices, ${results.overdueNotified} overdue notices, ${results.escalatedCount} escalated.`,
            results
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// -------------------------------------------------------------
// POST /api/tasks - Create Task (Supports Single & Bulk Assignment)
// -------------------------------------------------------------
router.post('/', async (req, res) => {
    try {
        const currentUser = resolveUser(req);
        const {
            title,
            description,
            project,
            assignees, // array of user objects or IDs
            bulk_assign_user_ids, // array of user IDs for template bulk assign
            department,
            priority,
            status,
            due_date,
            start_date,
            estimated_hours,
            tags,
            checklist,
            recurrence,
            depends_on
        } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({ error: 'Task title is required' });
        }

        // Handle Bulk Assignment Mode
        if (Array.isArray(bulk_assign_user_ids) && bulk_assign_user_ids.length > 0) {
            const [users] = await db.query("SELECT id, name, email, role, department, profile_image FROM users WHERE id IN (?)", [bulk_assign_user_ids]);
            const createdTasks = [];

            for (const user of users) {
                const [maxRows] = await db.query('SELECT MAX(id) as maxId FROM enterprise_tasks');
                const nextId = (maxRows[0]?.maxId || 1000) + 1;
                const taskKey = `TSK-${nextId}`;

                const singleAssignee = [{
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    department: user.department || department || 'Engineering',
                    avatar: user.profile_image || ''
                }];

                const history = [{
                    action: 'BULK_CREATED',
                    userName: currentUser.name,
                    timestamp: new Date().toISOString(),
                    details: `Bulk task created for ${user.name}`
                }];

                const [result] = await db.query(`
                    INSERT INTO enterprise_tasks (
                        task_key, title, description, project, assignees, created_by,
                        department, priority, status, due_date, start_date, estimated_hours,
                        tags, checklist, attachments, comments, recurrence, depends_on, history
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    taskKey,
                    `${title.trim()} [${user.name}]`,
                    description || '',
                    project || 'Beyond Gravity',
                    JSON.stringify(singleAssignee),
                    currentUser.name,
                    user.department || department || 'Engineering',
                    priority || 'Medium',
                    status || 'To Do',
                    due_date ? new Date(due_date).toISOString().slice(0, 19).replace('T', ' ') : null,
                    start_date ? new Date(start_date).toISOString().slice(0, 19).replace('T', ' ') : null,
                    estimated_hours || 4.0,
                    JSON.stringify(Array.isArray(tags) ? tags : []),
                    JSON.stringify(Array.isArray(checklist) ? checklist : []),
                    JSON.stringify([]),
                    JSON.stringify([]),
                    recurrence || 'None',
                    JSON.stringify(Array.isArray(depends_on) ? depends_on : []),
                    JSON.stringify(history)
                ]);

                const newTask = { id: result.insertId, task_key: taskKey, title, due_date, priority };
                await TaskAutomationEngine.onTaskAssigned(newTask, singleAssignee, currentUser.name);
                createdTasks.push(newTask);
            }

            return res.status(201).json({
                success: true,
                message: `Bulk created ${createdTasks.length} tasks successfully.`,
                tasks: createdTasks
            });
        }

        // Standard Single Task Creation
        const [maxRows] = await db.query('SELECT MAX(id) as maxId FROM enterprise_tasks');
        const nextId = (maxRows[0]?.maxId || 1000) + 1;
        const taskKey = `TSK-${nextId}`;

        // Ensure assignees is array of objects or automatically assign optimal team member
        let parsedAssignees = [];
        if (Array.isArray(assignees) && assignees.length > 0) {
            parsedAssignees = assignees;
        } else {
            // FULLY AUTOMATIC ASSIGNMENT: Calculate optimal assignee based on workload & department
            const optimal = await TaskAutomationEngine.determineOptimalAssignee({
                department: department || 'Engineering',
                tags: Array.isArray(tags) ? tags : []
            });
            parsedAssignees = [optimal];
        }

        const history = [{
            action: 'CREATED',
            userName: currentUser.name,
            timestamp: new Date().toISOString(),
            details: `Task created and auto-assigned to ${parsedAssignees.map(a => a.name).join(', ')}`
        }];

        const [result] = await db.query(`
            INSERT INTO enterprise_tasks (
                task_key, title, description, project, assignees, created_by,
                department, priority, status, due_date, start_date, estimated_hours,
                tags, checklist, attachments, comments, recurrence, depends_on, history
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            taskKey,
            title.trim(),
            description || '',
            project || 'Beyond Gravity',
            JSON.stringify(parsedAssignees),
            currentUser.name,
            department || parsedAssignees[0]?.department || 'Engineering',
            priority || 'Medium',
            status || 'To Do',
            due_date ? new Date(due_date).toISOString().slice(0, 19).replace('T', ' ') : null,
            start_date ? new Date(start_date).toISOString().slice(0, 19).replace('T', ' ') : null,
            estimated_hours || 4.0,
            JSON.stringify(Array.isArray(tags) ? tags : []),
            JSON.stringify(Array.isArray(checklist) ? checklist : []),
            JSON.stringify([]),
            JSON.stringify([]),
            recurrence || 'None',
            JSON.stringify(Array.isArray(depends_on) ? depends_on : []),
            JSON.stringify(history)
        ]);

        const newTask = {
            id: result.insertId,
            task_key: taskKey,
            title: title.trim(),
            description,
            project: project || 'Beyond Gravity',
            assignees: parsedAssignees,
            created_by: currentUser.name,
            department: department || 'Engineering',
            priority: priority || 'Medium',
            status: status || 'To Do',
            due_date,
            start_date,
            estimated_hours,
            tags: tags || [],
            checklist: checklist || [],
            attachments: [],
            comments: [],
            recurrence: recurrence || 'None',
            depends_on: depends_on || [],
            history
        };

        // Trigger Assignment Notification Rule
        await TaskAutomationEngine.onTaskAssigned(newTask, parsedAssignees, currentUser.name);

        return res.status(201).json(newTask);
    } catch (err) {
        console.error('Error creating task:', err);
        return res.status(500).json({ error: err.message });
    }
});

// -------------------------------------------------------------
// GET /api/tasks/:id - Get Single Task with Full History
// -------------------------------------------------------------
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.query("SELECT * FROM enterprise_tasks WHERE (id = ? OR task_key = ?) AND deleted_at IS NULL", [id, id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Task not found' });

        const r = rows[0];
        return res.json({
            ...r,
            assignees: JSON.parse(r.assignees || '[]'),
            tags: JSON.parse(r.tags || '[]'),
            checklist: JSON.parse(r.checklist || '[]'),
            attachments: JSON.parse(r.attachments || '[]'),
            comments: JSON.parse(r.comments || '[]'),
            depends_on: JSON.parse(r.depends_on || '[]'),
            history: JSON.parse(r.history || '[]')
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// -------------------------------------------------------------
// PUT /api/tasks/:id - Update Task & Evaluate Rules
// -------------------------------------------------------------
router.put('/:id', async (req, res) => {
    try {
        const currentUser = resolveUser(req);
        const { id } = req.params;

        const [existingRows] = await db.query("SELECT * FROM enterprise_tasks WHERE id = ? OR task_key = ?", [id, id]);
        if (existingRows.length === 0) return res.status(404).json({ error: 'Task not found' });

        const task = existingRows[0];
        const updateData = req.body;

        let history = [];
        try { history = JSON.parse(task.history || '[]'); } catch (e) {}

        // Track changes for audit history
        const changeLogs = [];
        if (updateData.status && updateData.status !== task.status) {
            changeLogs.push(`Status changed from '${task.status}' to '${updateData.status}'`);
        }
        if (updateData.priority && updateData.priority !== task.priority) {
            changeLogs.push(`Priority changed from '${task.priority}' to '${updateData.priority}'`);
        }
        if (updateData.due_date && updateData.due_date !== task.due_date) {
            changeLogs.push(`Due date updated to ${new Date(updateData.due_date).toLocaleDateString()}`);
        }

        if (changeLogs.length > 0) {
            history.unshift({
                action: 'UPDATED',
                userName: currentUser.name,
                timestamp: new Date().toISOString(),
                details: changeLogs.join(' • ')
            });
        }

        // Process Checklist updates
        if (updateData.checklist && Array.isArray(updateData.checklist)) {
            await TaskAutomationEngine.handleChecklistCompletion(task, updateData.checklist, currentUser.name);
        }

        // Process Task Done Completion Rule
        let completionTime = task.completion_time;
        if (updateData.status === 'Done' && task.status !== 'Done') {
            completionTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
            await TaskAutomationEngine.handleTaskDone(task, currentUser.name);
        }

        await db.query(`
            UPDATE enterprise_tasks SET
                title = COALESCE(?, title),
                description = COALESCE(?, description),
                project = COALESCE(?, project),
                assignees = COALESCE(?, assignees),
                department = COALESCE(?, department),
                priority = COALESCE(?, priority),
                status = COALESCE(?, status),
                due_date = COALESCE(?, due_date),
                start_date = COALESCE(?, start_date),
                estimated_hours = COALESCE(?, estimated_hours),
                tags = COALESCE(?, tags),
                checklist = COALESCE(?, checklist),
                attachments = COALESCE(?, attachments),
                recurrence = COALESCE(?, recurrence),
                depends_on = COALESCE(?, depends_on),
                history = ?,
                completion_time = ?
            WHERE id = ?
        `, [
            updateData.title,
            updateData.description,
            updateData.project,
            updateData.assignees ? JSON.stringify(updateData.assignees) : null,
            updateData.department,
            updateData.priority,
            updateData.status,
            updateData.due_date ? new Date(updateData.due_date).toISOString().slice(0, 19).replace('T', ' ') : null,
            updateData.start_date ? new Date(updateData.start_date).toISOString().slice(0, 19).replace('T', ' ') : null,
            updateData.estimated_hours,
            updateData.tags ? JSON.stringify(updateData.tags) : null,
            updateData.checklist ? JSON.stringify(updateData.checklist) : null,
            updateData.attachments ? JSON.stringify(updateData.attachments) : null,
            updateData.recurrence,
            updateData.depends_on ? JSON.stringify(updateData.depends_on) : null,
            JSON.stringify(history),
            completionTime,
            task.id
        ]);

        const [updatedRows] = await db.query("SELECT * FROM enterprise_tasks WHERE id = ?", [task.id]);
        const r = updatedRows[0];

        return res.json({
            ...r,
            assignees: JSON.parse(r.assignees || '[]'),
            tags: JSON.parse(r.tags || '[]'),
            checklist: JSON.parse(r.checklist || '[]'),
            attachments: JSON.parse(r.attachments || '[]'),
            comments: JSON.parse(r.comments || '[]'),
            depends_on: JSON.parse(r.depends_on || '[]'),
            history: JSON.parse(r.history || '[]')
        });
    } catch (err) {
        console.error('Error updating task:', err);
        return res.status(500).json({ error: err.message });
    }
});

// -------------------------------------------------------------
// POST /api/tasks/:id/comments - Add Comment with @Mentions
// -------------------------------------------------------------
router.post('/:id/comments', async (req, res) => {
    try {
        const currentUser = resolveUser(req);
        const { id } = req.params;
        const { text } = req.body;

        if (!text || !text.trim()) {
            return res.status(400).json({ error: 'Comment text is required' });
        }

        const [existingRows] = await db.query("SELECT * FROM enterprise_tasks WHERE id = ? OR task_key = ?", [id, id]);
        if (existingRows.length === 0) return res.status(404).json({ error: 'Task not found' });

        const task = existingRows[0];
        let comments = [];
        try { comments = JSON.parse(task.comments || '[]'); } catch (e) {}

        const newComment = {
            id: `c_${Date.now()}`,
            userId: currentUser.id,
            userName: currentUser.name,
            userAvatar: currentUser.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=2563eb&color=fff`,
            text: text.trim(),
            timestamp: new Date().toISOString()
        };

        comments.push(newComment);

        let history = [];
        try { history = JSON.parse(task.history || '[]'); } catch (e) {}
        history.unshift({
            action: 'COMMENT_ADDED',
            userName: currentUser.name,
            timestamp: new Date().toISOString(),
            details: `Comment added: "${text.slice(0, 50)}${text.length > 50 ? '...' : ''}"`
        });

        await db.query(`
            UPDATE enterprise_tasks 
            SET comments = ?, history = ? 
            WHERE id = ?
        `, [JSON.stringify(comments), JSON.stringify(history), task.id]);

        // Trigger @Mention Automation
        await TaskAutomationEngine.handleCommentMentions(task, text.trim(), currentUser.name);

        return res.status(201).json({
            success: true,
            comment: newComment,
            comments
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// -------------------------------------------------------------
// POST /api/tasks/auto-assign-all - Auto-assign all unassigned tasks
// -------------------------------------------------------------
router.post('/auto-assign-all', async (req, res) => {
    try {
        const result = await TaskAutomationEngine.autoAssignAllUnassigned();
        return res.json(result);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// -------------------------------------------------------------
// POST /api/tasks/auto-rebalance - Auto-rebalance team workloads
// -------------------------------------------------------------
router.post('/auto-rebalance', async (req, res) => {
    try {
        const result = await TaskAutomationEngine.autoRebalanceWorkload();
        return res.json(result);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// -------------------------------------------------------------
// POST /api/tasks/generate-sprint-tasks - Generate automated deliverables
// -------------------------------------------------------------
router.post('/generate-sprint-tasks', async (req, res) => {
    try {
        const currentUser = resolveUser(req);
        const { project_name } = req.body;
        const result = await TaskAutomationEngine.generateSprintDeliverables(project_name || 'Beyond Gravity', currentUser.name);
        return res.status(201).json(result);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

module.exports = router;
