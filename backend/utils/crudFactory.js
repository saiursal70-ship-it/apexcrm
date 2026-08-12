const express = require('express');
const db = require('../config/db');
const authMiddleware = require('../middleware/auth');

/**
 * Enterprise CRUD Router Factory
 * Includes:
 * 1. Soft Deletes (Trash & Instant Restore)
 * 2. Automatic Audit Trail Logging
 * 3. Faceted Multi-Filter Query Support
 * 4. SQL Injection Protection & Whitelist Verification
 * 5. Pagination & Indexed Querying
 */
function createCrudRouter(tableName, allowedFields) {
    const router = express.Router();
    router.use(authMiddleware);

    // Audit Logging Helper
    const logAudit = async (req, action, recordId, details = {}) => {
        try {
            const userId = req.user?.id || null;
            const userEmail = req.user?.email || 'system';
            const ip = req.ip || req.connection?.remoteAddress || '127.0.0.1';
            await db.query(
                `INSERT INTO audit_logs (user_id, user_email, action, entity, record_id, details, ip_address)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [userId, userEmail, action, tableName, recordId, JSON.stringify(details), ip]
            );
        } catch (err) {
            console.warn(`[AuditLog Warning] ${tableName} log failed:`, err.message);
        }
    };

    // GET all records (supports ?search=, ?trash=true, faceted field filters, ?page=1&limit=50)
    router.get('/', async (req, res) => {
        try {
            const { search, trash, page, limit, sort, order } = req.query;
            let conditions = [];
            let params = [];

            // 1. Soft Delete Filter
            if (trash === 'true' || trash === true) {
                conditions.push('deleted_at IS NOT NULL');
            } else {
                conditions.push('deleted_at IS NULL');
            }

            // 2. Global Search across whitelist fields
            if (search && search.trim() !== '') {
                const searchPattern = `%${search.trim()}%`;
                const searchClauses = allowedFields.map(f => `\`${f}\` LIKE ?`).join(' OR ');
                conditions.push(`(${searchClauses})`);
                allowedFields.forEach(() => params.push(searchPattern));
            }

            // 3. Faceted Column Filters (e.g. ?stage=Negotiation&priority=High)
            for (const field of allowedFields) {
                if (req.query[field] !== undefined && req.query[field] !== '') {
                    conditions.push(`\`${field}\` = ?`);
                    params.push(req.query[field]);
                }
            }

            const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

            // 4. Safe Sorting
            let sortField = 'id';
            if (sort && allowedFields.includes(sort)) {
                sortField = sort;
            }
            const sortOrder = (order && order.toUpperCase() === 'ASC') ? 'ASC' : 'DESC';

            let sql = `SELECT * FROM \`${tableName}\` ${whereClause} ORDER BY \`${sortField}\` ${sortOrder}`;

            // 5. Pagination
            if (limit) {
                const lim = Math.max(1, parseInt(limit, 10) || 50);
                const p = Math.max(1, parseInt(page, 10) || 1);
                const offset = (p - 1) * lim;
                sql += ` LIMIT ${lim} OFFSET ${offset}`;
            }

            const [rows] = await db.query(sql, params);
            res.json(rows);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    // GET Single Record
    router.get('/:id', async (req, res) => {
        try {
            const [rows] = await db.query(`SELECT * FROM \`${tableName}\` WHERE id = ?`, [req.params.id]);
            if (rows.length === 0) return res.status(404).json({ error: 'Record not found' });
            res.json(rows[0]);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    // CREATE Record
    router.post('/', async (req, res) => {
        try {
            const fields = allowedFields.filter(f => req.body[f] !== undefined);
            if (fields.length === 0) return res.status(400).json({ error: 'No valid fields provided' });

            const columns = fields.map(f => `\`${f}\``).join(', ');
            const placeholders = fields.map(() => '?').join(', ');
            const values = fields.map(f => req.body[f]);

            const [result] = await db.query(
                `INSERT INTO \`${tableName}\` (${columns}) VALUES (${placeholders})`,
                values
            );

            const newId = result.insertId;
            await logAudit(req, 'CREATE', newId, req.body);

            res.status(201).json({ id: newId, message: 'Record created successfully' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    // UPDATE Record
    router.put('/:id', async (req, res) => {
        try {
            const fields = allowedFields.filter(f => req.body[f] !== undefined);
            if (fields.length === 0) return res.status(400).json({ error: 'No valid fields provided' });

            const setClause = fields.map(f => `\`${f}\` = ?`).join(', ');
            const values = fields.map(f => req.body[f]);
            values.push(req.params.id);

            const [result] = await db.query(
                `UPDATE \`${tableName}\` SET ${setClause} WHERE id = ?`,
                values
            );

            if (result.affectedRows === 0) return res.status(404).json({ error: 'Record not found' });

            await logAudit(req, 'UPDATE', req.params.id, req.body);

            res.json({ message: 'Record updated successfully' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    // RESTORE Soft-Deleted Record
    router.post('/:id/restore', async (req, res) => {
        try {
            const [result] = await db.query(
                `UPDATE \`${tableName}\` SET deleted_at = NULL WHERE id = ?`,
                [req.params.id]
            );

            if (result.affectedRows === 0) return res.status(404).json({ error: 'Record not found or not in trash' });

            await logAudit(req, 'RESTORE', req.params.id);
            res.json({ message: 'Record restored successfully' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    // DELETE (Soft Delete by default; Hard Delete if ?permanent=true)
    router.delete('/:id', async (req, res) => {
        try {
            const isPermanent = req.query.permanent === 'true' || req.query.permanent === true;
            let result;

            if (isPermanent) {
                [result] = await db.query(`DELETE FROM \`${tableName}\` WHERE id = ?`, [req.params.id]);
                await logAudit(req, 'HARD_DELETE', req.params.id);
            } else {
                [result] = await db.query(`UPDATE \`${tableName}\` SET deleted_at = NOW() WHERE id = ?`, [req.params.id]);
                await logAudit(req, 'SOFT_DELETE', req.params.id);
            }

            if (result.affectedRows === 0) return res.status(404).json({ error: 'Record not found' });

            res.json({ message: isPermanent ? 'Record permanently deleted' : 'Record moved to trash' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    return router;
}

module.exports = createCrudRouter;
