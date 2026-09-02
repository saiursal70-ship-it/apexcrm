const db = require('../config/db');

/**
 * Task Automation Rules Engine for Apex Dev CRM
 * Evaluates real-time triggers and background schedules.
 */
class TaskAutomationEngine {
    
    // Log automation action into audit trail
    static async logAutomationAction(ruleName, triggerEvent, taskKey, details) {
        try {
            await db.query(
                'INSERT INTO task_automation_logs (rule_name, trigger_event, task_key, details) VALUES (?, ?, ?, ?)',
                [ruleName, triggerEvent, taskKey || null, typeof details === 'object' ? JSON.stringify(details) : String(details)]
            );
        } catch (err) {
            console.error('Failed to write automation log:', err.message);
        }
    }

    // Helper: Create In-App Notification
    static async createNotification({ userId, userEmail, taskId, type, title, message }) {
        try {
            await db.query(
                'INSERT INTO task_notifications (user_id, user_email, task_id, type, title, message) VALUES (?, ?, ?, ?, ?, ?)',
                [String(userId || ''), userEmail || '', taskId || '', type || 'assigned', title, message]
            );
            console.log(`🔔 [Notification] Sent to ${userEmail || userId}: ${title}`);
        } catch (err) {
            console.error('Failed to create notification:', err.message);
        }
    }

    // 1. Trigger on Task Assignment
    static async onTaskAssigned(task, assignees, creatorName = 'Admin') {
        if (!Array.isArray(assignees)) return;

        for (const assignee of assignees) {
            await this.createNotification({
                userId: assignee.id,
                userEmail: assignee.email,
                taskId: task.task_key,
                type: 'assigned',
                title: `📋 New Task Assigned: ${task.task_key}`,
                message: `${creatorName} assigned you to "${task.title}" (Priority: ${task.priority || 'Medium'}, Due: ${task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No date set'})`
            });
        }

        await this.logAutomationAction(
            'Task Assignment Dispatcher',
            'TASK_ASSIGNED',
            task.task_key,
            `Assigned to ${assignees.map(a => a.name || a.email).join(', ')} by ${creatorName}`
        );
    }

