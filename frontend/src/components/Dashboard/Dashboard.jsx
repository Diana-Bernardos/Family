// components/Dashboard/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { members } from '../../services/api';
import FamilyCalendar from '../Calendar/FamilyCalendar';
import MembersList from '../Members/MembersList';
import AddMemberModal from '../Members/AddMemberModal';
import './Dashboard.css';

const Dashboard = () => {
  const [membersList, setMembersList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setIsLoading(true);
      const response = await members.getAll();
      setMembersList(response.data);
    } catch (err) {
      setError('Error al cargar los miembros');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMember = async (memberData) => {
    try {
      await members.create(memberData);
      fetchMembers();
      setIsAddModalOpen(false);
    } catch (err) {
      setError('Error al añadir miembro');
    }
  };

  const handleDeleteMember = async (memberId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este miembro?')) {
      try {
        await members.delete(memberId);
        fetchMembers();
      } catch (err) {
        setError('Error al eliminar miembro');
      }
    }
  };

  if (isLoading) return <div className="loading">Cargando...</div>;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Calendario Familiar</h1>
        <button onClick={() => setIsAddModalOpen(true)} className="add-member-btn">
          Añadir Miembro
        </button>
      </header>

      {error && <div className="error-message">{error}</div>}

      <div className="dashboard-content">
        <aside className="members-sidebar">
          <MembersList 
            members={membersList}
            onDeleteMember={handleDeleteMember}
            onSelectMember={(id) => navigate(`/member/${id}`)}
          />
        </aside>

        <main className="calendar-container">
          <FamilyCalendar members={membersList} />
        </main>
      </div>

      <AddMemberModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddMember}
      />
    </div>
  );
};

export default Dashboard;