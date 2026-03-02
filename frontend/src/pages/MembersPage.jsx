import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, Mail, Phone, User } from 'lucide-react';
import { api } from '../services/api';
import '../styles/membersPage.css';

const MembersPage = () => {
    const navigate = useNavigate();
    const [members, setMembers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [showDeleteModal, setShowDeleteModal] = useState(null);

    const loadMembers = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await api.getMembers();
            setMembers(data);
            setError(null);
        } catch (err) {
            setError('Error al cargar los miembros');
            console.error('Error:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadMembers();
    }, [loadMembers]);

    const handleDelete = async (id) => {
        try {
            await api.deleteMember(id);
            setMembers(members.filter(m => m.id !== id));
            setShowDeleteModal(null);
        } catch (err) {
            alert('Error al eliminar el miembro');
            console.error('Error:', err);
        }
    };

    const filteredMembers = members.filter(member => {
        const matchesSearch = 
            member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = filterRole === 'all' || member.role === filterRole;
        return matchesSearch && matchesRole;
    });

    const roles = ['all', ...new Set(members.map(m => m.role).filter(Boolean))];

    if (error) {
        return (
            <div className="error-container bg-red-50 p-6 rounded-lg">
                <div className="text-red-700 font-medium text-lg">¡Oops! Algo salió mal</div>
                <p className="text-red-600 mt-2">{error}</p>
                <button
                    onClick={loadMembers}
                    className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
                >
                    Reintentar
                </button>
            </div>
        );
    }

    return (
        <div className="members-page">
            {/* Header */}
            <div className="members-header">
                <div className="members-header-content">
                    <div className="members-header-info">
                        <h1 className="members-title">👨‍👩‍👧‍👦 Miembros de la Familia</h1>
                        <p className="members-subtitle">
                            {members.length} miembro{members.length !== 1 ? 's' : ''} registrado{members.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <Link to="/new-member" className="btn btn-primary btn-lg">
                        <Plus size={20} />
                        Agregar Miembro
                    </Link>
                </div>

                {/* Search and Filter */}
                <div className="search-filter-section">
                    <input
                        type="text"
                        placeholder="🔍 Buscar por nombre o email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                    <select
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                        className="filter-select"
                    >
                        {roles.map(role => (
                            <option key={role} value={role}>
                                {role === 'all' ? 'Todos los roles' : role}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Members Grid */}
            <div className="members-content">
                {isLoading ? (
                    <div className="loading-spinner">
                        <div className="spinner"></div>
                        <p>Cargando miembros...</p>
                    </div>
                ) : filteredMembers.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">👥</div>
                        <h3>No hay miembros que mostrar</h3>
                        <p>Comienza agregando miembros a tu familia</p>
                        <Link to="/new-member" className="btn btn-primary">
                            <Plus size={18} />
                            Agregar Primer Miembro
                        </Link>
                    </div>
                ) : (
                    <div className="members-grid">
                        {filteredMembers.map(member => (
                            <div key={member.id} className="member-card">
                                <div className="member-card-header">
                                    <div className="member-avatar">
                                        {member.avatar ? (
                                            <img src={`data:${member.avatar.type};base64,${member.avatar.data}`} alt={member.name} />
                                        ) : (
                                            <div className="avatar-placeholder">
                                                <User size={32} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="member-role-badge">{member.role || 'Miembro'}</div>
                                </div>

                                <div className="member-card-content">
                                    <h3 className="member-name">{member.name}</h3>
                                    
                                    {member.email && (
                                        <div className="member-contact">
                                            <Mail size={16} />
                                            <a href={`mailto:${member.email}`}>{member.email}</a>
                                        </div>
                                    )}
                                    
                                    {member.phone && (
                                        <div className="member-contact">
                                            <Phone size={16} />
                                            <a href={`tel:${member.phone}`}>{member.phone}</a>
                                        </div>
                                    )}

                                    {member.birthday && (
                                        <div className="member-birthday">
                                            🎂 {new Date(member.birthday).toLocaleDateString('es-ES', { 
                                                month: 'long', 
                                                day: 'numeric' 
                                            })}
                                        </div>
                                    )}
                                </div>

                                <div className="member-card-actions">
                                    <Link 
                                        to={`/edit-member/${member.id}`} 
                                        className="action-btn edit-btn"
                                        title="Editar"
                                    >
                                        <Edit2 size={18} />
                                    </Link>
                                    <button
                                        onClick={() => setShowDeleteModal(member.id)}
                                        className="action-btn delete-btn"
                                        title="Eliminar"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="modal-overlay" onClick={() => setShowDeleteModal(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>¿Eliminar miembro?</h3>
                        <p>Esta acción no se puede deshacer.</p>
                        <div className="modal-actions">
                            <button 
                                className="btn btn-secondary"
                                onClick={() => setShowDeleteModal(null)}
                            >
                                Cancelar
                            </button>
                            <button 
                                className="btn btn-danger"
                                onClick={() => handleDelete(showDeleteModal)}
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MembersPage;
