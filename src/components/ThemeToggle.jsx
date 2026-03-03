// src/components/ThemeToggle.jsx
import React, { useState, useEffect } from 'react';

const ThemeToggle = () => {
    const [theme, setTheme] = useState(() => {
        // Obtener el tema guardado en localStorage o usar 'light' por defecto
        return localStorage.getItem('theme') || 'light';
    });

    useEffect(() => {
        // Aplicar el tema al elemento raíz
        document.documentElement.setAttribute('data-theme', theme);
        // Guardar el tema en localStorage
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    return (
        <button 
            onClick={toggleTheme}
            className="theme-toggle-btn"
            aria-label={`Cambiar a modo ${theme === 'light' ? 'oscuro' : 'claro'}`}
        >
              {theme === 'light' ?   '🌙' : '☀️'}
        </button>
    );
};

export default ThemeToggle;