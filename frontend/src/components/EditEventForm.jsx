// src/components/EditEventForm.jsx


import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { EVENT_TYPES, ICONS } from '../utils/constants';

const EditEventForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        event_date: '',
        event_type: '',
        icon: '',
        color: '#000000',
        image: null,
        selectedMembers: []
    });
    const [members, setMembers] = useState([]);
    const [selectedMembers, setSelectedMembers] = useState([]);

    useEffect(() => {
        fetchEventData();
        fetchMembers();
    }, [id]);

    const fetchEventData = async () => {
        try {
            const data = await api.getEvent(id);
            setFormData({
                name: data.name,
                event_date: data.event_date.split('T')[0],
                event_type: data.event_type,
                icon: data.icon,
                color: data.color || '#000000',
                image: null
            });
            setSelectedMembers(data.members || []);
        } catch (error) {
            setError('Error al cargar el evento');
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMembers = async () => {
        try {
            const data = await api.getMembers();
            setMembers(data);
        } catch (error) {
            console.error('Error al cargar miembros:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (key === 'selectedMembers') {
                data.append('members', JSON.stringify(selectedMembers));
            } else if (formData[key] !== null) {
                data.append(key, formData[key]);
            }
        });

        try {
            await api.updateEvent(id, data);
            navigate(`/event/${id}`);
        } catch (error) {
            setError('Error al actualizar el evento');
            console.error('Error:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value, files, type } = e.target;
        if (type === 'select-multiple') {
            const selected = Array.from(e.target.selectedOptions, option => Number(option.value));
            setSelectedMembers(selected);
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: files ? files[0] : value
            }));
        }
    };

    if (loading) return <div className="loading">Cargando...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <form onSubmit={handleSubmit} className="event-form">
            <h2>Editar Evento</h2>
            
            <div className="form-group">
                <label>Nombre del Evento:</label>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    
                />
            </div>

            <div className="form-group">
                <label>Fecha:</label>
                <input
                    type="date"
                    name="event_date"
                    value={formData.event_date}
                    onChange={handleChange}
                    
                />
            </div>

            <div className="form-group">
                <label>Tipo de Evento:</label>
                <select
                    name="event_type"
                    value={formData.event_type}
                    onChange={handleChange}
                    
                >
                    <option value="">Seleccionar tipo</option>
                    {EVENT_TYPES.map(type => (
                        <option key={type.value} value={type.value}>
                            {type.label}
                        </option>
                    ))}
                </select>
            </div>

            <div className="form-group">
                <label>Icono:</label>
                <select
                    name="icon"
                    value={formData.icon}
                    onChange={handleChange}
                    required
                >
                    <option value="">Seleccionar ícono</option>
                    {ICONS.map(icon => (
                        <option key={icon.value} value={icon.value}>
                            {icon.label}
                        </option>
                    ))}
                </select>
            </div>

            <div className="form-group">
                <label>Color:</label>
                <input
                    type="color"
                    name="color"
                    value={formData.color}
                    onChange={handleChange}
                />
            </div>

            <div className="form-group">
                <label>Nueva Imagen:</label>
                <input
                    type="file"
                    name="image"
                    onChange={handleChange}
                    accept="image/*"
                />
            </div>

            <div className="form-group">
                <label>Miembros:</label>
                <select
                    multiple
                    name="selectedMembers"
                    value={selectedMembers}
                    onChange={handleChange}
                    className="member-select"
                >
                    {members.map(member => (
                        <option key={member.id} value={member.id}>
                            {member.name}
                        </option>
                    ))}
                </select>
                <small>Mantén presionado Ctrl (Cmd en Mac) para seleccionar múltiples miembros</small>
            </div>

            <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                    Guardar Cambios
                </button>
                <button 
                    type="button" 
                    onClick={() => navigate(`/event/${id}`)}
                    className="btn btn-secondary"
                >
                    Cancelar
                </button>
            </div>
        </form>
    );
};

export default EditEventForm;