// components/Calendar/AddEventModal.jsx
import React, { useState, useEffect } from 'react';
import '../Modal/Modal.css';
import './EventModal.css';


const ACTIVITY_TYPES = {
  medical: {
    label: 'Cita Médica',
    icon: '🏥',
    color: '#FF4B4B'
  },
  exam: {
    label: 'Examen',
    icon: '📚',
    color: '#4B7BFF'
  },
  extracurricular: {
    label: 'Actividad Extraescolar',
    icon: '⚽',
    color: '#4BFF4B'
  },
  other: {
    label: 'Otro',
    icon: '📌',
    color: '#FFB74B'
  }
};

const AddEventModal = ({ isOpen, onClose, onAdd, selectedDate, member }) => {
  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    date: selectedDate ? selectedDate.format('YYYY-MM-DD') : '',
    time: '',
    activity_type: 'other',
    location: '',
    color: ACTIVITY_TYPES.other.color,
    reminder: false,
    notes: '',
    member_id: member?.id || ''
  });

  useEffect(() => {
    if (selectedDate) {
      setEventData(prev => ({
        ...prev,
        date: selectedDate.format('YYYY-MM-DD')
      }));
    }
  }, [selectedDate]);

  const handleActivityTypeChange = (type) => {
    setEventData(prev => ({
      ...prev,
      activity_type: type,
      color: ACTIVITY_TYPES[type].color
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(eventData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">oc
      <div className="modal-content event-modal">
        <div className="modal-header" style={{ background: eventData.color }}>
          <h3>
            {ACTIVITY_TYPES[eventData.activity_type].icon} Nueva Actividad
          </h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="activity-type-selector">
            {Object.entries(ACTIVITY_TYPES).map(([type, info]) => (
              <button
                key={type}
                type="button"
                className={`activity-type-button ${eventData.activity_type === type ? 'selected' : ''}`}
                onClick={() => handleActivityTypeChange(type)}
                style={{ '--color': info.color }}
              >
                <span className="activity-icon">{info.icon}</span>
                <span className="activity-label">{info.label}</span>
              </button>
            ))}
          </div>

          <div className="form-group">
            <label>Título</label>
            <input
              type="text"
              value={eventData.title}
              onChange={e => setEventData({...eventData, title: e.target.value})}
              required
              placeholder="Ej: Revisión Dental"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Fecha</label>
              <input
                type="date"
                value={eventData.date}
                onChange={e => setEventData({...eventData, date: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Hora</label>
              <input
                type="time"
                value={eventData.time}
                onChange={e => setEventData({...eventData, time: e.target.value})}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Ubicación</label>
            <input
              type="text"
              value={eventData.location}
              onChange={e => setEventData({...eventData, location: e.target.value})}
              placeholder="Ej: Centro Médico San Juan"
            />
          </div>

          <div className="form-group">
            <label>Descripción</label>
            <textarea
              value={eventData.description}
              onChange={e => setEventData({...eventData, description: e.target.value})}
              placeholder="Detalles adicionales..."
              rows="3"
            />
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={eventData.reminder}
                onChange={e => setEventData({...eventData, reminder: e.target.checked})}
              />
              Recordatorio
            </label>
          </div>

          <div className="form-group">
            <label>Notas</label>
            <textarea
              value={eventData.notes}
              onChange={e => setEventData({...eventData, notes: e.target.value})}
              placeholder="Notas adicionales..."
              rows="2"
            />
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

export default AddEventModal;