import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import api from '../services/api';
import {
    BookOpen,
    Sparkles,
    ShieldCheck,
    ArrowRight,
    CheckCircle2,
    Calendar,
    PenTool,
    Check,
    Loader2,
    X,
    MessageCircle
} from 'lucide-react';
import Logo from '../components/Logo';

const LandingPage = () => {
    const { t, language, setLanguage } = useLanguage();
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const res = await api.get('/plans/public');
                setPlans(res.data);
            } catch (err) {
                console.error("Erro ao carregar planos", err);
                // Fallback translations for plans descriptions
                setPlans([
                    { id: 'f1', name: 'Plano Básico', price: 67.90, max_sermons: 15, max_bible_studies: 2, allow_ai: false, description: t.landing?.plans?.basicDesc || 'Ideal para organização e praticidade. 15 sermões por mês.', checkout_url: 'https://pay.kiwify.com.br/O3NseBN' },
                    { id: 'f2', name: 'Plano Pro', price: 147.90, max_sermons: 40, max_bible_studies: -1, allow_ai: true, description: t.landing?.plans?.proDesc || 'Perfeito para sermões frequentes com IA. 40 sermões por mês.', checkout_url: 'https://pay.kiwify.com.br/RjHvRsU' },
                    { id: 'f3', name: 'Plano Enterprise', price: 247.00, max_sermons: -1, max_bible_studies: -1, allow_ai: true, description: t.landing?.plans?.enterpriseDesc || 'Para púlpito sério. Sermões ILIMITADOS e IA.', checkout_url: 'https://pay.kiwify.com.br/AKaukS4' }
                ]);
            } finally {
                setLoading(false);
            }
        };
        fetchPlans();
    }, [t]); // Re-run when translations change to update fallback plans texts

    const getCheckoutUrl = (planName, index) => {
        const name = planName?.toLowerCase() || '';
        if (name.includes('enterprise') || index === 2) return 'https://pay.kiwify.com.br/AKaukS4';
        if (name.includes('pro') || index === 1) return 'https://pay.kiwify.com.br/RjHvRsU';
        return 'https://pay.kiwify.com.br/O3NseBN'; // Default to Básico
    };

    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // Helper to safely access nested properties
    const l = (path) => {
        return path?.split('.').reduce((obj, key) => obj?.[key], t?.landing) || '';
    };

    if (!t.landing) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950">
            {/* Navbar */}
            <nav className="fixed top-0 w-full z-50 glass-panel !rounded-none border-t-0 border-x-0">
                <div className="container mx-auto px-6 h-28 flex items-center justify-between">
                    <Logo className="h-20" />

                    <div className="hidden md:flex items-center gap-8 text-slate-600 dark:text-slate-300 font-medium text-sm">
                        <button onClick={() => scrollToSection('solucao')} className="hover:text-blue-600 transition-colors">{t.landing.nav.system}</button>
                        <button onClick={() => scrollToSection('planos')} className="hover:text-blue-600 transition-colors">{t.landing.nav.plans}</button>
                        <button onClick={() => scrollToSection('depoimentos')} className="hover:text-blue-600 transition-colors">{t.landing.nav.testimonials}</button>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative group">
                            <button className="flex items-center gap-2 px-3 py-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors text-sm font-medium">
                                <img
                                    src={{
                                        pt: 'https://flagcdn.com/w40/br.png',
                                        es: 'https://flagcdn.com/w40/es.png',
                                        en: 'https://flagcdn.com/w40/us.png',
                                        fr: 'https://flagcdn.com/w40/fr.png',
                                        de: 'https://flagcdn.com/w40/de.png'
                                    }[language]}
                                    alt={language}
                                    className="w-6 h-4 object-cover rounded shadow-sm"
                                />
                                <span className="uppercase">{language}</span>
                            </button>
                            <div className="absolute right-0 top-full mt-2 w-40 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all transform origin-top-right z-50">
                                {[
                                    { code: 'pt', label: 'Português', flag: 'https://flagcdn.com/w40/br.png' },
                                    { code: 'es', label: 'Español', flag: 'https://flagcdn.com/w40/es.png' },
                                    { code: 'en', label: 'English', flag: 'https://flagcdn.com/w40/us.png' },
                                    { code: 'fr', label: 'Français', flag: 'https://flagcdn.com/w40/fr.png' },
                                    { code: 'de', label: 'Deutsch', flag: 'https://flagcdn.com/w40/de.png' }
                                ].map((lang) => (
                                    <button
                                        key={lang.code}
                                        onClick={() => setLanguage(lang.code)}
                                        className={`w-full text-left px-4 py-3 text-sm flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors first:rounded-t-xl last:rounded-b-xl ${language === lang.code ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'text-slate-600 dark:text-slate-300'}`}
                                    >
                                        <img src={lang.flag} alt={lang.code} className="w-6 h-4 object-cover rounded shadow-sm" />
                                        <span className="uppercase font-semibold">{lang.code}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <Link to="/login" className="px-4 py-2 text-blue-600 font-semibold text-sm hover:bg-blue-50 dark:hover:bg-slate-900 rounded-lg transition-all">
                            {t.landing.nav.login}
                        </Link>
                        <button onClick={() => scrollToSection('planos')} className="btn-primary !px-4 !py-2 !text-sm">
                            {t.landing.nav.createAccount}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section - Seção 1 */}
            <section className="pt-32 pb-20 relative overflow-hidden">
                <div className="absolute top-0 right-0 -z-10 w-1/2 h-full bg-gradient-to-l from-blue-50 to-transparent dark:from-blue-950/20 opacity-50 blur-3xl"></div>
                <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full font-semibold text-xs mb-6 uppercase tracking-wider">
                            <Sparkles className="w-3.5 h-3.5" />
                            {t.landing.hero.badge}
                        </div>
                        <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6 text-slate-900 dark:text-white">
                            {t.landing.hero.title} <span className="text-blue-600">{t.landing.hero.titleHighlight}</span> {t.landing.hero.titleEnd}
                        </h1>
                        <p className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">
                            {t.landing.hero.subtitle}
                        </p>
                        <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-lg">
                            {t.landing.hero.desc}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={() => scrollToSection('planos')}
                                className="btn-primary !px-8 !py-4 flex items-center justify-center gap-2"
                            >
                                {t.landing.hero.startBtn} <ArrowRight className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => scrollToSection('solucao')}
                                className="btn-secondary !px-8 !py-4 flex items-center justify-center text-blue-600 border-blue-200"
                            >
                                {t.landing.hero.learnBtn}
                            </button>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-slate-900">
                            <img
                                src="./hero-banner.png"
                                alt="VerboCast Pastoral AI"
                                className="w-full h-auto object-cover"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Pain Points - Seção 2 */}
            <section id="problema" className="py-20 bg-slate-50 dark:bg-slate-900/50 border-y border-slate-100 dark:border-slate-800">
                <div className="container mx-auto px-6">
                    <div className="max-w-4xl mx-auto text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-slate-900 dark:text-white">{t.landing.pain.title}</h2>
                        <p className="text-lg text-slate-600 dark:text-slate-400">{t.landing.pain.subtitle}</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {t.landing.pain.items.map((pain, pidx) => (
                            <div key={pidx} className="flex items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
                                <X className="w-5 h-5 text-red-500 flex-shrink-0" />
                                <span className="text-slate-700 dark:text-slate-300 font-medium">{pain}</span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-16 text-center">
                        <p className="text-xl mb-4 text-slate-700 dark:text-slate-300 whitespace-pre-line">{t.landing.pain.conclusion1}</p>
                        <p className="text-2xl font-bold text-blue-600">{t.landing.pain.conclusion2}</p>
                    </div>
                </div>
            </section>

            {/* Solution & Benefits - Seção 3 & 4 */}
            <section id="solucao" className="py-24 bg-white dark:bg-slate-950 overflow-hidden">
                <div className="container mx-auto px-6">
                    <div className="max-w-3xl mx-auto text-center mb-20">
                        <h2 className="text-4xl font-bold mb-6 text-slate-900 dark:text-white">{t.landing.solution.title}</h2>
                        <p className="text-lg text-slate-600 dark:text-slate-400 mb-10">
                            {t.landing.solution.desc}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                            {t.landing.solution.items.map((item, iidx) => (
                                <div key={iidx} className="flex items-center gap-3">
                                    <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                                        <Check className="w-4 h-4 text-green-600" />
                                    </div>
                                    <span className="font-medium text-slate-700 dark:text-slate-300">{item}</span>
                                </div>
                            ))}
                        </div>
                        <p className="mt-12 text-blue-600 font-bold text-xl uppercase tracking-widest text-center">
                            {t.landing.solution.note}
                        </p>
                    </div>

                    <div className="text-center mb-16">
                        <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">{t.landing.solution.summaryTitle}</h3>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {t.landing.solution.cards.map((benefit, bidx) => (
                            <div key={bidx} className="glass-panel p-8 card-hover">
                                <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600 mb-6">
                                    {[<PenTool className="w-7 h-7" />, <Sparkles className="w-7 h-7" />, <CheckCircle2 className="w-7 h-7" />, <ArrowRight className="w-7 h-7 rotate-45" />, <Calendar className="w-7 h-7" />, <BookOpen className="w-7 h-7" />][bidx]}
                                </div>
                                <h4 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">{benefit.title}</h4>
                                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                                    {benefit.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* IA Support - Seção 5 */}
            <section className="py-24 bg-slate-50 dark:bg-slate-900/50">
                <div className="container mx-auto px-6 grid md:grid-cols-2 gap-16 items-center max-w-5xl">
                    <div className="relative">
                        <div className="rounded-3xl overflow-hidden shadow-2xl">
                            <img src="./hero-banner.png" alt="IA e Bíblia" className="w-full h-auto" />
                        </div>
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">{t.landing.ia.title} <span className="text-blue-600">{t.landing.ia.titleHighlight}</span></h2>
                        <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                            {t.landing.ia.desc}
                        </p>
                        <ul className="space-y-4 mb-8">
                            {t.landing.ia.items.map((it, tid) => (
                                <li key={tid} className="flex items-center gap-3 font-bold text-slate-800 dark:text-slate-200">
                                    <Sparkles className="w-4 h-4 text-blue-600" /> {it}
                                </li>
                            ))}
                        </ul>
                        <p className="text-lg font-bold text-slate-900 dark:text-white border-l-4 border-blue-600 pl-6 italic bg-white dark:bg-slate-900 p-4 rounded-r-xl shadow-sm">
                            {t.landing.ia.disclaimer}
                        </p>
                    </div>
                </div>
            </section>

            {/* Testimonials - Seção 6 */}
            <section id="depoimentos" className="py-24 bg-white dark:bg-slate-950">
                <div className="container mx-auto px-6 text-center">
                    <div className="flex justify-center gap-1 mb-6 text-yellow-400">
                        {[1, 2, 3, 4, 5].map(s => <Sparkles key={s} className="w-6 h-6 fill-current" />)}
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900 dark:text-white">{t.landing.testimonials.title}</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-16">{t.landing.testimonials.subtitle}</p>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 text-left max-w-6xl mx-auto">
                        {t.landing.testimonials.items.map((test, tidx) => (
                            <div key={tidx} className="glass-panel p-6 bg-slate-50 dark:bg-slate-900/50">
                                <p className="text-slate-600 dark:text-slate-300 italic mb-6 leading-relaxed">"{test.text}"</p>
                                <div className="font-bold text-slate-900 dark:text-white">— {test.name}</div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-12 text-blue-600 font-bold text-xl">
                        {t.landing.testimonials.rating}
                    </div>
                    <button onClick={() => scrollToSection('planos')} className="mt-8 text-blue-600 font-bold underline flex items-center gap-2 mx-auto hover:text-blue-700 transition-colors">
                        {t.landing.testimonials.cta} <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </section>

            {/* Plans Section - Seção 7 */}
            <section id="planos" className="py-24 bg-slate-50 dark:bg-slate-900/50">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4 text-slate-900 dark:text-white">{t.landing.plans.title}</h2>
                        <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
                            {t.landing.plans.subtitle}
                        </p>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                            <p className="text-slate-500">{t.landing.plans.loading}</p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                            {plans.map((plan, idx) => (
                                <div key={plan.id} className={`glass-panel p-8 relative flex flex-col bg-white dark:bg-slate-900 transition-all duration-300 ${idx === 1 ? 'border-2 border-yellow-500 scale-105 shadow-2xl z-10' : 'hover:scale-105'}`}>
                                    {idx === 1 && (
                                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                            <span className="bg-yellow-500 text-white px-6 py-1.5 rounded-full text-sm font-bold shadow-lg uppercase tracking-wide flex items-center gap-2 whitespace-nowrap">
                                                <Sparkles className="w-4 h-4 fill-white" /> {t.landing.plans.recommended}
                                            </span>
                                        </div>
                                    )}

                                    {idx === 0 && <div className="w-4 h-4 rounded-full bg-green-500 mb-4 shadow-lg shadow-green-200"></div>}
                                    {idx === 1 && <div className="w-4 h-4 rounded-full bg-yellow-500 mb-4 shadow-lg shadow-yellow-200"></div>}
                                    {idx === 2 && <div className="w-4 h-4 rounded-full bg-blue-500 mb-4 shadow-lg shadow-blue-200"></div>}

                                    <h3 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">{plan.name}</h3>
                                    <div className="flex items-baseline gap-1 mb-6">
                                        <span className="text-4xl font-bold text-slate-900 dark:text-white">R$ {parseFloat(plan.price).toFixed(2).replace('.', ',')}</span>
                                        <span className="text-slate-500 dark:text-slate-400 text-sm">{t.landing.plans.month}</span>
                                    </div>
                                    <p className="text-slate-600 dark:text-slate-400 mb-8 text-sm leading-relaxed min-h-[40px] font-bold">
                                        {plan.description}
                                    </p>

                                    <ul className="space-y-4 mb-8 flex-1 border-t border-slate-100 dark:border-slate-800 pt-6">
                                        <li className="flex items-start gap-3 text-sm">
                                            <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                                            <span className="text-slate-700 dark:text-slate-300 font-bold">
                                                {plan.max_sermons === -1 ? t.landing.plans.unlimitedSermons : `${plan.max_sermons} ${t.landing.plans.sermonsPerMonth}`}
                                            </span>
                                        </li>
                                        <li className="flex items-start gap-3 text-sm">
                                            <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                                            <span className="text-slate-700 dark:text-slate-300 font-bold">
                                                {plan.max_bible_studies === -1 || !plan.max_bible_studies ? t.landing.plans.unlimitedStudies : `${plan.max_bible_studies} ${t.landing.plans.studiesPerMonth}`}
                                            </span>
                                        </li>
                                        <li className="flex items-start gap-3 text-sm">
                                            {plan.allow_ai ? (
                                                <Check className="w-5 h-5 text-blue-500 flex-shrink-0" />
                                            ) : (
                                                <X className="w-5 h-5 text-red-500 flex-shrink-0" />
                                            )}
                                            <span className={`font-bold ${plan.allow_ai ? 'text-blue-600' : 'text-slate-400 line-through'}`}>
                                                {plan.allow_ai ? t.landing.plans.aiIncluded : t.landing.plans.noAi}
                                            </span>
                                        </li>
                                        <li className="flex items-start gap-3 text-sm">
                                            <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                                            <span className="text-slate-700 dark:text-slate-300">
                                                <span className="font-bold">{plan.max_users === -1 ? t.landing.plans.unlimitedUsers : `${plan.max_users} ${t.landing.plans.usersCount}`}</span> {t.landing.plans.onTeam}
                                            </span>
                                        </li>
                                        <li className="flex items-start gap-3 text-sm">
                                            <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                                            <span className="text-slate-700 dark:text-slate-300">
                                                {t.landing.plans.manage} <span className="font-bold">{plan.max_churches === -1 ? t.landing.plans.unlimitedChurches : `${plan.max_churches} ${t.landing.plans.churchesCount}`}</span>
                                            </span>
                                        </li>
                                        <li className="flex items-start gap-3 text-sm">
                                            <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                                            <span className="text-slate-700 dark:text-slate-300">
                                                {plan.id === 'f1' ? t.landing.plans.pdfSave : t.landing.plans.outlines}
                                            </span>
                                        </li>
                                        <li className="flex items-start gap-3 text-sm">
                                            <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                                            <span className="text-slate-700 dark:text-slate-300">
                                                {plan.id === 'f3' ? t.landing.plans.fullBible : t.landing.plans.integratedBible}
                                            </span>
                                        </li>
                                        <li className="flex items-start gap-3 text-sm">
                                            <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                                            <span className="text-slate-700 dark:text-slate-300">{t.landing.plans.whatsappShare}</span>
                                        </li>
                                    </ul>

                                    <a
                                        href={getCheckoutUrl(plan.name, idx)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`w-full py-4 rounded-xl font-bold text-center transition-all ${idx === 1
                                            ? 'bg-yellow-500 text-white hover:bg-yellow-600 shadow-xl'
                                            : idx === 2 ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-green-600 text-white hover:bg-green-700'
                                            }`}
                                    >
                                        {t.landing.plans.iWant} {plan.name}
                                    </a>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Transformation - Seção 8 */}
            <section className="py-24 bg-white dark:bg-slate-950">
                <div className="container mx-auto px-6 max-w-4xl text-center">
                    <h2 className="text-4xl font-bold mb-8 text-slate-900 dark:text-white">{t.landing.features.imagine}</h2>
                    <p className="text-lg text-slate-600 dark:text-slate-400 mb-12">{t.landing.features.imagineSubtitle}</p>
                    <div className="grid md:grid-cols-2 gap-6 text-left mb-16">
                        {t.landing.features.items.map((txt, tid) => (
                            <div key={tid} className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                <span className="text-lg font-medium text-slate-700 dark:text-slate-300">{txt}</span>
                            </div>
                        ))}
                    </div>
                    <div className="space-y-2 text-2xl font-bold text-slate-900 dark:text-white">
                        <p>{t.landing.features.quick}</p>
                        <p>{t.landing.features.organized}</p>
                        <p className="text-blue-600">{t.landing.features.consistent}</p>
                    </div>
                </div>
            </section>

            {/* Mission Section */}
            <section id="missao" className="py-20 bg-slate-50 dark:bg-slate-900/50">
                <div className="container mx-auto px-6">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-4xl font-bold mb-8 text-slate-900 dark:text-white">{t.landing.mission.title}</h2>
                        <div className="grid md:grid-cols-2 gap-12 text-left">
                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="mt-1 w-6 h-6 bg-blue-600 rounded-full flex-shrink-0 flex items-center justify-center text-white text-[10px]">1</div>
                                    <p className="text-slate-600 dark:text-slate-400 text-sm">
                                        {t.landing.mission.p1}
                                    </p>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="mt-1 w-6 h-6 bg-blue-600 rounded-full flex-shrink-0 flex items-center justify-center text-white text-[10px]">2</div>
                                    <p className="text-slate-600 dark:text-slate-400 text-sm">
                                        {t.landing.mission.p2}
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-4 text-slate-600 dark:text-slate-400">
                                <p className="text-sm italic leading-relaxed">
                                    {t.landing.mission.quote}
                                </p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center text-blue-600 font-bold">AM</div>
                                    <div>
                                        <p className="font-bold text-slate-900 dark:text-white text-sm">{t.landing.mission.founderName}</p>
                                        <p className="text-xs text-slate-500">{t.landing.mission.founderRole}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Final - Seção 9 */}
            <section className="py-20 bg-white dark:bg-slate-950">
                <div className="container mx-auto px-6 text-center">
                    <div className="bg-gradient-to-r from-blue-600 to-sky-700 rounded-[3rem] p-12 text-center text-white relative overflow-hidden shadow-2xl max-w-5xl mx-auto">
                        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                        <h2 className="text-4xl font-bold mb-6 relative z-10">{t.landing.cta.title}</h2>
                        <p className="text-blue-100 mb-8 max-w-xl mx-auto relative z-10">
                            {t.landing.cta.desc}
                        </p>
                        <div className="relative z-10">
                            <button onClick={() => scrollToSection('planos')} className="px-10 py-5 bg-green-600 text-white font-bold rounded-2xl hover:bg-green-700 transition-all shadow-xl inline-flex items-center gap-2">
                                {t.landing.cta.btn} <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800">
                <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <Logo className="h-8" />
                    <p className="text-slate-500 text-xs">{t.landing.footer.rights}</p>
                    <div className="flex gap-6 text-slate-500 text-xs font-medium uppercase tracking-widest">
                        <a href="#" className="hover:text-blue-600 transition-colors">{t.landing.footer.privacy}</a>
                        <a href="#" className="hover:text-blue-600 transition-colors">{t.landing.footer.terms}</a>
                        <a href="#" className="hover:text-blue-600 transition-colors">{t.landing.footer.contact}</a>
                    </div>
                </div>
            </footer>

            {/* Floating WhatsApp Button */}
            <a
                href="https://wa.me/558491944131"
                target="_blank"
                rel="noopener noreferrer"
                className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-all transform hover:scale-110 flex items-center justify-center group"
                aria-label="Fale conosco no WhatsApp"
            >
                <MessageCircle className="w-8 h-8" />
                <span className="absolute right-full mr-3 bg-white dark:bg-slate-800 text-slate-800 dark:text-white px-3 py-1 rounded-lg text-sm font-bold shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    {t.landing.footer.support}
                </span>
            </a>
        </div>
    );
};

export default LandingPage;
