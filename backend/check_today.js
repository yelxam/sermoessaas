const sequelize = require('./src/config/database');
async function check() {
    try {
        const [users] = await sequelize.query('SELECT name, email, created_at FROM "Users" WHERE created_at > \'2026-01-18 00:00:00\'');
        const [companies] = await sequelize.query('SELECT name, plan, created_at FROM companies WHERE created_at > \'2026-01-18 00:00:00\'');
        console.log('TODAY_USERS:', JSON.stringify(users, null, 2));
        console.log('TODAY_COMPANIES:', JSON.stringify(companies, null, 2));
    } catch (e) {
        console.error('QUERY_ERROR:', e.message);
    } finally {
        await sequelize.close();
        process.exit();
    }
}
check();
