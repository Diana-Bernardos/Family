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
    <div className="member-detail">
      <header className="member-header">
        <button onClick={() => navigate('/')} className="back-button">
          <i className="fas fa-arrow-left"></i>
        </button>
        <h1>{member.name}</h1>
        <button onClick={() => setIsEditModalOpen(true)} className="edit-button">
          <i className="fas fa-edit"></i>
        </button>
      </header>

      {error && <div className="error-message">{error}</div>}

      <div className="member-content">
        <aside className="member-sidebar">
          <div className="member-photo-container">
            <img 
              src={member.photo_url || '/placeholder.png'} 
              alt={member.name} 
              className="member-photo"
            />
        </div>
        <NotesList
            notes={memberNotes}
            onAddNote={handleAddNote}
            onDeleteNote={handleDeleteNote}
          />
        </aside>
        <main className="member-main">
          <MemberCalendar memberId={id} />
        </main>
      
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