    // 2 & 3 & 4. Sweep Overdue, Due Soon, and Escalations
    static async runScheduledSweeps() {
        try {
            const now = new Date();
            const in24h = new Date(Date.now() + 24 * 60 * 60 * 1000);
            const past48h = new Date(Date.now() - 48 * 60 * 60 * 1000);

            // Fetch all non-completed, non-deleted tasks
            const [tasks] = await db.query(`
                SELECT * FROM enterprise_tasks 
                WHERE deleted_at IS NULL AND status NOT IN ('Done') AND due_date IS NOT NULL
            `);

            let dueSoonCount = 0;
            let overdueCount = 0;
            let escalatedCount = 0;

            for (const task of tasks) {
                const dueDate = new Date(task.due_date);
                let assignees = [];
                try { assignees = JSON.parse(task.assignees || '[]'); } catch (e) {}

                // Rule 4: Overdue by > 48 Hours -> Auto-Escalate
                if (dueDate < past48h && !task.is_escalated) {
                    let newPriority = 'Urgent';
                    if (task.priority === 'Low') newPriority = 'Medium';
                    else if (task.priority === 'Medium') newPriority = 'High';
                    else newPriority = 'Urgent';

                    let tags = [];
                    try { tags = JSON.parse(task.tags || '[]'); } catch (e) {}
                    if (!tags.includes('Escalated')) tags.push('Escalated');

                    let history = [];
                    try { history = JSON.parse(task.history || '[]'); } catch (e) {}
                    history.unshift({
                        action: 'AUTO_ESCALATED',
                        userName: 'System Automation',
                        timestamp: now.toISOString(),
                        details: `Task overdue by 48+ hours. Priority bumped to ${newPriority} and tagged Escalated.`
                    });

                    await db.query(`
                        UPDATE enterprise_tasks 
                        SET is_escalated = TRUE, priority = ?, tags = ?, history = ?
                        WHERE id = ?
                    `, [newPriority, JSON.stringify(tags), JSON.stringify(history), task.id]);

                    // Notify Admin and Assignees
                    for (const a of assignees) {
                        await this.createNotification({
                            userId: a.id,
                            userEmail: a.email,
                            taskId: task.task_key,
                            type: 'escalated',
                            title: `🚨 Escalated Overdue Task: ${task.task_key}`,
                            message: `Task "${task.title}" is overdue by >48 hours and has been automatically escalated to ${newPriority} priority.`
                        });
                    }

                    await this.logAutomationAction(
                        'Auto-Escalation Engine',
                        'OVERDUE_48H_ESCALATE',
                        task.task_key,
                        `Escalated task to ${newPriority}`
                    );
                    escalatedCount++;
                }

                // Rule 3: Past Due Date -> Mark Overdue notice
                else if (dueDate < now) {
                    // Check if already notified in last 24h
                    const [existingNotif] = await db.query(`
                        SELECT id FROM task_notifications 
                        WHERE task_id = ? AND type = 'overdue' AND created_at > DATE_SUB(NOW(), INTERVAL 1 DAY)
                    `, [task.task_key]);

                    if (existingNotif.length === 0) {
                        for (const a of assignees) {
                            await this.createNotification({
                                userId: a.id,
                                userEmail: a.email,
                                taskId: task.task_key,
                                type: 'overdue',
                                title: `⚠️ Task Overdue: ${task.task_key}`,
                                message: `Task "${task.title}" passed its due date (${dueDate.toLocaleDateString()}). Please update status or request an extension.`
                            });
                        }
                        overdueCount++;
                    }
                }

                // Rule 2: Due Soon (Within 24 Hours)
                else if (dueDate > now && dueDate <= in24h) {
                    const [existingNotif] = await db.query(`
                        SELECT id FROM task_notifications 
                        WHERE task_id = ? AND type = 'due_soon' AND created_at > DATE_SUB(NOW(), INTERVAL 1 DAY)
                    `, [task.task_key]);

                    if (existingNotif.length === 0) {
                        for (const a of assignees) {
                            await this.createNotification({
                                userId: a.id,
                                userEmail: a.email,
                                taskId: task.task_key,
                                type: 'due_soon',
                                title: `⏰ Due Soon (24h): ${task.task_key}`,
                                message: `Task "${task.title}" is due tomorrow at ${dueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`
                            });
                        }
                        dueSoonCount++;
                    }
                }
            }

            return {
                timestamp: now.toISOString(),
                evaluatedTasks: tasks.length,
                dueSoonNotified: dueSoonCount,
                overdueNotified: overdueCount,
                escalatedCount: escalatedCount
            };
        } catch (err) {
            console.error('Sweep execution error:', err);
            throw err;
        }
    }

    // 5. Trigger on Checklist Update -> Auto transition to 'In Review' if all complete
    static async handleChecklistCompletion(task, checklist, userName = 'User') {
        if (!Array.isArray(checklist) || checklist.length === 0) return false;

        const allDone = checklist.every(item => item.done);
        if (allDone && task.status !== 'In Review' && task.status !== 'Done') {
            let history = [];
            try { history = JSON.parse(task.history || '[]'); } catch (e) {}
            history.unshift({
                action: 'AUTO_TRANSITION',
                userName: 'System Automation',
                timestamp: new Date().toISOString(),
                details: `All ${checklist.length} checklist items completed by ${userName}. Status automatically moved to 'In Review'.`
            });

            await db.query(`
                UPDATE enterprise_tasks 
                SET status = 'In Review', history = ? 
                WHERE id = ?
            `, [JSON.stringify(history), task.id]);

            let assignees = [];
            try { assignees = JSON.parse(task.assignees || '[]'); } catch (e) {}
            for (const a of assignees) {
                await this.createNotification({
                    userId: a.id,
                    userEmail: a.email,
                    taskId: task.task_key,
                    type: 'status_changed',
                    title: `✨ Checklist Completed: ${task.task_key}`,
                    message: `All checklist items checked! "${task.title}" moved to In Review.`
                });
            }

            await this.logAutomationAction(
                'Checklist Auto-Transition',
                'CHECKLIST_100_PERCENT',
                task.task_key,
                `Moved to In Review (${checklist.length} items checked)`
            );
            return true;
        }
        return false;
    }

