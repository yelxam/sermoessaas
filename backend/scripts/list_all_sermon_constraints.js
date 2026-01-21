const sequelize = require('../src/config/database');

async function checkConstraints() {
    try {
        const [results] = await sequelize.query(`
      SELECT 
        conname, 
        pg_get_constraintdef(c.oid) as definition
      FROM pg_constraint c 
      JOIN pg_class t ON c.conrelid = t.oid 
      WHERE t.relname = 'sermons';
    `);
        console.log(JSON.stringify(results, null, 2));
    } catch (error) {
        console.error(error);
    } finally {
        process.exit();
    }
}

checkConstraints();
