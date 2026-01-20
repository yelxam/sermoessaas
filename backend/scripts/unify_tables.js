const sequelize = require('../src/config/database');

async function unify() {
    try {
        console.log('--- TABLE UNIFICATION START ---');

        // 1. Rename existing lowercase ones to backup
        console.log('Backing up old lowercase tables...');
        await sequelize.query('ALTER TABLE IF EXISTS "users" RENAME TO "users_backup_old"');
        await sequelize.query('ALTER TABLE IF EXISTS "plans" RENAME TO "plans_backup_old"');

        // 2. Rename capitalized ones to lowercase
        console.log('Renaming capitalized tables to lowercase...');
        await sequelize.query('ALTER TABLE IF EXISTS "Users" RENAME TO "users"');
        await sequelize.query('ALTER TABLE IF EXISTS "Plans" RENAME TO "plans"');

        console.log('--- TABLE UNIFICATION COMPLETE ---');

        // 3. Kill and Recreate constraints (this script already exists as kill_constraints.js)
        console.log('Now run kill_constraints.js to fix associations!');

    } catch (e) {
        console.error('UNIFICATION FAILED:', e.message);
    } finally {
        process.exit();
    }
}

unify();
