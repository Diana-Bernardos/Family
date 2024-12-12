// src/components/MemberList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

const MemberCard = ({ member, onDelete }) => {
    const avatarUrl = member.avatar ? 
        `data:${member.avatar.type};base64,${member.avatar.data}` : 
        '/default-avatar.png';

    return (
        <div className="member-card">
            <div className="member-avatar-container">
                <img 
                    src={avatarUrl}
                    alt={member.name}
                    className="member-avatar"
                />
            </div>
            <div className="member-info">
                <h3>{member.name}</h3>
                <p className="member-email">{member.email}</p>
                {member.phone && (
                    <p className="member-phone">{member.phone}</p>
                )}
            </div>
            <div className="member-actions">
                <Link 
                    to={`/member/${member.id}`} 
                    className="btn btn-secondary btn-sm"
                >
                    <span className="btn-icon">👁️</span>
                    Ver Detalles
                </Link>
                <div className="button-group">
                    <Link 
                        to={`/edit-member/${member.id}`} 
                        className="btn btn-primary btn-sm"
                    >
                        <span className="btn-icon">✏️</span>
                        Editar
                    </Link>
                    <button 
                        onClick={() => onDelete(member.id)}
                        className="btn btn-danger btn-sm"
                    >
                        <span className="btn-icon">🗑️</span>
                        Eliminar
                    </button>
                </div>
            </div>
        </div>
    );
};

const MemberList = () => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadMembers();
    }, []);

    const loadMembers = async () => {
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
            }
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading">Cargando miembros...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <div className="error-message">{error}</div>
            </div>
        );
    }

    return (
        <div className="member-list">
            <div className="member-list-header">
                <h2>Miembros de la Familia</h2>
                <Link to="/new-member" className="btn btn-primary">
                    <span className="btn-icon">➕</span>
                    Añadir Miembro
                </Link>
            </div>

            {members.length === 0 ? (
                <div className="no-members">
                    <p>No hay miembros registrados</p>
                    <Link to="/new-member" className="btn btn-primary">
                        Añadir el primer miembro
                    </Link>
                </div>
            ) : (
                <div className="members-grid">
                    {members.map(member => (
                        <MemberCard 
                            key={member.id} 
                            member={member}
                            onDelete={handleDeleteMember}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default MemberList;