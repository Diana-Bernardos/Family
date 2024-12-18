import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import PrivateRoute from './components/PrivateRoute';
import Navigation from './components/Navigation';
import Calendar from './components/Calendar';
import EventForm from './components/EventForm';
import EventDetail from './components/EventDetail';
import EditEventForm from './components/EditEventForm';
import MemberList from './components/MemberList';
import MemberForm from './components/MemberForm';
import MemberDetail from './components/MemberDetail';
import EditMemberForm from './components/EditMemberForm';
import ThemeToggle from './components/ThemeToggle';
import SplashScreen from './components/SplashScreen';

// Importación del logo
import logo from './assets/images/family-logo.png';

// Importación de estilos
import './styles/theme.css';
import './styles/components.css';
import './styles/utilities.css';
import './styles/members.css';

function App() {
    const [showSplash, setShowSplash] = useState(true);

    const handleSplashFinish = () => {
        setShowSplash(false);
    };

    return (
        <AuthProvider>
            {showSplash ? (
                <SplashScreen onFinish={handleSplashFinish} />
            ) : (
                <Router>
                    <div className="app-container">
                        <Routes>
                            {/* Rutas públicas */}
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />

                            {/* Rutas protegidas */}
                            <Route path="/*" element={
                                <PrivateRoute>
                                    <div className="authenticated-container">
                                        <Navigation />
                                        <main className="main-content">
                                            <Routes>
                                                <Route path="/" element={<Calendar />} />
                                                <Route path="/new-event" element={<EventForm />} />
                                                <Route path="/event/:id" element={<EventDetail />} />
                                                <Route path="/edit-event/:id" element={<EditEventForm />} />
                                                <Route path="/members" element={<MemberList />} />
                                                <Route path="/new-member" element={<MemberForm />} />
                                                <Route path="/member/:id" element={<MemberDetail />} />
                                                <Route path="/edit-member/:id" element={<EditMemberForm />} />
                                                <Route path="*" element={<Navigate to="/" replace />} />
                                            </Routes>
                                        </main>
                                        <ThemeToggle />
                                    </div>
                                </PrivateRoute>
                            } />
                        </Routes>
                    </div>
                </Router>
            )}
        </AuthProvider>
    );
}

export default App;
