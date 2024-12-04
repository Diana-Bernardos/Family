import React, { useState } from 'react';
import '../Modal/Modal.css';

const AddMemberModal = ({ isOpen, onClose, onAdd }) => {
  const [memberData, setMemberData] = useState({
    name: '',
    photo: null
  });
  const [previewUrl, setPreviewUrl] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMemberData({...memberData, photo: file});
      // Crear URL para preview
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', memberData.name);
    if (memberData.photo) {
      formData.append('photo', memberData.photo);
    }
    onAdd(formData);
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
              className="form-input"
            />
          </div>
          <div className="form-group photo-upload">
            <label className="photo-label">
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="photo-preview"/>
              ) : (
                <div className="photo-placeholder">
                  <i className="fas fa-camera"></i>
                  <span>Añadir foto</span>
                </div>
              )}
              <input
                type="file"
                onChange={handleFileChange}
                accept="image/*"
                className="photo-input"
              />
            </label>
          </div>
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMemberModal;