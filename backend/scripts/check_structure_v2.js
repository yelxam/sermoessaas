const sequelize = require('../src/config/database');
const fs = require('fs');
require('dotenv').config();

async function check() {
    try {
        await sequelize.authenticate();
        const [constraints] = await sequelize.query(`
            SELECT conname, pg_get_constraintdef(oid) as def
            FROM pg_constraint
            WHERE conrelid = 'sermons'::regclass;
        `);
        fs.writeFileSync('constraints_output.json', JSON.stringify(constraints, null, 2));
        process.exit(0);
    } catch (error) {
        process.exit(1);
    }
}

check();
