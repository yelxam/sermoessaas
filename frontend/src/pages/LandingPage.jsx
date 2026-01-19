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
    Loader2,
    X
} from 'lucide-react';
import Logo from '../components/Logo';

const LandingPage = () => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const res = await api.get('/plans/public');
                setPlans(res.data);
            } catch (err) {
                console.error("Erro ao carregar planos", err);
                setPlans([
                    { id: 'f1', name: 'Plano Básico', price: 67.90, max_sermons: 15, allow_ai: false, description: 'Ideal para quem quer organização e praticidade.', checkout_url: 'https://pay.kiwify.com.br/O3NseBN' },
                    { id: 'f2', name: 'Plano Pro', price: 147.90, max_sermons: 40, allow_ai: true, description: 'Perfeito para quem prepara sermões com frequência.', checkout_url: 'https://pay.kiwify.com.br/RjHvRsU' },
                    { id: 'f3', name: 'Plano Enterprise', price: 247.00, max_sermons: -1, allow_ai: true, description: 'Para quem leva o preparo do púlpito a sério.', checkout_url: 'https://pay.kiwify.com.br/AKaukS4' }
                ]);
            } finally {
                setLoading(false);
            }
        };
        fetchPlans();
    }, []);

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

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950">
            {/* Navbar */}
            <nav className="fixed top-0 w-full z-50 glass-panel !rounded-none border-t-0 border-x-0">
                <div className="container mx-auto px-6 h-28 flex items-center justify-between">
                    <Logo className="h-20" />

                    <div className="hidden md:flex items-center gap-8 text-slate-600 dark:text-slate-300 font-medium text-sm">
                        <button onClick={() => scrollToSection('problema')} className="hover:text-blue-600 transition-colors">Dores</button>
                        <button onClick={() => scrollToSection('solucao')} className="hover:text-blue-600 transition-colors">O Sistema</button>
                        <button onClick={() => scrollToSection('planos')} className="hover:text-blue-600 transition-colors">Planos</button>
                        <button onClick={() => scrollToSection('depoimentos')} className="hover:text-blue-600 transition-colors">Depoimentos</button>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link to="/login" className="px-4 py-2 text-blue-600 font-semibold text-sm hover:bg-blue-50 dark:hover:bg-slate-900 rounded-lg transition-all">
                            Entrar
                        </Link>
                        <button onClick={() => scrollToSection('planos')} className="btn-primary !px-4 !py-2 !text-sm">
                            Criar Conta
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
                            A primeira IA feita para pastores e líderes
                        </div>
                        <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6 text-slate-900 dark:text-white">
                            Prepare sermões <span className="text-blue-600">poderosos</span> em minutos.
                        </h1>
                        <p className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">
                            Sem stress. Sem bloqueio. Sem perder tempo.
                        </p>
                        <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-lg">
                            O Verbo Cast ajuda pastores e pregadores a criar, organizar, salvar e compartilhar sermões com clareza — usando tecnologia e Inteligência Artificial a favor do seu chamado.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={() => scrollToSection('planos')}
                                className="btn-primary !px-8 !py-4 flex items-center justify-center gap-2"
                            >
                                Começar agora <ArrowRight className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => scrollToSection('solucao')}
                                className="btn-secondary !px-8 !py-4 flex items-center justify-center text-blue-600 border-blue-200"
                            >
                                Conhecer o Sistema
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
                        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-slate-900 dark:text-white">Você não foi chamado para viver apagando incêndio todo domingo</h2>
                        <p className="text-lg text-slate-600 dark:text-slate-400">Se preparar um sermão virou sinônimo de:</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {[
                            "Correr contra o tempo toda semana",
                            "Ter boas ideias, mas não conseguir organizar",
                            "Deixar o sermão para o último dia",
                            "Perder mensagens antigas porque não estavam salvas",
                            "Sentir o peso da responsabilidade antes de subir ao púlpito"
                        ].map((pain, pidx) => (
                            <div key={pidx} className="flex items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
                                <X className="w-5 h-5 text-red-500 flex-shrink-0" />
                                <span className="text-slate-700 dark:text-slate-300 font-medium">{pain}</span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-16 text-center">
                        <p className="text-xl mb-4 text-slate-700 dark:text-slate-300">👉 O problema não é falta de fé. <br className="md:hidden" /> 👉 Nem falta de dedicação.</p>
                        <p className="text-2xl font-bold text-blue-600">É falta de um sistema simples, rápido e inteligente para o preparo da Palavra.</p>
                    </div>
                </div>
            </section>

            {/* Solution & Benefits - Seção 3 & 4 */}
            <section id="solucao" className="py-24 bg-white dark:bg-slate-950 overflow-hidden">
                <div className="container mx-auto px-6">
                    <div className="max-w-3xl mx-auto text-center mb-20">
                        <h2 className="text-4xl font-bold mb-6 text-slate-900 dark:text-white">Conheça o Verbo Cast</h2>
                        <p className="text-lg text-slate-600 dark:text-slate-400 mb-10">
                            O Verbo Cast é uma plataforma criada especialmente para pastores, pregadores e líderes que querem:
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                            {[
                                "Ganhar tempo no preparo dos sermões",
                                "Ter mensagens mais claras e bem estruturadas",
                                "Guardar tudo em um só lugar",
                                "Compartilhar mensagens com facilidade",
                                "Contar com IA quando a inspiração não vem"
                            ].map((item, iidx) => (
                                <div key={iidx} className="flex items-center gap-3">
                                    <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                                        <Check className="w-4 h-4 text-green-600" />
                                    </div>
                                    <span className="font-medium text-slate-700 dark:text-slate-300">{item}</span>
                                </div>
                            ))}
                        </div>
                        <p className="mt-12 text-blue-600 font-bold text-xl uppercase tracking-widest text-center">
                            Tudo isso em um painel simples, intuitivo e feito para quem vive o ministério na prática.
                        </p>
                    </div>

                    <div className="text-center mb-16">
                        <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">Tudo o que você precisa para preparar seus sermões, em um só lugar</h3>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { title: "Criador de Sermões Estruturado", desc: "Monte sermões completos com tema, texto base, introdução, desenvolvimento e conclusão.", icon: <PenTool className="w-7 h-7" /> },
                            { title: "Inteligência Artificial como apoio", desc: "Use IA para destravar ideias, gerar esboços bíblicos e organizar pensamentos.", icon: <Sparkles className="w-7 h-7" /> },
                            { title: "Salvar Sermões em PDF", desc: "Tenha seus sermões sempre salvos, organizados e prontos para reutilizar.", icon: <CheckCircle2 className="w-7 h-7" /> },
                            { title: "Compartilhamento no WhatsApp", desc: "Envie mensagens para líderes, células e equipes com um clique.", icon: <ArrowRight className="w-7 h-7 rotate-45" /> },
                            { title: "Biblioteca de Sermões", desc: "Nunca mais perca uma boa mensagem preparada com dedicação.", icon: <Calendar className="w-7 h-7" /> },
                            { title: "Bíblia Online Integrada", desc: "Consulte versículos, compare traduções e estude a Palavra sem sair da plataforma.", icon: <BookOpen className="w-7 h-7" /> }
                        ].map((benefit, bidx) => (
                            <div key={bidx} className="glass-panel p-8 card-hover">
                                <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600 mb-6">
                                    {benefit.icon}
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
                        <h2 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">A IA não substitui o chamado. <span className="text-blue-600">Ela apoia o preparo.</span></h2>
                        <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                            A Inteligência Artificial do Verbo Cast foi criada para ajudar, não para pregar por você. Ela serve para:
                        </p>
                        <ul className="space-y-4 mb-8">
                            {["Destravar ideias", "Organizar pensamentos", "Economizar tempo"].map((t, tid) => (
                                <li key={tid} className="flex items-center gap-3 font-bold text-slate-800 dark:text-slate-200">
                                    <Sparkles className="w-4 h-4 text-blue-600" /> {t}
                                </li>
                            ))}
                        </ul>
                        <p className="text-lg font-bold text-slate-900 dark:text-white border-l-4 border-blue-600 pl-6 italic bg-white dark:bg-slate-900 p-4 rounded-r-xl shadow-sm">
                            👉 O conteúdo final continua sendo seu, com sua visão, sua unção e sua responsabilidade diante de Deus e da igreja.
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
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900 dark:text-white">Pastores e pregadores que já usam aprovam</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-16">Centenas de mensagens preparadas com mais clareza, menos pressa e muito mais organização.</p>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 text-left max-w-6xl mx-auto">
                        {[
                            { name: "Pastor Marcos A.", text: "Eu sempre deixava o sermão para a última hora. Com o Verbo Cast, agora consigo organizar tudo com antecedência. Mudou completamente minha rotina." },
                            { name: "Pr. André S.", text: "A ferramenta de IA me ajuda muito quando estou sem ideias. Não substitui meu estudo, mas acelera demais o processo." },
                            { name: "Presbítero Lucas M.", text: "Antes eu perdia meus sermões antigos. Agora tenho tudo salvo, organizado e ainda consigo compartilhar direto no WhatsApp." },
                            { name: "Pastor João C.", text: "É uma plataforma pensada para quem vive o ministério de verdade." },
                            { name: "Evangelista Rafael P.", text: "Vale cada centavo. Hoje preparo meus sermões com mais paz, mais clareza e menos pressão." },
                            { name: "Pastor Daniel R.", text: "Depois que comecei a usar o Verbo Cast, parei de sentir aquele peso antes de preparar o sermão." },
                            { name: "Missionário Felipe T.", text: "O que mais gostei foi a praticidade. Em poucos minutos consigo estruturar a mensagem." },
                            { name: "Pastor Elias N.", text: "Uso o plano Pro e a IA ilimitada faz toda diferença." }
                        ].map((test, tidx) => (
                            <div key={tidx} className="glass-panel p-6 bg-slate-50 dark:bg-slate-900/50">
                                <p className="text-slate-600 dark:text-slate-300 italic mb-6 leading-relaxed">"{test.text}"</p>
                                <div className="font-bold text-slate-900 dark:text-white">— {test.name}</div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-12 text-blue-600 font-bold text-xl">
                        ⭐ Avaliação média: 5,0 de 5 estrelas
                    </div>
                    <button onClick={() => scrollToSection('planos')} className="mt-8 text-blue-600 font-bold underline flex items-center gap-2 mx-auto hover:text-blue-700 transition-colors">
                        Quero preparar meus sermões com mais clareza <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </section>

            {/* Plans Section - Seção 7 */}
            <section id="planos" className="py-24 bg-slate-50 dark:bg-slate-900/50">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4 text-slate-900 dark:text-white">Escolha o plano ideal para o seu ministério</h2>
                        <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
                            Invista no seu ministério com ferramentas que otimizam seu tempo de estudo.
                        </p>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                            <p className="text-slate-500">Carregando planos...</p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                            {plans.map((plan, idx) => (
                                <div key={plan.id} className={`glass-panel p-8 relative flex flex-col bg-white dark:bg-slate-900 ${idx === 1 ? 'border-2 border-yellow-500 scale-105 shadow-2xl z-10' : ''}`}>
                                    {idx === 0 && <div className="w-4 h-4 rounded-full bg-green-500 mb-4 shadow-lg shadow-green-200"></div>}
                                    {idx === 1 && <div className="w-4 h-4 rounded-full bg-yellow-500 mb-4 shadow-lg shadow-yellow-200"></div>}
                                    {idx === 2 && <div className="w-4 h-4 rounded-full bg-blue-500 mb-4 shadow-lg shadow-blue-200"></div>}

                                    <h3 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">{plan.name}</h3>
                                    <div className="flex items-baseline gap-1 mb-6">
                                        <span className="text-4xl font-bold text-slate-900 dark:text-white">R$ {parseFloat(plan.price).toFixed(2).replace('.', ',')}</span>
                                        <span className="text-slate-500 dark:text-slate-400 text-sm">/mês</span>
                                    </div>
                                    <p className="text-slate-600 dark:text-slate-400 mb-8 text-sm leading-relaxed min-h-[40px] font-bold">
                                        {plan.description}
                                    </p>

                                    <ul className="space-y-4 mb-8 flex-1 border-t border-slate-100 dark:border-slate-800 pt-6">
                                        <li className="flex items-start gap-3 text-sm">
                                            <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                                            <span className="text-slate-700 dark:text-slate-300 font-medium">
                                                {plan.id === 'f1' ? 'Organização total para o preparo do sermão' : plan.id === 'f2' ? 'Mais tempo, mais clareza e apoio inteligente' : 'Liberdade total para preparar sermões com excelência'}
                                            </span>
                                        </li>
                                        <li className="flex items-start gap-3 text-sm">
                                            <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                                            <span className="text-slate-700 dark:text-slate-300">
                                                {plan.id === 'f3' ? 'Todos os recursos liberados' : 'Criar e organizar sermões'}
                                            </span>
                                        </li>
                                        <li className="flex items-start gap-3 text-sm">
                                            <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                                            <span className="text-slate-700 dark:text-slate-300">
                                                {plan.id === 'f3' ? 'IA ILIMITADA' : plan.id === 'f2' ? 'IA para criação de sermões (uso limitado)' : 'Biblioteca pessoal'}
                                            </span>
                                        </li>
                                        <li className="flex items-start gap-3 text-sm">
                                            <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                                            <span className="text-slate-700 dark:text-slate-300">
                                                {plan.id === 'f1' ? 'Salvar sermões em PDF' : 'Esboços bíblicos'}
                                            </span>
                                        </li>
                                        <li className="flex items-start gap-3 text-sm">
                                            <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                                            <span className="text-slate-700 dark:text-slate-300">
                                                {plan.id === 'f3' ? 'Ideal para séries de mensagens' : 'Organização de ideias'}
                                            </span>
                                        </li>
                                        <li className="flex items-start gap-3 text-sm">
                                            <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                                            <span className="text-slate-700 dark:text-slate-300">
                                                {plan.id === 'f3' ? 'Bíblia Online completa integrada' : 'Bíblia Online integrada'}
                                            </span>
                                        </li>
                                        <li className="flex items-start gap-3 text-sm">
                                            <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                                            <span className="text-slate-700 dark:text-slate-300">Compartilhar no WhatsApp</span>
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
                                        Quero o {plan.name}
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
                    <h2 className="text-4xl font-bold mb-8 text-slate-900 dark:text-white">Imagine sua rotina com o Verbo Cast</h2>
                    <p className="text-lg text-slate-600 dark:text-slate-400 mb-12">Imagine abrir seu painel e já saber:</p>
                    <div className="grid md:grid-cols-2 gap-6 text-left mb-16">
                        {[
                            "Qual será o próximo sermão",
                            "Onde está cada mensagem",
                            "Ter apoio quando faltar inspiração",
                            "Ter mais tempo para oração, estudo e cuidado pastoral"
                        ].map((txt, tid) => (
                            <div key={tid} className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                <span className="text-lg font-medium text-slate-700 dark:text-slate-300">{txt}</span>
                            </div>
                        ))}
                    </div>
                    <div className="space-y-2 text-2xl font-bold text-slate-900 dark:text-white">
                        <p>Menos correria.</p>
                        <p>Mais clareza.</p>
                        <p className="text-blue-600">Mais consistência no púlpito.</p>
                    </div>
                </div>
            </section>

            {/* Mission Section */}
            <section id="missao" className="py-20 bg-slate-50 dark:bg-slate-900/50">
                <div className="container mx-auto px-6">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-4xl font-bold mb-8 text-slate-900 dark:text-white">Mais do que tecnologia, uma ferramenta de ministério.</h2>
                        <div className="grid md:grid-cols-2 gap-12 text-left">
                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="mt-1 w-6 h-6 bg-blue-600 rounded-full flex-shrink-0 flex items-center justify-center text-white text-[10px]">1</div>
                                    <p className="text-slate-600 dark:text-slate-400 text-sm">
                                        Libere tempo para o cuidado pastoral direto, deixando o Verbo Cast auxiliar na estruturação do estudo.
                                    </p>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="mt-1 w-6 h-6 bg-blue-600 rounded-full flex-shrink-0 flex items-center justify-center text-white text-[10px]">2</div>
                                    <p className="text-slate-600 dark:text-slate-400 text-sm">
                                        Encontre novas perspectivas e ilustrações para textos clássicos, renovando o interesse dos ouvintes.
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-4 text-slate-600 dark:text-slate-400">
                                <p className="text-sm italic leading-relaxed">
                                    "O Verbo Cast nasceu para estar ao lado de quem prega. Acreditamos que a tecnologia deve servir ao Reino, facilitando o preparo intelectual para que o pastor foque no preparo espiritual."
                                </p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center text-blue-600 font-bold">AM</div>
                                    <div>
                                        <p className="font-bold text-slate-900 dark:text-white text-sm">Pr. André Marques</p>
                                        <p className="text-xs text-slate-500">Fundador do Verbo Cast</p>
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
                        <h2 className="text-4xl font-bold mb-6 relative z-10">Seu próximo sermão pode começar agora</h2>
                        <p className="text-blue-100 mb-8 max-w-xl mx-auto relative z-10">
                            O Verbo Cast foi criado para servir o ministério, respeitar o chamado e facilitar o preparo da Palavra. Clique no botão abaixo, escolha seu plano e comece hoje mesmo.
                        </p>
                        <div className="relative z-10">
                            <button onClick={() => scrollToSection('planos')} className="px-10 py-5 bg-green-600 text-white font-bold rounded-2xl hover:bg-green-700 transition-all shadow-xl inline-flex items-center gap-2">
                                Começar com o Verbo Cast agora <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800">
                <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <Logo className="h-8" />
                    <p className="text-slate-500 text-xs">© 2026 Verbo Cast AI. Preparando corações para a mensagem bíblica.</p>
                    <div className="flex gap-6 text-slate-500 text-xs font-medium uppercase tracking-widest">
                        <a href="#" className="hover:text-blue-600 transition-colors">Privacidade</a>
                        <a href="#" className="hover:text-blue-600 transition-colors">Termos</a>
                        <a href="#" className="hover:text-blue-600 transition-colors">Contato</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
