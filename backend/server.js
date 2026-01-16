const express = require('express');
const cors = require('cors');
const sequelize = require('./src/config/database');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Models (Import to register with sequelize)
require('./src/models/Plan');
require('./src/models/Company');
require('./src/models/User');
require('./src/models/Sermon');
require('./src/models/Church');

// Routes
app.use('/auth', require('./src/routes/authRoutes'));
app.use('/sermons', require('./src/routes/sermonRoutes'));
app.use('/users', require('./src/routes/userRoutes'));
app.use('/companies', require('./src/routes/companyRoutes'));
app.use('/plans', require('./src/routes/planRoutes'));

// Database connection
sequelize.authenticate()
    .then(() => console.log('Database connected'))
    .catch(err => console.error('Database connection error:', err));

app.get('/', (req, res) => {
    res.json({ message: 'Sermoes API is running' });
});

app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date(),
        db_url_present: !!process.env.DATABASE_URL,
        sync_db_on: process.env.SYNC_DB,
        node_env: process.env.NODE_ENV
    });
});

// Start Server (only if not running on Vercel)
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;
