const Company = require('../models/Company');
const Church = require('../models/Church');
const User = require('../models/User');
const Sermon = require('../models/Sermon');
const sequelize = require('../config/database');
const sendEmail = require('../utils/mailer');
const { Op } = require('sequelize');

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
        if (!planId) return res.status(400).json({ msg: 'ID do plano é obrigatório' });

        const Plan = require('../models/Plan');
        const plan = await Plan.findByPk(planId);
        if (!plan) return res.status(404).json({ msg: 'Plano não encontrado' });

        const company = await Company.findByPk(req.user.company_id);
        if (!company) return res.status(404).json({ msg: 'Sua empresa não foi encontrada.' });

        const oldPlanName = company.plan;

        // Perform the update
        await company.update({ requested_plan_id: plan.id });
        console.log(`[UPDATE_MY_PLAN] SUCCESS: Company ${company.id} requested plan ${plan.name} (${plan.id})`);

        // Send response immediately to avoid UI blocking
        res.json({ msg: 'Solicitação de troca de plano enviada com sucesso! Aguarde a aprovação do administrador.', pending: true });

        // Background Emails - REMOVED as per user request to debug/simplify
        // (async () => { ... })();

    } catch (err) {
        console.error('[UPDATE_MY_PLAN] ACTION FAILED:', err.message);
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

// Super Admin approvals
const SUPER_ADMIN_EMAILS = ['admin@sermon.ai', 'eliel@verbocast.com.br', 'financeiro@verbocast.com.br'];
const isSuperAdmin = (email) => SUPER_ADMIN_EMAILS.includes(email.toLowerCase());

exports.listPendingRequests = async (req, res) => {
    try {
        const userEmail = req.user.email.toLowerCase();
        if (!isSuperAdmin(userEmail)) {
            console.log(`[PendingRequests] ACCESS DENIED: ${userEmail}`);
            return res.status(403).json({ msg: 'Not authorized as Super Admin' });
        }

        console.log(`[PendingRequests] Fetching requests for SuperAdmin: ${userEmail}`);

        const companies = await Company.findAll({
            where: {
                requested_plan_id: { [Op.ne]: null }
            }
        });
        console.log(`[PendingRequests] Found: ${companies.length} requests`);

        // We need to fetch plan details for the requested_plan_id
        // Ideally we would include Plan model if associated, but let's manual fetch for simplicity or assume FE fetches
        // Let's attach plan name
        const Plan = require('../models/Plan');
        const companiesWithPlans = await Promise.all(companies.map(async (c) => {
            const p = await Plan.findByPk(c.requested_plan_id);
            const plain = c.get({ plain: true });
            plain.requested_plan_name = p ? p.name : 'Unknown';
            plain.requested_plan_price = p ? p.price : 0;
            return plain;
        }));

        res.json(companiesWithPlans);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.approvePlanRequest = async (req, res) => {
    try {
        if (!isSuperAdmin(req.user.email)) {
            return res.status(403).json({ msg: 'Not authorized as Super Admin' });
        }

        const company = await Company.findByPk(req.params.id);
        if (!company || !company.requested_plan_id) {
            return res.status(404).json({ msg: 'No pending request found' });
        }

        const Plan = require('../models/Plan');
        const plan = await Plan.findByPk(company.requested_plan_id);

        if (!plan) return res.status(404).json({ msg: 'Requested plan not found' });

        await company.update({
            plan: plan.name,
            max_sermons: plan.max_sermons,
            max_users: plan.max_users,
            max_churches: plan.max_churches,
            allow_ai: plan.allow_ai,
            requested_plan_id: null
        });

        // Send email to company owner
        try {
            const User = require('../models/User');
            const owner = await User.findOne({ where: { company_id: company.id, role: 'owner' } });

            if (owner) {
                await sendEmail({
                    email: owner.email,
                    subject: `Alteração de Plano Aprovada - VerboCast`,
                    message: `
                        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                            <h2 style="color: #10b981;">Plano Atualizado com Sucesso!</h2>
                            <p>Olá, ${owner.name}.</p>
                            <p>A alteração do plano da <strong>${company.name}</strong> para <strong>${plan.name}</strong> foi aprovada e já está em vigor!</p>
                            <p>Agora você conta com:</p>
                            <ul>
                                <li>${plan.max_sermons === -1 ? 'Sermões Ilimitados' : `${plan.max_sermons} sermões/mês`}</li>
                                <li>${plan.max_users === -1 ? 'Usuários Ilimitados' : `${plan.max_users} usuários`}</li>
                                <li>${plan.max_churches === -1 ? 'Igrejas Ilimitadas' : `${plan.max_churches} igrejas`}</li>
                            </ul>
                            <p>Aproveite os novos recursos!</p>
                            <br>
                            <p>Atenciosamente,<br>Equipe VerboCast</p>
                        </div>
                    `
                });
            }
        } catch (emailErr) {
            console.error('Failed to send approval email:', emailErr);
        }

        res.json({ msg: 'Plan change approved and applied' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.rejectPlanRequest = async (req, res) => {
    try {
        if (!isSuperAdmin(req.user.email)) {
            return res.status(403).json({ msg: 'Not authorized as Super Admin' });
        }

        const company = await Company.findByPk(req.params.id);
        if (!company) return res.status(404).json({ msg: 'Company not found' });

        await company.update({ requested_plan_id: null });

        // Notify Rejection
        try {
            const User = require('../models/User');
            const owner = await User.findOne({ where: { company_id: company.id, role: 'owner' } });

            if (owner) {
                await sendEmail({
                    email: owner.email,
                    subject: `Atualização sobre sua solicitação de plano - VerboCast`,
                    message: `
                        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                            <h2 style="color: #ef4444;">Solicitação não aprovada</h2>
                            <p>Olá, ${owner.name}.</p>
                            <p>Infelizmente não foi possível processar sua solicitação de alteração de plano para a organização <strong>${company.name}</strong> neste momento.</p>
                            <p>Isso pode ter ocorrido por pendências financeiras ou dados cadastrais inconsistentes.</p>
                            <p>Por favor, entre em contato com nosso suporte para mais detalhes.</p>
                            <br>
                            <p>Atenciosamente,<br>Equipe VerboCast</p>
                        </div>
                    `
                });
            }
        } catch (emailErr) {
            console.error('Failed to send rejection email:', emailErr);
        }

        res.json({ msg: 'Plan request rejected' });

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
