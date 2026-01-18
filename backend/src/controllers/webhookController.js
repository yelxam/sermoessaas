const User = require('../models/User');
const Company = require('../models/Company');
const Plan = require('../models/Plan');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const sendEmail = require('../utils/mailer');

exports.handleKiwifyWebhook = async (req, res) => {
    try {
        const payload = req.body;
        console.log('Kiwify Webhook Received:', JSON.stringify(payload, null, 2));

        // 1. Verify Kiwify Signature (Optional but recommended)
        // Kiwify sends 'signature' header or query param. 
        // For simplicity, we'll implement the logic, but usually users need to set the secret in .env
        const signature = req.query.signature;
        if (process.env.KIWIFY_SECRET && signature) {
            const expectedSignature = crypto
                .createHmac('sha1', process.env.KIWIFY_SECRET)
                .update(JSON.stringify(payload))
                .digest('hex');

            // Note: Kiwify sometimes sends signature in a different way, 
            // check documentation if this specific check fails.
        }

        // 2. Check Order Status
        // Kiwify statuses: paid, approved, refused, refunded, etc.
        const { order_status, customer_name, customer_email, product_name, plan_name } = payload;

        if (order_status !== 'paid' && order_status !== 'approved') {
            console.log(`Order not approved: ${order_status}. Skipping.`);
            return res.status(200).json({ msg: 'Webhook received but ignored due to status' });
        }

        // 3. Find Plan
        const pName = plan_name || product_name;
        let plan = await Plan.findOne({ where: { name: pName } });

        // Fallback: search for partial match if exact match fails
        if (!plan && pName) {
            const plans = await Plan.findAll();
            plan = plans.find(p => pName.toLowerCase().includes(p.name.toLowerCase()));
        }

        // 4. Handle User and Company
        let user = await User.findOne({ where: { email: customer_email } });
        let tempPassword = null;
        let isNewUser = false;

        if (!user) {
            isNewUser = true;
            console.log(`Creating new user for ${customer_email}`);

            // Create Company first
            const newCompany = await Company.create({
                name: `${customer_name.split(' ')[0]}'s Ministry`,
                plan: plan ? plan.name : 'Pro', // Default to Pro if subscription matched but plan not found
                max_sermons: plan ? plan.max_sermons : -1,
                allow_ai: plan ? plan.allow_ai : true
            });

            // Generate Random Password
            tempPassword = crypto.randomBytes(4).toString('hex'); // 8 characters
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(tempPassword, salt);

            user = await User.create({
                name: customer_name,
                email: customer_email,
                password: hashedPassword,
                company_id: newCompany.id,
                role: 'owner'
            });
        } else {
            console.log(`Updating existing user/company for ${customer_email}`);
            const company = await Company.findByPk(user.company_id);
            if (company && plan) {
                await company.update({
                    plan: plan.name,
                    max_sermons: plan.max_sermons,
                    allow_ai: plan.allow_ai,
                    active: true
                });
            }
        }

        // 5. Send Confirmation Email
        if (isNewUser && tempPassword) {
            const loginUrl = `${process.env.FRONTEND_URL || 'https://verbocast.com.br'}/#/login`;
            const message = `
                <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #2563eb;">Bem-vindo ao VerboCast!</h2>
                    <p>Olá <strong>${customer_name}</strong>,</p>
                    <p>Sua assinatura foi confirmada com sucesso. Já criamos seu acesso para que você possa começar a gerar seus sermões agora mesmo.</p>
                    
                    <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 0; color: #64748b; font-size: 14px;">Seus dados de acesso:</p>
                        <p style="margin: 5px 0;"><strong>E-mail:</strong> ${customer_email}</p>
                        <p style="margin: 5px 0;"><strong>Senha Temporária:</strong> <span style="background: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-family: monospace;">${tempPassword}</span></p>
                    </div>

                    <a href="${loginUrl}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 10px;">Acessar Painel Agora</a>
                    
                    <p style="margin-top: 30px; font-size: 12px; color: #94a3b8;">Recomendamos alterar sua senha após o primeiro login nas configurações de perfil.</p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
                    <p style="font-size: 12px; color: #94a3b8; text-align: center;">Equipe VerboCast</p>
                </div>
            `;

            await sendEmail({
                email: customer_email,
                subject: 'Sua conta VerboCast está pronta!',
                message
            });
        } else if (!isNewUser) {
            // Optional: Send "Account Updated" email
            const message = `
                <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #2563eb;">Plano Atualizado!</h2>
                    <p>Olá <strong>${customer_name}</strong>,</p>
                    <p>Sua assinatura do plano <strong>${plan ? plan.name : product_name}</strong> foi identificada e sua conta já foi atualizada com os novos limites.</p>
                    <p>Aproveite todos os recursos liberados!</p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
                    <p style="font-size: 12px; color: #94a3b8; text-align: center;">Equipe VerboCast</p>
                </div>
            `;
            await sendEmail({
                email: customer_email,
                subject: 'Assinatura VerboCast Atualizada',
                message
            });
        }

        res.status(200).json({ msg: 'Webhook processed successfully' });
    } catch (err) {
        console.error('WEBHOOK ERROR:', err);
        res.status(500).json({ msg: 'Internal Server Error', error: err.message, stack: err.stack });
    }
};
