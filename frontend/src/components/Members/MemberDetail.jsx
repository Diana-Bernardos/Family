// components/Members/MemberDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { members, notes, events } from '../../services/api';
import MemberCalendar from '../Calendar/MemberCalendar';
import NotesList from '../Notes/NotesList';
import EditMemberModal from './EditMemberModal';
import './MemberDetail.css';

const MemberDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [memberNotes, setMemberNotes] = useState([]);

  useEffect(() => {
    fetchMemberData();
  }, [id]);

  const fetchMemberData = async () => {
    try {
      setIsLoading(true);
      const [memberResponse, notesResponse] = await Promise.all([
        members.getById(id),
        notes.getByMember(id)
      ]);
      setMember(memberResponse.data);
      setMemberNotes(notesResponse.data);
    } catch (err) {
      setError('Error al cargar los datos del miembro');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditMember = async (memberData) => {
    try {
      await members.update(id, memberData);
      fetchMemberData();
      setIsEditModalOpen(false);
    } catch (err) {
      setError('Error al actualizar miembro');
    }
  };

  const handleAddNote = async (noteContent) => {
    try {
      await notes.create({
        member_id: id,
        content: noteContent
      });
      fetchMemberData();
    } catch (err) {
      setError('Error al añadir nota');
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      await notes.delete(noteId);
      fetchMemberData();
    } catch (err) {
      setError('Error al eliminar nota');
    }
  };

  if (isLoading) return <div className="loading">Cargando...</div>;
  if (!member) return <div className="error">Miembro no encontrado</div>;

  return (
    <div className="member-detail-container">
      <header className="member-detail-header">
        <button onClick={() => navigate('/')} className="back-button">
          Volver
        </button>
        <h2>{member.name}</h2>
        <button onClick={() => setIsEditModalOpen(true)} className="edit-button">
          Editar
        </button>
      </header>

      {error && <div className="error-message">{error}</div>}

      <div className="member-detail-content">
        <div className="member-info-section">
          <img 
            src={member.photo_url || '/placeholder.png'} 
            alt={member.name} 
            className="member-photo"
          />
        </div>

        <div className="member-calendar-section">
          <h3>Calendario Personal</h3>
          <MemberCalendar memberId={id} />
        </div>

        <div className="member-notes-section">
          <h3>Notas</h3>
          <NotesList
            notes={memberNotes}
            onAddNote={handleAddNote}
            onDeleteNote={handleDeleteNote}
          />
        </div>
      </div>

      <EditMemberModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onEdit={handleEditMember}
        member={member}
      />
    </div>
  );
};

export default MemberDetail;