    // 6. Trigger on Task Done -> Log completion & spawn Recurring task
    static async handleTaskDone(task, userName = 'User') {
        const now = new Date();

        // 6a. Notify Task Creator
        if (task.created_by) {
            await this.createNotification({
                userId: 'admin',
                userEmail: '',
                taskId: task.task_key,
                type: 'completed',
                title: `🎉 Task Completed: ${task.task_key}`,
                message: `"${task.title}" has been completed by ${userName} at ${now.toLocaleTimeString()}.`
            });
        }

        // 6b. Recurrence Generation
        if (task.recurrence && task.recurrence !== 'None') {
            let nextDue = new Date();
            if (task.recurrence === 'Daily') {
                nextDue.setDate(nextDue.getDate() + 1);
            } else if (task.recurrence === 'Weekly') {
                nextDue.setDate(nextDue.getDate() + 7);
            } else if (task.recurrence === 'Monthly') {
                nextDue.setMonth(nextDue.getMonth() + 1);
            }

            // Generate next task key
            const [maxRows] = await db.query('SELECT MAX(id) as maxId FROM enterprise_tasks');
            const nextId = (maxRows[0]?.maxId || 1000) + 1;
            const nextKey = `TSK-${nextId}`;

            let checklist = [];
            try {
                // Reset checklist done state for next recurring cycle
                checklist = JSON.parse(task.checklist || '[]').map(c => ({ ...c, done: false }));
            } catch (e) {}

            const recurringTitle = `${task.title} (Recurring ${task.recurrence})`;

            await db.query(`
                INSERT INTO enterprise_tasks (
                    task_key, title, description, project, assignees, created_by,
                    department, priority, status, due_date, start_date, estimated_hours,
                    tags, checklist, attachments, comments, recurrence, depends_on, history
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                nextKey, recurringTitle, task.description, task.project, task.assignees, task.created_by,
                task.department, task.priority, 'To Do', nextDue.toISOString().slice(0, 19).replace('T', ' '),
                now.toISOString().slice(0, 19).replace('T', ' '), task.estimated_hours,
                task.tags, JSON.stringify(checklist), JSON.stringify([]), JSON.stringify([]),
                task.recurrence, JSON.stringify([]),
                JSON.stringify([{ action: 'RECURRING_SPAWN', userName: 'System Automation', timestamp: now.toISOString(), details: `Generated from ${task.task_key} upon completion` }])
            ]);

            await this.logAutomationAction(
                'Recurrence Engine',
                'RECURRING_TASK_SPAWNED',
                nextKey,
                `Next occurrence spawned with due date ${nextDue.toLocaleDateString()}`
            );
        }

        // 7. Check if any blocked tasks depended on this completed task
        await this.unblockDependentTasks(task.task_key, userName);
    }

    // 7. Auto-Unblock Dependent Tasks
    static async unblockDependentTasks(completedTaskKey, userName = 'System') {
        try {
            const [blockedTasks] = await db.query(`
                SELECT * FROM enterprise_tasks 
                WHERE status = 'Blocked' AND deleted_at IS NULL
            `);

            for (const bTask of blockedTasks) {
                let dependsOn = [];
                try { dependsOn = JSON.parse(bTask.depends_on || '[]'); } catch (e) {}

                if (dependsOn.includes(completedTaskKey)) {
                    // Check if all other dependencies are also done
                    const remainingDependencies = dependsOn.filter(key => key !== completedTaskKey);
                    let allResolved = true;

                    if (remainingDependencies.length > 0) {
                        const [depRows] = await db.query(`
                            SELECT task_key, status FROM enterprise_tasks 
                            WHERE task_key IN (?) AND status != 'Done'
                        `, [remainingDependencies]);
                        if (depRows.length > 0) allResolved = false;
                    }

                    if (allResolved) {
                        let history = [];
                        try { history = JSON.parse(bTask.history || '[]'); } catch (e) {}
                        history.unshift({
                            action: 'AUTO_UNBLOCKED',
                            userName: 'System Automation',
                            timestamp: new Date().toISOString(),
                            details: `Prerequisite dependency ${completedTaskKey} completed by ${userName}. Status changed from Blocked to To Do.`
                        });

                        await db.query(`
                            UPDATE enterprise_tasks 
                            SET status = 'To Do', history = ? 
                            WHERE id = ?
                        `, [JSON.stringify(history), bTask.id]);

                        let assignees = [];
                        try { assignees = JSON.parse(bTask.assignees || '[]'); } catch (e) {}
                        for (const a of assignees) {
                            await this.createNotification({
                                userId: a.id,
                                userEmail: a.email,
                                taskId: bTask.task_key,
                                type: 'status_changed',
                                title: `🔓 Dependency Unblocked: ${bTask.task_key}`,
                                message: `Prerequisite task ${completedTaskKey} was completed! You can now begin work on "${bTask.title}".`
                            });
                        }

                        await this.logAutomationAction(
                            'Dependency Unblocker',
                            'TASK_UNBLOCKED',
                            bTask.task_key,
                            `Unblocked because ${completedTaskKey} was marked Done`
                        );
                    }
                }
            }
        } catch (err) {
            console.error('Error in unblockDependentTasks:', err);
        }
    }

    // 8. Auto-Assign Onboarding Checklist on New User
    static async handleNewUserOnboarding(newUser) {
        try {
            const [maxRows] = await db.query('SELECT MAX(id) as maxId FROM enterprise_tasks');
            const nextId = (maxRows[0]?.maxId || 1000) + 1;
            const taskKey = `TSK-${nextId}`;

            const onboardingChecklist = [
                { text: 'Set up CRM profile and upload avatar', done: false },
                { text: 'Review Department SLA & Guidelines', done: false },
                { text: 'Complete Workspace security & 2FA setup', done: false },
                { text: 'Attend team intro sprint meeting', done: false }
            ];

            const assignee = [{
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role || 'Employee',
                department: newUser.department || 'Engineering',
                avatar: newUser.profile_image || ''
            }];

            const in7Days = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

            await db.query(`
                INSERT INTO enterprise_tasks (
                    task_key, title, description, project, assignees, created_by,
                    department, priority, status, due_date, estimated_hours, tags, checklist, history
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                taskKey,
                `Onboarding & Workspace Ramp-Up: ${newUser.name}`,
                `Welcome to Apex Dev CRM! Please complete all onboarding milestones listed in the checklist.`,
                'Apex CRM Core',
                JSON.stringify(assignee),
                'System Admin',
                newUser.department || 'Engineering',
                'High',
                'To Do',
                in7Days.toISOString().slice(0, 19).replace('T', ' '),
                8,
                JSON.stringify(['Onboarding', 'Welcome']),
                JSON.stringify(onboardingChecklist),
                JSON.stringify([{ action: 'AUTO_ONBOARDING', userName: 'System Automation', timestamp: new Date().toISOString(), details: `Auto-assigned onboarding template to new user ${newUser.name}` }])
            ]);

            await this.createNotification({
                userId: newUser.id,
                userEmail: newUser.email,
                taskId: taskKey,
                type: 'assigned',
                title: `👋 Welcome to Apex CRM! Onboarding Assigned`,
                message: `Your personalized onboarding task ${taskKey} has been created with initial checklist items.`
            });

            await this.logAutomationAction(
                'Onboarding Template Dispatcher',
                'NEW_USER_ONBOARDING',
                taskKey,
                `Assigned to ${newUser.name} (${newUser.email})`
            );
        } catch (err) {
            console.error('Error assigning onboarding template:', err);
        }
    }

