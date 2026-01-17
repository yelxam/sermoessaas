const sequelize = require('./src/config/database');
const Plan = require('./src/models/Plan');
const Company = require('./src/models/Company');

async function fixSchema() {
    try {
        console.log('Synchronizing database schema...');
        // This will add missing columns
        await sequelize.sync({ alter: true });
        console.log('Schema updated successfully.');

        // Ensure some plans have allow_ai set correctly (Optional)
        await Plan.update({ allow_ai: true }, { where: { allow_ai: null } });
        await Company.update({ allow_ai: true }, { where: { allow_ai: null } });

        process.exit(0);
    } catch (err) {
        console.error('Error syncing database:', err);
        process.exit(1);
    }
}

fixSchema();
