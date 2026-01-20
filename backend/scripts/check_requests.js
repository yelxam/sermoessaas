const sequelize = require('../src/config/database');
const Company = require('../src/models/Company');
const { Op } = require('sequelize');
require('dotenv').config();

async function check() {
    try {
        await sequelize.authenticate();
        console.log('--- DB CHECK START ---');

        const count = await Company.count({
            where: {
                requested_plan_id: { [Op.ne]: null }
            }
        });

        console.log(`COUNT pending requests: ${count}`);

        if (count > 0) {
            const all = await Company.findAll({
                where: { requested_plan_id: { [Op.ne]: null } },
                attributes: ['id', 'name', 'requested_plan_id']
            });
            console.log('PENDING COMPANIES:', JSON.stringify(all, null, 2));
        } else {
            console.log('NO PENDING REQUESTS FOUND.');
        }

        // Also check if any company has a numeric requested_plan_id just in case Op.ne is weird
        const allCompanies = await Company.findAll({ attributes: ['id', 'requested_plan_id'] });
        const url_params = allCompanies.filter(c => c.requested_plan_id !== null);
        console.log(`Js Filter Count: ${url_params.length}`);

        console.log('--- DB CHECK END ---');
        process.exit(0);
    } catch (error) {
        console.error('Check failed:', error);
        process.exit(1);
    }
}

check();
