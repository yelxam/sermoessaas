const User = require('../models/User');
const Company = require('../models/Company');
const Plan = require('../models/Plan');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sequelize = require('../config/database');

exports.register = async (req, res) => {
    try {
        const { name, email, password, companyName, planId } = req.body;

        // Basic validation
        if (!name || !email || !password) {
            return res.status(400).json({ msg: 'Please provide name, email and password' });
        }

        // Check if user exists
        let user = await User.findOne({ where: { email } });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        // Hash password EARLY (CPU intensive)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Fetch Plan details - Robust check
        let planDetails = null;
        if (planId && !isNaN(planId)) {
            try {
                planDetails = await Plan.findByPk(planId);
            } catch (pErr) {
                console.error("Plan lookup failed, defaulting to Free:", pErr.message);
            }
        }

        // Create Company
        const newCompany = await Company.create({
            name: companyName || `${name.split(' ')[0]}'s Ministry`,
            plan: planDetails ? planDetails.name : 'Free',
            max_sermons: planDetails ? planDetails.max_sermons : 3,
            allow_ai: planDetails ? planDetails.allow_ai : true,
        });

        // Create User
        user = await User.create({
            name,
            email,
            password: hashedPassword,
            company_id: newCompany.id,
            role: 'owner'
        });

        // Create Token
        const payload = {
            user: {
                id: user.id,
                company_id: user.company_id,
                role: user.role
            },
        };

        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET is missing!");
            return res.status(500).json({ msg: "Server configuration error" });
        }

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '5d' },
            (err, token) => {
                if (err) throw err;
                res.json({
                    token,
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        company_id: user.company_id,
                        role: user.role
                    }
                });
            }
        );
    } catch (err) {
        console.error("REGISTRATION ERROR:", err);
        res.status(500).json({
            msg: 'Error creating account: ' + err.message,
            error: err.message
        });
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

        // Check if company is active
        const company = await Company.findByPk(user.company_id);
        if (company && !company.active) {
            return res.status(403).json({
                msg: 'Sua conta está desativada. Por favor, entre em contato com o suporte ou verifique seu pagamento.',
                inactive: true
            });
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
                res.json({ token, user: { id: user.id, name: user.name, email: user.email, company_id: user.company_id, role: user.role, allow_ai: company.allow_ai } });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