    // 9. Reassign Inactive User's Tasks to Department Lead
    static async handleInactiveUser(inactiveUser) {
        try {
            // Find department lead or fallback to Admin
            const [leads] = await db.query(`
                SELECT * FROM users 
                WHERE department = ? AND (role LIKE '%Lead%' OR role = 'Admin') AND status = 'Active' 
                LIMIT 1
            `, [inactiveUser.department || 'Engineering']);

            const targetLead = leads.length > 0 ? leads[0] : { id: 1, name: 'Sai Ursal', email: 'sai@apexdev.io', role: 'Admin', department: 'Engineering' };

            // Find all open tasks containing this user in assignees JSON
            const [openTasks] = await db.query(`
                SELECT * FROM enterprise_tasks 
                WHERE status != 'Done' AND deleted_at IS NULL
            `);

            let reassignCount = 0;

            for (const task of openTasks) {
                let assignees = [];
                try { assignees = JSON.parse(task.assignees || '[]'); } catch (e) {}

                const hasUser = assignees.some(a => String(a.id) === String(inactiveUser.id) || a.email === inactiveUser.email);
                if (hasUser) {
                    // Replace inactive user with department lead
                    const updatedAssignees = assignees.filter(a => String(a.id) !== String(inactiveUser.id) && a.email !== inactiveUser.email);
                    if (!updatedAssignees.some(a => a.email === targetLead.email)) {
                        updatedAssignees.push({
                            id: targetLead.id,
                            name: targetLead.name,
                            email: targetLead.email,
                            role: targetLead.role,
                            department: targetLead.department,
                            avatar: targetLead.profile_image || ''
                        });
                    }

                    let history = [];
                    try { history = JSON.parse(task.history || '[]'); } catch (e) {}
                    history.unshift({
                        action: 'AUTO_REASSIGNED',
                        userName: 'System Automation',
                        timestamp: new Date().toISOString(),
                        details: `User ${inactiveUser.name} marked Inactive. Reassigned to ${targetLead.name} (${targetLead.role}).`
                    });

                    await db.query(`
                        UPDATE enterprise_tasks 
                        SET assignees = ?, history = ? 
                        WHERE id = ?
                    `, [JSON.stringify(updatedAssignees), JSON.stringify(history), task.id]);

                    reassignCount++;
                }
            }

            if (reassignCount > 0) {
                await this.createNotification({
                    userId: targetLead.id,
                    userEmail: targetLead.email,
                    taskId: 'SYSTEM',
                    type: 'escalated',
                    title: `🔄 Inactive User Reassignment`,
                    message: `${reassignCount} open task(s) from inactive user ${inactiveUser.name} were automatically reassigned to you.`
                });

                await this.logAutomationAction(
                    'Inactive User Task Rebalancer',
                    'USER_INACTIVE_REBALANCE',
                    null,
                    `Reassigned ${reassignCount} tasks from ${inactiveUser.name} to ${targetLead.name}`
                );
            }
        } catch (err) {
            console.error('Error rebalancing inactive user tasks:', err);
        }
    }

