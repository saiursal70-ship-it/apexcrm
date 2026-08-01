const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = function authMiddleware(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // "Bearer <token>"

    if (!token) {
        return res.status(401).json({ error: 'No token provided. Please login.' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token. Please login again.' });
        }
        req.user = decoded;
        next();
    });
};
