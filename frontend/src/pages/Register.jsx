import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { BookOpen, CreditCard, ChevronDown } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import Logo from '../components/Logo';

export default function Register() {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', companyName: '' });
    const [error, setError] = useState('');
    const [planId, setPlanId] = useState('');
    const [allPlans, setAllPlans] = useState([]);
    const [loadingPlans, setLoadingPlans] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useLanguage();

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const res = await api.get('/plans/public');
                setAllPlans(res.data);

                const params = new URLSearchParams(location.search);
                const planFromUrl = params.get('plan');

                if (planFromUrl) {
                    setPlanId(planFromUrl);
                } else if (res.data.length > 0) {
                    // Default to the first plan (usually Free) if none selected
                    setPlanId(res.data[0].id.toString());
                }
            } catch (err) {
                console.error("Erro ao carregar planos", err);
            } finally {
                setLoadingPlans(false);
            }
        };
        fetchPlans();
    }, [location]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const dataToSend = {
                ...formData,
                planId: parseInt(planId),
                companyName: formData.companyName || `${formData.name.split(' ')[0]}'s Ministry`
            };
            const res = await api.post('/auth/register', dataToSend);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.msg || 'Erro ao registrar');
        }
    };

    const selectedPlan = allPlans.find(p => p.id.toString() === planId.toString());

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 dark:from-slate-900 dark:to-slate-950 p-4">
            <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-8 rounded-3xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in duration-300 border dark:border-slate-800">
                <div className="flex justify-center mb-8">
                    <Logo className="w-64" showText={false} />
                </div>

                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-gray-100">{t.auth.createAccount}</h2>
                    <p className="text-center text-gray-500 dark:text-gray-400 mt-2">{t.auth.startGenerating}</p>
                </div>

                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-400 p-4 mb-6 rounded-r-lg text-sm animate-in slide-in-from-left-2" role="alert">
                        <p className="font-bold">Atenção</p>
                        <p>{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Plan Selector */}
                    <div className="space-y-2">
                        <label className="label-text flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-indigo-500" /> Selecione seu Plano
                        </label>
                        <div className="relative group">
                            <select
                                value={planId}
                                onChange={(e) => setPlanId(e.target.value)}
                                className="w-full appearance-none bg-indigo-50/50 dark:bg-slate-800 border-2 border-indigo-100 dark:border-slate-700 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-900 dark:text-white focus:border-indigo-500 outline-none transition-all cursor-pointer"
                            >
                                {allPlans.map(plan => (
                                    <option key={plan.id} value={plan.id}>
                                        {plan.name} - R$ {plan.price} /mês
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400 pointer-events-none group-hover:text-indigo-600 transition-colors" />
                        </div>
                        {selectedPlan && (
                            <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest pl-2">
                                Inclui: {selectedPlan.max_sermons === -1 ? 'Sermões Ilimitados' : `${selectedPlan.max_sermons} sermões/mês`}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-4 pt-2">
                        <div>
                            <label className="label-text">{t.auth.name}</label>
                            <input
                                type="text"
                                required
                                className="input-field"
                                placeholder="Seu nome"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="label-text">{t.auth.email}</label>
                            <input
                                type="email"
                                required
                                className="input-field"
                                placeholder="seu@email.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="label-text">{t.auth.password}</label>
                            <input
                                type="password"
                                required
                                className="input-field"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full btn-primary !py-4 !text-lg mt-6 shadow-xl shadow-indigo-200 dark:shadow-none transition-transform active:scale-95"
                    >
                        {t.auth.register}
                    </button>
                </form>

                <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
                    {t.auth.haveAccount}{' '}
                    <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline transition-all">
                        {t.auth.login}
                    </Link>
                </p>
            </div>
        </div>
    );
}
