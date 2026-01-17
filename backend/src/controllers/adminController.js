const Sermon = require('../models/Sermon');
const User = require('../models/User');
const Company = require('../models/Company');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

exports.getMetrics = async (req, res) => {
    try {
        // Fetch full user to verify email (token usually doesn't have email)
        const user = await User.findByPk(req.user.id);

        if (!user || user.email !== 'admin@sermon.ai') {
            return res.status(403).json({ msg: 'Acesso negado' });
        }

        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        // 1. Total Sermons
        const totalSermons = await Sermon.count();
        const monthlySermons = await Sermon.count({
            where: { created_at: { [Op.gte]: startOfMonth } }
        });

        // 2. Token Usage & Cost (Aggregated)
        const totalUsage = await Sermon.findAll({
            attributes: [
                [sequelize.fn('SUM', sequelize.col('input_tokens')), 'total_input'],
                [sequelize.fn('SUM', sequelize.col('output_tokens')), 'total_output'],
                [sequelize.fn('SUM', sequelize.col('cost')), 'total_cost']
            ],
            raw: true
        });

        const monthlyUsage = await Sermon.findAll({
            attributes: [
                [sequelize.fn('SUM', sequelize.col('input_tokens')), 'month_input'],
                [sequelize.fn('SUM', sequelize.col('output_tokens')), 'month_output'],
                [sequelize.fn('SUM', sequelize.col('cost')), 'month_cost']
            ],
            where: { created_at: { [Op.gte]: startOfMonth } },
            raw: true
        });

        // Safe defaults if null
        const stats = {
            sermons: {
                total: totalSermons,
                month: monthlySermons
            },
            tokens: {
                total: (parseInt(totalUsage[0]?.total_input) || 0) + (parseInt(totalUsage[0]?.total_output) || 0),
                total_input: parseInt(totalUsage[0]?.total_input) || 0,
                total_output: parseInt(totalUsage[0]?.total_output) || 0,
                month: (parseInt(monthlyUsage[0]?.month_input) || 0) + (parseInt(monthlyUsage[0]?.month_output) || 0)
            },
            cost: {
                total: parseFloat(totalUsage[0]?.total_cost) || 0,
                month: parseFloat(monthlyUsage[0]?.month_cost) || 0
            }
        };

        // 3. Top Spending Companies (Optional breakdown)
        // Leaving basic for now as requested: "exiba essas informações no painel"

        res.json(stats);

    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server Error' });
    }
};
