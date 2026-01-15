import React from 'react';
import logoImg from '../assets/logo.png';

const Logo = ({ className = "", showText = true }) => {
    return (
        <div className={`flex items-center justify-center ${className}`}>
            <img
                src={logoImg}
                alt="VerboCast Logo"
                className="max-w-full h-auto object-contain"
            />
        </div>
    );
};

export default Logo;
