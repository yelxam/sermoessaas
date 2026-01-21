const User = require('../src/models/User');
const Company = require('../src/models/Company');
const bcrypt = require('bcryptjs');

async function createTempUser() {
    try {
        const password = 'password123';
        const hashedPassword = await bcrypt.hash(password, 10);

        let company = await Company.findOne();
        if (!company) {
            company = await Company.create({ name: 'Test Company' });
        }

        const user = await User.create({
            name: 'Temp User',
            email: 'admin@test.com',
            password: hashedPassword,
            company_id: company.id,
            role: 'owner'
        });

        console.log('Created user: admin@test.com / password123');
    } catch (e) {
        console.error('FAILED TO CREATE TEMP USER:', e.message);
    } finally {
        process.exit();
    }
}

createTempUser();
