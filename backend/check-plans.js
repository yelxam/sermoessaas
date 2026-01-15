const Plan = require('./src/models/Plan');
const sequelize = require('./src/config/database');

async function checkPlans() {
    try {
        const plans = await Plan.findAll();
        console.log('Plans in DB:', JSON.stringify(plans, null, 2));
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

checkPlans();
