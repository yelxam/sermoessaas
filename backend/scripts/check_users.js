const sequelize = require('../src/config/database');
const User = require('../src/models/User');
require('dotenv').config();

async function check() {
    try {
        await sequelize.authenticate();
        console.log('--- USERS CHECK ---');

        const users = await User.findAll({
            attributes: ['id', 'email', 'company_id']
        });
        console.log('USERS:', JSON.stringify(users, null, 2));

        process.exit(0);
    } catch (error) {
        console.error('Check failed:', error);
        process.exit(1);
    }
}

check();
