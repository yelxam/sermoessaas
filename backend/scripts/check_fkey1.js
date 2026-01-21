const sequelize = require('../src/config/database');

async function checkSpecificFk() {
    try {
        const [results] = await sequelize.query(`
            SELECT 
                conname, 
                pg_get_constraintdef(c.oid) as definition
            FROM pg_constraint c
            WHERE conname = 'sermons_user_id_fkey1';
        `);
        console.log(JSON.stringify(results, null, 2));
    } catch (error) {
        console.error(error);
    } finally {
        process.exit();
    }
}

checkSpecificFk();
