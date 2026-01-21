const sequelize = require('../src/config/database');

async function check() {
    try {
        const [usersLower] = await sequelize.query('SELECT * FROM "users"');
        console.log('--- users (lowercase) contents ---');
        console.log(JSON.stringify(usersLower, null, 2));
    } catch (e) {
        console.error(e.message);
    }
    process.exit();
}
check();
