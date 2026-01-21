import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';
import { Building2, Save, X, Edit3, ShieldAlert, TrendingUp, Users, FileText, PieChart as PieChartIcon, CreditCard, AlertCircle, BookOpen, UserPlus } from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, AreaChart, Area, BarChart, Bar
} from 'recharts';

export default function AdminCompanies() {
    const [companies, setCompanies] = useState([]);
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingCompany, setEditingCompany] = useState(null);
    const [creatingUser, setCreatingUser] = useState(false);
    const [editForm, setEditForm] = useState({ name: '', plan: '', max_sermons: 0, active: true, allow_ai: true, allow_bible_study: true });
    const [userForm, setUserForm] = useState({ name: '', email: '', password: '', role: 'member', company_id: '' });
    const [msg, setMsg] = useState({ type: '', text: '' });
    const [stats, setStats] = useState({
        totalCompanies: 0,
        totalUsers: 0,
        totalSermons: 0,
        companyDistribution: [],
        sermonGrowth: [],
        pendingRequestsCount: 0,
        pendingRequestsCompanies: [],
        pendingRequestsDistribution: []
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [compRes, planRes, statsRes] = await Promise.all([
                    api.get('/companies'),
                    api.get('/plans/public'),
                    api.get('/companies/stats')
                ]);
                setCompanies(compRes.data);
                setPlans(planRes.data);
                setStats(statsRes.data);
            } catch (err) {
                console.error("Erro ao carregar dados do admin", err);
                setMsg({ type: 'error', text: 'Erro ao carregar empresas' });
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleEdit = (company) => {
        setEditingCompany(company);
        setEditForm({
            name: company.name,
            plan: company.plan,
            max_sermons: company.max_sermons,
            active: company.active !== undefined ? company.active : true,
            allow_ai: company.allow_ai !== undefined ? company.allow_ai : true,
            allow_bible_study: company.allow_bible_study !== undefined ? company.allow_bible_study : true
        });
        setMsg({ type: '', text: '' });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/companies/${editingCompany.id}`, editForm);
            setCompanies(companies.map(c => c.id === editingCompany.id ? { ...c, ...editForm } : c));
            setEditingCompany(null);
            setMsg({ type: 'success', text: 'Empresa atualizada com sucesso!' });
        } catch (err) {
            setMsg({ type: 'error', text: 'Erro ao atualizar empresa' });
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/users', userForm);
            setMsg({ type: 'success', text: 'Usuário criado com sucesso!' });
            setCreatingUser(false);
            setUserForm({ name: '', email: '', password: '', role: 'member', company_id: '' });
            // Optionally update stats
            setStats({ ...stats, totalUsers: stats.totalUsers + 1 });
        } catch (err) {
            setMsg({ type: 'error', text: err.response?.data?.msg || 'Erro ao criar usuário' });
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center dark:bg-slate-950"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div></div>;

    return (
        <Layout>
            <div className="container mx-auto px-6 py-8">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200 dark:shadow-none">
                                <ShieldAlert className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold dark:text-white">Gerenciamento do Sistema</h1>
                                <p className="text-slate-500">Administração de Empresas e Planos</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setCreatingUser(true)}
                            className="btn-primary flex items-center gap-2 px-6 py-3"
                        >
                            <UserPlus className="w-5 h-5" />
                            <span>Novo Usuário</span>
                        </button>
                    </div>

                    {msg.text && (
                        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${msg.type === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200'}`}>
                            <p className="font-bold">{msg.text}</p>
                        </div>
                    )}

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border dark:border-slate-800 shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
                                    <Building2 className="w-6 h-6 text-blue-600" />
                                </div>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Empresas</span>
                            </div>
                            <div className="text-3xl font-black dark:text-white">{stats.totalCompanies}</div>
                            <p className="text-sm text-slate-500 mt-1">Organizações Ativas</p>
                        </div>

                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border dark:border-slate-800 shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-xl">
                                    <Users className="w-6 h-6 text-green-600" />
                                </div>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Usuários</span>
                            </div>
                            <div className="text-3xl font-black dark:text-white">{stats.totalUsers}</div>
                            <p className="text-sm text-slate-500 mt-1">Pastores e Líderes</p>
                        </div>

                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border dark:border-slate-800 shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
                                    <FileText className="w-6 h-6 text-blue-600" />
                                </div>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Sermões</span>
                            </div>
                            <div className="text-3xl font-black dark:text-white">{stats.totalSermons}</div>
                            <p className="text-sm text-slate-500 mt-1">Gerados com IA</p>
                        </div>

                        <div className={`bg-white dark:bg-slate-900 rounded-2xl p-6 border ${stats.pendingRequestsCount > 0 ? 'border-amber-200 dark:border-amber-900/50 bg-amber-50/10' : 'dark:border-slate-800'} shadow-sm`}>
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 ${stats.pendingRequestsCount > 0 ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-slate-100 dark:bg-slate-800'} rounded-xl`}>
                                    <AlertCircle className={`w-6 h-6 ${stats.pendingRequestsCount > 0 ? 'text-amber-600' : 'text-slate-400'}`} />
                                </div>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Pendências</span>
                            </div>
                            <div className="text-3xl font-black dark:text-white">{stats.pendingRequestsCount}</div>
                            <p className="text-sm text-slate-500 mt-1">Trocas de Plano</p>
                        </div>
                    </div>

                    <div className="glass-panel overflow-hidden border dark:border-slate-800">
                        <div className="p-6 border-b dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 flex items-center justify-between font-bold">
                            <div className="flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-blue-600" />
                                <span>Empresas Cadastradas</span>
                            </div>
                            <span className="text-xs text-slate-500 uppercase tracking-widest">{companies.length} no total</span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50">
                                    <tr>
                                        <th className="px-6 py-4 font-black">Empresa / Ministério</th>
                                        <th className="px-6 py-4 font-black">Plano Atual</th>
                                        <th className="px-6 py-4 font-black">Sermões/Mês</th>
                                        <th className="px-6 py-4 font-black">Recursos</th>
                                        <th className="px-6 py-4 text-right">Ação</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y dark:divide-slate-800">
                                    {companies.map(company => (
                                        <tr key={company.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-bold dark:text-white">{company.name}</div>
                                                <div className="text-[10px] text-slate-400">ID: {company.id}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`w-fit px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${company.plan === 'Pro' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'}`}>
                                                    {company.plan}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-slate-600 dark:text-slate-300">
                                                {company.max_sermons === -1 ? '∞' : company.max_sermons}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-1.5">
                                                    <span className={`w-fit text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${company.allow_ai !== false ? 'text-blue-500 bg-blue-500/10' : 'text-slate-500 bg-slate-500/10'}`}>
                                                        IA
                                                    </span>
                                                    <span className={`w-fit text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${company.allow_bible_study !== false ? 'text-indigo-500 bg-indigo-500/10' : 'text-slate-500 bg-slate-500/10'}`}>
                                                        Estudo
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button onClick={() => handleEdit(company)} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all">
                                                    <Edit3 className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {editingCompany && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg border dark:border-slate-800">
                            <div className="p-8 pb-0 flex justify-between items-center">
                                <h2 className="text-2xl font-black dark:text-white">Editar Empresa</h2>
                                <button onClick={() => setEditingCompany(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleUpdate} className="p-8 space-y-5">
                                <div>
                                    <label className="label-text">Nome do Ministério</label>
                                    <input type="text" className="input-field" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} required />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="label-text">Plano</label>
                                        <select
                                            className="input-field"
                                            value={editForm.plan}
                                            onChange={(e) => {
                                                const p = plans.find(pl => pl.name === e.target.value);
                                                setEditForm({
                                                    ...editForm,
                                                    plan: e.target.value,
                                                    max_sermons: p ? p.max_sermons : editForm.max_sermons,
                                                    allow_ai: p ? p.allow_ai : editForm.allow_ai,
                                                    allow_bible_study: p ? p.allow_bible_study : editForm.allow_bible_study
                                                });
                                            }}
                                        >
                                            {plans.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                                            <option value="Personalizado">Personalizado</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="label-text">Limite Sermões</label>
                                        <input type="number" className="input-field" value={editForm.max_sermons} onChange={(e) => setEditForm({ ...editForm, max_sermons: parseInt(e.target.value) })} required />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border dark:border-slate-800 flex items-center justify-between">
                                        <span className="font-bold text-sm dark:text-white">Habilitar IA de Sermões</span>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" checked={editForm.allow_ai} onChange={(e) => setEditForm({ ...editForm, allow_ai: e.target.checked })} />
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>
                                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border dark:border-slate-800 flex items-center justify-between">
                                        <span className="font-bold text-sm dark:text-white">Módulo de Estudo Bíblico</span>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" checked={editForm.allow_bible_study} onChange={(e) => setEditForm({ ...editForm, allow_bible_study: e.target.checked })} />
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>
                                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border dark:border-slate-800 flex items-center justify-between">
                                        <span className="font-bold text-sm dark:text-white">Conta Ativa</span>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" checked={editForm.active} onChange={(e) => setEditForm({ ...editForm, active: e.target.checked })} />
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button type="button" onClick={() => setEditingCompany(null)} className="flex-1 px-6 py-4 font-bold rounded-2xl border dark:border-slate-800 dark:text-white">Cancelar</button>
                                    <button type="submit" className="flex-1 btn-primary !py-4 flex items-center justify-center gap-2">
                                        <Save className="w-5 h-5" /> Salvar
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {creatingUser && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg border dark:border-slate-800">
                            <div className="p-8 pb-0 flex justify-between items-center">
                                <h2 className="text-2xl font-black dark:text-white">Criar Novo Usuário</h2>
                                <button onClick={() => setCreatingUser(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleCreateUser} className="p-8 space-y-5">
                                <div>
                                    <label className="label-text">Nome Completo</label>
                                    <input type="text" className="input-field" value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} required />
                                </div>
                                <div>
                                    <label className="label-text">E-mail</label>
                                    <input type="email" className="input-field" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} required />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="label-text">Senha</label>
                                        <input type="password" className="input-field" value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} required />
                                    </div>
                                    <div>
                                        <label className="label-text">Função</label>
                                        <select className="input-field" value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}>
                                            <option value="member">Membro</option>
                                            <option value="admin">Admin</option>
                                            <option value="owner">Dono (Owner)</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="label-text">Organização / Igreja</label>
                                    <select className="input-field" value={userForm.company_id} onChange={(e) => setUserForm({ ...userForm, company_id: e.target.value })} required>
                                        <option value="">Selecione uma organização...</option>
                                        {companies.map(c => (
                                            <option key={c.id} value={c.id}>{c.name} (ID: {c.id})</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button type="button" onClick={() => setCreatingUser(false)} className="flex-1 px-6 py-4 font-bold rounded-2xl border dark:border-slate-800 dark:text-white">Cancelar</button>
                                    <button type="submit" className="flex-1 btn-primary !py-4 flex items-center justify-center gap-2">
                                        <UserPlus className="w-5 h-5" /> Criar Usuário
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}
