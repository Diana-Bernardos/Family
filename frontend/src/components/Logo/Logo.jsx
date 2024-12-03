// src/components/Logo/Logo.jsx
import React from 'react';
import './Logo.css';

const Logo = ({ size = 'medium' }) => {
  return (
    <div className={`logo-container ${size}`}>
      <h1 className="logo-text">
        <span className="crazy">CRAZY</span>
        <span className="mom">MOM</span>
      </h1>
      <div className="subtitle">FAMILY ORGANIZATION</div>
    </div>
  );
};