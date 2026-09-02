const express = require('express');
const router = express.Router();
const db = require('../config/db');
const TaskAutomationEngine = require('../utils/taskAutomationEngine');

// -------------------------------------------------------------
// GET /api/users - Live User Directory with active task counts
// -------------------------------------------------------------
router.get('/', async (req, res) => {
    try {
        const [users] = await db.query(`
            SELECT id, name, email, role, department, status, profile_image, created_at 
            FROM users 
            ORDER BY id ASC
        `);

        const [tasks] = await db.query(`
            SELECT assignees FROM enterprise_tasks 
            WHERE status != 'Done' AND deleted_at IS NULL
        `);

        // Compute active task counts per user from live enterprise_tasks
        const enrichedUsers = users.map(user => {
            let activeTaskCount = 0;
            for (const t of tasks) {
                try {
                    const assignees = typeof t.assignees === 'string' ? JSON.parse(t.assignees || '[]') : (t.assignees || []);
                    if (assignees.some(a => String(a.id) === String(user.id) || a.email === user.email || a.name === user.name)) {
                        activeTaskCount++;
                    }
                } catch (e) {}
            }

            return {
                ...user,
                department: user.department || 'Engineering',
                status: user.status || 'Active',
                activeTaskCount
            };
        });

        return res.json(enrichedUsers);
    } catch (err) {
        console.error('Error fetching users:', err);
        return res.status(500).json({ error: err.message });
    }
});

// -------------------------------------------------------------
// PUT /api/users/:id/status - Update Status (Triggers Inactive Reassignment Rule)
// -------------------------------------------------------------
router.put('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status || !['Active', 'Inactive', 'Suspended'].includes(status)) {
            return res.status(400).json({ error: 'Valid status required: Active, Inactive, Suspended' });
        }

        const [existing] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
        if (existing.length === 0) return res.status(404).json({ error: 'User not found' });

        const user = existing[0];
        await db.query('UPDATE users SET status = ? WHERE id = ?', [status, id]);

        // Rule 9: If user is set to Inactive, auto-reassign open tasks to department lead
        if (status === 'Inactive') {
            await TaskAutomationEngine.handleInactiveUser({ ...user, status });
        }

        return res.json({
            success: true,
            message: `User status updated to ${status}`,
            user: { ...user, status }
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// -------------------------------------------------------------
// POST /api/users - Add user & trigger Onboarding Rule
// -------------------------------------------------------------
router.post('/', async (req, res) => {
    try {
        const { name, email, role, department, status, profile_image } = req.body;
        if (!name || !email) return res.status(400).json({ error: 'Name and email are required' });

        const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email.trim().toLowerCase()]);
        if (existing.length > 0) return res.status(409).json({ error: 'User with this email already exists' });

        const avatar = profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=2563eb&color=fff`;

        const [result] = await db.query(
            'INSERT INTO users (name, email, password, role, department, status, profile_image) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [name.trim(), email.trim().toLowerCase(), '$2a$10$ynUuSHyG75NK9D6U7AjcbOuqCUpY3ANGv14FHGouzjIyWHJTadSL6', role || 'Employee', department || 'Engineering', status || 'Active', avatar]
        );

        const newUser = {
            id: result.insertId,
            name: name.trim(),
            email: email.trim().toLowerCase(),
            role: role || 'Employee',
            department: department || 'Engineering',
            status: status || 'Active',
            profile_image: avatar
        };

        // Rule 8: Auto-assign Onboarding task
        await TaskAutomationEngine.handleNewUserOnboarding(newUser);

        return res.status(201).json(newUser);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

module.exports = router;
