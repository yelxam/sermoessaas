const Plan = require('./src/models/Plan');
const sequelize = require('./src/config/database');

const seedPlans = async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync({ alter: true });

        const plans = [
            { name: 'Free', max_sermons: 3, price: 0.00, description: 'Plano gratuito básico' },
            { name: 'Pro', max_sermons: 50, price: 29.90, description: 'Para pastores ativos' },
            { name: 'Enterprise', max_sermons: -1, price: 99.90, description: 'Ilimitado para grandes igrejas' }
        ];

        for (const p of plans) {
            const [plan, created] = await Plan.findOrCreate({
                where: { name: p.name },
                defaults: p
            });
            if (created) console.log(`Plan ${p.name} created.`);
            else console.log(`Plan ${p.name} already exists.`);
        }

        console.log('Plans seeding completed');
        process.exit();
    } catch (err) {
        console.error('Error seeding plans:', err);
        process.exit(1);
    }
};

seedPlans();
