import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { UserPlus, Mail } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Team() {
    const [users, setUsers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'member' });
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const { t } = useLanguage();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/users');
            setUsers(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/users', formData);
            setShowModal(false);
            setFormData({ name: '', email: '', password: '', role: 'member' });
            fetchUsers();
        } catch (err) {
            alert(err.response?.data?.msg || 'Erro ao criar usuário');
        }
    };

    return (
        <Layout>
            <div className="container mx-auto px-6 py-8">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">{t.team.title}</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">{t.team.subtitle}</p>
                    </div>
                    {(currentUser?.role === 'owner' || currentUser?.role === 'admin') && (
                        <button
                            onClick={() => setShowModal(true)}
                            className="btn-primary flex items-center space-x-2"
                        >
                            <UserPlus className="w-4 h-4" />
                            <span>{t.team.addMember}</span>
                        </button>
                    )}
                </header>

                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t.team.name}</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t.team.email}</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t.team.role}</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t.team.joined}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                                {users.map(user => (
                                    <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold mr-3">
                                                    {user.name.charAt(0)}
                                                </div>
                                                <span className="font-medium text-gray-900 dark:text-gray-100">{user.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <Mail className="w-4 h-4 mr-2 text-gray-400 dark:text-gray-500" />
                                                {user.email}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                          ${user.role === 'owner' ? 'bg-blue-800 text-white shadow-sm' :
                                                    user.role === 'admin' ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300' :
                                                        'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300'}`}>
                                                {t.team.roles[user.role] || user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-sm whitespace-nowrap">
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in duration-200 border dark:border-slate-800">
                            <h2 className="text-2xl font-bold mb-6 dark:text-gray-100">{t.team.modalTitle}</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="label-text">{t.team.name}</label>
                                    <input required className="input-field" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                </div>
                                <div>
                                    <label className="label-text">{t.team.email}</label>
                                    <input required type="email" className="input-field" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                                </div>
                                <div>
                                    <label className="label-text">{t.team.provisionalPassword}</label>
                                    <input required type="password" className="input-field" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                                </div>
                                <div>
                                    <label className="label-text">{t.team.role}</label>
                                    <select className="input-field bg-white dark:bg-slate-900" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                                        <option value="member">{t.team.roles.member}</option>
                                        <option value="admin">{t.team.roles.admin}</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="label-text">{t.team.sermonLimit || 'Limite de Sermões (Mensal)'}</label>
                                    <input
                                        type="number"
                                        placeholder="Deixe em branco para usar limite da empresa"
                                        className="input-field"
                                        value={formData.sermon_limit || ''}
                                        onChange={e => setFormData({ ...formData, sermon_limit: e.target.value })}
                                    />
                                    <span className="text-xs text-gray-500 dark:text-gray-400">Use -1 para ilimitado (se o plano permitir).</span>
                                </div>
                                <div className="flex space-x-3 pt-4">
                                    <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn-secondary">{t.team.cancel}</button>
                                    <button type="submit" className="flex-1 btn-primary">{t.team.save}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

            </div>
        </Layout>
    );
}
