import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Trash2,
    Printer,
    Edit3,
    Share2,
    Save,
    X,
    Copy,
    CheckCircle,
    MessageCircle,
    User
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function SermonDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [sermon, setSermon] = useState(null);
    const [translatedContent, setTranslatedContent] = useState(null);
    const [isTranslating, setIsTranslating] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isSharing, setIsSharing] = useState(false);
    const [editForm, setEditForm] = useState({ theme: '', content: '' });
    const [copySuccess, setCopySuccess] = useState(false);
    const { t, language } = useLanguage();

    useEffect(() => {
        const fetchSermon = async () => {
            try {
                const res = await api.get(`/sermons/${id}`);
                setSermon(res.data);
                setEditForm({
                    theme: res.data.theme || '',
                    content: res.data.content || ''
                });
                setTranslatedContent(null);
            } catch (err) {
                console.error(err);
                alert('Erro ao carregar sermão');
            }
        };
        fetchSermon();
    }, [id]);

    useEffect(() => {
        const translateIfNeeded = async () => {
            if (!sermon || isEditing) return;

            const langMap = {
                pt: 'Português',
                es: 'Español',
                en: 'English',
                fr: 'Français',
                de: 'Deutsch'
            };
            const currentLangName = langMap[language] || 'Português';

            if (sermon.language === currentLangName) {
                setTranslatedContent(null);
                return;
            }

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
    }, [sermon, language, id, isEditing]);

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

    const handleSaveEdit = async () => {
        try {
            const res = await api.put(`/sermons/${id}`, editForm);
            setSermon(res.data);
            setIsEditing(false);
            setTranslatedContent(null); // Re-translate if needed
        } catch (err) {
            console.error(err);
            alert('Erro ao salvar alterações');
        }
    };

    const handleCopyLink = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
    };

    const handleWhatsAppShare = () => {
        if (!sermon) return;

        const title = sermon.theme || t.sermonDetail.untitled;
        const textToShare = `*${title}*\n\n${translatedContent || sermon.content}`;
        const encodedText = encodeURIComponent(textToShare);
        const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedText}`;

        window.open(whatsappUrl, '_blank');
        setIsSharing(false);
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
                            <div className="flex space-x-2">
                                {!isEditing ? (
                                    <>
                                        <button onClick={() => setIsSharing(true)} className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 transition" title={t.sermonDetail.share}>
                                            <Share2 className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => setIsEditing(true)} className="p-2 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg hover:bg-amber-100 transition" title={t.sermonDetail.edit}>
                                            <Edit3 className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => window.print()} className="p-2 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 transition" title={t.sermonDetail.print}>
                                            <Printer className="w-5 h-5" />
                                        </button>
                                        <button onClick={handleDelete} className="p-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 transition" title={t.sermonDetail.delete}>
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={handleSaveEdit} className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
                                            <Save className="w-4 h-4" /> <span>Salvar</span>
                                        </button>
                                        <button onClick={() => setIsEditing(false)} className="flex items-center space-x-2 px-4 py-2 bg-gray-200 dark:bg-slate-800 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 transition">
                                            <X className="w-4 h-4" /> <span>Cancelar</span>
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-900 shadow-xl rounded-2xl overflow-hidden print:shadow-none border dark:border-slate-800">
                            <div className="bg-blue-600 dark:bg-blue-700 p-8 text-white print:bg-white print:text-black print:p-0 print:mb-4">
                                {isEditing ? (
                                    <div className="space-y-4">
                                        <input
                                            type="text"
                                            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/30 text-2xl font-bold"
                                            value={editForm.theme}
                                            onChange={(e) => setEditForm({ ...editForm, theme: e.target.value })}
                                            placeholder="Título do Sermão"
                                        />
                                        {(sermon.book && sermon.chapter) && (
                                            <p className="text-blue-100 text-lg">{sermon.book} {sermon.chapter}:{sermon.verses}</p>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <span className="bg-white/20 text-blue-50 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide print:hidden">{sermon.language}</span>
                                            <h1 className="text-3xl font-bold mt-4 mb-2">{sermon.theme || t.sermonDetail.untitled}</h1>
                                            {(sermon.book && sermon.chapter) && (
                                                <p className="text-blue-100 text-lg print:text-gray-600">{sermon.book} {sermon.chapter}:{sermon.verses}</p>
                                            )}
                                        </div>
                                        <div className="text-right text-blue-200 text-sm print:hidden">
                                            <p>{t.sermonDetail.audience}: {sermon.audience}</p>
                                            <p>{t.sermonDetail.tone}: {sermon.tone}</p>
                                            <p>{t.sermonDetail.duration}: {sermon.duration}</p>
                                            {sermon.User && (
                                                <div className="mt-2 flex items-center justify-end text-white font-bold bg-white/10 px-3 py-1 rounded-full">
                                                    <User className="w-3.5 h-3.5 mr-1.5" />
                                                    {sermon.User.name}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="p-8 lg:p-12 print:p-0">
                                {isEditing ? (
                                    <textarea
                                        className="w-full min-h-[500px] p-6 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all dark:text-gray-300 leading-relaxed font-sans text-lg"
                                        value={editForm.content}
                                        onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                                    />
                                ) : isTranslating ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-blue-500 animate-pulse">
                                        <div className="text-4xl mb-4">🌍</div>
                                        <p>Traduzindo sermão... / Translating...</p>
                                    </div>
                                ) : (
                                    <div className="prose prose-blue max-w-none text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line text-lg">
                                        {translatedContent || sermon.content}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Share Modal */}
                {isSharing && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md p-8 shadow-2xl">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold dark:text-white">{t.sermonDetail.shareSermon}</h3>
                                <button onClick={() => setIsSharing(false)} className="text-gray-400 hover:text-gray-600">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <p className="text-slate-600 dark:text-slate-400 text-sm">
                                    Escolha como deseja compartilhar sua mensagem inspiradora:
                                </p>

                                <button
                                    onClick={handleWhatsAppShare}
                                    className="w-full flex items-center justify-center gap-3 py-4 bg-[#25D366] text-white font-bold rounded-2xl hover:bg-[#20bd5a] transition-all shadow-lg shadow-green-200 dark:shadow-none"
                                >
                                    <MessageCircle className="w-6 h-6 fill-white" />
                                    Enviar via WhatsApp
                                </button>

                                <div className="relative py-2">
                                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-800"></div></div>
                                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-white dark:bg-slate-900 px-2 text-slate-500">Ou use o link</span></div>
                                </div>

                                <div className="flex items-center gap-2 p-3 bg-slate-100 dark:bg-slate-800 rounded-xl border dark:border-slate-700">
                                    <input
                                        type="text"
                                        readOnly
                                        value={window.location.href}
                                        className="bg-transparent flex-1 text-sm outline-none overflow-hidden text-ellipsis dark:text-gray-300"
                                    />
                                    <button
                                        onClick={handleCopyLink}
                                        className={`p-2 rounded-lg transition-all ${copySuccess ? 'bg-green-500 text-white' : 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm'}`}
                                    >
                                        {copySuccess ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}
