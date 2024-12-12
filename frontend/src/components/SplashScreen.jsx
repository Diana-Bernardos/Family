// src/components/SplashScreen.jsx
import React, { useEffect, useState } from 'react';
import '../styles/splash.css';

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
                <div className="logo-container">
                    <div className="logo">
                        <div className="hearts">
                            <div className="heart heart-1"></div>
                            <div className="heart heart-2"></div>
                            <div className="heart heart-3"></div>
                            <div className="heart heart-4"></div>
                        </div>
                    </div>
                </div>
                <h1 className="app-title">FAMILY</h1>
                <p className="app-subtitle">FAMILY ORGANIZATION APP</p>
                <p className="app-description">for wide of users</p>
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