const Company = require('../models/Company');
const Church = require('../models/Church');
const User = require('../models/User');
const Sermon = require('../models/Sermon');
const sequelize = require('../config/database');
const sendEmail = require('../utils/mailer');

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

        const company = await Company.findByPk(req.user.company_id);
        const oldPlanName = company.plan;

        await Company.update(
            {
                plan: plan.name,
                max_sermons: plan.max_sermons,
                max_users: plan.max_users,
                max_churches: plan.max_churches,
                allow_ai: plan.allow_ai
            },
            { where: { id: req.user.company_id } }
        );

        // Notify Admin/Finance for invoice generation
        try {
            await sendEmail({
                email: process.env.SMTP_USER, // Sending to support/admin email
                subject: `[Cobrança] Alteração de Plano - ${company.name}`,
                message: `
                    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                        <h2 style="color: #2563eb;">Solicitação de Atualização de Plano</h2>
                        <p>A organização <strong>${company.name}</strong> alterou seu plano de assinatura.</p>
                        <hr style="border: 1px solid #eee; margin: 20px 0;">
                        <ul style="list-style: none; padding: 0;">
                            <li style="margin-bottom: 10px;">🏢 <strong>Empresa:</strong> ${company.name} (ID: ${company.id})</li>
                            <li style="margin-bottom: 10px;">👤 <strong>Solicitante:</strong> ${req.user.email} (ID: ${req.user.id})</li>
                            <li style="margin-bottom: 10px;">📉 <strong>Plano Anterior:</strong> ${oldPlanName}</li>
                            <li style="margin-bottom: 10px;">📈 <strong>Novo Plano:</strong> ${plan.name}</li>
                            <li style="margin-bottom: 10px;">💰 <strong>Novo Valor:</strong> R$ ${plan.price}</li>
                            <li style="margin-bottom: 10px;">📅 <strong>Data:</strong> ${new Date().toLocaleString('pt-BR')}</li>
                        </ul>
                        <hr style="border: 1px solid #eee; margin: 20px 0;">
                        <p style="background-color: #fffbeb; padding: 15px; border-radius: 5px; border: 1px solid #fcd34d; color: #92400e;">
                            ⚠️ <strong>Ação Necessária:</strong> Verifique o status do pagamento e emita a nova fatura/cobrança para o cliente.
                        </p>
                    </div>
                `
            });
        } catch (emailErr) {
            console.error('Failed to send plan update notification email:', emailErr);
            // Don't fail the request if email fails, just log it
        }

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
        let max_users = 1;
        let max_churches = 1;

        if (selectedPlan) {
            max_sermons = selectedPlan.max_sermons;
            max_users = selectedPlan.max_users;
            max_churches = selectedPlan.max_churches;
        }

        const newCompany = await Company.create({
            name,
            plan: plan || 'Free',
            max_sermons,
            max_users,
            max_churches,
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

        const { name, plan, max_sermons, active, allow_ai } = req.body;
        const company = await Company.findByPk(req.params.id);

        if (!company) return res.status(404).json({ msg: 'Company not found' });

        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (active !== undefined) updateData.active = active;
        if (allow_ai !== undefined) updateData.allow_ai = allow_ai;

        if (plan !== undefined) {
            updateData.plan = plan;
            const Plan = require('../models/Plan');
            const selectedPlan = await Plan.findOne({ where: { name: plan } });
            if (selectedPlan) {
                updateData.max_sermons = selectedPlan.max_sermons;
                updateData.max_users = selectedPlan.max_users;
                updateData.max_churches = selectedPlan.max_churches;
                updateData.allow_ai = selectedPlan.allow_ai;
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

        const company = await Company.findByPk(req.user.company_id);
        const currentChurches = await Church.count({ where: { company_id: req.user.company_id } });

        if (company.max_churches !== -1 && currentChurches >= company.max_churches) {
            return res.status(403).json({ msg: `Limite de igrejas atingido (${currentChurches}/${company.max_churches}). Atualize seu plano.` });
        }

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
