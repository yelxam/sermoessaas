import React, { useState } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowLeft, Loader2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function CreateSermon() {
    const navigate = useNavigate();
    const { t, language } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        book: '',
        chapter: '',
        verses: '',
        theme: '',
        audience: 'General',
        duration: '30 min',
        tone: 'Expository',
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const getLanguageName = (code) => {
        const map = {
            pt: 'Português',
            es: 'Español',
            en: 'English',
            fr: 'Français',
            de: 'Deutsch'
        };
        return map[code] || 'Português';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                ...formData,
                language: getLanguageName(language),
                // Send the raw key (e.g. 'General') or the translated label? 
                // Backend logic uses these for the prompt. It's better to send the label in the target language
                // or keep english keys and let GPT handle it. 
                // For simplicity, let's send the localized label corresponding to the key.
                audience: t.createSermon.audiences[formData.audience],
                tone: t.createSermon.tones[formData.tone]
            };

            const res = await api.post('/sermons/generate', payload);
            navigate(`/sermons/${res.data.id}`);
        } catch (err) {
            console.error(err);
            alert('Erro ao gerar sermão/Error generating sermon');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="container mx-auto px-6 py-8">
                <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 mb-6 transition">
                    <ArrowLeft className="w-4 h-4 mr-2" /> {t.createSermon.back}
                </button>

                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">{t.createSermon.title}</h1>
                        <p className="text-gray-500 dark:text-gray-400">{t.createSermon.subtitle}</p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <form onSubmit={handleSubmit} className="space-y-6">

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="col-span-1">
                                    <label className="label-text">{t.createSermon.book}</label>
                                    <input name="book" required placeholder="Ex: João" className="input-field" onChange={handleChange} />
                                </div>
                                <div className="col-span-1">
                                    <label className="label-text">{t.createSermon.chapter}</label>
                                    <input name="chapter" required type="number" placeholder="3" className="input-field" onChange={handleChange} />
                                </div>
                                <div className="col-span-1">
                                    <label className="label-text">{t.createSermon.verses}</label>
                                    <input name="verses" required placeholder="16" className="input-field" onChange={handleChange} />
                                </div>
                            </div>

                            <div>
                                <label className="label-text">{t.createSermon.theme}</label>
                                <input name="theme" placeholder="Ex: O amor de Deus" className="input-field" onChange={handleChange} />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="label-text">{t.createSermon.audience}</label>
                                    <select name="audience" className="input-field bg-white dark:bg-slate-900" onChange={handleChange} value={formData.audience}>
                                        {Object.keys(t.createSermon.audiences).map(key => (
                                            <option key={key} value={key}>{t.createSermon.audiences[key]}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="label-text">{t.createSermon.tone}</label>
                                    <select name="tone" className="input-field bg-white dark:bg-slate-900" onChange={handleChange} value={formData.tone}>
                                        {Object.keys(t.createSermon.tones).map(key => (
                                            <option key={key} value={key}>{t.createSermon.tones[key]}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg transition transform hover:scale-[1.01] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="animate-spin mr-2" /> {t.createSermon.generating}
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="mr-2" /> {t.createSermon.generate}
                                        </>
                                    )}
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
