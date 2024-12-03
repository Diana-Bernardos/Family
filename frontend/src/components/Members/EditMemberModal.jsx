import React, { useState, useEffect } from 'react';
import '../Modal/Modal.css';

const EditMemberModal = ({ isOpen, onClose, onEdit, member }) => {
  const [memberData, setMemberData] = useState({
    name: '',
    photo_url: ''
  });

  useEffect(() => {
    if (member) {
      setMemberData({
        name: member.name,
        photo_url: member.photo_url || ''
      });
    }
  }, [member]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onEdit(memberData);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Editar Miembro</h3>
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
            <button type="submit">Guardar Cambios</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditMemberModal;