import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Users, Plus, LogOut, CheckSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navigation = () => {
    const location = useLocation();
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (err) {
            console.error('Error logging out:', err);
        }
    };

    if (!user) return null;

    return (
        <nav className="main-navigation">
            <div className="nav-container">
                {/* logo simple en la barra inferior */}
                <Link to="/" className="nav-brand">
                    <div className="nav-logo-wrapper">
                        <span className="nav-logo-text">👨‍👩‍👧‍👦</span>
                    </div>
                </Link>

                <div className="nav-links">
                    <Link
                        to="/"
                        className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
                    >
                        <Home size={18} />
                        <span>Inicio</span>
                    </Link>
                    <Link
                        to="/members"
                        className={`nav-link ${location.pathname === '/members' ? 'active' : ''}`}
                    >
                        <Users size={18} />
                        <span>Miembros</span>
                    </Link>
                    <Link
                        to="/tasks"
                        className={`nav-link ${location.pathname === '/tasks' ? 'active' : ''}`}
                    >
                        <CheckSquare size={18} />
                        <span>Tareas</span>
                    </Link>
                    <Link
                        to="/new-event"
                        className="btn btn-primary btn-small"
                    >
                        <Plus size={16} />
                        <span className="hide-on-mobile">Evento</span>
                    </Link>
                    <Link
                        to="/new-member"
                        className="btn btn-secondary btn-small"
                    >
                        <Plus size={16} />
                        <span className="hide-on-mobile">Miembro</span>
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="nav-link logout-btn-manual"
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            color: 'inherit',
                            padding: '0.5rem 1rem'
                        }}
                    >
                        <LogOut size={18} />
                        <span>Cerrar Sesión</span>
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navigation;