import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const MemberForm = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        birth_date: '',
        avatar: null
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                if (formData[key] !== null && formData[key] !== '') {
                    data.append(key, formData[key]);
                }
            });

            await api.createMember(data);
            navigate('/members');
        } catch (err) {
            setError(err.message);
            console.error('Error al crear miembro:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: files ? files[0] : value
        }));
    };

    return (
        <form onSubmit={handleSubmit} className="member-form">
            <h2>Nuevo Miembro</h2>
            
            {error && <div className="error-message">{error}</div>}

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
                <label>Avatar:</label>
                <input
                    type="file"
                    name="avatar"
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
                    {loading ? 'Guardando...' : 'Guardar'}
                </button>
                <button 
                    type="button" 
                    onClick={() => navigate('/members')}
                    className="btn btn-secondary"
                    disabled={loading}
                >
                    Cancelar
                </button>
            </div>
        </form>
    );
};

export default MemberForm;