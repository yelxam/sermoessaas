const sequelize = require('./src/config/database');
const Sermon = require('./src/models/Sermon');

async function syncModels() {
    try {
        console.log('🔄 Checking database connection...');
        await sequelize.authenticate();
        console.log('✅ Database connected.');

        console.log('🔄 Altering Sermon table schema to add new columns (ai_model, cost, tokens)...');
        await Sermon.sync({ alter: true });

        console.log('✅ Schema updated successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error updating schema:', error);
        process.exit(1);
    }
}

syncModels();
