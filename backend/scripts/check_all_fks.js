const sequelize = require('../src/config/database');

async function checkAllFks() {
    try {
        const [results] = await sequelize.query(`
            SELECT 
                conname, 
                relname as table_name
            FROM pg_constraint c
            JOIN pg_class t ON c.conrelid = t.oid
            WHERE conname LIKE '%fkey%';
        `);
        console.log(JSON.stringify(results, null, 2));
    } catch (error) {
        console.error(error);
    } finally {
        process.exit();
    }
}

checkAllFks();
