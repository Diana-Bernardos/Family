import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { EVENT_TYPES, ICONS } from '../utils/constants';

const EventForm = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [members, setMembers] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        event_date: '',
        event_type: '',
        icon: '',
        color: '#000000',
        image: null,
        selectedMembers: []
    });

    useEffect(() => {
        loadMembers();
    }, []);

    const loadMembers = async () => {
        try {
            const data = await api.getMembers();
            setMembers(data);
        } catch (error) {
            setError('Error al cargar los miembros');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                if (key === 'selectedMembers') {
                    data.append('members', JSON.stringify(formData[key]));
                } else if (formData[key] !== null && formData[key] !== '') {
                    data.append(key, formData[key]);
                }
            });

            await api.createEvent(data);
            navigate('/');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, files, type } = e.target;
        if (type === 'select-multiple') {
            const selectedOptions = Array.from(e.target.selectedOptions, option => Number(option.value));
            setFormData(prev => ({
                ...prev,
                selectedMembers: selectedOptions
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: files ? files[0] : value
            }));
        }
    };

    return (
        <form onSubmit={handleSubmit} className="event-form">
            <h2>Nuevo Evento</h2>
            
            {error && <div className="error-message">{error}</div>}

            <div className="form-group">
                <label>Titulo  </label>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="form-group">
                <label>Fecha  </label>
                <input
                    type="date"
                    name="event_date"
                    value={formData.event_date}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="form-group">
                <label>Tipo de Evento  </label>
                <select
                    name="event_type"
                    value={formData.event_type}
                    onChange={handleChange}
                    required
                >
                    <option value="">  Seleccionar</option>
                    {EVENT_TYPES.map(type => (
                        <option key={type.value} value={type.value}>
                            {type.label}
                        </option>
                    ))}
                </select>
            </div>

            <div className="form-group">
                <label> Miembros    </label>
                <select
                    multiple
                    name="selectedMembers"
                    value={formData.selectedMembers}
                    onChange={handleChange}
                    className="member-select"
                >
                    {members.map(member => (
                        <option key={member.id} value={member.id}>
                            {member.name}
                        </option>
                    ))}
                </select>
               
            </div>

            <div className="form-group">
                <label>Icono  </label>
                <select
                    name="icon"
                    value={formData.icon}
                    onChange={handleChange}
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
                <label>Color  </label>
                <input
                    type="color"
                    name="color"
                    value={formData.color}
                    onChange={handleChange}
                />
            </div>

            <div className="form-group">
                <label>Imagen  </label>
                <input
                    type="file"
                    name="image"
                    onChange={handleChange}
                    accept="image/*"
                />
            </div>

            <div className="form-actions">
                <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={loading}
                >
                    {loading ? 'Guardando...' : 'Crear Evento'}
                </button>
                <button 
                    type="button" 
                    onClick={() => navigate('/')}
                    className="btn btn-secondary"
                    disabled={loading}
                >
                    Cancelar
                </button>
            </div>
        </form>
    );
};

export default EventForm;