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

        if (type === 'groq') {
            console.log('Calling Groq API...');
            const completion = await client.chat.completions.create({
                messages: [
                    { role: "system", content: "You are a helpful assistant that writes sermons." },
                    { role: "user", content: systemInstruction }
                ],
                model: "llama-3.3-70b-versatile",
            });
            content = completion.choices[0].message.content;
        } else {
            console.log('Calling OpenAI API...');
            const completion = await client.chat.completions.create({
                messages: [
                    { role: "system", content: "You are a helpful assistant that writes sermons." },
                    { role: "user", content: systemInstruction }
                ],
                model: "gpt-4o",
            });
            content = completion.choices[0].message.content;
        }
        console.log('AI Response received');

        const newSermon = await Sermon.create({
            user_id: req.user.id,
            book,
            chapter,
            verses,
            theme,
            audience,
            duration,
            tone,
            language: language || 'pt-BR',
            content
        });

        res.json(newSermon);

    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: err.message || 'AI Generation Error' });
    }
};

exports.getSermons = async (req, res) => {
    try {
        const sermons = await Sermon.findAll({
            where: { user_id: req.user.id },
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
        const sermon = await Sermon.findOne({ where: { id: req.params.id, user_id: req.user.id } });
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
