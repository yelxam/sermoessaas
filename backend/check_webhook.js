const sequelize = require('./src/config/database');
async function check() {
    try {
        const [users] = await sequelize.query('SELECT name, email, created_at FROM "Users" ORDER BY created_at DESC LIMIT 5');
        const [companies] = await sequelize.query('SELECT name, plan, created_at FROM companies ORDER BY created_at DESC LIMIT 5');
        console.log('LATEST_USERS:', JSON.stringify(users, null, 2));
        console.log('LATEST_COMPANIES:', JSON.stringify(companies, null, 2));
    } catch (e) {
        console.error('QUERY_ERROR:', e.message);
    } finally {
        await sequelize.close();
        process.exit();
    }
}
check();
