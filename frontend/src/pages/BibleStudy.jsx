import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Search, Sparkles, Loader2, Copy, RefreshCw, BookMarked, MessageSquare, History, Trash2, ChevronRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import api from '../services/api';

export default function BibleStudy() {
    const { t, language } = useLanguage();
    const [topic, setTopic] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [history, setHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(true);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            setLoadingHistory(true);
            const res = await api.get('/sermons/study');
            setHistory(res.data);
        } catch (err) {
            console.error('Failed to fetch history:', err);
        } finally {
            setLoadingHistory(false);
        }
    };

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
            // res.data is the saved study object
            setResult(res.data.content);
            fetchHistory(); // Refresh history list
        } catch (err) {
            console.error('Study error:', err);
            setError(err.response?.data?.msg || 'Erro ao processar estudo');
        } finally {
            setLoading(false);
        }
    };

    const deleteStudy = async (id, e) => {
        e.stopPropagation();
        if (!window.confirm('Excluir este estudo permanentemente?')) return;

        try {
            await api.delete(`/sermons/study/${id}`);
            setHistory(history.filter(s => s.id !== id));
            if (result && result.id === id) setResult(null);
        } catch (err) {
            console.error('Delete error:', err);
        }
    };

    const selectFromHistory = (study) => {
        setResult(study.content);
        setTopic(study.topic);
    };

    const copyToClipboard = () => {
        if (!result) return;
        navigator.clipboard.writeText(result);
    };

    const formatContent = (content) => {
        if (!content) return null;

        return content.split('\n').map((line, i) => {
            if (line.trim().startsWith('# ')) {
                return <h3 key={i} className="text-xl font-black text-slate-800 dark:text-white mt-6 mb-3 uppercase tracking-tight">{line.replace(/#/g, '').trim()}</h3>;
            }
            if (line.trim().startsWith('## ')) {
                return <h4 key={i} className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-4 mb-2">{line.replace(/#/g, '').trim()}</h4>;
            }
            if (line.trim().startsWith('-') || line.trim().startsWith('*')) {
                return <li key={i} className="ml-4 mb-2 text-slate-600 dark:text-slate-300">{line.replace(/^[-*]\s*/, '').trim()}</li>;
            }

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
                <header className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 dark:text-white flex items-center gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-xl">
                                <Sparkles className="text-blue-600" size={28} />
                            </div>
                            {t.bibleStudy.title}
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-2">{t.bibleStudy.subtitle}</p>
                    </div>
                </header>

                <div className="flex-1 flex flex-col lg:flex-row gap-8 overflow-hidden">
                    {/* Left Sidebar: Search & History */}
                    <div className="w-full lg:w-96 flex-shrink-0 flex flex-col gap-6 overflow-hidden">
                        {/* Search Panel */}
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
                                            className="w-full pl-12 pr-4 pt-4 pb-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-white min-h-[100px] resize-none"
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
                                    {loading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={18} />}
                                    {loading ? t.bibleStudy.searching : t.bibleStudy.search}
                                </button>
                            </form>
                            {error && <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-2xl text-xs font-bold border border-red-100">{error}</div>}
                        </div>

                        {/* History Panel */}
                        <div className="flex-1 bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                                <History size={14} /> Histórico de Estudos
                            </h4>
                            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2">
                                {loadingHistory ? (
                                    <div className="flex justify-center py-8"><Loader2 className="animate-spin text-slate-300" size={24} /></div>
                                ) : history.length > 0 ? (
                                    history.map((s) => (
                                        <div
                                            key={s.id}
                                            onClick={() => selectFromHistory(s)}
                                            className="group relative p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-transparent hover:border-blue-500 cursor-pointer transition-all"
                                        >
                                            <div className="pr-8">
                                                <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{s.topic}</p>
                                                <p className="text-[10px] text-slate-400 mt-1">{new Date(s.created_at).toLocaleDateString()}</p>
                                            </div>
                                            <button
                                                onClick={(e) => deleteStudy(s.id, e)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-2 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center text-slate-400 text-xs py-8">Nenhum estudo salvo ainda.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: Content Display */}
                    <div className="flex-1 bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col relative">
                        {loading ? (
                            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                                <Loader2 className="w-16 h-16 text-blue-600 animate-spin mb-4" />
                                <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Aprofundando nas Escrituras...</h2>
                            </div>
                        ) : result ? (
                            <>
                                <div className="p-6 border-b dark:border-slate-800 flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-10 sticky top-0">
                                    <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <MessageSquare size={16} className="text-blue-600" /> Resultado do Estudo
                                    </h2>
                                    <div className="flex items-center gap-3">
                                        <button onClick={copyToClipboard} className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-black uppercase hover:bg-blue-600 hover:text-white transition-all">
                                            <Copy size={14} /> {t.bibleStudy.copy}
                                        </button>
                                        <button onClick={() => { setResult(null); setTopic(''); }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-black uppercase hover:bg-blue-700 transition-all">
                                            <RefreshCw size={14} /> {t.bibleStudy.newSearch}
                                        </button>
                                    </div>
                                </div>
                                <div className="flex-1 overflow-y-auto p-8 md:p-12 custom-scrollbar">
                                    <div className="max-w-3xl mx-auto">{formatContent(result)}</div>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                                <Sparkles className="text-slate-200 dark:text-slate-800 mb-6" size={64} />
                                <h3 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter mb-4">Seu estudo teológico aparecerá aqui</h3>
                                <p className="text-slate-400 max-w-sm">Use o campo lateral para pesquisar um tema ou selecione um estudo do histórico.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}
