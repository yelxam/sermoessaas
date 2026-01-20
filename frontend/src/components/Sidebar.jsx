import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    BookOpen, Home, List, Plus, Users, Settings, CreditCard, LogOut,
    ChevronLeft, ChevronRight, Globe, Sun, Moon, ShieldAlert, AlertCircle
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import Logo from './Logo';

export default function Sidebar({ collapsed, setCollapsed, onNavigate }) {
    const location = useLocation();
    const navigate = useNavigate();
    const { t, language, setLanguage } = useLanguage();
    const { isDarkMode, toggleTheme } = useTheme();
    const user = JSON.parse(localStorage.getItem('user')) || {};

    const isActive = (path) => location.pathname === path;

    const navItems = [
        { path: '/dashboard', label: t.nav.home, icon: Home },
        { path: '/bible', label: t.nav.bible, icon: BookOpen },
        { path: '/sermons', label: t.nav.mySermons, icon: List },
        { path: '/sermons/new', label: t.nav.newSermon, icon: Plus },
        { path: '/team', label: t.nav.team, icon: Users },
    ];

    if (user.role === 'owner' || user.email === 'admin@sermon.ai') {
        navItems.push({ path: '/organization', label: t.organization?.settings || 'Configs', icon: Settings });
    }

    const superAdmins = ['admin@sermon.ai', 'eliel@verbocast.com.br', 'financeiro@verbocast.com.br'];

    if (superAdmins.includes(user.email)) {
        navItems.push({ path: '/admin', label: t.dashboard.adminTitle.split(' ')[0], icon: ShieldAlert });
        navItems.push({ path: '/admin/requests', label: 'Solicitações', icon: AlertCircle });
        navItems.push({ path: '/plans', label: t.plans.title, icon: CreditCard });
    }

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const languages = [
        { code: 'pt', label: 'Português', flag: 'https://flagcdn.com/w40/br.png' },
        { code: 'es', label: 'Español', flag: 'https://flagcdn.com/w40/es.png' },
        { code: 'en', label: 'English', flag: 'https://flagcdn.com/w40/us.png' },
        { code: 'fr', label: 'Français', flag: 'https://flagcdn.com/w40/fr.png' },
        { code: 'de', label: 'Deutsch', flag: 'https://flagcdn.com/w40/de.png' }
    ];

    const currentFlag = languages.find(l => l.code === language)?.flag;

    return (
        <div
            className={`
                bg-white dark:bg-slate-900 text-slate-800 dark:text-white h-full w-full transition-all duration-300 flex flex-col shadow-2xl border-r border-slate-100 dark:border-transparent
            `}
        >
            {/* Header / Toggle */}
            <div className={`flex items-center p-4 border-b border-slate-100 dark:border-white/10 h-24 transition-all duration-300 ${collapsed ? 'justify-center' : 'justify-between px-6'}`}>
                <Logo className={collapsed ? "w-10" : "w-32"} showText={false} />

                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-1.5 rounded-lg bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-white transition"
                    title={collapsed ? "Expandir" : "Recolher"}
                >
                    {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                </button>
            </div>

            {/* Navigation Links */}
            <div className="flex-1 overflow-y-auto py-6 space-y-2 px-3 custom-scrollbar">
                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`
                            flex items-center px-4 py-3 rounded-xl transition-all duration-200 group relative
                            ${isActive(item.path)
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30'
                                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-blue-600 dark:hover:text-white'
                            }
                        `}
                        onClick={() => onNavigate && onNavigate()}
                        title={collapsed ? item.label : ''}
                    >
                        <item.icon className={`w-5 h-5 flex-shrink-0 ${!collapsed && 'mr-3'}`} />

                        {!collapsed && (
                            <span className="font-medium whitespace-nowrap">{item.label}</span>
                        )}

                        {/* Collapsed Tooltip (optional CSS based) */}
                        {collapsed && (
                            <div className="absolute left-full ml-4 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none z-50">
                                {item.label}
                            </div>
                        )}
                    </Link>
                ))}
            </div>

            {/* Bottom Section: Language & User */}
            <div className="p-4 border-t border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-slate-900/50">

                {/* Language & Theme Selector */}
                {!collapsed ? (
                    <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                            <p className="text-xs text-slate-400 dark:text-slate-500 uppercase font-semibold tracking-wider">Preferências</p>
                            <button
                                onClick={toggleTheme}
                                className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-white transition-colors"
                                title={isDarkMode ? "Modo Claro" : "Modo Escuro"}
                            >
                                {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
                            </button>
                        </div>
                        <div className="grid grid-cols-5 gap-1">
                            {languages.map(lang => (
                                <button
                                    key={lang.code}
                                    onClick={() => setLanguage(lang.code)}
                                    className={`
                                        p-1 rounded transition border border-transparent flex items-center justify-center
                                        ${language === lang.code ? 'border-blue-500 bg-blue-50 dark:bg-white/10' : 'opacity-50 hover:opacity-100'}
                                    `}
                                    title={lang.label}
                                >
                                    <img src={lang.flag} alt={lang.code} className="w-full h-5 rounded-sm object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="mb-4 flex flex-col items-center space-y-4">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-white transition-colors"
                        >
                            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                        </button>
                        <img src={currentFlag} className="w-6 h-4 rounded shadow-sm opacity-80" />
                    </div>
                )}

                {/* User Profile */}
                <div className={`flex items-center ${collapsed ? 'justify-center flex-col space-y-3' : 'justify-between'}`}>

                    {!collapsed && (
                        <div className="flex items-center space-x-3 overflow-hidden">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-sky-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                                {user.name?.[0] || 'U'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-800 dark:text-white truncate">{user.name}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={handleLogout}
                        className={`
                            text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-white/5 p-2 rounded-lg transition
                            ${collapsed ? '' : ''}
                        `}
                        title={t.nav.logout}
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
