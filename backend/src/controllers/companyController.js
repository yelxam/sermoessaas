const Company = require('../models/Company');
const Church = require('../models/Church');
const User = require('../models/User');
const Sermon = require('../models/Sermon');

// My Organization (Tenant)
exports.getMyCompany = async (req, res) => {
    try {
        const company = await Company.findByPk(req.user.company_id);
        if (!company) return res.status(404).json({ msg: 'Company not found' });
        res.json(company);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.updateMyCompany = async (req, res) => {
    try {
        if (req.user.role !== 'owner' && req.user.role !== 'admin') {
            return res.status(403).json({ msg: 'Not authorized' });
        }

        const { name, openai_api_key, groq_api_key } = req.body;
        await Company.update(
            { name, openai_api_key, groq_api_key },
            { where: { id: req.user.company_id } }
        );

        res.json({ msg: 'Settings updated' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.updateMyPlan = async (req, res) => {
    try {
        if (req.user.role !== 'owner') {
            return res.status(403).json({ msg: 'Apenas proprietários podem alterar o plano.' });
        }

        const { planId } = req.body;
        const Plan = require('../models/Plan');
        const plan = await Plan.findByPk(planId);

        if (!plan) return res.status(404).json({ msg: 'Plano não encontrado' });

        await Company.update(
            {
                plan: plan.name,
                max_sermons: plan.max_sermons
            },
            { where: { id: req.user.company_id } }
        );

        res.json({ msg: 'Plano atualizado com sucesso', plan: plan.name });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.getAdminStats = async (req, res) => {
    try {
        if (req.user.role !== 'owner' && req.user.email !== 'admin@sermon.ai') {
            return res.status(403).json({ msg: 'Not authorized' });
        }

        const stats = {
            totalCompanies: await Company.count(),
            totalUsers: await User.count(),
            totalSermons: await Sermon.count(),
        };

        // Distribution of users per company
        const userDist = await Company.findAll({
            attributes: ['id', 'name'],
            include: [{
                model: User,
                attributes: ['id']
            }]
        });

        // Sermons last 30 days
        const { Op } = require('sequelize');
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const sermonGrowth = await Sermon.findAll({
            where: {
                created_at: { [Op.gte]: thirtyDaysAgo }
            },
            attributes: [
                [sequelize.fn('date', sequelize.col('created_at')), 'date'],
                [sequelize.fn('count', sequelize.col('id')), 'count']
            ],
            group: [sequelize.fn('date', sequelize.col('created_at'))],
            order: [[sequelize.fn('date', sequelize.col('created_at')), 'ASC']]
        });

        res.json({
            ...stats,
            companyDistribution: userDist.map(c => ({
                name: c.name,
                userCount: c.Users ? c.Users.length : 0
            })),
            sermonGrowth
        });
    } catch (err) {
        console.error("ADMIN STATS ERR:", err);
        res.status(500).send('Server Error');
    }
};

// Platform Admin (Manage All Companies)
exports.getAllCompanies = async (req, res) => {
    try {
        if (req.user.role !== 'owner') {
            return res.status(403).json({ msg: 'Not authorized for this section' });
        }

        const companies = await Company.findAll({ order: [['created_at', 'DESC']] });
        res.json(companies);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.createCompany = async (req, res) => {
    try {
        if (req.user.role !== 'owner') {
            return res.status(403).json({ msg: 'Not authorized' });
        }

        const { name, plan } = req.body;
        const Plan = require('../models/Plan');
        const selectedPlan = await Plan.findOne({ where: { name: plan || 'Free' } });

        let max_sermons = 3;
        if (selectedPlan) {
            max_sermons = selectedPlan.max_sermons;
        }

        const newCompany = await Company.create({
            name,
            plan: plan || 'Free',
            max_sermons
        });
        res.json(newCompany);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.updateCompany = async (req, res) => {
    try {
        if (req.user.role !== 'owner') {
            return res.status(403).json({ msg: 'Not authorized' });
        }

        const { name, plan, max_sermons, active } = req.body;
        const company = await Company.findByPk(req.params.id);

        if (!company) return res.status(404).json({ msg: 'Company not found' });

        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (active !== undefined) updateData.active = active;

        if (plan !== undefined) {
            updateData.plan = plan;
            const Plan = require('../models/Plan');
            const selectedPlan = await Plan.findOne({ where: { name: plan } });
            if (selectedPlan) {
                updateData.max_sermons = selectedPlan.max_sermons;
            }
        }

        if (max_sermons !== undefined) updateData.max_sermons = max_sermons;

        await company.update(updateData);

        res.json(company);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};


// Church Management (within the logged user's company)
exports.getChurches = async (req, res) => {
    try {
        const churches = await Church.findAll({
            where: { company_id: req.user.company_id },
            order: [['created_at', 'DESC']]
        });
        res.json(churches);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.createChurch = async (req, res) => {
    try {
        if (req.user.role !== 'owner' && req.user.role !== 'admin') {
            return res.status(403).json({ msg: 'Not authorized' });
        }

        const { name, address, pastor_name, phone } = req.body;

        const newChurch = await Church.create({
            name,
            address,
            pastor_name,
            phone,
            company_id: req.user.company_id
        });

        res.json(newChurch);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.deleteChurch = async (req, res) => {
    try {
        if (req.user.role !== 'owner' && req.user.role !== 'admin') {
            return res.status(403).json({ msg: 'Not authorized' });
        }

        await Church.destroy({
            where: { id: req.params.id, company_id: req.user.company_id }
        });

        res.json({ msg: 'Church deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
