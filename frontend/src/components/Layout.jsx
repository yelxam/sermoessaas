import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { Menu, X, BookOpen } from 'lucide-react';

export default function Layout({ children }) {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="flex bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors duration-300">
            {/* MOBILE HEADER */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 z-40">
                <div className="flex items-center space-x-2">
                    <div className="bg-indigo-600 p-1.5 rounded-lg text-white">
                        <BookOpen size={20} />
                    </div>
                    <span className="font-bold text-lg dark:text-white">VerboCast</span>
                </div>
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
        </div>
    );
}
