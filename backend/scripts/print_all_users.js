const sequelize = require('../src/config/database');

async function listUsers() {
    try {
        const [users] = await sequelize.query('SELECT id, email, name, role FROM "users"');
        console.log('Total users:', users.length);
        console.log(JSON.stringify(users, null, 2));
    } catch (e) {
        console.error(e.message);
    }
    process.exit();
}
listUsers();
