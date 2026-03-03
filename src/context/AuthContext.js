import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);
const STORAGE_KEY = 'family_app_user';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Verificar sesión local
        const savedUser = localStorage.getItem(STORAGE_KEY);
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        // Mock login: cualquier email funciona
        const mockUser = { 
            id: 1, 
            email, 
            username: email.split('@')[0], 
            token: 'mock-token-' + Date.now() 
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mockUser));
        setUser(mockUser);
        return mockUser;
    };

    const register = async (email, password, metadata = {}) => {
        // Mock register
        const mockUser = { 
            id: Date.now(), 
            email, 
            username: metadata.username || email.split('@')[0], 
            token: 'mock-token-' + Date.now() 
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mockUser));
        setUser(mockUser);
        return mockUser;
    };

    const logout = async () => {
        localStorage.removeItem(STORAGE_KEY);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
};