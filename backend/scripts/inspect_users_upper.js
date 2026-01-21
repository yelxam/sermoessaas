const sequelize = require('../src/config/database');

async function check() {
    try {
        const [usersUpper] = await sequelize.query('SELECT * FROM "Users"');
        console.log('--- Users (UPPERCASE) contents ---');
        console.log(JSON.stringify(usersUpper, null, 2));
    } catch (e) {
        console.error(e.message);
    }
    process.exit();
}
check();
