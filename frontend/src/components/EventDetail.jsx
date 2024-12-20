import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';

const EventDetail = () => {
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { id } = useParams();
    const navigate = useNavigate();
    const [aiSuggestions, setAiSuggestions] = useState([]);
    const [relatedEvents, setRelatedEvents] = useState([]);

    const getEventSuggestions = async () => {
        const suggestions = await SmartAssistantService.getEventRecommendations(event.id);
        setAiSuggestions(suggestions);
    };

    useEffect(() => {
        loadEvent();
    }, [id]);

    const loadEvent = async () => {
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
                {event.image && (
                    <div className="event-image">
                        <img 
                            src={`data:${event.image.type};base64,${event.image.data}`}
                            alt={event.name}
                        />
                    </div>
                )}

                <div className="event-data">
                    <p><strong>Fecha:</strong> {new Date(event.event_date).toLocaleDateString()}</p>
                    <p><strong>Tipo:</strong> {event.event_type}</p>
                    
                    {event.members && event.members.length > 0 && (
                        <div className="event-members">
                            <h3>Participantes</h3>
                            <div className="members-list">
                                {event.members.map(member => (
                                    <Link 
                                        key={member.id} 
                                        to={`/member/${member.id}`}
                                        className="member-item"
                                    >
                                        {member.avatar && (
                                            <img 
                                                src={`data:${member.avatar.type};base64,${member.avatar.data}`}
                                                alt={member.name}
                                                className="member-avatar-small"
                                            />
                                        )}
                                        <span>{member.name}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

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
