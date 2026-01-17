import React from 'react';
import logoImg from '../assets/logo.png';
import { useTheme } from '../contexts/ThemeContext';

const Logo = ({ className = "h-10" }) => {
    const { isDarkMode } = useTheme();

    return (
        <div className={`flex items-center justify-center overflow-hidden ${className}`}>
            <img
                src={logoImg}
                alt="VerboCast Logo"
                className="h-full w-auto object-contain block transition-all duration-300"
                style={{
                    filter: isDarkMode
                        ? 'brightness(100%)'
                        : 'brightness(0)'
                }}
            />
        </div>
    );
};

export default Logo;
