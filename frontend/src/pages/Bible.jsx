import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Book, ChevronRight, Search, Loader2, BookOpen, ChevronLeft, Bookmark, Share2, Copy, AlertCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import axios from 'axios';
import { BIBLE_BOOKS_PT } from '../translations/bibleData';

export default function Bible() {
    const { t, language } = useLanguage();
    const [books, setBooks] = useState(() => (language === 'pt' ? BIBLE_BOOKS_PT : []));
    const [selectedBook, setSelectedBook] = useState(null);
    const [selectedChapter, setSelectedChapter] = useState(null);
    const [verses, setVerses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingVerses, setLoadingVerses] = useState(false);
    const [version, setVersion] = useState(() => {
        const langMap = {
            pt: 'por_onbv',
            es: 'spa_r09',
            en: 'eng_bsb',
            fr: 'fra_lsg',
            de: 'deu_l12'
        };
        return langMap[language] || 'por_onbv';
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState(null);

    // Safety check: if translation object is missing for any reason
    if (!t || !t.bible) {
        return (
            <Layout>
                <div className="flex items-center justify-center h-full">
                    <Loader2 className="animate-spin text-blue-600" size={48} />
                </div>
            </Layout>
        );
    }

    const versions = [
        { id: 'por_onbv', name: 'Open Nova Bíblia Viva (PT)', lang: 'pt' },
        { id: 'por_blj', name: 'Bíblia Livre (PT)', lang: 'pt' },
        { id: 'spa_r09', name: 'Reina Valera 1909 (ES)', lang: 'es' },
        { id: 'BSB', name: 'Berean Standard Bible (EN)', lang: 'en' },
        { id: 'fra_lsg', name: 'Louis Segond 1910 (FR)', lang: 'fr' },
        { id: 'deu_l12', name: 'Lutherbibel 1912 (DE)', lang: 'de' }
    ];

    useEffect(() => {
        // Set default version based on user language
        const langMap = {
            pt: 'por_onbv',
            es: 'spa_r09',
            en: 'BSB',
            fr: 'fra_lsg',
            de: 'deu_l12'
        };
        setVersion(langMap[language] || 'por_onbv');
    }, [language]);

    useEffect(() => {
        handleBackToBooks();
        setBooks([]); // Clear books while loading new version
        fetchBooks();
    }, [version]);

    const fetchBooks = async () => {
        setLoading(true);
        setError(null);
        try {
            // Priority 1: Use local data for PT to ensure all 66 books are present
            if (version.startsWith('por') && BIBLE_BOOKS_PT.length > 0) {
                setBooks(BIBLE_BOOKS_PT);
                setLoading(false);
                return;
            }

            const res = await axios.get(`https://bible.helloao.org/api/${version}/books.json`);
            if (res.data && res.data.books) {
                // Better testament logic based on standard list
                const ntStartIdx = res.data.books.findIndex(b => b.id === 'MAT');
                const finalizedBooks = res.data.books.map((b, idx) => ({
                    name: b.name,
                    abbrev: { pt: b.id },
                    id: b.id,
                    chapters: b.numberOfChapters,
                    testament: (ntStartIdx !== -1 && idx >= ntStartIdx) ? 'NT' : 'VT'
                }));

                setBooks(finalizedBooks);
            } else {
                setBooks(version.startsWith('por') ? BIBLE_BOOKS_PT : []);
            }
        } catch (err) {
            console.error("Erro ao carregar livros", err);
            setError(t.bible.errorBooks);
            // Use BIBLE_BOOKS_PT as ultimate fallback if version is PT
            if (version.startsWith('por')) {
                setBooks(BIBLE_BOOKS_PT);
            } else {
                setBooks([]);
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchVerses = async (bookId, chapter) => {
        setLoadingVerses(true);
        setError(null);
        try {
            const res = await axios.get(`https://bible.helloao.org/api/${version}/${bookId}/${chapter}.json`);
            // HelloAO structure: res.data.chapter.content is an array with verses
            const mappedVerses = res.data.chapter.content
                .filter(c => c.type === 'verse')
                .map(v => ({
                    number: v.number,
                    text: v.content.map(textObj => typeof textObj === 'string' ? textObj : textObj.content).join('')
                }));

            setVerses(mappedVerses);
            setSelectedChapter(chapter);
        } catch (err) {
            console.error("Erro ao carregar versículos", err);
            setError(t.bible.errorVerses);
            setVerses([]);
        } finally {
            setLoadingVerses(false);
        }
    };

    const handleSelectBook = (book) => {
        setSelectedBook(book);
        setSelectedChapter(null);
        setVerses([]);
    };

    const handleBackToBooks = () => {
        setSelectedBook(null);
        setSelectedChapter(null);
        setVerses([]);
    };

    const copyToClipboard = (text, verseNum) => {
        const fullText = `${selectedBook.name} ${selectedChapter}:${verseNum} - "${text}"`;
        navigator.clipboard.writeText(fullText);
        // Could add a toast here if available
    };

    const filteredBooks = Array.isArray(books) ? books.filter(b =>
        b.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) : [];

    const oldTestament = filteredBooks.filter(b => b.testament === 'VT');
    const newTestament = filteredBooks.filter(b => b.testament === 'NT');

    return (
        <Layout>
            <div className="container mx-auto px-4 sm:px-6 py-8 h-[calc(100vh-100px)] flex flex-col">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 dark:text-white flex items-center gap-3">
                            <BookOpen className="text-blue-600" size={32} />
                            {t.bible.title}
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400">{t.bible.subtitle}</p>
                    </div>

                    <div className="flex items-center gap-3">
                        {error && (
                            <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 px-4 py-2 rounded-xl border border-amber-100 dark:border-amber-800 text-[10px] font-bold">
                                <div className="flex items-center gap-2 animate-pulse">
                                    <AlertCircle size={14} />
                                    {error}
                                </div>
                                <button
                                    onClick={() => fetchBooks()}
                                    className="px-2 py-1 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition font-black uppercase tracking-tighter"
                                >
                                    {t.bible.tryAgain}
                                </button>
                            </div>
                        )}
                        <select
                            value={version}
                            onChange={(e) => setVersion(e.target.value)}
                            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-sans"
                        >
                            {versions.filter(v => v.lang === language).map(v => (
                                <option key={v.id} value={v.id}>{v.name}</option>
                            ))}
                        </select>
                    </div>
                </header>

                <div className="flex-1 overflow-hidden flex flex-col bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800">
                    {!selectedBook ? (
                        <div className="flex flex-col h-full">
                            <div className="p-6 border-b dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                                <div className="relative max-w-md">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder={t.bible.search}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm dark:text-white"
                                    />
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
                                {loading ? (
                                    <div className="flex flex-col items-center justify-center py-20">
                                        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                                        <p className="text-slate-500">{t.bible.loading}</p>
                                    </div>
                                ) : (
                                    <div className="space-y-12">
                                        <section>
                                            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-3">
                                                <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
                                                {t.bible.oldTestament}
                                                <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
                                            </h2>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                                {oldTestament.map(book => (
                                                    <button
                                                        key={book.id}
                                                        onClick={() => handleSelectBook(book)}
                                                        className="group p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl hover:bg-white dark:hover:bg-slate-800 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/10 transition-all text-center"
                                                    >
                                                        <span className="block font-bold text-slate-700 dark:text-slate-200 text-sm group-hover:text-blue-600 transition-colors uppercase tracking-tight">{book.name}</span>
                                                        <span className="text-[10px] text-slate-400 group-hover:text-blue-400 font-bold">{book.chapters} {t.bible.chapter.toLowerCase()}{(book.chapters > 1 && language === 'pt') ? 's' : ''}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </section>

                                        <section>
                                            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-3">
                                                <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
                                                {t.bible.newTestament}
                                                <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
                                            </h2>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                                {newTestament.map(book => (
                                                    <button
                                                        key={book.id}
                                                        onClick={() => handleSelectBook(book)}
                                                        className="group p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl hover:bg-white dark:hover:bg-slate-800 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/10 transition-all text-center"
                                                    >
                                                        <span className="block font-bold text-slate-700 dark:text-slate-200 text-sm group-hover:text-blue-600 transition-colors uppercase tracking-tight">{book.name}</span>
                                                        <span className="text-[10px] text-slate-400 group-hover:text-blue-400 font-bold">{book.chapters} {t.bible.chapter.toLowerCase()}{(book.chapters > 1 && language === 'pt') ? 's' : ''}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </section>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex h-full">
                            {/* Chapters Sidebar (Hidden on mobile when reading) */}
                            <div className={`${selectedChapter ? 'hidden lg:flex' : 'flex'} w-full lg:w-48 xl:w-64 flex-col border-r dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/10`}>
                                <div className="p-6 border-b dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
                                    <button
                                        onClick={handleBackToBooks}
                                        className="text-slate-400 hover:text-blue-600 transition-colors"
                                    >
                                        <ChevronLeft size={24} />
                                    </button>
                                    <span className="font-black text-slate-800 dark:text-white uppercase text-sm tracking-widest truncate ml-2">
                                        {selectedBook.name}
                                    </span>
                                </div>
                                <div className="flex-1 overflow-y-auto p-4 grid grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-2 content-start custom-scrollbar">
                                    {Array.from({ length: selectedBook.chapters }, (_, i) => i + 1).map(chap => (
                                        <button
                                            key={chap}
                                            onClick={() => fetchVerses(selectedBook.id, chap)}
                                            className={`
                                                aspect-square flex items-center justify-center rounded-xl text-sm font-black transition-all
                                                ${selectedChapter === chap
                                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 ring-2 ring-blue-500'
                                                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-blue-600'}
                                            `}
                                        >
                                            {chap}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Verses Content */}
                            <div className={`${!selectedChapter ? 'hidden lg:flex' : 'flex'} flex-1 flex-col overflow-hidden bg-white dark:bg-slate-900 relative`}>
                                {selectedChapter ? (
                                    <>
                                        <div className="p-6 border-b dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-10">
                                            <div className="flex items-center gap-4">
                                                <button
                                                    onClick={() => setSelectedChapter(null)}
                                                    className="lg:hidden text-slate-400 hover:text-blue-600"
                                                >
                                                    <ChevronLeft size={24} />
                                                </button>
                                                <div>
                                                    <h3 className="text-xl font-black dark:text-white uppercase tracking-tighter">
                                                        {selectedBook.name} {selectedChapter}
                                                    </h3>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{verses.length} {t.bible.verse.toLowerCase()}{(verses.length > 1 && language === 'pt') ? 's' : ''}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                                                    <Bookmark size={20} />
                                                </button>
                                                <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                                                    <Share2 size={20} />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex-1 overflow-y-auto p-6 md:p-12 custom-scrollbar lg:mx-auto lg:max-w-4xl w-full">
                                            {loadingVerses ? (
                                                <div className="flex flex-col items-center justify-center py-20">
                                                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                                                </div>
                                            ) : (
                                                <div className="space-y-8 pb-10">
                                                    {verses.map(v => (
                                                        <div key={v.number} className="group flex gap-4 relative">
                                                            <span className="text-blue-600 dark:text-blue-400 font-black text-xs pt-1.5 w-6 flex-shrink-0 text-right">{v.number}</span>
                                                            <div className="flex-1">
                                                                <p className="text-lg text-slate-700 dark:text-slate-200 leading-relaxed font-serif tracking-tight selection:bg-blue-100 dark:selection:bg-blue-900 selection:text-blue-900 dark:selection:text-blue-100">
                                                                    {v.text}
                                                                </p>
                                                                <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-4">
                                                                    <button
                                                                        onClick={() => copyToClipboard(v.text, v.number)}
                                                                        className="flex items-center gap-1.5 text-[10px] uppercase font-black text-slate-400 hover:text-blue-600"
                                                                    >
                                                                        <Copy size={12} /> {t.sermonDetail.shareSermon.split(' ')[0]}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
                                        <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center text-slate-300 dark:text-slate-600 mb-6">
                                            <BookOpen size={40} />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-400 mb-2 uppercase tracking-widest">{t.bible.selectBook}</h3>
                                        <p className="text-slate-300 dark:text-slate-500 max-w-xs">{t.bible.subtitle}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}
