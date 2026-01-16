import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { Building2, Save, MapPin, Phone, User, Trash2, PlusCircle, Globe, CreditCard, ChevronRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Organization() {
    const [data, setData] = useState({ company: { name: '' }, churches: [], allCompanies: [] });
    const [availablePlans, setAvailablePlans] = useState([]);
    const [showChurchModal, setShowChurchModal] = useState(false);
    const [showCompModal, setShowCompModal] = useState(false);

    const [churchForm, setChurchForm] = useState({ name: '', address: '', pastor_name: '', phone: '' });
    const [compForm, setCompForm] = useState({ name: '', plan: 'free' });

    const [loading, setLoading] = useState(false);
    const { t } = useLanguage();
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const canEdit = currentUser?.role === 'owner' || currentUser?.role === 'admin';
    const isSuperAdmin = currentUser?.email === 'admin@sermon.ai'; // Simple check

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Parallel requests
            const reqs = [
                api.get('/companies/me'),
                api.get('/companies/churches')
            ];

            if (isSuperAdmin) {
                reqs.push(api.get('/companies'));
                reqs.push(api.get('/plans'));
            }

            const results = await Promise.all(reqs);

            setData(prev => ({
                ...prev,
                company: results[0].data,
                churches: results[1].data,
                allCompanies: isSuperAdmin ? results[2].data : []
            }));

            if (isSuperAdmin) {
                setAvailablePlans(results[3].data);
            } else {
                // For regular owners, fetch public plans to change
                const plansRes = await api.get('/plans/public');
                setAvailablePlans(plansRes.data);
            }

        } catch (err) {
            console.error(err);
        }
    };

    const updateMyCompany = async (e) => {
        e.preventDefault();
        if (!canEdit) return;
        setLoading(true);
        try {
            await api.put('/companies/me', {
                name: data.company.name,
                openai_api_key: data.company.openai_api_key,
                groq_api_key: data.company.groq_api_key
            });
            alert(t.organization.save + ' OK!');
        } catch (err) {
            alert('Erro ao atualizar');
        } finally {
            setLoading(false);
        }
    };

    const changeMyPlan = async (planId) => {
        if (!window.confirm("Deseja realmente alterar seu plano?")) return;
        try {
            setLoading(true);
            await api.put('/companies/me/plan', { planId });
            fetchData();
            alert("Plano atualizado com sucesso!");
        } catch (err) {
            alert(err.response?.data?.msg || "Erro ao alterar plano");
        } finally {
            setLoading(false);
        }
    };

    const toggleCompanyActive = async (companyId, currentStatus) => {
        try {
            await api.put(`/companies/${companyId}`, { active: !currentStatus });
            fetchData();
        } catch (err) {
            alert("Erro ao alterar status");
        }
    };

    const createChurch = async (e) => {
        e.preventDefault();
        try {
            await api.post('/companies/churches', churchForm);
            setShowChurchModal(false);
            setChurchForm({ name: '', address: '', pastor_name: '', phone: '' });
            fetchData();
        } catch (err) {
            alert('Erro ao criar igreja');
        }
    };

    const createCompany = async (e) => {
        e.preventDefault();
        try {
            await api.post('/companies', compForm);
            setShowCompModal(false);
            setCompForm({ name: '', plan: 'free' });
            fetchData();
        } catch (err) {
            alert('Erro ao criar empresa');
        }
    };

    const deleteChurch = async (id) => {
        if (window.confirm(t.organization.deleteConfirm)) {
            try {
                await api.delete(`/companies/churches/${id}`);
                fetchData();
            } catch (err) {
                alert('Erro ao deletar');
            }
        }
    };

    return (
        <Layout>
            <div className="container mx-auto px-6 py-8">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">{t.organization.title}</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">{t.organization.subtitle}</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* LEFT COL: My Company Settings */}
                    <div className="lg:col-span-1 space-y-8">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-6">
                            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center">
                                <Building2 className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                                {t.organization.settings}
                            </h2>
                            <form onSubmit={updateMyCompany} className="space-y-4">
                                <div>
                                    <label className="label-text">{t.organization.companyName}</label>
                                    <input
                                        className="input-field"
                                        value={data.company.name}
                                        onChange={e => setData({ ...data, company: { ...data.company, name: e.target.value } })}
                                        disabled={!canEdit}
                                    />
                                </div>
                                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700 space-y-4 transition-colors">
                                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Chaves de API (AI)</h3>
                                    <div>
                                        <label className="label-text">{t.organization.openaiKey}</label>
                                        <input
                                            type="password"
                                            className="input-field"
                                            placeholder="sk-..."
                                            value={data.company.openai_api_key || ''}
                                            onChange={e => setData({ ...data, company: { ...data.company, openai_api_key: e.target.value } })}
                                            disabled={!canEdit}
                                        />
                                    </div>
                                    <div>
                                        <label className="label-text">{t.organization.groqKey}</label>
                                        <input
                                            type="password"
                                            className="input-field"
                                            placeholder="gsk_..."
                                            value={data.company.groq_api_key || ''}
                                            onChange={e => setData({ ...data, company: { ...data.company, groq_api_key: e.target.value } })}
                                            disabled={!canEdit}
                                        />
                                    </div>
                                    <p className="text-[10px] text-slate-400 dark:text-slate-500">
                                        * Se deixado em branco, o sistema usará a chave padrão.
                                    </p>
                                </div>
                                {canEdit && (
                                    <button type="submit" disabled={loading} className="w-full btn-primary flex justify-center items-center">
                                        <Save className="w-4 h-4 mr-2" />
                                        {t.organization.save}
                                    </button>
                                )}
                            </form>
                        </div>

                        {/* Plan Management */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-indigo-50 dark:border-indigo-900/40 p-6">
                            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center">
                                <CreditCard className="w-5 h-5 mr-2 text-indigo-500" />
                                Plano e Assinatura
                            </h2>
                            <div className="space-y-4">
                                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800/50">
                                    <p className="text-sm text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider mb-1">Plano Atual</p>
                                    <p className="text-2xl font-black text-indigo-900 dark:text-indigo-200 uppercase">{data.company.plan}</p>
                                    <p className="text-xs text-indigo-500 mt-1">Limite: {data.company.max_sermons === -1 ? 'Ilimitado' : `${data.company.max_sermons} sermões/mês`}</p>
                                </div>

                                {currentUser?.role === 'owner' && (
                                    <div className="space-y-3 pt-2">
                                        <label className="label-text">Alterar para:</label>
                                        <div className="grid grid-cols-1 gap-2">
                                            {availablePlans.filter(p => p.name !== data.company.plan).map(p => (
                                                <button
                                                    key={p.id}
                                                    onClick={() => changeMyPlan(p.id)}
                                                    disabled={loading}
                                                    className="flex justify-between items-center p-3 rounded-xl border-2 border-slate-100 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-400 transition-all text-left group"
                                                >
                                                    <div>
                                                        <p className="font-bold text-slate-700 dark:text-slate-200">{p.name}</p>
                                                        <p className="text-[10px] text-slate-500">R$ {p.price}/mês</p>
                                                    </div>
                                                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Super Admin Panel: All Companies */}
                        {isSuperAdmin && (
                            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-orange-100 dark:border-orange-900/40 p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center">
                                        <Globe className="w-5 h-5 mr-2 text-orange-500" />
                                        {t.organization.allCompanies}
                                    </h2>
                                    <button onClick={() => setShowCompModal(true)} className="text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-300 bg-orange-50 dark:bg-orange-900/20 p-2 rounded-lg transition-colors">
                                        <PlusCircle className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                                    {data.allCompanies.map(c => (
                                        <div key={c.id} className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-gray-100 dark:border-slate-800 space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className="font-bold text-gray-700 dark:text-gray-200">{c.name}</span>
                                                <span className="text-[10px] bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded text-gray-600 dark:text-gray-400 uppercase font-black">{c.plan}</span>
                                            </div>
                                            <div className="flex justify-between items-center pt-1 border-t border-slate-200 dark:border-slate-700/50">
                                                <span className={`text-[10px] font-bold uppercase ${c.active ? 'text-green-500' : 'text-red-500'}`}>
                                                    {c.active ? 'Ativa' : 'Desativada'}
                                                </span>
                                                <button
                                                    onClick={() => toggleCompanyActive(c.id, c.active)}
                                                    className={`text-[10px] px-2 py-1 rounded font-bold transition-colors ${c.active ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                                                >
                                                    {c.active ? 'Desativar' : 'Ativar'}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RIGHT COL: Churches List */}
                    <div className="lg:col-span-2">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{t.organization.churches}</h2>
                                {canEdit && (
                                    <button onClick={() => setShowChurchModal(true)} className="flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium text-sm bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 px-3 py-1.5 rounded-lg transition">
                                        <PlusCircle className="w-4 h-4 mr-1.5" />
                                        {t.organization.addChurch}
                                    </button>
                                )}
                            </div>

                            {data.churches.length === 0 ? (
                                <div className="text-center py-10 border border-dashed border-gray-200 dark:border-slate-700 rounded-xl">
                                    <p className="text-gray-400 dark:text-gray-500">{t.organization.noChurches}</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {data.churches.map(church => (
                                        <div key={church.id} className="border border-gray-100 dark:border-slate-800 rounded-xl p-4 hover:shadow-md dark:hover:shadow-indigo-900/10 transition flex justify-between items-start group">
                                            <div>
                                                <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg">{church.name}</h3>
                                                <div className="mt-2 space-y-1">
                                                    {church.address && (
                                                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                                            <MapPin className="w-3.5 h-3.5 mr-2 text-gray-400 dark:text-gray-500" />
                                                            {church.address}
                                                        </div>
                                                    )}
                                                    {church.pastor_name && (
                                                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                                            <User className="w-3.5 h-3.5 mr-2 text-gray-400 dark:text-gray-500" />
                                                            {church.pastor_name}
                                                        </div>
                                                    )}
                                                    {church.phone && (
                                                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                                            <Phone className="w-3.5 h-3.5 mr-2 text-gray-400 dark:text-gray-500" />
                                                            {church.phone}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            {canEdit && (
                                                <button onClick={() => deleteChurch(church.id)} className="text-gray-300 dark:text-gray-600 hover:text-red-500 transition p-2">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Modal Create Church */}
                {showChurchModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in duration-200 border dark:border-slate-800">
                            <h2 className="text-2xl font-bold mb-6 dark:text-gray-100">{t.organization.modalTitle}</h2>
                            <form onSubmit={createChurch} className="space-y-4">
                                <div>
                                    <label className="label-text">{t.organization.churchName}</label>
                                    <input required className="input-field" value={churchForm.name} onChange={e => setChurchForm({ ...churchForm, name: e.target.value })} />
                                </div>
                                <div>
                                    <label className="label-text">{t.organization.address}</label>
                                    <input className="input-field" value={churchForm.address} onChange={e => setChurchForm({ ...churchForm, address: e.target.value })} />
                                </div>
                                <div>
                                    <label className="label-text">{t.organization.pastor}</label>
                                    <input className="input-field" value={churchForm.pastor_name} onChange={e => setChurchForm({ ...churchForm, pastor_name: e.target.value })} />
                                </div>
                                <div>
                                    <label className="label-text">{t.organization.phone}</label>
                                    <input className="input-field" value={churchForm.phone} onChange={e => setChurchForm({ ...churchForm, phone: e.target.value })} />
                                </div>
                                <div className="flex space-x-3 pt-4">
                                    <button type="button" onClick={() => setShowChurchModal(false)} className="flex-1 btn-secondary">{t.team.cancel || 'Cancelar'}</button>
                                    <button type="submit" className="flex-1 btn-primary">{t.team.save || 'Salvar'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modal Create Company */}
                {showCompModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in duration-200 border dark:border-slate-800">
                            <h2 className="text-2xl font-bold mb-6 dark:text-gray-100">Nova Organização</h2>
                            <form onSubmit={createCompany} className="space-y-4">
                                <div>
                                    <label className="label-text">Nome da Organização</label>
                                    <input required className="input-field" value={compForm.name} onChange={e => setCompForm({ ...compForm, name: e.target.value })} />
                                </div>
                                <div>
                                    <label className="label-text">Plano</label>
                                    <select className="input-field bg-white dark:bg-slate-900" value={compForm.plan} onChange={e => setCompForm({ ...compForm, plan: e.target.value })}>
                                        {availablePlans.map(p => (
                                            <option key={p.id} value={p.name}>{p.name} ({p.max_sermons === -1 ? 'Ilimitado' : p.max_sermons})</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex space-x-3 pt-4">
                                    <button type="button" onClick={() => setShowCompModal(false)} className="flex-1 btn-secondary">{t.team.cancel || 'Cancelar'}</button>
                                    <button type="submit" className="flex-1 btn-primary">{t.organization.save || 'Salvar'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

            </div>
        </Layout>
    );
}
