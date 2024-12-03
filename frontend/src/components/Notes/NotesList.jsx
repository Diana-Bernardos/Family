// src/components/Notes/NotesList.jsx
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
      <form onSubmit={handleSubmit}>
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Escribe una nota..."
        />
        <button type="submit">Añadir</button>
      </form>
      <div className="notes-list">
        {notes.map(note => (
          <div key={note.id} className="note-card">
            <p>{note.content}</p>
            <button onClick={() => onDeleteNote(note.id)}>Eliminar</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotesList;