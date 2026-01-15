import React from 'react';

const Logo = ({ className = "h-10", showText = true }) => {
    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <div className="relative h-full aspect-square flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="h-full w-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Microphone Icon - Based on the new logo */}
                    <g className="text-indigo-600 dark:text-white" fill="currentColor">
                        {/* Mic Head */}
                        <rect x="38" y="25" width="24" height="35" rx="12" />

                        {/* Cradle */}
                        <path d="M33 50V52C33 61.3888 40.6112 69 50 69C59.3888 69 67 61.3888 67 52V50H63V52C63 59.1797 57.1797 65 50 65C42.8203 65 37 59.1797 37 52V50H33Z" />

                        {/* Stand */}
                        <rect x="48" y="69" width="4" height="10" />
                        <rect x="40" y="79" width="20" height="4" rx="2" />

                        {/* Arrow Sweeping Around */}
                        <path
                            d="M25 65C15 50 20 25 50 20C75 15 85 40 80 60"
                            stroke="currentColor"
                            strokeWidth="4"
                            strokeLinecap="round"
                            fill="none"
                        />
                        {/* Arrow Head */}
                        <path d="M75 12L85 20L72 30Z" />
                    </g>
                </svg>
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
