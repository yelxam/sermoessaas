import React from 'react';
import logoImg from '../assets/logo.png';

const Logo = ({ className = "h-10", showText = true }) => {
    return (
        <div className={`flex items-center justify-center ${className}`}>
            <img
                src={logoImg}
                alt="VerboCast Logo"
                className="h-full w-auto object-contain dark:brightness-100 brightness-0 invert-[.1]"
            />
        </div>
    );
};

export default Logo;
