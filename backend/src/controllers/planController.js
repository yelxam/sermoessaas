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
        const { name, max_sermons, price, description } = req.body;

        // Only admin/owner can create plans (usually super admin)
        // Assuming the auth middleware already checks for basic role, but we might want stricter check here
        if (req.user.role !== 'owner' && req.user.role !== 'admin') {
            return res.status(403).json({ msg: 'Not authorized' });
        }

        const newPlan = await Plan.create({
            name,
            max_sermons,
            price,
            description
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
        const { name, max_sermons, price, description, active } = req.body;

        if (req.user.role !== 'owner' && req.user.role !== 'admin') {
            return res.status(403).json({ msg: 'Not authorized' });
        }

        const plan = await Plan.findByPk(id);
        if (!plan) return res.status(404).json({ msg: 'Plan not found' });

        await plan.update({ name, max_sermons, price, description, active });
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
