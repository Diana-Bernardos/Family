import React, { useState } from 'react';
import Logo from '../Logo/Logo';
import './Header.css';

const Header = ({ onAddMember }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="main-header">
      <div className="header-left">
        <button 
          className="menu-button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <i className="fas fa-bars"></i>
        </button>
        <Logo />
      </div>
      
      <div className="header-right">
        <button className="share-button">
          <i className="fas fa-share-alt"></i>
        </button>
      </div>

      {isMenuOpen && (
        <div className="menu-overlay" onClick={() => setIsMenuOpen(false)}>
          <div className="menu-content" onClick={e => e.stopPropagation()}>
            <div className="menu-header">
              <Logo size="small" />
              <button 
                className="close-menu"
                onClick={() => setIsMenuOpen(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <nav className="menu-nav">
              <button onClick={() => {
                onAddMember();
                setIsMenuOpen(false);
              }}>
                <i className="fas fa-user-plus"></i>
                Añadir Miembro
              </button>
              <button>
                <i className="fas fa-share-alt"></i>
                Compartir Calendario
              </button>
              <button>
                <i className="fas fa-cog"></i>
                Configuración
              </button>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;