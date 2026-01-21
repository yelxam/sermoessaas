const sequelize = require('../src/config/database');

async function check() {
    try {
        const [usersLower] = await sequelize.query('SELECT count(*) FROM "users"');
        const [usersUpper] = await sequelize.query('SELECT count(*) FROM "Users"');
        console.log('users (lower):', usersLower[0].count);
        console.log('Users (Upper):', usersUpper[0].count);
    } catch (e) {
        console.error(e.message);
    }
    process.exit();
}
check();
