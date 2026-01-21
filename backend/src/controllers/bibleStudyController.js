const User = require('../models/User');
const Company = require('../models/Company');
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
        const user = await User.findByPk(req.user.id, {
            include: [{ model: Company }]
        });

        if (!user || !user.Company) {
            return res.status(400).json({ msg: 'User company not found' });
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

        res.json({ content: rawContent });

    } catch (err) {
        console.error('Bible Study Error:', err);
        res.status(500).json({
            msg: 'Erro ao realizar estudo bíblico',
            error: err.message
        });
    }
};
