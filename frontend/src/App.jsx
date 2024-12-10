// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Calendar from './components/Calendar';
import EventForm from './components/EventForm';
import EventDetail from './components/EventDetail';
import EditEventForm from './components/EditEventForm';
import MemberList from './components/MemberList';
import MemberForm from './components/MemberForm';
import MemberDetail from './components/MemberDetail';
import EditMemberForm from './components/EditMemberForm';
import './styles/index.css';
import './styles/members.css';

const App = () => {
    return (
        <Router>
            <div className="App">
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
                    </Routes>
                </main>
            </div>
        </Router>
    );
};

export default App;