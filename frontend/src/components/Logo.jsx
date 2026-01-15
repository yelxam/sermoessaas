import React from 'react';

const Logo = ({ className = "h-10", showText = true }) => {
    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <div className="relative h-full aspect-square flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="h-full w-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Microphone Icon */}
                    <g filter="url(#dropShadow)">
                        {/* Mic Head */}
                        <rect x="30" y="20" width="28" height="42" rx="14" fill="url(#blueGradient)" />

                        {/* Grid lines on mic */}
                        <path d="M30 35H58M30 45H58" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />

                        {/* Mic Bottom part */}
                        <path d="M35 62V65C35 70.5 39.5 75 45 75V75C50.5 75 55 70.5 55 65V62" stroke="#1E3A8A" strokeWidth="4" strokeLinecap="round" />

                        {/* Stand */}
                        <path d="M45 75V85" stroke="#1E3A8A" strokeWidth="5" strokeLinecap="round" />
                        <path d="M38 85H52" stroke="#1E3A8A" strokeWidth="5" strokeLinecap="round" />

                        {/* Waves/Signals */}
                        <path d="M22 38C19 43 19 53 22 58" stroke="#60A5FA" strokeWidth="3" strokeLinecap="round" />
                        <path d="M15 32C10 43 10 63 15 74" stroke="#93C5FD" strokeWidth="3" strokeLinecap="round" />

                        {/* Curving Arrow around the Mic */}
                        <path d="M28 72C15 65 15 35 45 30C75 25 85 45 78 65" stroke="url(#blueGradient)" strokeWidth="4" strokeLinecap="round" fill="none" />

                        {/* Arrow Head */}
                        <path d="M72 15L85 22L75 35" fill="#1D4ED8" />
                        <path d="M85 22C75 35 72 45 75 55" stroke="#1D4ED8" strokeWidth="3" strokeLinecap="round" />
                    </g>

                    <defs>
                        <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#60A5FA" />
                            <stop offset="100%" stopColor="#1E3A8A" />
                        </linearGradient>
                        <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur in="SourceAlpha" stdDeviation="1" />
                            <feOffset dx="1" dy="1" result="offsetblur" />
                            <feComponentTransfer>
                                <feFuncA type="linear" slope="0.2" />
                            </feComponentTransfer>
                            <feMerge>
                                <feMergeNode />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>
                </svg>
            </div>

            {showText && (
                <div className="flex flex-col leading-none">
                    <span className="text-3xl font-black tracking-tighter text-[#1E3A8A] dark:text-white uppercase" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        Verbo
                    </span>
                    <span className="text-sm font-bold tracking-[0.3em] text-[#3B82F6] uppercase -mt-1 ml-0.5">
                        Cast
                    </span>
                </div>
            )}
        </div>
    );
};

export default Logo;
