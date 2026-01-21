const sequelize = require('../src/config/database');
require('dotenv').config();

async function check() {
    try {
        await sequelize.authenticate();
        console.log('--- FKs for sermons ---');

        const [results] = await sequelize.query(`
            SELECT
                conname AS name,
                a.attname AS col,
                confrelid::regclass AS ref_table,
                af.attname AS ref_col
            FROM
                pg_constraint AS c
                JOIN pg_attribute AS a ON a.attrelid = c.conrelid AND a.attnum = ANY(c.conkey)
                JOIN pg_attribute AS af ON af.attrelid = c.confrelid AND af.attnum = ANY(c.confkey)
            WHERE
                c.contype = 'f' AND conrelid::regclass::text = 'sermons';
        `);

        results.forEach(r => {
            console.log(`FK: ${r.name}, Col: ${r.col} -> ${r.ref_table}(${r.ref_col})`);
        });

        process.exit(0);
    } catch (error) {
        console.error('Check failed:', error);
        process.exit(1);
    }
}

check();
