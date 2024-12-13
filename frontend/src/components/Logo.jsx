
import React from 'react';
import logo from '../assets/images/family-logo.png'; // Ajusta la ruta según tu proyecto


const Logo = () => {
    return (
        <div className="logo-container">
            <img src={logo} alt="Family Logo" className="logo-image" />
        </div>
    );
};

export default Logo;
