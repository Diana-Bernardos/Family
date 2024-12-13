// src/components/SplashScreen.jsx
// src/components/SplashScreen.jsx
import React, { useEffect, useState } from 'react';
import '../styles/splash.css';
import Logo from './Logo';

const SplashScreen = ({ onFinish }) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            onFinish();
        }, 3000);

        return () => clearTimeout(timer);
    }, [onFinish]);

    return isVisible ? (
        <div className="splash-screen">
        
            <div className="splash-content">
                <div className="splash-logo">
                    <img 
                        src="/static/media/family-logo.481e22f25cac2029f077.png"
                        alt="Family App Logo"
                        className="splash-logo-image" 
                    />
                </div>
                <h1>FAMILY</h1>
                <p className="splash-subtitle">FAMILY ORGANIZATION APP</p>
                <p className="splash-description">for wide of users</p>
            </div>
            <div className="splash-background">
                <div className="shape shape-1"></div>
                <div className="shape shape-2"></div>
                <div className="shape shape-3"></div>
            </div>
        </div>
    ) : null;
};

export default SplashScreen;