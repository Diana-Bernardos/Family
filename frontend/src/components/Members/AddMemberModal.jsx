// src/components/Members/AddMemberModal.jsx
import React, { useState } from 'react';
import '../Modal/Modal.css';

const AddMemberModal = ({ isOpen, onClose, onAdd }) => {
  const [memberData, setMemberData] = useState({
    name: '',
    photo_url: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(memberData);
    setMemberData({ name: '', photo_url: '' });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Añadir Nuevo Miembro</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              placeholder="Nombre"
              value={memberData.name}
              onChange={(e) => setMemberData({...memberData, name: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              placeholder="URL de la foto"
              value={memberData.photo_url}
              onChange={(e) => setMemberData({...memberData, photo_url: e.target.value})}
            />
          </div>
          <div className="modal-actions">
            <button type="button" onClick={onClose}>Cancelar</button>
            <button type="submit">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMemberModal;