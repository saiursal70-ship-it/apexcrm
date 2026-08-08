const express = require('express');
const db = require('../config/db');
const authMiddleware = require('../middleware/auth');

/**
 * Generic CRUD router factory.
 * Creates GET(all), GET(:id), POST, PUT(:id), DELETE(:id) routes
 * for any table, restricted to a whitelist of allowed columns
 * (prevents SQL injection via unexpected field names).
 */
function createCrudRouter(tableName, allowedFields) {
    const router = express.Router();
    router.use(authMiddleware);

    // GET all (supports ?search= and pagination ?page=1&limit=50)
    router.get('/', async (req, res) => {
        try {
            const { search, page, limit } = req.query;
            let sql = `SELECT * FROM \`${tableName}\``;
            let params = [];

            if (search) {
                const likeConditions = allowedFields.map(f => `\`${f}\` LIKE ?`).join(' OR ');
                sql += ` WHERE ${likeConditions}`;
                params = allowedFields.map(() => `%${search}%`);
            }
            sql += ' ORDER BY id DESC';

            if (limit) {
                const lim = parseInt(limit, 10) || 50;
                const p = parseInt(page, 10) || 1;
                const offset = (p - 1) * lim;
                sql += ` LIMIT ${lim} OFFSET ${offset}`;
            }

            const [rows] = await db.query(sql, params);
            res.json(rows);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    // GET single
    router.get('/:id', async (req, res) => {
        try {
            const [rows] = await db.query(`SELECT * FROM \`${tableName}\` WHERE id = ?`, [req.params.id]);
            if (rows.length === 0) return res.status(404).json({ error: 'Record not found' });
            res.json(rows[0]);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    // CREATE
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
            res.status(201).json({ id: result.insertId, message: 'Record created successfully' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    // UPDATE
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
            res.json({ message: 'Record updated successfully' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    // DELETE
    router.delete('/:id', async (req, res) => {
        try {
            const [result] = await db.query(`DELETE FROM \`${tableName}\` WHERE id = ?`, [req.params.id]);
            if (result.affectedRows === 0) return res.status(404).json({ error: 'Record not found' });
            res.json({ message: 'Record deleted successfully' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    return router;
}

module.exports = createCrudRouter;
