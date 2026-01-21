const sequelize = require('../src/config/database');
const Sermon = require('../src/models/Sermon');
const User = require('../src/models/User');

async function testCreate() {
    try {
        console.log('Testing Sermon Creation...');

        // Find a valid user
        const user = await User.findOne();
        if (!user) {
            console.error('No users found in DB');
            return;
        }

        console.log(`Using User ID: ${user.id}, Company ID: ${user.company_id}`);

        const newSermon = await Sermon.create({
            theme: 'Test Theme',
            content: 'Test Content',
            user_id: user.id,
            company_id: user.company_id
        });

        console.log('Sermon created successfully!', newSermon.id);

    } catch (error) {
        console.error('CREATE FAILED:');
        console.error(error);
        if (error.parent) {
            console.error('Parent Error:', error.parent.message);
            console.error('Constraint:', error.parent.constraint);
        }
    } finally {
        process.exit();
    }
}

testCreate();
