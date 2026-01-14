const express = require('express');
const cors = require('cors');
const sequelize = require('./src/config/database');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', require('./src/routes/authRoutes'));
app.use('/sermons', require('./src/routes/sermonRoutes'));
app.use('/users', require('./src/routes/userRoutes'));
app.use('/companies', require('./src/routes/companyRoutes'));
app.use('/plans', require('./src/routes/planRoutes'));

// Database connection & Sync logic
// In production/serverless, sync is risky on every request.
// Only sync if in dev or if SYNC_DB env var is explicitly set.
if (process.env.NODE_ENV !== 'production' || process.env.SYNC_DB === 'true') {
    sequelize.sync({ alter: true })
        .then(() => console.log('Database connected and synced'))
        .catch(err => console.error('Database connection error:', err));
} else {
    sequelize.authenticate()
        .then(() => console.log('Database connected'))
        .catch(err => console.error('Database connection error:', err));
}

app.get('/', (req, res) => {
    res.json({ message: 'Sermoes API is running' });
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

// Start Server (only if not running on Vercel)
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;
