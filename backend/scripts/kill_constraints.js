const sequelize = require('../src/config/database');
require('dotenv').config();

async function kill() {
    try {
        await sequelize.authenticate();
        console.log('--- EXTREME CONSTRAINT KILLER ---');

        const [constraints] = await sequelize.query(`
            SELECT
                conname AS name
            FROM
                pg_constraint
            WHERE
                conrelid = 'sermons'::regclass;
        `);

        console.log('Found constraints:', constraints);

        for (const c of constraints) {
            console.log(`Dropping: ${c.name}`);
            await sequelize.query(`ALTER TABLE sermons DROP CONSTRAINT IF EXISTS "${c.name}" CASCADE`);
        }

        console.log('Constraints dropped. Running sync...');
        require('../src/models/Company');
        require('../src/models/User');
        require('../src/models/Sermon');

        await sequelize.sync({ alter: true });

        console.log('--- RECOVERY COMPLETE ---');
        process.exit(0);
    } catch (error) {
        console.error('Kill failed:', error);
        process.exit(1);
    }
}

kill();
