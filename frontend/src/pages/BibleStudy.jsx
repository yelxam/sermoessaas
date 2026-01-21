import React, { useState } from 'react';
import Layout from '../components/Layout';
import { Search, Sparkles, Loader2, Copy, RefreshCw, BookMarked, MessageSquare } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import api from '../services/api';

export default function BibleStudy() {
    const { t, language } = useLanguage();
    const [topic, setTopic] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleStudy = async (e) => {
        if (e) e.preventDefault();
        if (!topic.trim()) return;

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const res = await api.post('/sermons/study', {
                topic,
                language: language === 'pt' ? 'Português' : language === 'es' ? 'Español' : 'English'
            });
            setResult(res.data.content);
        } catch (err) {
            console.error('Study error:', err);
            setError(err.response?.data?.msg || 'Erro ao processar estudo');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        if (!result) return;
        navigator.clipboard.writeText(result);
        // Could add a toast alert here
    };

    const formatContent = (content) => {
        if (!content) return null;

        // Split by lines and handle markdown-like bolding and bullets
        return content.split('\n').map((line, i) => {
            if (line.trim().startsWith('#')) {
                return <h3 key={i} className="text-xl font-black text-slate-800 dark:text-white mt-6 mb-3 uppercase tracking-tight">{line.replace(/#/g, '').trim()}</h3>;
            }
            if (line.trim().startsWith('-') || line.trim().startsWith('*')) {
                return <li key={i} className="ml-4 mb-2 text-slate-600 dark:text-slate-300">{line.replace(/^[-*]\s*/, '').trim()}</li>;
            }

            // Highlight Bible references (simplified regex)
            const parts = line.split(/(\d?\s?[A-Z][a-zà-ÿ]+\s\d+:\d+(?:-\d+)?)/g);
            return (
                <p key={i} className="mb-4 text-slate-600 dark:text-slate-300 leading-relaxed font-serif text-lg">
                    {parts.map((part, j) => {
                        if (j % 2 === 1) {
                            return <span key={j} className="text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-900/30 px-1 rounded">{part}</span>;
                        }
                        return part;
                    })}
                </p>
            );
        });
    };

    return (
        <Layout>
            <div className="container mx-auto px-4 sm:px-6 py-8 h-[calc(100vh-100px)] flex flex-col">
                <header className="mb-8">
                    <h1 className="text-3xl font-black text-slate-800 dark:text-white flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-xl">
                            <Sparkles className="text-blue-600" size={28} />
                        </div>
                        {t.bibleStudy.title}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">{t.bibleStudy.subtitle}</p>
                </header>

                <div className="flex-1 flex flex-col lg:flex-row gap-8 overflow-hidden">
                    {/* Search Panel */}
                    <div className="w-full lg:w-96 flex-shrink-0">
                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-100 dark:border-slate-800">
                            <form onSubmit={handleStudy} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
                                        {t.bibleStudy.search}
                                    </label>
                                    <div className="relative">
                                        <Search className="absolute left-4 top-4 text-slate-400" size={20} />
                                        <textarea
                                            value={topic}
                                            onChange={(e) => setTopic(e.target.value)}
                                            placeholder={t.bibleStudy.placeholder}
                                            className="w-full pl-12 pr-4 pt-4 pb-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-white min-h-[120px] resize-none"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleStudy();
                                                }
                                            }}
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || !topic.trim()}
                                    className={`
                                        w-full py-4 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 transition-all
                                        ${loading || !topic.trim()
                                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                                            : 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700 active:scale-[0.98]'
                                        }
                                    `}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="animate-spin" size={20} />
                                            {t.bibleStudy.searching}
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles size={18} />
                                            {t.bibleStudy.search}
                                        </>
                                    )}
                                </button>
                            </form>

                            {error && (
                                <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl text-xs font-bold border border-red-100 dark:border-red-900/30">
                                    {error}
                                </div>
                            )}

                            <div className="mt-8 p-6 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-3 flex items-center gap-2">
                                    <BookMarked size={12} /> Sugestões
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {['O Fruto do Espírito', 'A Fé de Abraão', 'Parábola do Semeador'].map(s => (
                                        <button
                                            key={s}
                                            onClick={() => setTopic(s)}
                                            className="text-[10px] bg-white dark:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 hover:border-blue-500 transition-colors dark:text-slate-300"
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 min-w-0 bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col relative">
                        {loading ? (
                            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                                <div className="relative mb-8">
                                    <div className="absolute inset-0 bg-blue-500 rounded-full blur-2xl opacity-20 animate-pulse"></div>
                                    <div className="relative bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-700">
                                        <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
                                    </div>
                                </div>
                                <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter mb-2">
                                    Aprofundando nas Escrituras...
                                </h2>
                                <p className="text-slate-400 max-w-sm">
                                    Nossa IA está consultando as bases teológicas e referências bíblicas para sua pesquisa.
                                </p>
                            </div>
                        ) : result ? (
                            <>
                                <div className="p-6 border-b dark:border-slate-800 flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-10 sticky top-0">
                                    <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <MessageSquare size={16} className="text-blue-600" />
                                        {t.bibleStudy.results}
                                    </h2>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={copyToClipboard}
                                            className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-black uppercase tracking-tighter hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                        >
                                            <Copy size={14} />
                                            {t.bibleStudy.copy}
                                        </button>
                                        <button
                                            onClick={() => { setResult(null); setTopic(''); }}
                                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-tighter hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20"
                                        >
                                            <RefreshCw size={14} />
                                            {t.bibleStudy.newSearch}
                                        </button>
                                    </div>
                                </div>
                                <div className="flex-1 overflow-y-auto p-8 md:p-12 lg:p-16 custom-scrollbar">
                                    <div className="max-w-3xl mx-auto">
                                        {formatContent(result)}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                                <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center text-slate-200 dark:text-slate-700 mb-8 border border-slate-100 dark:border-slate-800">
                                    <Sparkles size={48} />
                                </div>
                                <h3 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter mb-4">
                                    Pronto para começar seu estudo?
                                </h3>
                                <p className="text-slate-400 max-w-sm mb-8">
                                    Digite um tema teológico ou passagem bíblica na lateral para receber um estudo completo e referenciado.
                                </p>
                                <div className="grid grid-cols-2 gap-4 max-w-md w-full">
                                    {[
                                        { label: 'O Amor de Deus', icon: '❤️' },
                                        { label: 'Santidade', icon: '✨' },
                                        { label: 'Provisão Divina', icon: '🍞' },
                                        { label: 'A Segunda Vinda', icon: '☁️' }
                                    ].map(item => (
                                        <button
                                            key={item.label}
                                            onClick={() => setTopic(item.label)}
                                            className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl hover:border-blue-500 hover:bg-white dark:hover:bg-slate-800 transition-all text-left group"
                                        >
                                            <span className="text-2xl mb-2 block">{item.icon}</span>
                                            <span className="font-bold text-slate-600 dark:text-slate-300 group-hover:text-blue-600 transition-colors uppercase text-[10px] tracking-widest">{item.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}
