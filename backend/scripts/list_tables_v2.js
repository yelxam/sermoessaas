const sequelize = require('../src/config/database');

async function listTables() {
    try {
        const [results] = await sequelize.query(`
            SELECT tablename 
            FROM pg_catalog.pg_tables 
            WHERE schemaname = 'public';
        `);
        console.log(results.map(r => r.tablename));
    } catch (e) { console.error(e); }
    process.exit();
}
listTables();
