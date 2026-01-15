import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';
import { Building2, Save, X, Edit3, ShieldAlert } from 'lucide-react';

export default function AdminCompanies() {
    const [companies, setCompanies] = useState([]);
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingCompany, setEditingCompany] = useState(null);
    const [editForm, setEditForm] = useState({ name: '', plan: '', max_sermons: 0 });
    const [msg, setMsg] = useState({ type: '', text: '' });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [compRes, planRes] = await Promise.all([
                    api.get('/companies'),
                    api.get('/plans/public')
                ]);
                setCompanies(compRes.data);
                setPlans(planRes.data);
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
            max_sermons: company.max_sermons
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

    if (loading) return <div className="min-h-screen flex items-center justify-center dark:bg-slate-950"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div></div>;

    return (
        <Layout>
            <div className="container mx-auto px-6 py-8">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-none">
                            <ShieldAlert className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold dark:text-white">Gerenciamento do Sistema</h1>
                            <p className="text-slate-500">Administração de Empresas e Planos</p>
                        </div>
                    </div>

                    {msg.text && (
                        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${msg.type === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200'}`}>
                            <p className="font-bold">{msg.text}</p>
                        </div>
                    )}

                    <div className="glass-panel overflow-hidden border dark:border-slate-800">
                        <div className="p-6 border-b dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 flex items-center justify-between font-bold">
                            <div className="flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-indigo-600" />
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
                                        <th className="px-6 py-4 font-black">Data Cadastro</th>
                                        <th className="px-6 py-4 font-black text-right">Ação</th>
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
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${company.plan === 'Pro' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300' :
                                                        company.plan === 'Avançado' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' :
                                                            'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                                                    }`}>
                                                    {company.plan}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-slate-600 dark:text-slate-300">
                                                {company.max_sermons === -1 ? 'Ilimitado' : company.max_sermons}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-500">
                                                {new Date(company.created_at || company.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleEdit(company)}
                                                    className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-all"
                                                >
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

                {/* Edit Modal */}
                {editingCompany && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden border dark:border-slate-800">
                            <div className="p-8 pb-0 flex justify-between items-center">
                                <h2 className="text-2xl font-black dark:text-white flex items-center gap-3">
                                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                                        <Building2 className="w-6 h-6 text-indigo-600" />
                                    </div>
                                    Editar Empresa
                                </h2>
                                <button onClick={() => setEditingCompany(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleUpdate} className="p-8 space-y-6">
                                <div>
                                    <label className="label-text">Nome do Ministério/Empresa</label>
                                    <input
                                        type="text"
                                        className="input-field"
                                        value={editForm.name}
                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="label-text">Plano</label>
                                        <select
                                            className="input-field !pr-10 appearance-none bg-no-repeat"
                                            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundPosition: 'right 1rem center', backgroundSize: '1.2rem' }}
                                            value={editForm.plan}
                                            onChange={(e) => {
                                                const p = plans.find(pl => pl.name === e.target.value);
                                                setEditForm({
                                                    ...editForm,
                                                    plan: e.target.value,
                                                    max_sermons: p ? p.max_sermons : editForm.max_sermons
                                                });
                                            }}
                                        >
                                            {plans.map(p => (
                                                <option key={p.id} value={p.name}>{p.name}</option>
                                            ))}
                                            <option value="Personalizado">Personalizado</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="label-text">Limite Sermões (-1 = ∞)</label>
                                        <input
                                            type="number"
                                            className="input-field"
                                            value={editForm.max_sermons}
                                            onChange={(e) => setEditForm({ ...editForm, max_sermons: parseInt(e.target.value) })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setEditingCompany(null)}
                                        className="flex-1 px-6 py-4 font-bold rounded-2xl border border-slate-200 dark:border-slate-800 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 btn-primary !py-4 flex items-center justify-center gap-2"
                                    >
                                        <Save className="w-5 h-5" /> Salvar Alterações
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
