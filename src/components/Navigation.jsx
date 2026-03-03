import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Users, Plus, Menu, X, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navigation = () => {
   const [menuOpen, setMenuOpen] = useState(false);
   const location = useLocation();
   const { user, logout } = useAuth();
   const navigate = useNavigate();

   const closeMenu = () => setMenuOpen(false);

   const handleLogout = async () => {
       try {
           await logout();
           navigate('/login');
           closeMenu();
       } catch (err) {
           console.error('Error logging out:', err);
       }
   };

   if (!user) return null;

   return (
       <nav className="main-navigation">
           <div className="nav-container">
               <Link to="/" className="nav-brand" onClick={closeMenu}>
                   <div className="nav-logo-wrapper">
                       <span className="nav-logo-text">👨‍👩‍👧‍👦</span>
                       <span className="nav-logo-title">Family Calendar</span>
                   </div>
               </Link>

               <button 
                   className="mobile-menu hamburger" 
                   onClick={() => setMenuOpen(!menuOpen)}
                   aria-label="Toggle menu"
               >
                   {menuOpen ? <X size={24} /> : <Menu size={24} />}
               </button>

               <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
                   <Link 
                       to="/" 
                       className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
                       onClick={closeMenu}
                   >
                       <Home size={18} />
                       <span>Inicio</span>
                   </Link>
                   
                   <Link 
                       to="/members" 
                       className={`nav-link ${location.pathname === '/members' ? 'active' : ''}`}
                       onClick={closeMenu}
                   >
                       <Users size={18} />
                       <span>Miembros</span>
                   </Link>

                   <div className="nav-divider"></div>

                   <Link 
                       to="/new-event"
                       className="btn btn-primary btn-small"
                       onClick={closeMenu}
                   >
                       <Plus size={16} />
                       Nuevo Evento
                   </Link>

                   <Link 
                       to="/new-member"
                       className="btn btn-secondary btn-small"
                       onClick={closeMenu}
                   >
                       <Plus size={16} />
                       Agregar Miembro
                   </Link>

                   <button 
                       onClick={handleLogout}
                       className="nav-link logout-btn-manual"
                       style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: 'inherit', padding: '0.5rem 1rem' }}
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