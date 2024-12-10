// src/components/MemberDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { formatDate } from '../utils/dateUtils';

const MemberDetail = () => {
    const [member, setMember] = useState(null);
    const [memberEvents, setMemberEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [memberData, eventsData] = await Promise.all([
                    api.getMember(id),
                    api.getMemberEvents(id)
                ]);
                setMember(memberData);
                setMemberEvents(eventsData);
            } catch (err) {
                setError('Error al cargar los datos');
                console.error('Error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleDelete = async () => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este miembro?')) {
            try {
                await api.deleteMember(id);
                navigate('/members');
            } catch (err) {
                setError('Error al eliminar el miembro');
            }
        }
    };

    if (loading) return <div className="loading">Cargando...</div>;
    if (error) return <div className="error-message">{error}</div>;
    if (!member) return <div className="error-message">Miembro no encontrado</div>;

    return (
        <div className="member-detail">
            <div className="member-header">
                <h2>Perfil del Miembro</h2>
            </div>

            <div className="member-info">
                <div className="member-avatar-container">
                    <img 
                        src={member.avatar_url ? `http://localhost:3001${member.avatar_url}` : '/default-avatar.png'} 
                        alt={member.name}
                        className="member-avatar-large"
                    />
                </div>

                <div className="member-data">
                    <h3>{member.name}</h3>
                    <p><strong>Email:</strong> {member.email}</p>
                    {member.phone && <p><strong>Teléfono:</strong> {member.phone}</p>}
                    {member.birth_date && (
                        <p><strong>Fecha de Nacimiento:</strong> {formatDate(member.birth_date)}</p>
                    )}
                </div>

                <div className="member-actions">
                    <button onClick={() => navigate(`/edit-member/${id}`)} className="btn btn-primary">
                        Editar
                    </button>
                    <button onClick={handleDelete} className="btn btn-danger">
                        Eliminar
                    </button>
                    <button onClick={() => navigate('/members')} className="btn btn-secondary">
                        Volver
                    </button>
                </div>
            </div>

            <div className="member-events">
                <h3>Eventos del Miembro</h3>
                {memberEvents.length === 0 ? (
                    <p className="no-events">No hay eventos asociados a este miembro</p>
                ) : (
                    <div className="events-list">
                        {memberEvents.map(event => (
                            <div key={event.id} className="event-item">
                                <div className="event-info">
                                    <h4>{event.name}</h4>
                                    <p>{formatDate(event.event_date)}</p>
                                </div>
                                <Link to={`/event/${event.id}`} className="btn btn-secondary">
                                    Ver Evento
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