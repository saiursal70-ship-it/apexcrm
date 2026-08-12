const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// GET High-Performance Parallel Aggregated Dashboard Metrics
router.get('/stats', async (req, res) => {
    try {
        const [
            [[{ totalLeads }]],
            [[{ totalDeals }]],
            [[{ openOpportunities }]],
            [[{ totalClients }]],
            [[{ revenueThisMonth }]],
            [[{ totalRevenue }]],
            [[{ closedWon }]],
            [[{ closedWonRevenue }]],
            [[{ weightedForecast }]],
            [pipeline],
            [leadsSource],
            [revenueOverview],
            [topDeals],
            [upcomingTasks],
            [recentActivities]
        ] = await Promise.all([
            // 1. Total active leads
            db.query('SELECT COUNT(*) AS totalLeads FROM leads WHERE deleted_at IS NULL'),

            // 2. Total active deals
            db.query('SELECT COUNT(*) AS totalDeals FROM deals WHERE deleted_at IS NULL'),

            // 3. Open pipeline opportunities
            db.query("SELECT COUNT(*) AS openOpportunities FROM deals WHERE deleted_at IS NULL AND stage NOT IN ('Closed Won', 'Closed Lost')"),

            // 4. Total accounts / clients
            db.query('SELECT COUNT(*) AS totalClients FROM accounts WHERE deleted_at IS NULL'),

            // 5. Revenue this month from paid invoices
            db.query(`
                SELECT COALESCE(SUM(amount), 0) AS revenueThisMonth FROM invoices
                WHERE deleted_at IS NULL AND payment_status = 'Paid'
                  AND MONTH(invoice_date) = MONTH(CURDATE()) AND YEAR(invoice_date) = YEAR(CURDATE())
            `),

            // 6. Total all-time collected revenue from paid invoices
            db.query(`
                SELECT COALESCE(SUM(amount), 0) AS totalRevenue FROM invoices
                WHERE deleted_at IS NULL AND payment_status = 'Paid'
            `),

            // 7. Closed won deals count
            db.query("SELECT COUNT(*) AS closedWon FROM deals WHERE deleted_at IS NULL AND stage = 'Closed Won'"),

            // 8. Closed won deals revenue value
            db.query("SELECT COALESCE(SUM(value), 0) AS closedWonRevenue FROM deals WHERE deleted_at IS NULL AND stage = 'Closed Won'"),

            // 7. Weighted pipeline forecast
            db.query(`
                SELECT COALESCE(SUM(value * (probability / 100)), 0) AS weightedForecast
                FROM deals
                WHERE deleted_at IS NULL AND stage NOT IN ('Closed Won', 'Closed Lost')
            `),

            // 8. Pipeline stage breakdown
            db.query('SELECT stage, COUNT(*) AS count FROM deals WHERE deleted_at IS NULL GROUP BY stage'),

            // 9. Lead sources
            db.query("SELECT COALESCE(source, 'Other') AS source, COUNT(*) AS count FROM leads WHERE deleted_at IS NULL GROUP BY source"),

            // 10. Revenue trend past 6 months
            db.query(`
                SELECT DATE_FORMAT(invoice_date, '%b') AS month, SUM(amount) AS total
                FROM invoices
                WHERE deleted_at IS NULL AND invoice_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
                GROUP BY DATE_FORMAT(invoice_date, '%Y-%m'), DATE_FORMAT(invoice_date, '%b')
                ORDER BY MIN(invoice_date)
            `),

            // 11. Top deals by value
            db.query('SELECT id, deal_name, account_name, value FROM deals WHERE deleted_at IS NULL ORDER BY value DESC LIMIT 5'),

            // 12. Upcoming pending tasks
            db.query("SELECT id, task_name, due_date, status, priority FROM tasks WHERE deleted_at IS NULL AND status != 'Completed' ORDER BY due_date ASC LIMIT 6"),

            // 13. Recent audit activity stream
            db.query(`
                SELECT id, action, entity, record_id, user_email, created_at
                FROM audit_logs
                ORDER BY created_at DESC
                LIMIT 8
            `)
        ]);

        const winRate = totalDeals > 0 ? Math.round((closedWon / totalDeals) * 100) : 0;
        const monthlyTarget = 1000000; // Target ₹10,00,000
        const targetProgress = Math.min(100, Math.round((revenueThisMonth / monthlyTarget) * 100));

        // Format recent activity feed
        const formattedActivities = recentActivities.length > 0
            ? recentActivities.map(a => ({
                id: a.id,
                label: `${a.action} ${a.entity} #${a.record_id || ''}`,
                action: a.user_email ? `by ${a.user_email}` : 'System event',
                created_at: a.created_at
            }))
            : [
                { id: 1, label: 'Pipeline sync completed', action: 'System check', created_at: new Date() },
                { id: 2, label: 'Security audit active', action: 'System monitor', created_at: new Date() }
            ];

        res.json({
            totalLeads,
            totalDeals,
            openOpportunities,
            totalClients,
            revenueThisMonth,
            totalRevenue,
            closedWonRevenue,
            winRate,
            weightedForecast,
            monthlyTarget,
            targetProgress,
            closedWon,
            pipeline,
            leadsSource,
            revenueOverview,
            topDeals,
            upcomingTasks,
            recentActivities: formattedActivities
        });
    } catch (err) {
        console.error('❌ Dashboard stats error:', err);
        res.status(500).json({ error: err.message });
    }
});

// GET Full Audit Trail Log with Filter & Search
router.get('/audit-logs', async (req, res) => {
    try {
        const { entity, action, limit = 50 } = req.query;
        let conditions = [];
        let params = [];

        if (entity) {
            conditions.push('entity = ?');
            params.push(entity);
        }
        if (action) {
            conditions.push('action = ?');
            params.push(action);
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
        const [rows] = await db.query(
            `SELECT * FROM audit_logs ${whereClause} ORDER BY created_at DESC LIMIT ?`,
            [...params, parseInt(limit, 10) || 50]
        );

        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
