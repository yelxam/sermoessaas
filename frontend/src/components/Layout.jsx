import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { Menu, X, BookOpen, MessageCircle } from 'lucide-react';
import Logo from './Logo';

export default function Layout({ children }) {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="flex bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors duration-300">
            {/* MOBILE HEADER */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 z-40">
                <Logo className="h-8" />
                <button
                    onClick={() => setMobileOpen(true)}
                    className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                    <Menu size={24} />
                </button>
            </div>

            {/* OVERLAY (Mobile) */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar FIXED */}
            <div
                className={`
                    fixed top-0 left-0 h-screen z-50 transition-all duration-300
                    ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                    ${collapsed ? 'w-20' : 'w-72'}
                `}
            >
                <div className="relative h-full">
                    <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} onNavigate={() => setMobileOpen(false)} />

                    {/* Close button inside sidebar for mobile */}
                    {mobileOpen && (
                        <button
                            onClick={() => setMobileOpen(false)}
                            className="lg:hidden absolute top-4 right-[-3rem] p-2 bg-indigo-600 text-white rounded-r-xl shadow-lg animate-in fade-in slide-in-from-left-4 duration-300"
                        >
                            <X size={20} />
                        </button>
                    )}
                </div>
            </div>

            {/* Main Content Area - offset by sidebar width on large screens */}
            <main
                className={`
                    flex-1 overflow-x-hidden min-h-screen transition-all duration-300 pt-16 lg:pt-0
                    ${collapsed ? 'lg:ml-20' : 'lg:ml-72'}
                `}
            >
                <div className="container mx-auto h-full">
                    {children}
                </div>
            </main>

            {/* Floating WhatsApp Button */}
            <a
                href="https://wa.me/558491944131"
                target="_blank"
                rel="noopener noreferrer"
                className="fixed bottom-6 right-6 z-40 bg-green-500 hover:bg-green-600 text-white p-3 rounded-full shadow-lg transition-all transform hover:scale-110 flex items-center justify-center group"
                aria-label="Fale com o Suporte"
                title="Suporte via WhatsApp"
            >
                <MessageCircle className="w-6 h-6" />
                <span className="absolute right-full mr-3 bg-white dark:bg-slate-800 text-slate-800 dark:text-white px-3 py-1 rounded-lg text-sm font-bold shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-slate-100 dark:border-slate-700">
                    Suporte
                </span>
            </a>
        </div>
    );
}
