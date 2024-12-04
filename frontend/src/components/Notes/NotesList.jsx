import React, { useState } from 'react';
import './Notes.css';

const NotesList = ({ notes, onAddNote, onDeleteNote }) => {
  const [newNote, setNewNote] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newNote.trim()) {
      onAddNote(newNote);
      setNewNote('');
    }
  };

  return (
    <div className="notes-container">
      <h2>Notas</h2>
      <form onSubmit={handleSubmit} className="notes-form">
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Escribe una nota..."
          rows="3"
        />
        <button type="submit">Añadir Nota</button>
      </form>
      <div className="notes-list">
        {notes.map(note => (
          <div key={note.id} className="note-card">
            <p>{note.content}</p>
            <div className="note-footer">
              <span>{new Date(note.created_at).toLocaleDateString()}</span>
              <button onClick={() => onDeleteNote(note.id)}>Eliminar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotesList;