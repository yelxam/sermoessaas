const sequelize = require('../src/config/database');
const Company = require('../src/models/Company');
const { Op } = require('sequelize');
require('dotenv').config();

async function check() {
    try {
        await sequelize.authenticate();

        const count = await Company.count({
            where: {
                requested_plan_id: { [Op.ne]: null }
            }
        });

        console.log(`Total pending requests in DB: ${count}`);

        const all = await Company.findAll({ attributes: ['id', 'name', 'requested_plan_id'] });
        console.log('Sample companies:', JSON.stringify(all.slice(0, 3), null, 2));

        process.exit(0);
    } catch (error) {
        console.error('Check failed:', error);
        process.exit(1);
    }
}

check();
