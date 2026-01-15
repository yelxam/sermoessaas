import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
    Loader2
} from 'lucide-react';

const LandingPage = () => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                // Using the centralized API service to handle baseURL and avoids issues with manual URL concatenation
                const res = await api.get('/plans/public');
                setPlans(res.data);
            } catch (err) {
                console.error("Erro ao carregar planos", err);
                // Fallback local if API is not yet redeployed on Vercel (optional, but helps UX)
                setPlans([
                    { id: 'f1', name: 'Plano Mensal', price: 49.90, max_sermons: 10, description: 'Perfeito para pastores de comunidades locais.' },
                    { id: 'f2', name: 'Plano Premium', price: 89.90, max_sermons: -1, description: 'Acesso ilimitado para líderes e conferencistas.' },
                    { id: 'f3', name: 'Plano Church', price: 199.90, max_sermons: -1, description: 'Ideal para equipes pastorais e igrejas em crescimento.' }
                ]);
            } finally {
                setLoading(false);
            }
        };
        fetchPlans();
    }, []);

    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950">
            {/* Navbar */}
            <nav className="fixed top-0 w-full z-50 glass-panel !rounded-none border-t-0 border-x-0">
                <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-none">
                            <BookOpen className="text-white w-6 h-6" />
                        </div>
                        <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
                            VerboCast
                        </span>
                    </div>

                    <div className="hidden md:flex items-center gap-8 text-slate-600 dark:text-slate-300 font-medium text-sm">
                        <button onClick={() => scrollToSection('funcionalidades')} className="hover:text-indigo-600 transition-colors">Funcionalidades</button>
                        <button onClick={() => scrollToSection('planos')} className="hover:text-indigo-600 transition-colors">Planos</button>
                        <button onClick={() => scrollToSection('missao')} className="hover:text-indigo-600 transition-colors">Nossa Missão</button>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link to="/login" className="px-4 py-2 text-indigo-600 font-semibold text-sm hover:bg-indigo-50 dark:hover:bg-slate-900 rounded-lg transition-all">
                            Entrar
                        </Link>
                        <Link to="/register" className="btn-primary !px-4 !py-2 !text-sm">
                            Criar Conta
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 relative overflow-hidden">
                <div className="absolute top-0 right-0 -z-10 w-1/2 h-full bg-gradient-to-l from-indigo-50 to-transparent dark:from-indigo-950/20 opacity-50 blur-3xl"></div>
                <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full font-semibold text-xs mb-6 uppercase tracking-wider">
                            <Sparkles className="w-3.5 h-3.5" />
                            A primeira IA feita para pastores e líderes
                        </div>
                        <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
                            Sermões Inspirados pela <span className="text-indigo-600">Bíblia</span> com auxílio da IA.
                        </h1>
                        <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-lg">
                            Potencialize seu ministério com o VerboCast. Gere esboços, estudos e sermões profundos em minutos, mantendo sempre a fidelidade às Escrituras.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={() => scrollToSection('planos')}
                                className="btn-primary !px-8 !py-4 flex items-center justify-center gap-2"
                            >
                                Ver Planos Disponíveis <ArrowRight className="w-5 h-5" />
                            </button>
                            <Link to="/login" className="btn-secondary !px-8 !py-4 flex items-center justify-center text-indigo-600 border-indigo-200">
                                Ver Demonstração
                            </Link>
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
                        <div className="absolute -bottom-6 -left-6 glass-panel p-6 max-w-xs shadow-2xl animate-bounce-slow hidden sm:block">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white">
                                    <CheckCircle2 className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold">Esboço Gerado</p>
                                    <p className="text-xs text-slate-500">Com base em João 3:16</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section id="funcionalidades" className="py-20 bg-slate-50 dark:bg-slate-900/50">
                <div className="container mx-auto px-6 text-center mb-16">
                    <h2 className="text-3xl font-bold mb-4">Funcionalidades focadas no Reino</h2>
                    <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                        Ferramentas inteligentes desenhadas para respeitar o tempo de estudo bíblico e amplificar a mensagem do Evangelho.
                    </p>
                </div>

                <div className="container mx-auto px-6 grid md:grid-cols-3 gap-8 text-left">
                    <div className="glass-panel p-8 card-hover">
                        <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900/50 rounded-2xl flex items-center justify-center text-indigo-600 mb-6 font-bold text-xl">
                            <PenTool className="w-7 h-7" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Esboços Inteligentes</h3>
                        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                            Gere pontos de sermão, ilustrações e aplicações práticas baseadas em qualquer texto bíblico ou tema.
                        </p>
                    </div>

                    <div className="glass-panel p-8 card-hover">
                        <div className="w-14 h-14 bg-violet-100 dark:bg-violet-900/50 rounded-2xl flex items-center justify-center text-violet-600 mb-6">
                            <Calendar className="w-7 h-7" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Séries de Mensagens</h3>
                        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                            Planeje o mês inteiro da igreja com séries temáticas e devocionais conectados para sua congregação.
                        </p>
                    </div>

                    <div className="glass-panel p-8 card-hover">
                        <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/50 rounded-2xl flex items-center justify-center text-blue-600 mb-6">
                            <ShieldCheck className="w-7 h-7" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Fidelidade Doutrinária</h3>
                        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                            Nossa IA é treinada para priorizar a exegese bíblica e referências teológicas sólidas em cada resposta.
                        </p>
                    </div>
                </div>
            </section>

            {/* Plans Section */}
            <section id="planos" className="py-24 bg-white dark:bg-slate-950">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4">Escolha o Plano Ideal</h2>
                        <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
                            Invista no seu ministério com ferramentas que otimizam seu tempo de estudo.
                        </p>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
                            <p className="text-slate-500">Carregando planos...</p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                            {plans.map((plan, idx) => (
                                <div key={plan.id} className={`glass-panel p-8 relative flex flex-col ${idx === 1 ? 'border-2 border-indigo-500 scale-105 shadow-2xl z-10' : ''}`}>
                                    {idx === 1 && (
                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                            Mais Popular
                                        </div>
                                    )}
                                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                                    <div className="flex items-baseline gap-1 mb-6">
                                        <span className="text-4xl font-bold">R$ {parseFloat(plan.price).toFixed(2).replace('.', ',')}</span>
                                        <span className="text-slate-500 dark:text-slate-400 text-sm">/mês</span>
                                    </div>
                                    <p className="text-slate-600 dark:text-slate-400 mb-8 text-sm leading-relaxed min-h-[40px]">
                                        {plan.description}
                                    </p>

                                    <ul className="space-y-4 mb-8 flex-1">
                                        <li className="flex items-start gap-3 text-sm">
                                            <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                                            <span>{plan.max_sermons === -1 ? 'Sermões Ilimitados' : `${plan.max_sermons} Sermões por mês`}</span>
                                        </li>
                                        <li className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400">
                                            <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                                            <span>Geração de Esboços com IA</span>
                                        </li>
                                        <li className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400">
                                            <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                                            <span>Compartilhamento via Link</span>
                                        </li>
                                        <li className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400">
                                            <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                                            <span>Exportação para Impressão</span>
                                        </li>
                                    </ul>

                                    <Link
                                        to="/register"
                                        className={`w-full py-4 rounded-xl font-bold text-center transition-all ${idx === 1
                                                ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none'
                                                : 'bg-indigo-50 dark:bg-slate-900 text-indigo-600 hover:bg-indigo-100 dark:hover:bg-slate-800'
                                            }`}
                                    >
                                        Assinar Agora
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Mission Section */}
            <section id="missao" className="py-20 relative overflow-hidden bg-slate-50 dark:bg-slate-900/30">
                <div className="container mx-auto px-6">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-4xl font-bold mb-8">Mais do que tecnologia, uma ferramenta de ministério.</h2>
                        <div className="grid md:grid-cols-2 gap-12 text-left">
                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="mt-1 w-6 h-6 bg-indigo-600 rounded-full flex-shrink-0 flex items-center justify-center text-white text-[10px]">1</div>
                                    <p className="text-slate-600 dark:text-slate-400 text-sm">
                                        Libere tempo para o cuidado pastoral direto, deixando o VerboCast auxiliar na estruturação do estudo.
                                    </p>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="mt-1 w-6 h-6 bg-indigo-600 rounded-full flex-shrink-0 flex items-center justify-center text-white text-[10px]">2</div>
                                    <p className="text-slate-600 dark:text-slate-400 text-sm">
                                        Encontre novas perspectivas e ilustrações para textos clássicos, renovando o interesse dos ouvintes.
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-4 text-slate-600 dark:text-slate-400">
                                <p className="text-sm italic leading-relaxed">
                                    "O VerboCast nasceu para estar ao lado de quem prega. Acreditamos que a tecnologia deve servir ao Reino, facilitando o preparo intelectual para que o pastor foque no preparo espiritual."
                                </p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">AM</div>
                                    <div>
                                        <p className="font-bold text-slate-900 dark:text-white text-sm">Pr. André Marques</p>
                                        <p className="text-xs text-slate-500">Fundador do VerboCast</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Final */}
            <section className="py-20">
                <div className="container mx-auto px-6 text-center">
                    <div className="bg-gradient-to-r from-indigo-600 to-violet-700 rounded-[3rem] p-12 text-center text-white relative overflow-hidden shadow-2xl max-w-5xl mx-auto">
                        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                        <h2 className="text-4xl font-bold mb-6 relative z-10">Potencialize seu ministério hoje.</h2>
                        <p className="text-indigo-100 mb-8 max-w-xl mx-auto relative z-10">
                            Junte-se a centenas de líderes que já estão transformando o tempo de preparo de sermões com inteligência bíblica.
                        </p>
                        <div className="relative z-10">
                            <Link to="/register" className="px-10 py-5 bg-white text-indigo-600 font-bold rounded-2xl hover:bg-indigo-50 transition-all shadow-xl inline-flex items-center gap-2">
                                Criar Conta Agora <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-slate-100 dark:border-slate-800">
                <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <BookOpen className="text-indigo-600 w-6 h-6" />
                        <span className="text-xl font-bold">VerboCast</span>
                    </div>
                    <p className="text-slate-500 text-xs">© 2026 VerboCast AI. Preparando corações para a mensagem bíblica.</p>
                    <div className="flex gap-6 text-slate-500 text-xs font-medium uppercase tracking-widest">
                        <a href="#" className="hover:text-indigo-600 transition-colors">Privacidade</a>
                        <a href="#" className="hover:text-indigo-600 transition-colors">Termos</a>
                        <a href="#" className="hover:text-indigo-600 transition-colors">Contato</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
