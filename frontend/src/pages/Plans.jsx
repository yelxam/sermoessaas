import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { CreditCard, PlusCircle, Edit, Trash2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Plans() {
    const [plans, setPlans] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ id: null, name: '', max_sermons: '', price: '', description: '', allow_ai: true });
    const { t } = useLanguage();

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            const res = await api.get('/plans');
            setPlans(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (form.id) {
                await api.put(`/plans/${form.id}`, form);
            } else {
                await api.post('/plans', form);
            }
            setShowModal(false);
            setForm({ id: null, name: '', max_sermons: '', price: '', description: '', allow_ai: true });
            fetchPlans();
        } catch (err) {
            alert(t.plans?.saveError || 'Erro ao salvar plano');
        }
    };

    const handleEdit = (plan) => {
        setForm({
            ...plan,
            allow_ai: plan.allow_ai !== undefined ? plan.allow_ai : true
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm(t.plans?.confirmDelete || 'Tem certeza?')) {
            try {
                await api.delete(`/plans/${id}`);
                fetchPlans();
            } catch (err) {
                alert(t.plans?.deleteError || 'Erro ao deletar');
            }
        }
    };

    return (
        <Layout>
            <div className="container mx-auto px-6 py-8">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">{t.plans?.title || 'Gerenciar Planos'}</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">{t.plans?.subtitle || 'Configure os planos e limites do sistema.'}</p>
                    </div>
                    <button onClick={() => { setForm({ id: null, name: '', max_sermons: '', price: '', description: '', allow_ai: true }); setShowModal(true); }} className="btn-primary flex items-center space-x-2">
                        <PlusCircle className="w-4 h-4" />
                        <span>{t.plans?.newPlan || 'Novo Plano'}</span>
                    </button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {plans.map(plan => (
                        <div key={plan.id} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-6 relative group overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition flex space-x-2">
                                <button onClick={() => handleEdit(plan)} className="text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 p-2 rounded-lg">
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDelete(plan.id)} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 p-2 rounded-lg">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">{plan.name}</h3>
                            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-4">
                                {Number(plan.price).toLocaleString(undefined, { style: 'currency', currency: 'BRL' })}
                                <span className="text-sm text-gray-400 dark:text-gray-500 font-normal">/mês</span>
                            </div>

                            <div className="space-y-3 mb-6">
                                <div className="flex items-center text-gray-600 dark:text-gray-300 text-sm">
                                    <CreditCard className="w-4 h-4 mr-2 text-blue-400" />
                                    {plan.max_sermons === -1 ? (t.plans?.unlimited || 'Sermões Ilimitados') : `${plan.max_sermons} ${(t.plans?.sermonsMonth || 'sermões/mês')}`}
                                </div>
                                <div className="flex items-center text-sm font-bold">
                                    <div className={`w-2 h-2 rounded-full mr-2 ${plan.allow_ai !== false ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                    <span className={plan.allow_ai !== false ? 'text-green-600' : 'text-red-500'}>
                                        {plan.allow_ai !== false ? 'IA Habilitada' : 'IA Desabilitada'}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{plan.description}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {showModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in duration-200 border dark:border-slate-800">
                            <h2 className="text-2xl font-bold mb-6 dark:text-gray-100">{form.id ? (t.plans?.editPlan || 'Editar Plano') : (t.plans?.newPlan || 'Novo Plano')}</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="label-text">{t.plans?.name || 'Nome do Plano'}</label>
                                    <input required className="input-field" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                                </div>
                                <div>
                                    <label className="label-text">{t.plans?.limit || 'Limite de Sermões (-1 para ilimitado)'}</label>
                                    <input required type="number" className="input-field" value={form.max_sermons} onChange={e => setForm({ ...form, max_sermons: e.target.value })} />
                                </div>
                                <div>
                                    <label className="label-text">{t.plans?.price || 'Preço (R$)'}</label>
                                    <input required type="number" step="0.01" className="input-field" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
                                </div>
                                <div>
                                    <label className="label-text">{t.plans?.description || 'Descrição'}</label>
                                    <input className="input-field" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                                </div>
                                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border dark:border-slate-800 flex items-center justify-between">
                                    <span className="font-bold text-sm dark:text-gray-200">Habilitar Inteligência Artificial</span>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={form.allow_ai}
                                            onChange={(e) => setForm({ ...form, allow_ai: e.target.checked })}
                                        />
                                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>
                                <div className="flex space-x-3 pt-4">
                                    <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn-secondary">{t.team?.cancel || 'Cancelar'}</button>
                                    <button type="submit" className="flex-1 btn-primary">{t.team?.save || 'Salvar'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}
