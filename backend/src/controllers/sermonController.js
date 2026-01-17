const Sermon = require('../models/Sermon');
const User = require('../models/User');
const Company = require('../models/Company');
const Groq = require('groq-sdk');
const { Op } = require('sequelize');
require('dotenv').config();

const getAIClient = (company) => {
    console.log('API Keys Availability - Company Groq:', !!company.groq_api_key, 'Company OpenAI:', !!company.openai_api_key, 'Env Groq:', !!process.env.GROQ_API_KEY, 'Env OpenAI:', !!process.env.OPENAI_API_KEY);
    if (company.groq_api_key) {
        return { type: 'groq', client: new Groq({ apiKey: company.groq_api_key }) };
    }
    if (company.openai_api_key) {
        const { OpenAI } = require('openai');
        return { type: 'openai', client: new OpenAI({ apiKey: company.openai_api_key }) };
    }
    // Fallback
    if (process.env.GROQ_API_KEY) {
        return { type: 'groq', client: new Groq({ apiKey: process.env.GROQ_API_KEY }) };
    }
    if (process.env.OPENAI_API_KEY) {
        const { OpenAI } = require('openai');
        return { type: 'openai', client: new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) };
    }
    throw new Error('No AI API Key found for this organization or system.');
};

exports.generateSermon = async (req, res) => {
    const { book, chapter, verses, theme, audience, duration, tone, language } = req.body;

    try {
        console.log('Generating sermon with params:', { book, chapter, verses, language });

        // 1. Check Plan Limits
        const user = await User.findByPk(req.user.id, {
            include: [{ model: Company }]
        });

        if (!user || !user.Company) {
            return res.status(400).json({ msg: 'User company not found' });
        }

        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        // A. Check User Specific Limit
        if (user.sermon_limit !== null) {
            const userUsage = await Sermon.count({
                where: {
                    user_id: user.id,
                    created_at: { [Op.gte]: startOfMonth }
                }
            });

            if (user.sermon_limit !== -1 && userUsage >= user.sermon_limit) {
                console.log(`User limit reached: ${userUsage}/${user.sermon_limit} for user ${user.email}`);
                return res.status(403).json({
                    msg: `Limite mensal de usuário atingido (${userUsage}/${user.sermon_limit}).`
                });
            }
        }

        // B. Check Company Limit
        const companyLimit = user.Company.max_sermons;
        const companyUsage = await Sermon.count({
            include: [{
                model: User,
                where: { company_id: user.company_id }
            }],
            where: {
                created_at: { [Op.gte]: startOfMonth }
            }
        });

        if (companyLimit !== -1 && companyUsage >= companyLimit) {
            console.log(`Company limit reached: ${companyUsage}/${companyLimit} for company ${user.Company.name}`);
            return res.status(403).json({
                msg: `Limite da organização (${user.Company.plan}) atingido (${companyUsage}/${companyLimit}). Fale com o admin.`
            });
        }

        // C. Check AI Permission
        if (user.Company.allow_ai === false) {
            return res.status(403).json({
                msg: 'Seu plano atual não permite a geração de sermões via Inteligência Artificial. Por favor, faça um upgrade para acessar este recurso.'
            });
        }

        // 3. Generate Sermon
        const systemInstruction = `You are an experienced Christian theologian, faithful to the Scriptures.
Your task is to generate a complete Christian sermon based EXCLUSIVELY on the provided passage.

IMPORTANT: The ENTIRE SECTION of your response (the sermon itself) MUST BE WRITTEN IN THE FOLLOWING LANGUAGE: ${language || 'Portuguese'}.
Do not write in English unless the requested language is English.

Passage: ${book} ${chapter}:${verses}
Theme: ${theme || 'General'}
Target Audience: ${audience || 'General'}
Estimated Duration: ${duration || '30 min'}
Tone: ${tone || 'Expository'}
Output Language: ${language || 'Portuguese'}

Required Structure:
1. Creative Title
2. Introduction (with a daily life hook)
3. Biblical Context (simple exegesis)
4. Development (3 main points)
5. Practical Application
6. Conclusion (with appeal or challenge)`;

        const { type, client } = getAIClient(user.Company);
        console.log(`Using AI Client: ${type}`);

        let content = "";
        let inputTokens = 0;
        let outputTokens = 0;
        let aiModel = "";
        let cost = 0;

        // Pricing (USD per 1M tokens) - Update as needed
        const PRICING = {
            'gpt-4o': { input: 2.50, output: 10.00 },
            'llama-3.3-70b-versatile': { input: 0.59, output: 0.79 },
            'gpt-4o-mini': { input: 0.15, output: 0.60 }, // Example for other models if needed
            'llama-3.1-8b-instant': { input: 0.05, output: 0.08 }
        };

        const calculateCost = (model, input, output) => {
            const price = PRICING[model] || { input: 0, output: 0 };
            return ((input * price.input) + (output * price.output)) / 1_000_000;
        };

        if (type === 'groq') {
            console.log('Calling Groq API...');
            aiModel = "llama-3.3-70b-versatile";
            const completion = await client.chat.completions.create({
                messages: [
                    { role: "system", content: "You are a helpful assistant that writes sermons." },
                    { role: "user", content: systemInstruction }
                ],
                model: aiModel,
            });
            content = completion.choices[0].message.content;

            if (completion.usage) {
                inputTokens = completion.usage.prompt_tokens;
                outputTokens = completion.usage.completion_tokens;
                cost = calculateCost(aiModel, inputTokens, outputTokens);
            }

        } else {
            console.log('Calling OpenAI API...');
            aiModel = "gpt-4o";
            const completion = await client.chat.completions.create({
                messages: [
                    { role: "system", content: "You are a helpful assistant that writes sermons." },
                    { role: "user", content: systemInstruction }
                ],
                model: aiModel,
            });
            content = completion.choices[0].message.content;

            if (completion.usage) {
                inputTokens = completion.usage.prompt_tokens;
                outputTokens = completion.usage.completion_tokens;
                cost = calculateCost(aiModel, inputTokens, outputTokens);
            }
        }
        console.log(`AI Response received. Tokens: In=${inputTokens}, Out=${outputTokens}. Cost: $${cost.toFixed(6)}`);

        const newSermon = await Sermon.create({
            user_id: req.user.id,
            company_id: user.company_id,
            book,
            chapter,
            verses,
            theme,
            audience,
            duration,
            tone,
            language: language || 'pt-BR',
            content,
            ai_model: aiModel,
            input_tokens: inputTokens,
            output_tokens: outputTokens,
            cost: cost
        });

        // Fetch with User info for immediate UI update
        const sermonWithAuthor = await Sermon.findByPk(newSermon.id, {
            include: [{ model: User, attributes: ['name'] }]
        });

        res.json(sermonWithAuthor);

    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: err.message || 'AI Generation Error' });
    }
};

