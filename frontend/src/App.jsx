import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { ChatContextProvider } from './context/chatContext';
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

// Importación de estilos
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

// Componente de página principal que muestra el calendario y un avatar pequeño
const HomePage = () => {
    const [members, setMembers] = useState([]);

    useEffect(() => {
        // cargar miembros para mostrar sus avatares
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
            <div className="home-header">
                {members.map(m => {
                    const avatarUrl = m.avatar ? `data:${m.avatar.type};base64,${m.avatar.data}` : '/default-avatar.png';
                    return (
                        <Link key={m.id} to={`/member/${m.id}`}>
                            <img src={avatarUrl} alt={m.name} className="home-avatar" />
                        </Link>
                    );
                })}
            </div>
            <div className="home-page-layout">
                <Calendar />
            </div>
        </div>
    );
};

function App() {
    const [showSplash, setShowSplash] = useState(true);

    const handleSplashFinish = () => {
        setShowSplash(false);
    };

    return (
        <ErrorBoundary>  
            <ChatContextProvider>
                <Router>
                    {showSplash ? (
                        <SplashScreen onFinish={handleSplashFinish} />
                    ) : (
                        <div className="app-container">
                            <Navigation />
                            <main className="main-content">
                                <Routes>
                                    {/* Página principal con calendario y miembros */}
                                    <Route path="/" element={<HomePage />} />
                                    
                                    {/* Rutas de eventos */}
                                    <Route path="/new-event" element={<EventForm />} />
                                    <Route path="/event/:id" element={<EventDetail />} />
                                    <Route path="/edit-event/:id" element={<EditEventForm />} />
                                    
                                    {/* Rutas de miembros */}
                                    <Route path="/members" element={<MembersPage />} />
                                    <Route path="/new-member" element={<MemberForm />} />
                                    <Route path="/member/:id" element={<MemberDetail />} />
                                    <Route path="/edit-member/:id" element={<EditMemberForm />} />
                                    
                                    {/* Redirección de rutas no encontradas */}
                                    <Route path="*" element={<Navigate to="/" replace />} />
                                </Routes>
                            </main>
                            <ThemeToggle />
                        </div>
                    )}
                    <FloatingChat />
                </Router>
            </ChatContextProvider>
        </ErrorBoundary>
    );
}

export default App;


