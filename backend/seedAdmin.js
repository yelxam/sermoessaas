const sequelize = require('./src/config/database');
const User = require('./src/models/User');
const Company = require('./src/models/Company');
const bcrypt = require('bcryptjs');

const seedAdmin = async () => {
    try {
        await sequelize.sync(); // Ensure tables exist

        const email = 'admin@sermon.ai';
        const password = 'admin123';

        // Check if exists
        let user = await User.findOne({ where: { email } });
        if (user) {
            console.log('Admin user already exists.');
            return;
        }

        // Create Company
        const company = await Company.create({
            name: 'Sermon AI Headquarters',
            plan: 'enterprise'
        });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = await User.create({
            name: 'Super Admin',
            email,
            password: hashedPassword,
            role: 'owner', // Highest role currently
            company_id: company.id
        });

        console.log('Super Admin user created successfully');
        console.log('Email: ' + email);
        console.log('Password: ' + password);
    } catch (err) {
        console.error('Error seeding admin:', err);
    } finally {
        process.exit();
    }
};

seedAdmin();
