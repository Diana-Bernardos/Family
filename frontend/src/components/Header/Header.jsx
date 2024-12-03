// src/components/Header/Header.jsx
import React from 'react';
import Logo from '../Logo/Logo';
import './Header.css';

const Header = () => {
  return (
    <header className="main-header">
      <Logo size="small" />
      <div className="header-actions">
        <button className="add-button">
          <span>+</span> Añadir Miembro
        </button>
      </div>
    </header>
  );
};