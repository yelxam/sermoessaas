import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { BookOpen } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Register() {
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { t } = useLanguage();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/auth/register', formData);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.msg || 'Erro ao registrar');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 dark:from-slate-900 dark:to-slate-950 p-4">
            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in duration-300 border dark:border-slate-800">
                <div className="flex justify-center mb-6">
                    <div className="bg-indigo-100 dark:bg-indigo-900/40 p-3 rounded-full">
                        <BookOpen className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                    </div>
                </div>
                <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-gray-100 mb-2">{t.auth.createAccount}</h2>
                <p className="text-center text-gray-500 dark:text-gray-400 mb-8">{t.auth.startGenerating}</p>

                {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 text-sm" role="alert">
                        <p>{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="label-text">{t.auth.name}</label>
                        <input
                            type="text"
                            required
                            className="input-field"
                            placeholder="João da Silva"
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

                    <button
                        type="submit"
                        className="w-full btn-primary mt-4"
                    >
                        {t.auth.register}
                    </button>
                </form>

                <p className="mt-6 text-center text-gray-600 dark:text-gray-400">
                    {t.auth.haveAccount}{' '}
                    <Link to="/login" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium hover:underline">
                        {t.auth.login}
                    </Link>
                </p>
            </div>
        </div>
    );
}
