const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const entityRoutes = require('./routes/entityRoutes');
const kanbanRoutes = require('./routes/kanbanRoutes');
const workflowRoutes = require('./routes/workflowRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/workflow', workflowRoutes);
app.post('/api/leads/webhook', (req, res, next) => {
    req.url = '/lead-webhook';
    workflowRoutes(req, res, next);
});
app.use('/api/v1/kanban', kanbanRoutes);
app.use('/api/kanban', kanbanRoutes);
app.use('/api', entityRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'CRM API Server is running' });
});

// Serve frontend static assets
app.use(express.static(path.join(__dirname, '../frontend/build')));
app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
    }
});

const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, () => {
    console.log(`🚀 CRM server running on http://localhost:${PORT}`);
});

// Handle server errors cleanly (e.g. if port is already in use)
server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.log(`\n⚠️ Port ${PORT} is already in use by an active CRM server process.`);
        console.log(`✅ Your backend API is ALREADY RUNNING on http://localhost:${PORT}`);
        process.exit(0);
    } else {
        console.error('❌ Server error:', err);
    }
});