    // 11. Parse Comment @Mentions and Trigger Direct Notifications
    static async handleCommentMentions(task, commentText, authorName = 'Someone') {
        if (!commentText || typeof commentText !== 'string') return;

        // Match @Name or @email patterns
        const mentionMatches = commentText.match(/@([\w.-]+(?:\s+[\w.-]+)?)/g);
        if (!mentionMatches) return;

        const [allUsers] = await db.query('SELECT id, name, email FROM users');

        for (const rawMention of mentionMatches) {
            const query = rawMention.replace('@', '').trim().toLowerCase();
            const matchedUser = allUsers.find(u => 
                (u.name && u.name.toLowerCase().includes(query)) ||
                (u.email && u.email.toLowerCase().includes(query))
            );

            if (matchedUser) {
                await this.createNotification({
                    userId: matchedUser.id,
                    userEmail: matchedUser.email,
                    taskId: task.task_key,
                    type: 'comment',
                    title: `💬 You were mentioned in ${task.task_key}`,
                    message: `${authorName} mentioned you: "${commentText.slice(0, 100)}${commentText.length > 100 ? '...' : ''}"`
                });

                await this.logAutomationAction(
                    'Mention Notification Dispatcher',
                    'COMMENT_MENTION',
                    task.task_key,
                    `Mentioned ${matchedUser.name} in comment by ${authorName}`
                );
            }
        }
    }

