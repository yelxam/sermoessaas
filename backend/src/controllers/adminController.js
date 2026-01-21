const User = require('../models/User');
const Company = require('../models/Company');
const bcrypt = require('bcryptjs');

exports.createSuperUser = async (req, res) => {
    try {
        const { name, email, password, role, company_id } = req.body;

        // Basic validation
        if (!name || !email || !password || !role || !company_id) {
            return res.status(400).json({ msg: 'Por favor, preencha todos os campos.' });
        }

        // Check if company exists
        const company = await Company.findByPk(company_id);
        if (!company) {
            return res.status(404).json({ msg: 'Organização não encontrada.' });
        }

        // Check if user already exists
        let user = await User.findOne({ where: { email } });
        if (user) {
            return res.status(400).json({ msg: 'Usuário já existe.' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        user = await User.create({
            name,
            email,
            password: hashedPassword,
            role,
            company_id
        });

        res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            company_id: user.company_id
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erro no servidor');
    }
};

exports.getAllCompanies = async (req, res) => {
    try {
        const companies = await Company.findAll({
            attributes: ['id', 'name'],
            order: [['name', 'ASC']]
        });
        res.json(companies);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erro no servidor');
    }
};
