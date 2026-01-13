import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    BookOpen, Home, List, Plus, Users, Settings, CreditCard, LogOut,
    ChevronLeft, ChevronRight, Globe, Sun, Moon
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

export default function Sidebar({ collapsed, setCollapsed, onNavigate }) {
    const location = useLocation();
    const navigate = useNavigate();
    const { t, language, setLanguage } = useLanguage();
    const { isDarkMode, toggleTheme } = useTheme();
    const user = JSON.parse(localStorage.getItem('user')) || {};

    const isActive = (path) => location.pathname === path;

    const navItems = [
        { path: '/dashboard', label: t.nav.home, icon: Home },
        { path: '/sermons', label: t.nav.mySermons, icon: List },
        { path: '/sermons/new', label: t.nav.newSermon, icon: Plus },
        { path: '/team', label: t.nav.team, icon: Users },
    ];

    if (user.role === 'owner' || user.email === 'admin@sermon.ai') {
        navItems.push({ path: '/organization', label: t.organization?.settings || 'Configs', icon: Settings });
    }

    if (user.email === 'admin@sermon.ai') {
        navItems.push({ path: '/plans', label: 'Planos', icon: CreditCard });
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
                bg-slate-900 text-white h-full w-full transition-all duration-300 flex flex-col shadow-2xl
            `}
        >
            {/* Header / Toggle */}
            <div className={`flex items-center p-4 border-b border-white/10 h-20 transition-all duration-300 ${collapsed ? 'justify-center' : 'justify-between'}`}>
                <div className={`flex items-center space-x-3 transition-opacity duration-200 ${collapsed ? 'hidden' : 'flex'}`}>
                    <div className="bg-indigo-600 p-2 rounded-lg">
                        <BookOpen className="w-6 h-6" />
                    </div>
                    <span className="font-bold text-xl tracking-tight whitespace-nowrap">VerboCast</span>
                </div>

                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition"
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
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50'
                                : 'text-slate-400 hover:bg-white/5 hover:text-white'
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
            <div className="p-4 border-t border-white/10 bg-slate-900/50">

                {/* Language & Theme Selector */}
                {!collapsed ? (
                    <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                            <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider">Preferências</p>
                            <button
                                onClick={toggleTheme}
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
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
                                        p-1 rounded transition border border-transparent
                                        ${language === lang.code ? 'border-indigo-500 bg-white/10' : 'opacity-50 hover:opacity-100'}
                                    `}
                                    title={lang.label}
                                >
                                    <img src={lang.flag} alt={lang.code} className="w-full h-auto rounded-sm object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="mb-4 flex flex-col items-center space-y-4">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                        >
                            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                        </button>
                        <img src={currentFlag} className="w-6 h-4 rounded shadow opacity-80" />
                    </div>
                )}

                {/* User Profile */}
                <div className={`flex items-center ${collapsed ? 'justify-center flex-col space-y-3' : 'justify-between'}`}>

                    {!collapsed && (
                        <div className="flex items-center space-x-3 overflow-hidden">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                                {user.name?.[0] || 'U'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">{user.name}</p>
                                <p className="text-xs text-slate-400 truncate">{user.email}</p>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={handleLogout}
                        className={`
                            text-slate-400 hover:text-red-400 hover:bg-white/5 p-2 rounded-lg transition
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
