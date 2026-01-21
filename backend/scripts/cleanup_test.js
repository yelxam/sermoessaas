const sequelize = require('../src/config/database');

async function cleanUp() {
    try {
        await sequelize.query("DELETE FROM users WHERE email = 'admin@test.com'");
        console.log('Cleaned up temp user.');
    } catch (e) {
        console.error(e);
    }
    process.exit();
}
cleanUp();
