const sequelize = require('../src/config/database');

async function check() {
    try {
        const [plansLower] = await sequelize.query('SELECT count(*) FROM "plans"');
        const [plansUpper] = await sequelize.query('SELECT count(*) FROM "Plans"');
        console.log('plans (lower):', plansLower[0].count);
        console.log('Plans (Upper):', plansUpper[0].count);
    } catch (e) {
        console.error(e.message);
    }
    process.exit();
}
check();
