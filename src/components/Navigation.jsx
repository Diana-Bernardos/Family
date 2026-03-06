import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Users, CheckSquare, CalendarPlus, LogOut } from 'lucide-react';
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

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="main-navigation">
            <div className="nav-container">

                {/* Inicio */}
                <Link to="/" className={`nav-item ${isActive('/') ? 'active' : ''}`}>
                    <span className="nav-icon">
                        <Home size={22} strokeWidth={isActive('/') ? 2.5 : 1.8} />
                    </span>
                    <span className="nav-label">Inicio</span>
                </Link>

                {/* Miembros */}
                <Link to="/members" className={`nav-item ${isActive('/members') ? 'active' : ''}`}>
                    <span className="nav-icon">
                        <Users size={22} strokeWidth={isActive('/members') ? 2.5 : 1.8} />
                    </span>
                    <span className="nav-label">Familia</span>
                </Link>

                {/* Nuevo Evento - FAB central */}
                <Link to="/new-event" className="nav-item-fab">
                    <span className="nav-icon-fab">
                        <CalendarPlus size={20} color="white" />
                    </span>
                    <span className="nav-label-fab">Evento</span>
                </Link>

                {/* Tareas */}
                <Link to="/tasks" className={`nav-item ${isActive('/tasks') ? 'active' : ''}`}>
                    <span className="nav-icon">
                        <CheckSquare size={22} strokeWidth={isActive('/tasks') ? 2.5 : 1.8} />
                    </span>
                    <span className="nav-label">Tareas</span>
                </Link>

                {/* Cerrar sesión */}
                <button onClick={handleLogout} className="nav-item">
                    <span className="nav-icon">
                        <LogOut size={22} strokeWidth={1.8} />
                    </span>
                    <span className="nav-label">Salir</span>
                </button>
            </div>
        </nav>
    );
};

export default Navigation;