const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/stats', async (req, res) => {
    try {
        const [[{ totalLeads }]] = await db.query('SELECT COUNT(*) AS totalLeads FROM leads');
        const [[{ totalDeals }]] = await db.query('SELECT COUNT(*) AS totalDeals FROM deals');
        const [[{ openOpportunities }]] = await db.query(
            "SELECT COUNT(*) AS openOpportunities FROM deals WHERE stage NOT IN ('Closed Won','Closed Lost')"
        );
        const [[{ totalClients }]] = await db.query('SELECT COUNT(*) AS totalClients FROM accounts');
        const [[{ revenueThisMonth }]] = await db.query(
            `SELECT COALESCE(SUM(amount),0) AS revenueThisMonth FROM invoices
             WHERE payment_status = 'Paid' AND MONTH(invoice_date) = MONTH(CURDATE()) AND YEAR(invoice_date) = YEAR(CURDATE())`
        );

        // Additional KPI metrics: Win Rate, Weighted Forecast, Revenue Target
        const [[{ closedWon }]] = await db.query("SELECT COUNT(*) AS closedWon FROM deals WHERE stage = 'Closed Won'");
        const [[{ weightedForecast }]] = await db.query(
            "SELECT COALESCE(SUM(value * (probability / 100)), 0) AS weightedForecast FROM deals WHERE stage NOT IN ('Closed Won','Closed Lost')"
        );

        const winRate = totalDeals > 0 ? Math.round((closedWon / totalDeals) * 100) : 0;
        const monthlyTarget = 1000000; // Target ₹10,00,000
        const targetProgress = Math.min(100, Math.round((revenueThisMonth / monthlyTarget) * 100));

        // Sales pipeline (deals grouped by stage)
        const [pipeline] = await db.query(
            `SELECT stage, COUNT(*) AS count FROM deals GROUP BY stage`
        );

        // Leads source breakdown
        const [leadsSource] = await db.query(
            `SELECT COALESCE(source, 'Other') AS source, COUNT(*) AS count FROM leads GROUP BY source`
        );

        // Revenue overview - last 6 months
        const [revenueOverview] = await db.query(
            `SELECT DATE_FORMAT(invoice_date, '%b') AS month, SUM(amount) AS total
             FROM invoices
             WHERE invoice_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
             GROUP BY DATE_FORMAT(invoice_date, '%Y-%m'), DATE_FORMAT(invoice_date, '%b')
             ORDER BY MIN(invoice_date)`
        );

        // Top deals by value
        const [topDeals] = await db.query(
            `SELECT deal_name, account_name, value FROM deals ORDER BY value DESC LIMIT 5`
        );

        // Upcoming tasks
        const [upcomingTasks] = await db.query(
            `SELECT id, task_name, due_date, status FROM tasks
             WHERE status != 'Completed' ORDER BY due_date ASC LIMIT 6`
        );

        // Recent activity feed (latest across leads, deals, tasks, invoices)
        const [recentLeads] = await db.query(`SELECT lead_name AS label, 'New lead added' AS action, created_at FROM leads ORDER BY created_at DESC LIMIT 3`);
        const [recentDeals] = await db.query(`SELECT deal_name AS label, 'Deal updated' AS action, created_at FROM deals ORDER BY created_at DESC LIMIT 3`);
        const [recentInvoices] = await db.query(`SELECT invoice_number AS label, 'Invoice created' AS action, created_at FROM invoices ORDER BY created_at DESC LIMIT 3`);
        const recentActivities = [...recentLeads, ...recentDeals, ...recentInvoices]
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 6);

        res.json({
            totalLeads, totalDeals, openOpportunities, totalClients, revenueThisMonth,
            winRate, weightedForecast, monthlyTarget, targetProgress, closedWon,
            pipeline, leadsSource, revenueOverview, topDeals, upcomingTasks, recentActivities
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
