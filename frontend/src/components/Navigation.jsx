// src/components/Navigation.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navigation = () => {
    const location = useLocation();

    return (
        <nav className="main-navigation">
            <div className="nav-container">
                <Link to="/" className="nav-logo">
                    <div className="logo-small">
                        <div className="hearts">
                            <div className="heart heart-1"></div>
                            <div className="heart heart-2"></div>
                        </div>
                    </div>
                    <span>FAMILY</span>
                </Link>
                
                <div className="nav-links">
                    <Link 
                        to="/" 
                        className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
                    >
                        Calendario
                    </Link>
                    
                    <Link 
                        to="/members" 
                        className={`nav-link ${location.pathname.includes('/members') ? 'active' : ''}`}
                    >
                        Miembros
                    </Link>

                    <Link 
                        to="/new-event"
                        className="btn btn-primary"
                    >
                        Nuevo Evento
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default Navigation;