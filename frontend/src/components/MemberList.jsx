// src/components/MemberList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

function MemberList() {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        try {
            const data = await api.getMembers();
            setMembers(data);
        } catch (error) {
            setError('Error al cargar los miembros');
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteMember = async (id) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este miembro?')) {
            try {
                await api.deleteMember(id);
                setMembers(members.filter(member => member.id !== id));
            } catch (error) {
                setError('Error al eliminar el miembro');
                console.error('Error:', error);
            }
        }
    };

    if (loading) return <div className="loading">Cargando...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="member-list">
            <div className="member-list-header">
                <h1>Miembros de la Familia</h1>
                <Link to="/new-member" className="btn btn-primary">
                    Añadir Miembro
                </Link>
            </div>

            {members.length === 0 ? (
                <div className="no-members">
                    <p>No hay miembros registrados</p>
                </div>
            ) : (
                <div className="members-grid">
                    {members.map(member => (
                        <div key={member.id} className="member-card">
                            <img 
                                src={member.avatar_url ? `http://localhost:3001${member.avatar_url}` : '/default-avatar.png'} 
                                alt={member.name}
                                className="member-avatar"
                            />
                            <h3>{member.name}</h3>
                            <p>{member.email}</p>
                            {member.phone && <p>{member.phone}</p>}
                            <div className="member-actions">
                                <Link 
                                    to={`/member/${member.id}`} 
                                    className="btn btn-secondary"
                                >
                                    Ver Detalles
                                </Link>
                                <Link 
                                    to={`/edit-member/${member.id}`} 
                                    className="btn btn-primary"
                                >
                                    Editar
                                </Link>
                                <button 
                                    onClick={() => handleDeleteMember(member.id)}
                                    className="btn btn-danger"
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default MemberList;