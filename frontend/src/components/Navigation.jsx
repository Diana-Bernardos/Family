import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home } from 'lucide-react';

const Navigation = () => {
    const location = useLocation();

    return (
        <nav className="main-navigation">
            <div className="nav-logo">
            </div>
            <div className="nav-container">
                <Link to="/" className="nav-brand">
                    <img 
                        src={process.env.PUBLIC_URL + "/static/media/family-logo.481e22f25cac2029f077.png"} 
                        alt="" 
                        className="nav-logo" 
                        style={{ width: '40px', height: '40px' }}
                    />
                    <span className="nav-title">FAMILY</span>
                </Link>
                
                <div className="nav-links">
                    <Link 
                        to="/" 
                        className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
                    >
                        <div className="flex items-center">
                            
                            <span>Calendario</span>
                        </div>
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