exports.getSermons = async (req, res) => {
    try {
        const sermons = await Sermon.findAll({
            where: { company_id: req.user.company_id },
            include: [{ model: User, attributes: ['name'] }],
            order: [['created_at', 'DESC']]
        });
        res.json(sermons);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.getSermonById = async (req, res) => {
    try {
        const sermon = await Sermon.findOne({
            where: { id: req.params.id, company_id: req.user.company_id },
            include: [{ model: User, attributes: ['name'] }]
        });
        if (!sermon) return res.status(404).json({ msg: 'Sermon not found' });
        res.json(sermon);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.deleteSermon = async (req, res) => {
    try {
        const result = await Sermon.destroy({ where: { id: req.params.id, user_id: req.user.id } });
        if (!result) return res.status(404).json({ msg: 'Sermon not found' });
        res.json({ msg: 'Sermon removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.translateSermon = async (req, res) => {
    try {
        const { id } = req.params;
        const { targetLanguage } = req.body;

        const user = await User.findByPk(req.user.id, { include: [Company] });
        const sermon = await Sermon.findOne({ where: { id, user_id: req.user.id } });
        if (!sermon) return res.status(404).json({ msg: 'Sermon not found' });

        const prompt = `Translate the following Christian sermon content to ${targetLanguage}. 
        Output ONLY translated text.
        
        Content:
        ${sermon.content}`;

        const { type, client } = getAIClient(user.Company);
        let translatedContent = "";

        if (type === 'groq') {
            const completion = await client.chat.completions.create({
                messages: [
                    { role: "system", content: "You are a professional translator." },
                    { role: "user", content: prompt }
                ],
                model: "llama-3.1-8b-instant",
            });
            translatedContent = completion.choices[0].message.content;
        } else {
            const completion = await client.chat.completions.create({
                messages: [
                    { role: "system", content: "You are a professional translator." },
                    { role: "user", content: prompt }
                ],
                model: "gpt-4o-mini",
            });
            translatedContent = completion.choices[0].message.content;
        }

        res.json({ content: translatedContent });

    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Translation Error' });
    }
};

exports.createSermon = async (req, res) => {
    try {
        const { theme, content, audience, tone, duration } = req.body;

        // 1. Check Plan Limits
        const user = await User.findByPk(req.user.id, {
            include: [{ model: Company }]
        });

        if (!user || !user.Company) {
            return res.status(400).json({ msg: 'User company not found' });
        }

        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        // A. Check User Specific Limit
        if (user.sermon_limit !== null) {
            const userUsage = await Sermon.count({
                where: {
                    user_id: user.id,
                    created_at: { [Op.gte]: startOfMonth }
                }
            });

            if (user.sermon_limit !== -1 && userUsage >= user.sermon_limit) {
                return res.status(403).json({
                    msg: `Limite mensal de usuário atingido (${userUsage}/${user.sermon_limit}).`
                });
            }
        } else {
            // B. Check Company Limit
            const companyUsage = await Sermon.count({
                where: {
                    company_id: user.company_id,
                    created_at: { [Op.gte]: startOfMonth }
                }
            });

            if (user.Company.max_sermons !== -1 && companyUsage >= user.Company.max_sermons) {
                return res.status(403).json({
                    msg: `Limite mensal da organização atingido (${companyUsage}/${user.Company.max_sermons}).`
                });
            }
        }

        const newSermon = await Sermon.create({
            theme,
            content,
            audience,
            tone,
            duration,
            user_id: req.user.id,
            company_id: req.user.company_id
        });

        // Fetch with User info for immediate UI update
        const sermonWithAuthor = await Sermon.findByPk(newSermon.id, {
            include: [{ model: User, attributes: ['name'] }]
        });

        res.json(sermonWithAuthor);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.updateSermon = async (req, res) => {
    try {
        const { id } = req.params;
        const { theme, content, audience, tone, duration } = req.body;

        const sermon = await Sermon.findOne({ where: { id, user_id: req.user.id } });
        if (!sermon) return res.status(404).json({ msg: 'Sermon not found' });

        await sermon.update({
            theme,
            content,
            audience,
            tone,
            duration
        });

        res.json(sermon);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