    // 12. Daily Digest Generator
    static async generateDailyDigests() {
        try {
            const [users] = await db.query("SELECT * FROM users WHERE status = 'Active'");
            const [openTasks] = await db.query("SELECT * FROM enterprise_tasks WHERE status != 'Done' AND deleted_at IS NULL");
            const now = new Date();

            for (const u of users) {
                const userTasks = openTasks.filter(t => {
                    try {
                        const a = JSON.parse(t.assignees || '[]');
                        return a.some(x => String(x.id) === String(u.id) || x.email === u.email);
                    } catch (e) { return false; }
                });

                const overdue = userTasks.filter(t => t.due_date && new Date(t.due_date) < now);

                if (userTasks.length > 0) {
                    await this.createNotification({
                        userId: u.id,
                        userEmail: u.email,
                        taskId: 'DAILY-DIGEST',
                        type: 'digest',
                        title: `☀️ Daily Task Digest (${now.toLocaleDateString()})`,
                        message: `Good morning, ${u.name}! You have ${userTasks.length} active task(s) today (${overdue.length} overdue). Check your My Tasks tab.`
    // 14. Intelligent Optimal Assignee Determiner (Workload Balancing & Role Match)
    static async determineOptimalAssignee({ department = 'Engineering', tags = [] } = {}) {
        try {
            const [users] = await db.query("SELECT id, name, email, role, department, profile_image FROM users WHERE status = 'Active'");
            if (users.length === 0) {
                return {
                    id: 1,
                    name: 'Alex Rivera',
                    email: 'alex.rivera@apexdev.io',
                    role: 'Principal Cloud Architect',
                    department: 'Engineering',
                    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'
                };
            }

            // Fetch current active task counts for all users
            const [tasks] = await db.query("SELECT assignees FROM enterprise_tasks WHERE status != 'Done' AND deleted_at IS NULL");
            const workloadMap = {};
            users.forEach(u => { workloadMap[u.id] = 0; });

            tasks.forEach(t => {
                try {
                    const assignees = JSON.parse(t.assignees || '[]');
                    assignees.forEach(a => {
                        if (workloadMap[a.id] !== undefined) {
                            workloadMap[a.id]++;
                        }
                    });
                } catch (e) {}
            });

            // Filter by department if available
            let candidates = users.filter(u => u.department && u.department.toLowerCase() === department.toLowerCase());
            if (candidates.length === 0) candidates = users;

            // Sort candidates by lowest workload
            candidates.sort((a, b) => (workloadMap[a.id] || 0) - (workloadMap[b.id] || 0));
            const chosen = candidates[0];

            return {
                id: chosen.id,
                name: chosen.name,
                email: chosen.email,
                role: chosen.role || 'Specialist',
                department: chosen.department || department,
                avatar: chosen.profile_image || ''
            };
        } catch (err) {
            console.error('Error determining optimal assignee:', err);
            return {
                id: 1,
                name: 'Sarah Jenkins',
                email: 'sarah.j@apexdev.io',
                role: 'Product Lead & Scrum Master',
                department: 'Product & Delivery',
                avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200'
            };
        }
    }

    // 15. Auto-Assign All Unassigned Tasks in System
    static async autoAssignAllUnassigned() {
        try {
            const [unassignedTasks] = await db.query(`
                SELECT * FROM enterprise_tasks 
                WHERE status != 'Done' AND deleted_at IS NULL 
                AND (assignees IS NULL OR assignees = '[]' OR assignees = '' OR assignees = 'null')
            `);

            let assignedCount = 0;
            const assignmentLog = [];

            for (const task of unassignedTasks) {
                const optimalAssignee = await this.determineOptimalAssignee({
                    department: task.department,
                    tags: typeof task.tags === 'string' ? JSON.parse(task.tags || '[]') : []
                });

                const assigneesArr = [optimalAssignee];
                let history = [];
                try { history = JSON.parse(task.history || '[]'); } catch (e) {}
                history.unshift({
                    action: 'AUTO_ASSIGNED',
                    userName: 'System AI Engine',
                    timestamp: new Date().toISOString(),
                    details: `Auto-assigned to ${optimalAssignee.name} based on lowest active workload & department matching.`
                });

                await db.query(`
                    UPDATE enterprise_tasks 
                    SET assignees = ?, history = ? 
                    WHERE id = ?
                `, [JSON.stringify(assigneesArr), JSON.stringify(history), task.id]);

                await this.onTaskAssigned(task, assigneesArr, 'System AI Engine');
                assignedCount++;
                assignmentLog.push({ task_key: task.task_key, assigned_to: optimalAssignee.name });
            }

            await this.logAutomationAction(
                'Auto-Assignment Engine',
                'BULK_AUTO_ASSIGN',
                null,
                `Automatically assigned ${assignedCount} pending tasks to team members based on capacity.`
            );

            return { success: true, count: assignedCount, assignments: assignmentLog };
        } catch (err) {
            console.error('Error auto-assigning all unassigned tasks:', err);
            throw err;
        }
    }

    // 16. Auto-Rebalance Workload Engine
    static async autoRebalanceWorkload() {
        try {
            const [users] = await db.query("SELECT id, name, email, role, department FROM users WHERE status = 'Active'");
            const [openTasks] = await db.query("SELECT * FROM enterprise_tasks WHERE status = 'To Do' AND deleted_at IS NULL");

            // Calculate workload per user
            const userTaskMap = {};
            users.forEach(u => { userTaskMap[u.id] = []; });

            openTasks.forEach(t => {
                try {
                    const assignees = JSON.parse(t.assignees || '[]');
                    assignees.forEach(a => {
                        if (userTaskMap[a.id]) {
                            userTaskMap[a.id].push(t);
                        }
                    });
                } catch (e) {}
            });

            let rebalancedCount = 0;
            const rebalanceDetails = [];

            // Identify overloaded users (> 6 To Do tasks) and underloaded (< 3 To Do tasks)
            for (const user of users) {
                const userTasks = userTaskMap[user.id] || [];
                if (userTasks.length > 5) {
                    const tasksToShift = userTasks.slice(4); // Shift extra tasks
                    const deptPeers = users.filter(u => u.id !== user.id && (u.department === user.department || !u.department));

                    for (const task of tasksToShift) {
                        deptPeers.sort((a, b) => (userTaskMap[a.id]?.length || 0) - (userTaskMap[b.id]?.length || 0));
                        const targetPeer = deptPeers[0];

                        if (targetPeer && (userTaskMap[targetPeer.id]?.length || 0) < userTasks.length) {
                            const newAssignee = [{
                                id: targetPeer.id,
                                name: targetPeer.name,
                                email: targetPeer.email,
                                role: targetPeer.role || 'Specialist',
                                department: targetPeer.department || user.department,
                                avatar: targetPeer.profile_image || ''
                            }];

                            let history = [];
                            try { history = JSON.parse(task.history || '[]'); } catch (e) {}
                            history.unshift({
                                action: 'AUTO_REBALANCED',
                                userName: 'System Workload Balancer',
                                timestamp: new Date().toISOString(),
                                details: `Rebalanced task from ${user.name} to ${targetPeer.name} to maintain capacity threshold.`
                            });

                            await db.query(`
                                UPDATE enterprise_tasks 
                                SET assignees = ?, history = ? 
                                WHERE id = ?
                            `, [JSON.stringify(newAssignee), JSON.stringify(history), task.id]);

                            userTaskMap[targetPeer.id].push(task);
                            rebalancedCount++;
                            rebalanceDetails.push({ task_key: task.task_key, from: user.name, to: targetPeer.name });
                        }
                    }
                }
            }

            await this.logAutomationAction(
                'Workload Capacity Balancer',
                'AUTO_REBALANCE',
                null,
                `Rebalanced ${rebalancedCount} tasks across team members.`
            );

            return { success: true, rebalancedCount, details: rebalanceDetails };
        } catch (err) {
            console.error('Error auto-rebalancing workload:', err);
            throw err;
        }
    }

    // 17. Automated Sprint Deliverables Generator
    static async generateSprintDeliverables(projectName = 'Beyond Gravity', creatorName = 'System Admin') {
        try {
            const standardSprintDeliverables = [
                {
                    title: 'Core System Topology & High-Availability Cloud Architecture',
                    description: 'Provision containerized microservices, configure MySQL connection pooling, setup Redis caching and load balancer endpoints.',
                    department: 'Architecture & Cloud',
                    priority: 'High',
                    points: 5,
                    tags: ['Architecture', 'Cloud', 'DevOps'],
                    assignee: {
                        name: 'Alex Rivera',
                        role: 'Principal Cloud Architect',
                        email: 'alex.rivera@apexdev.io',
                        department: 'Architecture & Cloud',
                        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'
                    }
                },
                {
                    title: 'Interactive UI/UX Design System & Theme Token Standardization',
                    description: 'Audit dual-theme contrast ratios, implement 60-30-10 palette rules, and refine mobile touch targets across all customer-facing views.',
                    department: 'Design & Experience',
                    priority: 'Medium',
                    points: 3,
                    tags: ['UI/UX', 'Frontend', 'Accessibility'],
                    assignee: {
                        name: 'Elena Rostova',
                        role: 'Senior UI/UX & Frontend Lead',
                        email: 'elena.rostova@apexdev.io',
                        department: 'Design & Experience',
                        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
                    }
                },
                {
                    title: 'Automated CRM Workflow Engines & Event Dispatchers',
                    description: 'Build automated lead capture hooks, pipeline stage triggers, background sweeper cron jobs, and real-time notification sockets.',
                    department: 'Engineering',
                    priority: 'High',
                    points: 8,
                    tags: ['Backend', 'Automation', 'API'],
                    assignee: {
                        name: 'Michael Vance',
                        role: 'Senior Full-Stack Lead',
                        email: 'michael.vance@apexdev.io',
                        department: 'Engineering',
                        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200'
                    }
                },
                {
                    title: 'Sprint Scope Planning & Enterprise Stakeholder Alignment',
                    description: 'Define sprint backlog epics, estimate velocity metrics, schedule daily standups, and establish sprint acceptance criteria.',
                    department: 'Product & Delivery',
                    priority: 'Medium',
                    points: 2,
                    tags: ['Agile', 'Scrum', 'Management'],
                    assignee: {
                        name: 'Sarah Jenkins',
                        role: 'Product Lead & Scrum Master',
                        email: 'sarah.j@apexdev.io',
                        department: 'Product & Delivery',
                        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200'
                    }
                },
                {
                    title: 'Automated End-to-End QA Testing & OWASP Security Audit',
                    description: 'Execute integration test suites, verify role-based access controls (RBAC), run token validation scans, and audit SQL query parameterization.',
                    department: 'Quality & Security',
                    priority: 'High',
                    points: 5,
                    tags: ['QA', 'Security', 'Testing'],
                    assignee: {
                        name: 'Claire Redfield',
                        role: 'QA Lead & Security Specialist',
                        email: 'claire.redfield@apexdev.io',
                        department: 'Quality & Security',
                        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200'
                    }
                },
                {
                    title: 'Automated CI/CD Pipeline & Production Blue/Green Deployment',
                    description: 'Configure automated build verification webhooks, zero-downtime rolling updates, automated rollback scripts, and monitoring telemetry.',
                    department: 'DevOps & Reliability',
                    priority: 'Medium',
                    points: 3,
                    tags: ['CI/CD', 'Docker', 'Reliability'],
                    assignee: {
                        name: 'David Kim',
                        role: 'DevOps & Site Reliability Lead',
                        email: 'david.kim@apexdev.io',
                        department: 'DevOps & Reliability',
                        avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200'
                    }
                }
            ];

            const createdTasks = [];
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 7);

            for (const item of standardSprintDeliverables) {
                const [maxRows] = await db.query('SELECT MAX(id) as maxId FROM enterprise_tasks');
                const nextId = (maxRows[0]?.maxId || 1000) + 1;
                const taskKey = `TSK-${nextId}`;

                const assigneeArr = [{
                    id: String(Date.now()).slice(-4),
                    name: item.assignee.name,
                    email: item.assignee.email,
                    role: item.assignee.role,
                    department: item.assignee.department,
                    avatar: item.assignee.avatar
                }];

                const history = [{
                    action: 'AUTO_GENERATED',
                    userName: creatorName,
                    timestamp: new Date().toISOString(),
                    details: `Sprint deliverable automatically generated and assigned to ${item.assignee.name} (${item.assignee.role})`
                }];

                const [result] = await db.query(`
                    INSERT INTO enterprise_tasks (
                        task_key, title, description, project, assignees, created_by,
                        department, priority, status, due_date, estimated_hours,
                        tags, checklist, history
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    taskKey,
                    item.title,
                    item.description,
                    projectName,
                    JSON.stringify(assigneeArr),
                    creatorName,
                    item.department,
                    item.priority,
                    'To Do',
                    tomorrow.toISOString().slice(0, 19).replace('T', ' '),
                    item.points * 2.5,
                    JSON.stringify(item.tags),
                    JSON.stringify([
                        { text: 'Review acceptance criteria and design specs', done: false },
                        { text: 'Execute technical implementation & automated tests', done: false },
                        { text: 'Submit code review & verify staging rollout', done: false }
                    ]),
                    JSON.stringify(history)
                ]);

                const newTask = { id: result.insertId, task_key: taskKey, title: item.title, due_date: tomorrow, priority: item.priority };
                await this.onTaskAssigned(newTask, assigneeArr, creatorName);
                createdTasks.push(newTask);
            }

            await this.logAutomationAction(
                'Sprint Automation Engine',
                'SPRINT_TASKS_GENERATED',
                null,
                `Auto-generated ${createdTasks.length} standard sprint deliverables distributed across professional lead roles.`
            );

            return { success: true, count: createdTasks.length, tasks: createdTasks };
        } catch (err) {
            console.error('Error generating sprint deliverables:', err);
            throw err;
        }
    }
}

module.exports = TaskAutomationEngine;

