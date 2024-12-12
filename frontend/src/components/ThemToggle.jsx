// src/components/ThemeToggle.jsx
import React, { useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

const ThemeToggle = () => {
    const [theme, setTheme] = useLocalStorage('theme', 'light');

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    return (
        <button 
            onClick={toggleTheme}
            className="theme-toggle-btn"
            aria-label={`Cambiar a modo ${theme === 'light' ? 'oscuro' : 'claro'}`}
        >
            {theme === 'light' ? '🌙' : '☀️'}
        </button>
    );
};

export default ThemeToggle;