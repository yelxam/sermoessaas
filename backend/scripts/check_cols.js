const sequelize = require('../src/config/database');
require('dotenv').config();

async function check() {
    try {
        await sequelize.authenticate();
        console.log('--- COLUMNS FOR sermons ---');

        const [cols] = await sequelize.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'sermons';
        `);

        console.log(cols);

        process.exit(0);
    } catch (error) {
        console.error('Check failed:', error);
        process.exit(1);
    }
}

check();
