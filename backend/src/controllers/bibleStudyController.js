const User = require('../models/User');
const Company = require('../models/Company');
const BibleStudy = require('../models/BibleStudy');
const Groq = require('groq-sdk');
require('dotenv').config();

const getAIClient = (company) => {
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

exports.conductStudy = async (req, res) => {
    const { topic, language } = req.body;

    if (!topic) {
        return res.status(400).json({ msg: 'Topic is required' });
    }

    try {
        const Plan = require('../models/Plan');
        const user = await User.findByPk(req.user.id, {
            include: [{ model: Company }]
        });

        // If association alias is not set in Company/Plan models yet, we might need a direct query or fix association.
        // Assuming Company belongsTo Plan. Let's verify association in Company model or use basic fetch.
        // Actually, Company.belongsTo(Plan) is likely setup. Let's check Company.js? 
        // We will assume standard association or fetch plan manually if needed.
        // Safe approach: Fetch Plan manually if relation is tricky.

        if (!user || !user.Company) {
            return res.status(400).json({ msg: 'User company not found' });
        }

        let plan = null;
        // Standardize plan fetching
        // Company.plan uses a string (free/pro) old style?
        // Ah, checked Company.js, it has `requested_plan_id` but maybe `plan` column is string?
        // Sync script added columns but typically we use plan_id.
        // Let's look at check_data.js output: "Company: ... Plan ID: undefined". 
        // Company.js has: `plan: { type: DataTypes.STRING, defaultValue: 'free' }`.

        // LIMIT CHECK LOGIC
        // We will use a simple map for now if plan is just a string, OR check against Plan table if available.
        // Given we added `max_bible_studies` to `Plan` entity, we must rely on Plan entity.
        // BUT Company.js does NOT have `plan_id` column explicitly defined in the file I viewed (Step 1139).
        // Wait, did I miss it? 
        // Step 1139: `requested_plan_id`. But verified check_data.js output.
        // `Company.findAll({ attributes: ['id', 'name', 'allow_bible_study', 'plan_id'] })` produced `Plan ID: undefined`.
        // This means `plan_id` is NOT in the model definition in JS, even if in DB.

        // HOWEVER, `plan` column is a STRING ('free', 'pro').
        // AND `Plan` model matches names.
        // Let's fetch the Plan by name.

        plan = await Plan.findOne({ where: { name: user.Company.plan } });
        if (!plan) {
            // Fallback default
            plan = { max_bible_studies: 5 };
        }

        // Plan Permission Check
        if (!user.Company.allow_bible_study && !plan.allow_bible_study) {
            return res.status(403).json({
                msg: 'Seu plano atual não permite o acesso ao módulo de Estudos Bíblicos com IA. Por favor, faça um upgrade.'
            });
        }

        // Limit Check
        const currentUsage = user.Company.bible_studies_count_month || 0;
        const limit = plan.max_bible_studies;

        if (limit !== -1 && currentUsage >= limit) {
            return res.status(403).json({
                msg: `Você atingiu o limite mensal de estudos bíblicos (${limit}). Faça um upgrade para continuar.`
            });
        }

        const systemInstruction = `Você é um tutor teológico acadêmico e pastoral, especializado em exegese e hermenêutica bíblica.
Sua tarefa é realizar um ESTUDO BÍBLICO PROFUNDO e simplificado sobre o tema fornecido.

ESTRUTURA OBRIGATÓRIA DA RESPOSTA:
1. # TÍTULO DO ESTUDO: Defina um título teológico impactante.
2. # INTRODUÇÃO: Uma visão geral do conceito bíblico do tema.
3. # FUNDAMENTAÇÃO BÍBLICA: Explique o tema dividindo em tópicos (usando ##). Cada parágrafo deve conter referências bíblicas (Livro Capítulo:Versículo).
4. # ANÁLISE DE CONTEXTO: Explique o contexto original de pelo menos uma passagem chave.
5. # APLICAÇÃO PRÁTICA: Como este estudo se aplica à vida cristã hoje.
6. # VERSÍCULOS CHAVE: Uma lista formatada com [Livro Cap:Ver] - "Texto bíblico simplificado".

REGRAS CRÍTICAS:
- Use apenas as Escrituras Sagradas como fonte.
- Linguagem deve ser Clara, Acessível e Profunda (Evite jargões sem explicação).
- O idioma da resposta deve ser: ${language || 'Português'}.
- Use formatação Markdown ( # para títulos, ## para subtítulos, - para listas).

Tema: ${topic}
`;

        const { type, client } = getAIClient(user.Company);
        let rawContent = "";

        if (type === 'groq') {
            const completion = await client.chat.completions.create({
                messages: [
                    { role: "system", content: "Você é um assistente de estudos bíblicos altamente qualificado." },
                    { role: "user", content: systemInstruction }
                ],
                model: "llama-3.3-70b-versatile",
            });
            rawContent = completion.choices[0].message.content;
        } else {
            const completion = await client.chat.completions.create({
                messages: [
                    { role: "system", content: "Você é um assistente de estudos bíblicos altamente qualificado." },
                    { role: "user", content: systemInstruction }
                ],
                model: "gpt-4o",
            });
            rawContent = completion.choices[0].message.content;
        }

        // Save study
        const savedStudy = await BibleStudy.create({
            user_id: req.user.id,
            company_id: user.company_id,
            topic,
            content: rawContent
        });

        // Increment usage
        await user.Company.increment('bible_studies_count_month');

        res.json(savedStudy);

    } catch (err) {
        console.error('Bible Study Error:', err);
        res.status(500).json({
            msg: 'Erro ao realizar estudo bíblico',
            error: err.message
        });
    }
};

exports.getStudies = async (req, res) => {
    try {
        const studies = await BibleStudy.findAll({
            where: { company_id: req.user.company_id },
            order: [['created_at', 'DESC']]
        });
        res.json(studies);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.deleteStudy = async (req, res) => {
    try {
        const study = await BibleStudy.findOne({
            where: { id: req.params.id, company_id: req.user.company_id }
        });
        if (!study) return res.status(404).json({ msg: 'Estudo não encontrado' });

        await study.destroy();
        res.json({ msg: 'Estudo deletado com sucesso' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
