import React, { useState } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowLeft, Loader2, Edit3, Wand2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function CreateSermon() {
    const navigate = useNavigate();
    const { t, language } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [creationMode, setCreationMode] = useState('ai'); // 'ai' or 'manual'
    const [formData, setFormData] = useState({
        book: '',
        chapter: '',
        verses: '',
        theme: '',
        content: '', // For manual mode
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
            if (creationMode === 'ai') {
                const payload = {
                    ...formData,
                    language: getLanguageName(language),
                    audience: t.createSermon.audiences[formData.audience],
                    tone: t.createSermon.tones[formData.tone]
                };
                const res = await api.post('/sermons/generate', payload);
                navigate(`/sermons/${res.data.id}`);
            } else {
                const payload = {
                    theme: formData.theme,
                    content: formData.content,
                    audience: t.createSermon.audiences[formData.audience],
                    tone: t.createSermon.tones[formData.tone],
                    duration: formData.duration
                };
                const res = await api.post('/sermons', payload);
                navigate(`/sermons/${res.data.id}`);
            }
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.msg || 'Erro ao criar sermão');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="container mx-auto px-4 sm:px-6 py-8">
                <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 mb-6 transition font-medium">
                    <ArrowLeft className="w-4 h-4 mr-2" /> {t.createSermon.back}
                </button>

                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
                            {creationMode === 'ai' ? t.createSermon.title : t.createSermon.manualTitle}
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400">
                            {creationMode === 'ai' ? t.createSermon.subtitle : t.createSermon.manualSubtitle}
                        </p>
                    </div>

                    {/* Mode Selector Toggle */}
                    <div className="flex justify-center mb-8">
                        <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl inline-flex shadow-inner">
                            <button
                                onClick={() => setCreationMode('ai')}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${creationMode === 'ai'
                                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-md transform scale-100'
                                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                    }`}
                            >
                                <Wand2 className="w-4 h-4" />
                                {t.createSermon.optionAI}
                            </button>
                            <button
                                onClick={() => setCreationMode('manual')}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${creationMode === 'manual'
                                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-md transform scale-100'
                                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                    }`}
                            >
                                <Edit3 className="w-4 h-4" />
                                {t.createSermon.optionManual}
                            </button>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-slate-800 p-6 sm:p-10 transition-all duration-500">
                        <form onSubmit={handleSubmit} className="space-y-8">

                            {creationMode === 'ai' ? (
                                <>
                                    {/* AI MODE FIELDS */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="col-span-1">
                                            <label className="label-text">{t.createSermon.book}</label>
                                            <input
                                                name="book"
                                                required={creationMode === 'ai'}
                                                placeholder="Ex: João"
                                                className="input-field"
                                                value={formData.book}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div className="col-span-1">
                                            <label className="label-text">{t.createSermon.chapter}</label>
                                            <input
                                                name="chapter"
                                                required={creationMode === 'ai'}
                                                type="number"
                                                placeholder="3"
                                                className="input-field"
                                                value={formData.chapter}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div className="col-span-1">
                                            <label className="label-text">{t.createSermon.verses}</label>
                                            <input
                                                name="verses"
                                                required={creationMode === 'ai'}
                                                placeholder="16"
                                                className="input-field"
                                                value={formData.verses}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="label-text">{t.createSermon.theme}</label>
                                        <input
                                            name="theme"
                                            placeholder="Ex: O amor de Deus"
                                            className="input-field"
                                            value={formData.theme}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* MANUAL MODE FIELDS */}
                                    <div>
                                        <label className="label-text">{t.createSermon.manualThemeLabel}</label>
                                        <input
                                            name="theme"
                                            required={creationMode === 'manual'}
                                            placeholder="Ex: O amor de Deus"
                                            className="input-field"
                                            value={formData.theme}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div>
                                        <label className="label-text">{t.createSermon.manualContentLabel}</label>
                                        <textarea
                                            name="content"
                                            required={creationMode === 'manual'}
                                            placeholder="Escreva seu sermão aqui..."
                                            className="input-field min-h-[300px] py-4 resize-none leading-relaxed"
                                            value={formData.content}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </>
                            )}

                            {/* COMMON FIELDS */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="label-text">{t.createSermon.audience}</label>
                                    <select
                                        name="audience"
                                        className="input-field bg-white dark:bg-slate-900"
                                        onChange={handleChange}
                                        value={formData.audience}
                                    >
                                        {Object.keys(t.createSermon.audiences).map(key => (
                                            <option key={key} value={key}>{t.createSermon.audiences[key]}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="label-text">{t.createSermon.tone}</label>
                                    <select
                                        name="tone"
                                        className="input-field bg-white dark:bg-slate-900"
                                        onChange={handleChange}
                                        value={formData.tone}
                                    >
                                        {Object.keys(t.createSermon.tones).map(key => (
                                            <option key={key} value={key}>{t.createSermon.tones[key]}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="pt-6">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full py-5 rounded-2xl shadow-xl font-bold flex justify-center items-center transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed ${creationMode === 'ai'
                                            ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-700 hover:to-violet-700 shadow-indigo-200 dark:shadow-none'
                                            : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                        }`}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="animate-spin mr-3 w-5 h-5" />
                                            {creationMode === 'ai' ? t.createSermon.generating : t.createSermon.savingManual}
                                        </>
                                    ) : (
                                        <>
                                            {creationMode === 'ai' ? (
                                                <><Sparkles className="mr-3 w-5 h-5" /> {t.createSermon.generate}</>
                                            ) : (
                                                <><Edit3 className="mr-3 w-5 h-5" /> {t.createSermon.saveManual}</>
                                            )}
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
