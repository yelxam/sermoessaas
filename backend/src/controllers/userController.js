const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.getCompanyUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            where: { company_id: req.user.company_id },
            attributes: ['id', 'name', 'email', 'role', 'created_at']
        });
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.createUser = async (req, res) => {
    try {
        const { name, email, password, role, sermon_limit } = req.body;

        // Only admin/owner can create users
        if (req.user.role !== 'owner' && req.user.role !== 'admin') {
            return res.status(403).json({ msg: 'Not authorized' });
        }

        let user = await User.findOne({ where: { email } });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || 'member',
            company_id: req.user.company_id,
            sermon_limit: sermon_limit !== '' ? sermon_limit : null
        });

        res.json({ id: user.id, name: user.name, email: user.email, role: user.role });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
