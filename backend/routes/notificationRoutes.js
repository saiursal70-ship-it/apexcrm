const express = require('express');
const router = express.Router();
const db = require('../config/db');

// -------------------------------------------------------------
// GET /api/notifications - List notifications (optionally filtered by user)
// -------------------------------------------------------------
router.get('/', async (req, res) => {
    try {
        const { user_email, user_id } = req.query;
        let query = 'SELECT * FROM task_notifications';
        const params = [];

        if (user_email || user_id) {
            query += ' WHERE user_email = ? OR user_id = ? OR user_id = "admin"';
            params.push(user_email || '', String(user_id || ''));
        }

        query += ' ORDER BY created_at DESC LIMIT 50';

        const [rows] = await db.query(query, params);

        const unreadCount = rows.filter(r => !r.read_status).length;

        return res.json({
            notifications: rows,
            unreadCount
        });
    } catch (err) {
        console.error('Error fetching notifications:', err);
        return res.status(500).json({ error: err.message });
    }
});

// -------------------------------------------------------------
// PUT /api/notifications/:id/read - Mark notification as read
// -------------------------------------------------------------
router.put('/:id/read', async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('UPDATE task_notifications SET read_status = 1 WHERE id = ?', [id]);
        return res.json({ success: true });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// -------------------------------------------------------------
// PUT /api/notifications/mark-all-read - Mark all notifications read
// -------------------------------------------------------------
router.put('/mark-all-read', async (req, res) => {
    try {
        const { user_email, user_id } = req.body;
        if (user_email || user_id) {
            await db.query('UPDATE task_notifications SET read_status = 1 WHERE user_email = ? OR user_id = ?', [user_email || '', String(user_id || '')]);
        } else {
            await db.query('UPDATE task_notifications SET read_status = 1');
        }
        return res.json({ success: true, message: 'All notifications marked as read' });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// -------------------------------------------------------------
// DELETE /api/notifications/:id - Dismiss notification
// -------------------------------------------------------------
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM task_notifications WHERE id = ?', [id]);
        return res.json({ success: true, message: 'Notification dismissed' });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

module.exports = router;
