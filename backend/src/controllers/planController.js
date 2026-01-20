const Plan = require('../models/Plan');

// List all plans
exports.getAllPlans = async (req, res) => {
    try {
        const plans = await Plan.findAll({
            where: { active: true },
            order: [['price', 'ASC']]
        });
        res.json(plans);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Create a new plan
exports.createPlan = async (req, res) => {
    try {
        const { name, max_sermons, max_users, price, description, allow_ai } = req.body;

        // Only admin/owner can create plans (usually super admin)
        // Assuming the auth middleware already checks for basic role, but we might want stricter check here
        if (req.user.role !== 'owner' && req.user.role !== 'admin') {
            return res.status(403).json({ msg: 'Not authorized' });
        }

        const newPlan = await Plan.create({
            name,
            max_sermons,
            max_users: max_users !== undefined ? max_users : 1,
            price,
            description,
            allow_ai: allow_ai !== undefined ? allow_ai : true
        });

        res.json(newPlan);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Update a plan
exports.updatePlan = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, max_sermons, max_users, price, description, active, allow_ai } = req.body;

        if (req.user.role !== 'owner' && req.user.role !== 'admin') {
            return res.status(403).json({ msg: 'Not authorized' });
        }

        const plan = await Plan.findByPk(id);
        if (!plan) return res.status(404).json({ msg: 'Plan not found' });

        const oldPlanName = plan.name;
        await plan.update({ name, max_sermons, max_users, price, description, active, allow_ai });

        // Sync with companies that use this plan
        const Company = require('../models/Company');
        await Company.update(
            {
                plan: plan.name, // In case name changed
                max_sermons: plan.max_sermons,
                max_users: plan.max_users,
                allow_ai: plan.allow_ai
            },
            { where: { plan: oldPlanName } }
        );

        res.json(plan);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Delete (soft delete via active flag usually preferable, but here simple delete)
exports.deletePlan = async (req, res) => {
    try {
        const { id } = req.params;
        if (req.user.role !== 'owner' && req.user.role !== 'admin') {
            return res.status(403).json({ msg: 'Not authorized' });
        }

        await Plan.destroy({ where: { id } });
        res.json({ msg: 'Plan deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
