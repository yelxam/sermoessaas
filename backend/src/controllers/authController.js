const User = require('../models/User');
const Company = require('../models/Company');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sequelize = require('../config/database');

exports.register = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { name, email, password, companyName } = req.body;

        // Check if user exists
        let user = await User.findOne({ where: { email } });
        if (user) {
            await t.rollback();
            return res.status(400).json({ msg: 'User already exists' });
        }

        // Create Company
        const newCompany = await Company.create({
            name: companyName || `${name}'s Company`,
        }, { transaction: t });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = await User.create({
            name,
            email,
            password: hashedPassword,
            company_id: newCompany.id,
            role: 'owner'
        }, { transaction: t });

        await t.commit();

        // Create Token
        const payload = {
            user: {
                id: user.id,
                company_id: user.company_id,
                role: user.role
            },
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '5d' },
            (err, token) => {
                if (err) throw err;
                res.json({ token, user: { id: user.id, name: user.name, email: user.email, company_id: user.company_id, role: user.role } });
            }
        );
    } catch (err) {
        await t.rollback();
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check user
        let user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        // Return token
        const payload = {
            user: {
                id: user.id,
                company_id: user.company_id,
                role: user.role
            },
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '5d' },
            (err, token) => {
                if (err) throw err;
                res.json({ token, user: { id: user.id, name: user.name, email: user.email, company_id: user.company_id, role: user.role } });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
