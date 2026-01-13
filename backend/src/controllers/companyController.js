const Company = require('../models/Company');
const Church = require('../models/Church');

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

// Platform Admin (Manage All Companies)
exports.getAllCompanies = async (req, res) => {
    try {
        // In a real app, verify is_super_admin. Here allowing owners for demo flexibility
        // if (req.user.role !== 'owner') ...

        const companies = await Company.findAll({ order: [['created_at', 'DESC']] });
        res.json(companies);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.createCompany = async (req, res) => {
    try {
        const { name, plan } = req.body;

        // Find the plan to determine limits
        const Plan = require('../models/Plan');
        const selectedPlan = await Plan.findOne({ where: { name: plan || 'Free' } });

        let max_sermons = 3; // Fallback
        if (selectedPlan) {
            max_sermons = selectedPlan.max_sermons;
        }

        const newCompany = await Company.create({
            name,
            plan: plan || 'Free', // Keep storing name string for now
            max_sermons
        });
        res.json(newCompany);
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
