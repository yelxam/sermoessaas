import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';
import {
    CheckCircle,
    XCircle,
    AlertCircle,
    ArrowRight,
    Building,
    User,
    Calendar,
    DollarSign
} from 'lucide-react';

export default function AdminRequests() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const { t } = useLanguage();

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const res = await api.get('/companies/requests/pending');
            setRequests(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        if (!window.confirm('Tem certeza que deseja aprovar esta alteração? A cobrança deverá ser verificada.')) return;
        try {
            await api.post(`/companies/requests/${id}/approve`);
            setRequests(requests.filter(r => r.id !== id));
            alert('Plano alterado com sucesso!');
        } catch (err) {
            alert('Erro ao aprovar solicitação.');
        }
    };

    const handleReject = async (id) => {
        if (!window.confirm('Tem certeza que deseja rejeitar esta solicitação?')) return;
        try {
            await api.post(`/companies/requests/${id}/reject`);
            setRequests(requests.filter(r => r.id !== id));
        } catch (err) {
            alert('Erro ao rejeitar solicitação.');
        }
    };

    return (
        <Layout>
            <div className="container mx-auto px-6 py-8">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Solicitações de Aprovação</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Gerencie as solicitações de mudança de plano das organizações.</p>
                </header>

                {loading ? (
                    <div className="text-center py-10">Carregando...</div>
                ) : requests.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-gray-300 dark:border-slate-700">
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4 opacity-50" />
                        <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300">Tudo limpo!</h3>
                        <p className="text-gray-500 dark:text-gray-400">Não há solicitações pendentes no momento.</p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {requests.map(req => (
                            <div key={req.id} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-6 flex flex-col md:flex-row items-center justify-between gap-6 transition-all hover:shadow-md">
                                <div className="flex-1 space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 font-bold text-xl">
                                            {req.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                                                {req.name}
                                                <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full font-medium">Pendente</span>
                                            </h3>
                                            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-4 mt-1">
                                                <span className="flex items-center gap-1"><Building className="w-3 h-3" /> ID: {req.id}</span>
                                                <span className="flex items-center gap-1"><User className="w-3 h-3" /> Admin</span>
                                                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(req.updated_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-8 pl-16">
                                        <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 min-w-[200px]">
                                            <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Plano Atual</p>
                                            <p className="font-bold text-gray-700 dark:text-gray-300 text-lg">{req.plan}</p>
                                        </div>
                                        <ArrowRight className="w-6 h-6 text-gray-400" />
                                        <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-200 dark:border-blue-900/30 min-w-[200px]">
                                            <p className="text-xs text-blue-600 dark:text-blue-400 uppercase font-semibold mb-1">Plano Solicitado</p>
                                            <p className="font-bold text-blue-700 dark:text-blue-300 text-lg flex justify-between items-center">
                                                {req.requested_plan_name}
                                                <span className="text-sm font-normal bg-blue-200 dark:bg-blue-800 px-2 py-0.5 rounded text-blue-800 dark:text-blue-200">
                                                    R$ {req.requested_plan_price}
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3 min-w-[150px]">
                                    <button onClick={() => handleApprove(req.id)} className="btn-primary bg-green-600 hover:bg-green-700 border-green-600 text-white flex items-center justify-center gap-2 w-full">
                                        <CheckCircle className="w-4 h-4" /> Aprovar
                                    </button>
                                    <button onClick={() => handleReject(req.id)} className="px-4 py-2 rounded-lg font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all border border-transparent hover:border-red-200 flex items-center justify-center gap-2 w-full">
                                        <XCircle className="w-4 h-4" /> Rejeitar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
}
