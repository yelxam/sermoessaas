const sequelize = require('../src/config/database');

async function check() {
    try {
        const [results] = await sequelize.query(`
            SELECT
                conname as constraint_name,
                pg_get_constraintdef(c.oid) as definition
            FROM pg_constraint c
            JOIN pg_class t ON c.conrelid = t.oid
            WHERE t.relname = 'sermons'
        `);
        results.forEach(r => {
            console.log(`- ${r.constraint_name}: ${r.definition}`);
        });
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}
check();
