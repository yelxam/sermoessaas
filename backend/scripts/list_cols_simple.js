const sequelize = require('../src/config/database');

async function debug() {
    try {
        const [results] = await sequelize.query("SELECT * FROM information_schema.columns WHERE table_name = 'users' AND table_schema = 'public'");
        results.forEach(c => console.log(c.column_name));
    } catch (e) { console.error(e); }
    process.exit();
}
debug();
