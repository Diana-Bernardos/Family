import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';

const MemberDetail = () => {
    const [member, setMember] = useState(null);
    const [memberEvents, setMemberEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        loadMemberData();
    }, [id]);

    const loadMemberData = async () => {
        try {
            setLoading(true);
            const [memberData, eventsData] = await Promise.all([
                api.getMember(id),
                api.getMemberEvents(id)
            ]);
            setMember(memberData);
            setMemberEvents(eventsData);
        } catch (error) {
            setError('Error al cargar los datos del miembro');
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este miembro?')) {
            try {
                await api.deleteMember(id);
                navigate('/members');
            } catch (error) {
                setError('Error al eliminar el miembro');
            }
        }
    };

    if (loading) return <div className="loading">Cargando...</div>;
    if (error) return <div className="error-message">{error}</div>;
    if (!member) return <div className="error-message">Miembro no encontrado</div>;

    const avatarUrl = member.avatar ? 
        `data:${member.avatar.type};base64,${member.avatar.data}` : 
        '/default-avatar.png';

    return (
        <div className="member-detail">
            <div className="member-header">
                <h2>Perfil del Miembro</h2>
            </div>

            <div className="member-info">
                <div className="member-avatar-container">
                    <img 
                        src={avatarUrl}
                        alt={member.name}
                        className="member-avatar"
                    />
                </div>
                <div className="member-data">
                    <h3>{member.name}</h3>
                    <p><strong>Email:</strong> {member.email}</p>
                    {member.phone && <p><strong>Teléfono:</strong> {member.phone}</p>}
                    {member.birth_date && (
                        <p><strong>Fecha de Nacimiento:</strong> {new Date(member.birth_date).toLocaleDateString()}</p>
                    )}
                </div>

                <div className="member-actions">
                    <button 
                        onClick={() => navigate(`/edit-member/${id}`)} 
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
                        onClick={() => navigate('/members')}
                        className="btn btn-secondary"
                    >
                        Volver
                    </button>
                </div>
            </div>

            <div className="member-events-section">
                <h3>Eventos del Miembro</h3>
                {memberEvents.length === 0 ? (
                    <p className="no-events">No hay eventos asociados a este miembro</p>
                ) : (
                    <div className="events-grid">
                        {memberEvents.map(event => (
                            <div key={event.id} className="event-card-compact">
                                {event.image && (
                                    <div className="event-image">
                                        <img 
                                            src={`data:${event.image.type};base64,${event.image.data}`}
                                            alt={event.name}
                                        />
                                    </div>
                                )}
                                <div className="event-info">
                                    <h4>{event.name}</h4>
                                    <p className="event-date">
                                        {new Date(event.event_date).toLocaleDateString()}
                                    </p>
                                    <p className="event-type">{event.event_type}</p>
                                </div>
                                <Link 
                                    to={`/event/${event.id}`}
                                    className="btn btn-secondary"
                                >
                                    Ver
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MemberDetail;