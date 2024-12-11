import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';




const DocumentList = ({ documents, onDelete, onDownload }) => (
    <div className="documents-list">
        {documents.map(doc => (
            <div key={doc.id} className="document-item">
                <div className="document-info">
                    <i className="fas fa-file-pdf"></i>
                    <span>{doc.document_name}</span>
                </div>
                <div className="document-actions">
                    <button 
                        onClick={() => onDownload(doc.id, doc.document_name)}
                        className="btn btn-secondary btn-sm"
                    >
                        Descargar
                    </button>
                    <button 
                        onClick={() => onDelete(doc.id)}
                        className="btn btn-danger btn-sm"
                    >
                        Eliminar
                    </button>
                </div>
            </div>
        ))}
    </div>
);

const MemberDetail = () => {
    const [member, setMember] = useState(null);
    const [memberEvents, setMemberEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { id } = useParams();
    const navigate = useNavigate();
    const [documents, setDocuments] = useState([]);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        loadMemberData();
        loadDocuments();
    }, [id]);

    const loadDocuments = async () => {
        try {
            const data = await api.getMemberDocuments(id);
            setDocuments(data);
        } catch (error) {
            console.error('Error al cargar documentos:', error);
        }
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
      
        if (file.type !== 'application/pdf') {
          alert('Solo se permiten archivos PDF');
          return;
        }
      
        if (file.size > 10 * 1024 * 1024) {
          alert('El archivo no puede ser mayor a 10MB');
          return;
        }
      
        try {
          setUploading(true);
          await api.uploadDocument(member.id, file);
          const updatedDocuments = await api.getMemberDocuments(member.id);
          setDocuments(updatedDocuments);
        } catch (error) {
          setError('Error al subir el documento');
          console.error('Error:', error);
        } finally {
          setUploading(false);
          event.target.value = ''; // Limpiar input
        }
      };
    const handleDownload = async (documentId, fileName) => {
        try {
            const blob = await api.downloadDocument(documentId);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Error al descargar documento:', error);
        }
    };

    const handleDeleteDocument = async (documentId) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este documento?')) {
            try {
                await api.deleteDocument(documentId);
                setDocuments(documents.filter(doc => doc.id !== documentId));
            } catch (error) {
                console.error('Error al eliminar documento:', error);
            }
        }}

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
    }

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
            <div className="member-documents-section">
                <h3>Documentos</h3>
                <div className="document-upload">
                    <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileUpload}
                        disabled={uploading}
                        style={{ display: 'none' }}
                        id="document-upload"
                    />
                    <label htmlFor="document-upload" className="btn btn-primary">
                        {uploading ? 'Subiendo...' : 'Subir Documento'}
                    </label>
                </div>
                
                {documents.length === 0 ? (
                    <p className="no-documents">No hay documentos adjuntos</p>
                ) : (
                    <DocumentList 
                        documents={documents}
                        onDelete={handleDeleteDocument}
                        onDownload={handleDownload}
                    />
                )}
            </div>
        </div>
    );
    

    };

export default MemberDetail;