// src/components/Navigation.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navigation = () => {
    const location = useLocation();

    // Función para determinar si un enlace está activo
    const isActive = (path) => {
        if (path === '/') {
            return location.pathname === '/';
        }
        return location.pathname.startsWith(path);
    };

    return (
        <nav className="main-navigation">
            <div className="nav-container">
                <div className="nav-logo">
                    <Link to="/">
                        Calendario Familiar
                    </Link>
                </div>
                
                <div className="nav-links">
                    <Link 
                        to="/" 
                        className={`nav-link ${isActive('/') ? 'active' : ''}`}
                    >
                        Calendario
                    </Link>
                    
                    <Link 
                        to="/members" 
                        className={`nav-link ${isActive('/members') ? 'active' : ''}`}
                    >
                        Miembros
                    </Link>

                    <div className="nav-actions">
                        <Link 
                            to="/new-event"
                            className="btn btn-primary"
                        >
                            Nuevo Evento
                        </Link>
                        
                        <Link 
                            to="/new-member"
                            className="btn btn-outline-primary"
                        >
                            Añadir Miembro
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navigation;