import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowLeft, Loader2, Edit3, Wand2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function CreateSermon() {
    const navigate = useNavigate();
    const { t, language } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
    const [creationMode, setCreationMode] = useState(user?.allow_ai === false ? 'manual' : 'ai'); // 'ai' or 'manual'

    useEffect(() => {
        const checkPermission = async () => {
            try {
                const res = await api.get('/companies/me');
                if (res.data) {
                    const updatedUser = { ...user, allow_ai: res.data.allow_ai };
                    setUser(updatedUser);
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                    if (res.data.allow_ai === false) {
                        setCreationMode('manual');
                    }
                }
            } catch (err) {
                console.error("Erro ao verificar permissão de IA", err);
            }
        };
        checkPermission();
    }, []);
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
                                type="button"
                                onClick={() => user?.allow_ai !== false && setCreationMode('ai')}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all relative ${creationMode === 'ai'
                                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-md'
                                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                    } ${user?.allow_ai === false ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <Wand2 className="w-4 h-4" />
                                {t.createSermon.optionAI}
                                {user?.allow_ai === false && (
                                    <span className="absolute -top-2 -right-2 bg-amber-500 text-white p-1 rounded-full text-[10px]">
                                        <Loader2 className="w-2.5 h-2.5" />
                                    </span>
                                )}
                            </button>
                            <button
                                onClick={() => setCreationMode('manual')}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${creationMode === 'manual'
                                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-md transform scale-100'
                                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                    }`}
                            >
                                <Edit3 className="w-4 h-4" />
                                {t.createSermon.optionManual}
                            </button>
                        </div>
                    </div>

                    {user?.allow_ai === false && creationMode === 'ai' && (
                        <div className="mb-8 p-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl text-center">
                            <Sparkles className="w-8 h-8 text-amber-500 mx-auto mb-3" />
                            <h3 className="text-lg font-bold text-amber-900 dark:text-amber-200 mb-2">{t.createSermon.premiumFeature}</h3>
                            <p className="text-amber-700 dark:text-amber-400 text-sm mb-4">
                                {t.createSermon.aiRestricted}
                            </p>
                            <button
                                onClick={() => navigate('/organization')}
                                className="px-6 py-2 bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-700 transition shadow-lg shadow-amber-200 dark:shadow-none"
                            >
                                {t.createSermon.upgradeSermons}
                            </button>
                        </div>
                    )}

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
                                                type="text"
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
                                                required={false}
                                                placeholder="Ex: 1-8 ou 'Todo'"
                                                className="input-field"
                                                value={formData.verses}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                    <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium mt-[-1rem]">
                                        ✨ Dica: Deixe os <b>versículos</b> em branco para usar o capítulo todo, ou use um intervalo como <b>1-12</b>.
                                    </p>

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
                                <div className="md:col-span-2">
                                    <label className="label-text">Duração estimada</label>
                                    <select
                                        name="duration"
                                        className="input-field bg-white dark:bg-slate-900"
                                        onChange={handleChange}
                                        value={formData.duration}
                                    >
                                        <option value="15 min">15 minutos</option>
                                        <option value="30 min">30 minutos</option>
                                        <option value="45 min">45 minutos</option>
                                        <option value="60 min">1 hora</option>
                                        <option value="Ilimitada">Ilimitada</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-6">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full py-5 rounded-2xl shadow-xl font-bold flex justify-center items-center transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed ${creationMode === 'ai'
                                        ? 'bg-gradient-to-r from-blue-600 to-sky-600 text-white hover:from-blue-700 hover:to-sky-700 shadow-blue-200 dark:shadow-none'
                                        : 'bg-blue-600 text-white hover:bg-blue-700'
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
