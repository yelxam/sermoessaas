import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { Link } from 'react-router-dom';
import { PlusCircle, FileText, ChevronRight } from 'lucide-react';
import api from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';

export default function Dashboard() {
    const [stats, setStats] = useState({ count: 0 });
    const [recentSermons, setRecentSermons] = useState([]);
    const [currentTip, setCurrentTip] = useState({ text: '', ref: '' });
    const user = JSON.parse(localStorage.getItem('user'));
    const { t } = useLanguage();

    useEffect(() => {
        const updateTip = () => {
            if (t.dashboard.tips && t.dashboard.tips.length > 0) {
                const hourIndex = Math.floor(Date.now() / (1000 * 60 * 60));
                const tip = t.dashboard.tips[hourIndex % t.dashboard.tips.length];
                setCurrentTip(tip);
            }
        };

        updateTip();
        const interval = setInterval(updateTip, 60000); // Check every minute if hour changed
        return () => clearInterval(interval);
    }, [t]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get('/sermons');
                setStats({ count: res.data.length });
                setRecentSermons(res.data.slice(0, 3));
            } catch (err) {
                console.error("Failed to load dashboard data");
            }
        };
        fetchData();
    }, []);

    return (
        <Layout>
            <div className="container mx-auto px-6 py-8">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">{t.dashboard.title}</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">{t.dashboard.welcome}, {user?.name}.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                    {/* SuperAdmin Quick Link */}
                    {user?.email === 'admin@sermon.ai' && (
                        <Link to="/admin" className="bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-2xl shadow-lg p-6 flex flex-col justify-between hover:shadow-2xl transition transform hover:-translate-y-1 overflow-hidden relative border-2 border-white/20">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <PlusCircle size={100} className="rotate-45" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-2">Painel de Controle</h3>
                                <p className="text-amber-50 text-sm">Gerenciar todas as empresas e planos do sistema.</p>
                            </div>
                            <div className="mt-4 flex items-center font-bold">
                                Acessar Administração <ChevronRight className="ml-2 w-4 h-4" />
                            </div>
                        </Link>
                    )}

                    {/* Quick Action: New Sermon */}
                    <Link to="/sermons/new" className="group bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-2xl shadow-lg p-6 flex flex-col justify-between hover:shadow-2xl transition transform hover:-translate-y-1 overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
                            <PlusCircle size={100} />
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold mb-2">{t.dashboard.quickAction}</h3>
                            <p className="text-blue-100 text-sm">{t.dashboard.quickActionDesc}</p>
                        </div>
                        <div className="mt-4 flex items-center font-medium">
                            {t.dashboard.startNow} <ChevronRight className="ml-2 w-4 h-4" />
                        </div>
                    </Link>

                    {/* Stat Card */}
                    <Link to="/sermons" className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-6 flex flex-col justify-between hover:border-blue-200 dark:hover:border-blue-900 transition">
                        <div>
                            <h3 className="text-gray-500 dark:text-gray-400 font-medium mb-1 uppercase text-xs tracking-wider">{t.dashboard.totalSermons}</h3>
                            <div className="text-4xl font-bold text-gray-800 dark:text-gray-100">{stats.count}</div>
                        </div>
                        <div className="mt-4 text-blue-600 dark:text-blue-400 text-sm font-medium flex items-center">
                            {t.dashboard.library} <ChevronRight className="ml-1 w-4 h-4" />
                        </div>
                    </Link>

                    {/* Info Card */}
                    <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl shadow-lg p-6 flex flex-col justify-between overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <FileText size={100} />
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold mb-2">{t.dashboard.tipTitle}</h3>
                            <p className="text-emerald-50 text-sm italic">{currentTip.text}</p>
                        </div>
                        <div className="mt-4 text-emerald-100 text-xs text-right">
                            {currentTip.ref}
                        </div>
                    </div>
                </div>

                <section>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">{t.dashboard.recentSermons}</h2>
                        <Link to="/sermons" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium hover:underline">{t.dashboard.seeAll}</Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {recentSermons.length > 0 ? recentSermons.map(sermon => (
                            <Link key={sermon.id} to={`/sermons/${sermon.id}`} className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 p-5 hover:shadow-md transition group">
                                <div className="flex justify-between items-start mb-3">
                                    <span className="bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-bold px-2 py-1 rounded-md uppercase">{sermon.book} {sermon.chapter}:{sermon.verses}</span>
                                    <div className="text-right">
                                        <p className="text-gray-400 dark:text-gray-500 text-[10px]">{new Date(sermon.created_at).toLocaleDateString()}</p>
                                        {sermon.User && (
                                            <p className="text-blue-500/70 dark:text-blue-400/70 text-[10px] font-bold uppercase tracking-tight">{sermon.User.name}</p>
                                        )}
                                    </div>
                                </div>
                                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition truncate">{sermon.theme || 'Sem tema'}</h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-3 mb-4">{sermon.content.substring(0, 150)}...</p>
                                <div className="text-blue-500 dark:text-blue-400 text-sm font-medium flex items-center">
                                    {t.dashboard.readSermon} <ChevronRight className="w-4 h-4 ml-1" />
                                </div>
                            </Link>
                        )) : (
                            <div className="col-span-3 text-center py-10 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-gray-300 dark:border-slate-700">
                                <p className="text-gray-500 dark:text-gray-400 mb-4">{t.dashboard.noSermons}</p>
                                <Link to="/sermons/new" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">{t.dashboard.createFirst}</Link>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </Layout>
    );
}
