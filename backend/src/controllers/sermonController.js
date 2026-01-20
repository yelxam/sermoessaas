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

const checkAndResetMonthlyUsage = async (company) => {
    const now = new Date();
    const lastReset = new Date(company.last_reset_date);

    // Check if we entered a new month
    if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
        company.sermons_count_month = 0;
        company.last_reset_date = now;
        await company.save();
    }
    return company;
};

exports.generateSermon = async (req, res) => {
    const { book, chapter, verses, theme, audience, duration, tone, language, church_name, event_date } = req.body;

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

        // A. Check User Specific Limit (Use dynamic count per user for now, or add field to User if strict monotonic needed per user)
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

        // B. Check Company Limit (Monotonic Persistent Counter)
        await checkAndResetMonthlyUsage(user.Company);

        if (user.Company.max_sermons !== -1 && user.Company.sermons_count_month >= user.Company.max_sermons) {
            return res.status(403).json({
                msg: `Limite da organização (${user.Company.plan}) atingido (${user.Company.sermons_count_month}/${user.Company.max_sermons}). Fale com o admin.`
            });
        }

        // C. Check AI Permission
        if (user.Company.allow_ai === false) {
            return res.status(403).json({
                msg: 'Seu plano atual não permite a geração de sermões via Inteligência Artificial. Por favor, faça um upgrade para acessar este recurso.'
            });
        }

        // 3. Prepare the reference string
        let passageReference = `${book} ${chapter}`;
        if (verses && verses.toLowerCase() !== 'all' && verses.toLowerCase() !== 'todo' && verses.trim() !== '') {
            passageReference += `:${verses}`;
        } else {
            passageReference += ` (Todo o capítulo)`;
        }

        // 4. Generate Sermon
        const systemInstruction = `You are an experienced Christian theologian, faithful to the Scriptures.
Your task is to generate a complete Christian sermon based EXCLUSIVELY on the provided passage selection.

IMPORTANT: The ENTIRE SECTION of your response (the sermon itself) MUST BE WRITTEN IN THE FOLLOWING LANGUAGE: ${language || 'Portuguese'}.
Do not write in English unless the requested language is English.

Passage Selection: ${passageReference}
Theme: ${theme || 'General'}
Target Audience: ${audience || 'General'}
Estimated Duration: ${duration || '30 min'}
Tone: ${tone || 'Expository'}
Output Language: ${language || 'Portuguese'}

Required Structure:
1. Creative Title
2. Introduction (with a daily life hook)
3. Biblical Context and Exegesis of the specific selection (${passageReference})
4. Development (3 main points derived from the text)
5. Practical Application
7. Conclusion (with appeal or challenge)
8. RELATED_VERSES: List at least 5 other biblical references (Book Chapter:Verse) where this theme is cited, with a very brief explanation (1 sentence) for each.

IMPORTANT: End the sermon content and start the related verses section with the exact tag: [RELATED_VERSES_START]`;

        const { type, client } = getAIClient(user.Company);
        console.log(`Using AI Client: ${type}`);

        let rawContent = "";

        if (type === 'groq') {
            console.log('Calling Groq API...');
            const completion = await client.chat.completions.create({
                messages: [
                    { role: "system", content: "You are a helpful assistant that writes sermons. Always follow the language requirement." },
                    { role: "user", content: systemInstruction }
                ],
                model: "llama-3.3-70b-versatile",
            });
            rawContent = completion.choices[0].message.content;
        } else {
            console.log('Calling OpenAI API...');
            const completion = await client.chat.completions.create({
                messages: [
                    { role: "system", content: "You are a helpful assistant that writes sermons. Always follow the language requirement." },
                    { role: "user", content: systemInstruction }
                ],
                model: "gpt-4o",
            });
            rawContent = completion.choices[0].message.content;
        }
        console.log('AI Response received');

        // Split content and related verses
        let content = rawContent;
        let related_verses = "";

        if (rawContent.includes('[RELATED_VERSES_START]')) {
            const parts = rawContent.split('[RELATED_VERSES_START]');
            content = parts[0].trim();
            related_verses = parts[1].trim();
        }

        console.log(`Creating Sermon record for User ${req.user.id}, Company ${user.company_id}`);
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
            related_verses,
            church_name,
            event_date
        });

        // Fetch with User info for immediate UI update
        const sermonWithAuthor = await Sermon.findByPk(newSermon.id, {
            include: [{ model: User, attributes: ['name'] }]
        });

        // Increment usage
        await user.Company.increment('sermons_count_month');

        res.json(sermonWithAuthor);

    } catch (err) {
        console.error('AI Generation Error:', err);
        res.status(500).json({
            msg: 'Erro na geração por IA',
            error: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
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
        const sermon = await Sermon.findByPk(req.params.id);
        if (!sermon) return res.status(404).json({ msg: 'Sermon not found' });

        // Allow if it's the author OR an admin/owner of the same company
        const canDelete = sermon.user_id === req.user.id || req.user.role === 'owner' || req.user.role === 'admin';

        if (!canDelete || (sermon.company_id !== req.user.company_id)) {
            return res.status(403).json({ msg: 'Not authorized to delete this sermon' });
        }

        await sermon.destroy();
        res.json({ msg: 'Sermon removed' });
    } catch (err) {
        console.error('Delete Sermon Error:', err.message);
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
        const { theme, content, audience, tone, duration, church_name, event_date } = req.body;
        console.log(`[ManualSermon] Request from user ${req.user?.id} in company ${req.user?.company_id}`);

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
            await checkAndResetMonthlyUsage(user.Company);

            if (user.Company.max_sermons !== -1 && user.Company.sermons_count_month >= user.Company.max_sermons) {
                return res.status(403).json({
                    msg: `Limite mensal da organização atingido (${user.Company.sermons_count_month}/${user.Company.max_sermons}).`
                });
            }
        }

        console.log(`[ManualSermon] Saving record for theme: ${theme}`);
        const newSermon = await Sermon.create({
            theme,
            content,
            audience,
            tone,
            duration,
            church_name,
            event_date,
            user_id: req.user.id,
            company_id: req.user.company_id
        });

        // Fetch with User info for immediate UI update
        const sermonWithAuthor = await Sermon.findByPk(newSermon.id, {
            include: [{ model: User, attributes: ['name'] }]
        });

        // Increment usage if company limit applies (or generally if we track usage for everything)
        if (user.sermon_limit === null) {
            await user.Company.increment('sermons_count_month');
        }

        res.json(sermonWithAuthor);
    } catch (err) {
        console.error('Manual Sermon Creation Error:', err);
        res.status(500).json({
            msg: 'Erro ao criar sermão manualmente',
            error: err.message
        });
    }
};

exports.updateSermon = async (req, res) => {
    try {
        const { id } = req.params;
        const { theme, content, audience, tone, duration, church_name, event_date } = req.body;

        const sermon = await Sermon.findByPk(id);
        if (!sermon) return res.status(404).json({ msg: 'Sermon not found' });

        // Allow if author OR admin/owner of same company
        const canEdit = sermon.user_id === req.user.id || req.user.role === 'owner' || req.user.role === 'admin';
        if (!canEdit || (sermon.company_id !== req.user.company_id)) {
            return res.status(403).json({ msg: 'Not authorized to edit this sermon' });
        }

        await sermon.update({
            theme,
            content,
            audience,
            tone,
            duration,
            church_name,
            event_date
        });

        res.json(sermon);
    } catch (err) {
        console.error('Update Sermon Error:', err.message);
        res.status(500).send('Server Error');
    }
};
