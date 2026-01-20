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

        const company = await (require('../models/Company')).findByPk(req.user.company_id);
        const currentUsersCount = await User.count({ where: { company_id: req.user.company_id } });

        if (company.max_users !== -1 && currentUsersCount >= company.max_users) {
            return res.status(403).json({ msg: `Limite de usuários atingido (${currentUsersCount}/${company.max_users}). Atualize seu plano.` });
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

exports.updateUser = async (req, res) => {
    try {
        const { name, email, password, role, sermon_limit } = req.body;
        const { id } = req.params;

        // Only admin/owner can update users
        if (req.user.role !== 'owner' && req.user.role !== 'admin') {
            return res.status(403).json({ msg: 'Not authorized' });
        }

        let user = await User.findOne({ where: { id, company_id: req.user.company_id } });
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        const updateData = {
            name,
            email,
            role,
            sermon_limit: sermon_limit !== '' ? sermon_limit : null
        };

        if (password && password.trim() !== '') {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(password, salt);
        }

        await user.update(updateData);

        res.json({ id: user.id, name: user.name, email: user.email, role: user.role });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Only admin/owner can delete users
        if (req.user.role !== 'owner' && req.user.role !== 'admin') {
            return res.status(403).json({ msg: 'Not authorized' });
        }

        // Don't allow deleting yourself
        if (parseInt(id) === req.user.id) {
            return res.status(400).json({ msg: 'Você não pode excluir sua própria conta aqui.' });
        }

        const user = await User.findOne({ where: { id, company_id: req.user.company_id } });
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        await user.destroy();
        res.json({ msg: 'User removed' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
