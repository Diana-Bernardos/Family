import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { ChatContextProvider } from './context/chatContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';

import Navigation from './components/Navigation';
import Calendar from './components/Calendar';
import { api } from './services/api';
import EventForm from './components/EventForm';
import EventDetail from './components/EventDetail';
import EditEventForm from './components/EditEventForm';
import MemberForm from './components/MemberForm';
import MemberDetail from './components/MemberDetail';
import EditMemberForm from './components/EditMemberForm';
import ThemeToggle from './components/ThemeToggle';
import SplashScreen from './components/SplashScreen';
import FloatingChat from './components/FloatingChat';
import MembersPage from './pages/MembersPage';
import TaskManager from './components/TaskManager';
import Login from './components/Login';
import Register from './components/Register';

// Estilos
import './styles/theme.css';
import './styles/components.css';
import './styles/utilities.css';
import './styles/members.css';
import './styles/messages.css';
import './styles/animations.css';
import './styles/index.css';
import './styles/documents.css';
import './styles/FloatingChat.css';
import './styles/navigation.css';
import './styles/membersPage.css';
import './styles/TaskManager.css';

// Ruta protegida
const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return (
        <div className="loading-spinner" style={{ height: '100%', justifyContent: 'center' }}>
            <div className="spinner" />
            <p>Cargando...</p>
        </div>
    );
    return user ? children : <Navigate to="/login" />;
};

// Página principal: avatares + calendario
const HomePage = () => {
    const [members, setMembers] = useState([]);

    useEffect(() => {
        const loadMembers = async () => {
            try {
                const data = await api.getMembers();
                setMembers(data || []);
            } catch (err) {
                console.error('Error cargando miembros:', err);
            }
        };
        loadMembers();
    }, []);

    return (
        <div className="home-page-container">
            {/* Tira de avatares */}
            <div className="home-header">
                <span className="home-header-title">👨‍👩‍👧‍👦 Familia</span>
                {members.map(m => {
                    const avatarUrl = m.avatar
                        ? `data:${m.avatar.type};base64,${m.avatar.data}`
                        : '/default-avatar.png';
                    return (
                        <Link key={m.id} to={`/member/${m.id}`}>
                            <img src={avatarUrl} alt={m.name} className="home-avatar" title={m.name} />
                        </Link>
                    );
                })}
            </div>

            {/* Calendario ocupa el espacio restante */}
            <div className="home-page-layout">
                <Calendar />
            </div>
        </div>
    );
};

function App() {
    const [showSplash, setShowSplash] = useState(true);

    return (
        <ErrorBoundary>
            <AuthProvider>
                <ChatContextProvider>
                    <Router>
                        {showSplash ? (
                            <SplashScreen onFinish={() => setShowSplash(false)} />
                        ) : (
                            <div className="app-container">
                                <main className="main-content">
                                    <Routes>
                                        {/* Rutas públicas */}
                                        <Route path="/login" element={<Login />} />
                                        <Route path="/register" element={<Register />} />

                                        {/* Rutas protegidas */}
                                        <Route path="/" element={<PrivateRoute><HomePage /></PrivateRoute>} />

                                        {/* Eventos */}
                                        <Route path="/new-event" element={<PrivateRoute><EventForm /></PrivateRoute>} />
                                        <Route path="/event/:id" element={<PrivateRoute><EventDetail /></PrivateRoute>} />
                                        <Route path="/edit-event/:id" element={<PrivateRoute><EditEventForm /></PrivateRoute>} />

                                        {/* Miembros */}
                                        <Route path="/members" element={<PrivateRoute><MembersPage /></PrivateRoute>} />
                                        <Route path="/new-member" element={<PrivateRoute><MemberForm /></PrivateRoute>} />
                                        <Route path="/member/:id" element={<PrivateRoute><MemberDetail /></PrivateRoute>} />
                                        <Route path="/edit-member/:id" element={<PrivateRoute><EditMemberForm /></PrivateRoute>} />

                                        {/* Tareas */}
                                        <Route path="/tasks" element={<PrivateRoute><TaskManager /></PrivateRoute>} />

                                        {/* Fallback */}
                                        <Route path="*" element={<Navigate to="/" replace />} />
                                    </Routes>
                                </main>
                                <Navigation />
                                <ThemeToggle />
                                <FloatingChat />
                            </div>
                        )}
                    </Router>
                </ChatContextProvider>
            </AuthProvider>
        </ErrorBoundary>
    );
}

export default App;
