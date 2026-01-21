const sequelize = require('../src/config/database');
require('dotenv').config();

async function check() {
    try {
        await sequelize.authenticate();
        const [cols] = await sequelize.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'sermons'`);
        const names = cols.map(c => c.column_name);
        console.log('Columns:', names.join(', '));

        const duplicates = names.filter(n => n.toLowerCase().includes('user'));
        console.log('User related columns:', duplicates);

        process.exit(0);
    } catch (error) {
        process.exit(1);
    }
}

check();
