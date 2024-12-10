import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

function EditMemberForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        birth_date: '',
        avatar: null
    });

    useEffect(() => {
        fetchMemberData();
    }, [id]);

    const fetchMemberData = async () => {
        try {
            const data = await api.getMember(id);
            setFormData({
                name: data.name,
                email: data.email,
                phone: data.phone || '',
                birth_date: data.birth_date ? data.birth_date.split('T')[0] : '',
                avatar: null
            });
        } catch (error) {
            setError('Error al cargar los datos del miembro');
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (formData[key] !== null) {
                data.append(key, formData[key]);
            }
        });

        try {
            await api.updateMember(id, data);
            navigate(`/member/${id}`);
        } catch (error) {
            setError('Error al actualizar el miembro');
            console.error('Error:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: files ? files[0] : value
        }));
    };

    if (loading) return <div className="loading">Cargando...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <form onSubmit={handleSubmit} className="member-form">
            <h2>Editar Miembro</h2>
            
            <div className="form-group">
                <label>Nombre:</label>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="form-group">
                <label>Email:</label>
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="form-group">
                <label>Teléfono:</label>
                <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                />
            </div>

            <div className="form-group">
                <label>Fecha de Nacimiento:</label>
                <input
                    type="date"
                    name="birth_date"
                    value={formData.birth_date}
                    onChange={handleChange}
                />
            </div>

            <div className="form-group">
                <label>Nueva Foto de Perfil:</label>
                <input
                    type="file"
                    name="avatar"
                    onChange={handleChange}
                    accept="image/*"
                />
            </div>

            <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                    Guardar Cambios
                </button>
                <button 
                    type="button" 
                    onClick={() => navigate(`/member/${id}`)}
                    className="btn btn-secondary"
                >
                    Cancelar
                </button>
            </div>
        </form>
    );
}

export default EditMemberForm;