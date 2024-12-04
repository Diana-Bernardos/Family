import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { members } from '../../services/api';
import MembersList from '../Members/MembersList';
import AddMemberModal from '../Members/AddMemberModal';
import FamilyCalendar from '../Calendar/FamilyCalendar';
import './Dashboard.css';

const Dashboard = () => {
  const [membersList, setMembersList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
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
    try {
      await members.delete(memberId);
      fetchMembers();
    } catch (err) {
      setError('Error al eliminar miembro');
    }
  };

  const Logo = () => (
    <div className="logo-container">
      <h1 className="logo-text">
        <span className="logo-crazy">CRAZY</span>
        <span className="logo-mom">MOM</span>
      </h1>
      <span className="logo-subtitle">FAMILY ORGANIZATION</span>
    </div>
  );

  if (isLoading) return <div className="loading">Cargando...</div>;

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <button 
              className="menu-button"
              onClick={() => setShowMenu(true)}
            >
              <i className="fas fa-bars"></i>
            </button>
            <Logo />
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)} 
            className="add-button"
          >
            <i className="fas fa-plus"></i>
            <span>Añadir</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        {error && <div className="error-message">{error}</div>}

        {/* Sección de Miembros */}
        <section className="members-section">
          <MembersList
            members={membersList}
            onDeleteMember={handleDeleteMember}
            onSelectMember={(id) => navigate(`/member/${id}`)}
          />
        </section>

        {/* Calendario */}
        <section className="calendar-section">
          <FamilyCalendar members={membersList} />
        </section>

        {/* Próximos Eventos */}
        <section className="upcoming-events">
          <h2>Próximos Eventos</h2>
          <div className="events-list">
            {/* Aquí irán los eventos */}
          </div>
        </section>
      </main>

      {/* Menú Lateral */}
      {showMenu && (
        <div className="sidebar-overlay">
          <div 
            className="overlay-background"
            onClick={() => setShowMenu(false)}
          ></div>
          <div className="sidebar-menu">
            <div className="sidebar-header">
              <Logo />
              <button 
                className="close-menu"
                onClick={() => setShowMenu(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <nav className="sidebar-nav">
              <button onClick={() => setIsAddModalOpen(true)}>
                <i className="fas fa-user-plus"></i>
                Añadir Miembro
              </button>
              <button>
                <i className="fas fa-share-alt"></i>
                Compartir
              </button>
              <button>
                <i className="fas fa-cog"></i>
                Configuración
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Modal de Añadir Miembro */}
      {isAddModalOpen && (
        <AddMemberModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddMember}
        />
      )}
    </div>
  );
};

export default Dashboard;