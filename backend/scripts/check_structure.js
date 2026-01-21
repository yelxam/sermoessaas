const sequelize = require('../src/config/database');
require('dotenv').config();

async function check() {
    try {
        await sequelize.authenticate();
        const [results] = await sequelize.query(`
            SELECT pg_get_indexdef(indexrelid) AS index_def
            FROM pg_index
            WHERE indrelid = 'sermons'::regclass;
        `);
        console.log('Indexes:', results);

        const [constraints] = await sequelize.query(`
            SELECT conname, pg_get_constraintdef(oid)
            FROM pg_constraint
            WHERE conrelid = 'sermons'::regclass;
        `);
        console.log('Constraints:', constraints);

        process.exit(0);
    } catch (error) {
        process.exit(1);
    }
}

check();
