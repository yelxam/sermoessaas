const sequelize = require('../src/config/database');
require('dotenv').config();

async function inspect() {
    try {
        await sequelize.authenticate();
        console.log('--- DB INSPECT ---');

        // Check current user in DB for a sample
        const [users] = await sequelize.query('SELECT id, email, role FROM users LIMIT 5');
        console.log('Sample users:', users);

        // Check columns of sermons table
        const [sermonsCols] = await sequelize.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'sermons'");
        console.log('Sermons columns:', sermonsCols);

        // Check constraints of sermons table
        const [constraints] = await sequelize.query(`
            SELECT conname, pg_get_constraintdef(c.oid)
            FROM pg_constraint c
            JOIN pg_namespace n ON n.oid = c.connamespace
            WHERE n.nspname = 'public' AND relname = 'sermons';
        `);
        console.log('Sermons constraints:', constraints);

        process.exit(0);
    } catch (error) {
        console.error('Inspect failed:', error);
        process.exit(1);
    }
}

inspect();
