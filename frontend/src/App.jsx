// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard/Dashboard';
import MemberDetail from './components/Members/MemberDetail';
import './App.css';
import './styles/global.css';

function App() {
  return (
    <Router>
      <div className="app">
        <div className="app-background">
          <div className="bubble bubble-1"></div>
          <div className="bubble bubble-2"></div>
          <div className="bubble bubble-3"></div>
        </div>
        <div className="app-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/member/:id" element={<MemberDetail />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;