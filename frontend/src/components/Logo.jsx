import React from 'react';
import logoImg from '../assets/logo.png';

const Logo = ({ className = "h-10", showText = true }) => {
    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <div className="relative h-full flex items-center justify-center">
                <img
                    src={logoImg}
                    alt="VerboCast Logo"
                    className="h-full w-auto object-contain dark:brightness-100 brightness-0 invert-[.1]"
                />
            </div>

            {showText && (
                <div className="flex flex-col leading-none">
                    <span className="text-3xl font-black tracking-tighter text-indigo-900 dark:text-white uppercase" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        Verbo
                    </span>
                    <span className="text-sm font-bold tracking-[0.3em] text-indigo-600 dark:text-indigo-400 uppercase -mt-1 ml-0.5">
                        Cast
                    </span>
                </div>
            )}
        </div>
    );
};

export default Logo;
