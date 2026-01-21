const sequelize = require('../src/config/database');

async function findUser() {
    try {
        const [users] = await sequelize.query("SELECT id, email, name FROM users WHERE email ILIKE '%eliel%'");
        console.log(users);
    } catch (e) { console.error(e); }
    process.exit();
}
findUser();
