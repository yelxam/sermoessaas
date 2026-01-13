import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Printer } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function SermonDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [sermon, setSermon] = useState(null);
    const [translatedContent, setTranslatedContent] = useState(null);
    const [isTranslating, setIsTranslating] = useState(false);
    const { t, language } = useLanguage();

    useEffect(() => {
        const fetchSermon = async () => {
            try {
                const res = await api.get(`/sermons/${id}`);
                setSermon(res.data);
                // Clear separate translations when loading new sermon
                setTranslatedContent(null);
            } catch (err) {
                console.error(err);
                alert('Erro ao carregar sermão');
            }
        };
        fetchSermon();
    }, [id]);

    // Auto-translation effect
    useEffect(() => {
        const translateIfNeeded = async () => {
            if (!sermon) return;

            // Map simple codes to full names expected by backend/LLM
            const langMap = {
                pt: 'Português',
                es: 'Español',
                en: 'English',
                fr: 'Français',
                de: 'Deutsch'
            };
            const currentLangName = langMap[language] || 'Português';

            // If sermon language matches current system language, reset translation
            // Note: simple string check, backend stores 'Português', 'English', etc.
            if (sermon.language === currentLangName) {
                setTranslatedContent(null);
                return;
            }

            // Trigger translation
            setIsTranslating(true);
            try {
                const res = await api.post(`/sermons/${id}/translate`, { targetLanguage: currentLangName });
                setTranslatedContent(res.data.content);
            } catch (err) {
                console.error("Translation failed", err);
            } finally {
                setIsTranslating(false);
            }
        };

        translateIfNeeded();
    }, [sermon, language, id]);

    const handleDelete = async () => {
        if (window.confirm(t.sermonDetail.confirmDelete)) {
            try {
                await api.delete(`/sermons/${id}`);
                navigate('/sermons');
            } catch (err) {
                console.error(err);
                alert('Erro ao excluir');
            }
        }
    };

    if (!sermon) return <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center dark:text-gray-100">...</div>;

    return (
        <Layout>
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 print:bg-white p-0">
                <div className="container mx-auto px-6 py-8 print:p-0">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex justify-between items-center mb-6 print:hidden">
                            <button onClick={() => navigate('/sermons')} className="flex items-center text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition">
                                <ArrowLeft className="w-4 h-4 mr-2" /> {t.sermonDetail.back}
                            </button>
                            <div className="flex space-x-3">
                                <button onClick={() => window.print()} className="flex items-center space-x-2 px-4 py-2 bg-gray-200 dark:bg-slate-800 hover:bg-gray-300 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200 rounded-lg transition">
                                    <Printer className="w-4 h-4" /> <span>{t.sermonDetail.print}</span>
                                </button>
                                <button onClick={handleDelete} className="flex items-center space-x-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-lg transition">
                                    <Trash2 className="w-4 h-4" /> <span>{t.sermonDetail.delete}</span>
                                </button>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-900 shadow-xl rounded-2xl overflow-hidden print:shadow-none border dark:border-slate-800">
                            <div className="bg-indigo-600 dark:bg-indigo-700 p-8 text-white print:bg-white print:text-black print:p-0 print:mb-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <span className="bg-white/20 text-indigo-50 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide print:hidden">{sermon.language}</span>
                                        <h1 className="text-3xl font-bold mt-4 mb-2">{sermon.theme || t.sermonDetail.untitled}</h1>
                                        <p className="text-indigo-100 text-lg print:text-gray-600">{sermon.book} {sermon.chapter}:{sermon.verses}</p>
                                    </div>
                                    <div className="text-right text-indigo-200 text-sm print:hidden">
                                        <p>{t.sermonDetail.audience}: {sermon.audience}</p>
                                        <p>{t.sermonDetail.tone}: {sermon.tone}</p>
                                        <p>{t.sermonDetail.duration}: {sermon.duration}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 lg:p-12 print:p-0">
                                {isTranslating ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-indigo-500 animate-pulse">
                                        <div className="text-4xl mb-4">🌍</div>
                                        <p>Traduzindo sermão... / Translating...</p>
                                    </div>
                                ) : (
                                    <div className="prose prose-indigo max-w-none text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                                        {translatedContent || sermon.content}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
