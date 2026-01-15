import React from 'react';
import logoImg from '../assets/logo.png';

const Logo = ({ className = "h-10" }) => {
    return (
        <div className={`flex items-center justify-center overflow-hidden ${className}`}>
            <img
                src={logoImg}
                alt="VerboCast Logo"
                className="h-full w-auto object-contain block"
            />
        </div>
    );
};

export default Logo;
