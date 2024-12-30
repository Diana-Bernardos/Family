import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Menu, X } from 'lucide-react';

const Navigation = () => {
   const [menuOpen, setMenuOpen] = useState(false);
   const location = useLocation();

   return (
       <nav className="main-navigation">
           <div className="nav-container">
               <Link to="/" className="nav-brand">
                   <img 
                       src={process.env.PUBLIC_URL + "/static/media/family-logo.481e22f25cac2029f077.png"} 
                       alt="Logo" 
                       className="nav-logo" 
                       style={{ width: '40px', height: '40px' }}
                   />
               </Link>

               <button className="mobile-menu hamburger" onClick={() => setMenuOpen(!menuOpen)}>
                   {menuOpen ? <X size={24} /> : <Menu size={24} />}
               </button>

               <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
                   <Link 
                       to="/" 
                       className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
                       onClick={() => setMenuOpen(false)}
                   >
                       <span>Calendario</span>
                   </Link>
                   
                   <Link 
                       to="/members" 
                       className={`nav-link ${location.pathname.includes('/members') ? 'active' : ''}`}
                       onClick={() => setMenuOpen(false)}
                   >
                       Miembros
                   </Link>

                   <Link 
                       to="/new-event"
                       className="btn btn-primary"
                       onClick={() => setMenuOpen(false)}
                   >
                       Nuevo Evento
                   </Link>
               </div>
           </div>
       </nav>
   );
};

export default Navigation;