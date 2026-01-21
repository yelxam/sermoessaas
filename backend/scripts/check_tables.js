const sequelize = require('../src/config/database');
require('dotenv').config();

async function check() {
    try {
        await sequelize.authenticate();
        const [tables] = await sequelize.query(`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`);
        console.log('Tables:', tables.map(t => t.table_name).join(', '));
        process.exit(0);
    } catch (error) {
        process.exit(1);
    }
}

check();
