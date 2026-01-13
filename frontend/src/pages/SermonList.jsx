import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { Calendar, ChevronRight, Search } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function SermonList() {
    const [sermons, setSermons] = useState([]);
    const [loading, setLoading] = useState(true);
    const { t } = useLanguage();

    useEffect(() => {
        const fetchSermons = async () => {
            try {
                const res = await api.get('/sermons');
                setSermons(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchSermons();
    }, []);

    return (
        <Layout>
            <div className="container mx-auto px-6 py-8">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">{t.sermonList.title}</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">{t.sermonList.subtitle}</p>
                    </div>
                    <Link to="/sermons/new" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg shadow transition">
                        {t.sermonList.newSermon}
                    </Link>
                </header>

                {/* Search placeholder */}
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 mb-6 flex items-center">
                    <Search className="text-gray-400 dark:text-gray-500 mr-3" />
                    <input type="text" placeholder={t.sermonList.search} className="w-full bg-transparent outline-none text-gray-700 dark:text-gray-200" />
                </div>

                {loading ? (
                    <div className="text-center py-20 text-gray-500 dark:text-gray-400">{t.sermonList.loading}</div>
                ) : sermons.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800">
                        <p className="text-gray-500 dark:text-gray-400 mb-4">{t.sermonList.notFound}</p>
                        <Link to="/sermons/new" className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">{t.sermonList.createFirst}</Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {sermons.map(sermon => (
                            <Link key={sermon.id} to={`/sermons/${sermon.id}`} className="bg-white dark:bg-slate-900 group rounded-xl shadow-sm hover:shadow-md border border-gray-100 dark:border-slate-800 p-6 transition duration-200">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wide">
                                        {sermon.book} {sermon.chapter}:{sermon.verses}
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">{sermon.theme || t.sermonList.untitled}</h3>

                                <div className="flex items-center text-gray-400 dark:text-gray-500 text-xs mb-4">
                                    <Calendar className="w-3 h-3 mr-1" />
                                    {new Date(sermon.created_at).toLocaleDateString()}
                                </div>

                                <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-4 mb-4">
                                    {sermon.content}
                                </p>

                                <div className="flex items-center text-indigo-500 dark:text-indigo-400 font-medium text-sm mt-auto">
                                    {t.sermonList.readMessage} <ChevronRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition" />
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
}
