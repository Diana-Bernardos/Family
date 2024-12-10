

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { formatDate } from '../utils/dateUtils';

const EventDetail = () => {
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        fetchEventDetails();
    }, [id]);

    const fetchEventDetails = async () => {
        try {
            const data = await api.getEvent(id);
            setEvent(data);
        } catch (error) {
            setError('Error al cargar el evento');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este evento?')) {
            try {
                await api.deleteEvent(id);
                navigate('/');
            } catch (error) {
                setError('Error al eliminar el evento');
            }
        }
    };

    if (loading) return <div className="loading">Cargando...</div>;
    if (error) return <div className="error-message">{error}</div>;
    if (!event) return <div className="error-message">Evento no encontrado</div>;

    return (
        <div className="event-detail">
            <h2>{event.name}</h2>
            <div className="event-info">
                <p><strong>Fecha:</strong> {formatDate(event.event_date)}</p>
                <p><strong>Tipo:</strong> {event.event_type}</p>
                {event.image_url && (
                    <img 
                        src={`http://localhost:3001${event.image_url}`} 
                        alt="Imagen del evento" 
                        className="event-image"
                    />
                )}
                {event.members && event.members.length > 0 && (
                    <div className="event-members">
                        <h3>Miembros Participantes</h3>
                        <div className="member-list">
                            {event.members.map(member => (
                                <Link 
                                    key={member.id} 
                                    to={`/member/${member.id}`}
                                    className="member-item"
                                >
                                    <img 
                                        src={member.avatar_url ? `http://localhost:3001${member.avatar_url}` : '/default-avatar.png'} 
                                        alt={member.name} 
                                        className="member-avatar-small"
                                    />
                                    <span>{member.name}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
                <div className="event-actions">
                    <button 
                        onClick={() => navigate(`/edit-event/${id}`)}
                        className="btn btn-primary"
                    >
                        Editar
                    </button>
                    <button 
                        onClick={handleDelete}
                        className="btn btn-danger"
                    >
                        Eliminar
                    </button>
                    <button 
                        onClick={() => navigate('/')}
                        className="btn btn-secondary"
                    >
                        Volver
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EventDetail;
