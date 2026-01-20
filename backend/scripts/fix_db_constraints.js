const sequelize = require('../src/config/database');
require('dotenv').config();

async function fix() {
    try {
        await sequelize.authenticate();
        console.log('--- DB FIX START ---');

        // Find all foreign keys on 'sermons' table
        const [fks] = await sequelize.query(`
            SELECT constraint_name 
            FROM information_schema.table_constraints 
            WHERE table_name = 'sermons' AND constraint_type = 'FOREIGN KEY'
        `);

        console.log('Found FKs:', fks);

        for (const fk of fks) {
            console.log(`Dropping FK: ${fk.constraint_name}`);
            await sequelize.query(`ALTER TABLE sermons DROP CONSTRAINT "${fk.constraint_name}"`);
        }

        console.log('Syncing models to recreate healthy constraints...');
        // We require models to ensure they are loaded
        require('../src/models/Company');
        require('../src/models/User');
        const Sermon = require('../src/models/Sermon');

        await sequelize.sync({ alter: true });

        console.log('--- DB FIX END ---');
        process.exit(0);
    } catch (error) {
        console.error('Fix failed:', error);
        process.exit(1);
    }
}

fix();
