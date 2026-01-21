const sequelize = require('../src/config/database');

async function checkSermonTable() {
    try {
        const [results] = await sequelize.query(`
            SELECT 
                column_name, 
                data_type, 
                is_nullable 
            FROM information_schema.columns 
            WHERE table_name = 'sermons'
            ORDER BY ordinal_position;
        `);
        console.log(JSON.stringify(results, null, 2));
    } catch (error) {
        console.error(error);
    } finally {
        process.exit();
    }
}

checkSermonTable();
