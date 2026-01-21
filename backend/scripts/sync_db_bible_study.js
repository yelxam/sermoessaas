const path = require('path');
const sequelize = require(path.join(__dirname, '../src/config/database'));
const BibleStudy = require(path.join(__dirname, '../src/models/BibleStudy'));
const Plan = require(path.join(__dirname, '../src/models/Plan'));
const Company = require(path.join(__dirname, '../src/models/Company'));

async function sync() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // This will create the table if it doesn't exist
        await BibleStudy.sync({ alter: true });
        console.log('BibleStudy table synced.');

        // This will add missing columns to plans and companies
        await Plan.sync({ alter: true });
        console.log('Plan table synced.');

        await Company.sync({ alter: true });
        console.log('Company table synced.');

        console.log('Database schema successfully updated!');
        process.exit(0);
    } catch (error) {
        console.error('Error syncing database:', error);
        process.exit(1);
    }
}

sync();
