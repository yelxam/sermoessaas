const sequelize = require('../src/config/database');
const Company = require('../src/models/Company');
require('dotenv').config();

async function sync() {
    try {
        await sequelize.authenticate();
        console.log('Connected to DB');

        // This will ALTER the table to match the model
        await Company.sync({ alter: true });
        console.log('Company table synced successfully');

        process.exit(0);
    } catch (error) {
        console.error('Sync failed:', error);
        process.exit(1);
    }
}

sync();
