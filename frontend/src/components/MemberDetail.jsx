import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import { api } from '../services/api';
import DocumentPreview from './DocumentPreview';


const MemberDetail = () => {
    const [member, setMember] = useState(null);
    const [memberEvents, setMemberEvents] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        loadAllData();
    }, [id]);

    const loadAllData = async () => {
        try {
            setLoading(true);
            const memberData = await api.getMember(id);
            const eventsData = await api.getMemberEvents(id);
            let documentsData = [];
            try {
                documentsData = await api.getMemberDocuments(id);
            } catch (docErr) {
                console.warn('No se pudieron cargar los documentos del miembro:', docErr);
                // show minimal error; keep page functioning
                setError('Algunos datos no se pudieron recuperar (documentos)');
            }
            setMember(memberData);
            setMemberEvents(eventsData);
            setDocuments(documentsData);
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

    const handleFileUpload = async (event) => {
        try {
            const file = event.target.files[0];
            if (!file) {
                setError('Por favor selecciona un archivo');
                return;
            }
    
            console.log('Archivo seleccionado:', file);
    
            const allowedTypes = [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'image/jpeg',
                'image/png',
                'image/gif'
            ];
    
            if (!allowedTypes.includes(file.type)) {
                setError('Tipo de archivo no permitido');
                return;
            }
    
            if (file.size > 15 * 1024 * 1024) {
                setError('El archivo no puede ser mayor a 15MB');
                return;
            }
    
            setUploading(true);
            setError(null);
    
            try {
                await api.uploadDocument(id, file);
                await loadAllData();
                event.target.value = '';
                setError(null);
            } catch (error) {
                console.error('Error al subir documento:', error);
                setError(error.message || 'Error al subir el documento');
            } finally {
                setUploading(false);
            }
        } catch (error) {
            console.error('Error en handleFileUpload:', error);
            setError('Error inesperado al procesar el archivo');
            setUploading(false);
        }
    };

    const handleDownload = async (documentId, fileName) => {
        try {
            setError(null);
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
            setError('Error al descargar el documento');
            console.error('Error:', error);
        }
    };

    const handleDeleteDocument = async (documentId) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este documento?')) {
            try {
                setError(null);
                await api.deleteDocument(documentId);
                setDocuments(documents.filter(doc => doc.id !== documentId));
            } catch (error) {
                setError('Error al eliminar el documento');
                console.error('Error:', error);
            }
        }
    };

    if (loading) return <div className="loading">Cargando...</div>;
    if (error) return <div className="error-message">{error}</div>;
    if (!member) return <div className="error-message">Miembro no encontrado</div>;

    const avatarUrl = member.avatar ? 
        `data:${member.avatar.type};base64,${member.avatar.data}` : 
        '/default-avatar.png';

    // formatear eventos del miembro para el calendario
    const formattedMemberEvents = memberEvents.map(ev => ({
        id: ev.id,
        title: ev.name,
        date: ev.event_date.split('T')[0],
        backgroundColor: ev.color || '#3788d8',
        borderColor: ev.color || '#3788d8',
        textColor: getContrastColor(ev.color || '#3788d8')
    }));

    function getContrastColor(hexcolor) {
        const r = parseInt(hexcolor.slice(1, 3), 16);
        const g = parseInt(hexcolor.slice(3, 5), 16);
        const b = parseInt(hexcolor.slice(5, 7), 16);
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return luminance > 0.5 ? '#000000' : '#FFFFFF';
    }


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
                        ✏️ Editar
                    </button>
                    <button 
                        onClick={handleDelete}
                        className="btn btn-danger"
                    >
                        🗑️ Eliminar
                    </button>
                    <button 
                        onClick={() => navigate('/members')}
                        className="btn btn-secondary"
                        title="Volver"
                    >
                        <Home size={20} />
                    </button>
                </div>
            </div>

            <div className="member-calendar-section">
                <h3>Calendario de {member.name}</h3>
                <Link to={`/new-event?memberId=${id}`} className="btn btn-primary btn-sm">
                    ➕ Agregar evento personal
                </Link>
                <div className="calendar-view" style={{ marginTop: '1rem' }}>
                    <FullCalendar
                        plugins={[dayGridPlugin]}
                        initialView="dayGridMonth"
                        events={formattedMemberEvents}
                        locale="es"
                        headerToolbar={{
                            left: 'prev,next today',
                            center: 'title',
                            right: 'dayGridMonth'
                        }}
                        eventClick={(info) => navigate(`/event/${info.event.id}`)}
                        eventContent={(eventInfo) => (
                            <div className="flex items-center p-1 overflow-hidden">
                                <span className="event-title truncate">{eventInfo.event.title}</span>
                            </div>
                        )}
                        dayMaxEvents={true}
                        height="auto"
                    />
                </div>
            </div>

            <div className="member-documents-section">
                <h3>Documentos</h3>
                <div className="document-upload">
                    <input
                        type="file"
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
                        onChange={handleFileUpload}
                        disabled={uploading}
                        style={{ display: 'none' }}
                        id="document-upload"
                    />
                    <label htmlFor="document-upload" className="btn btn-primary">
                        {uploading ? '📤 Subiendo...' : '📄 Subir Documento'}
                    </label>
                </div>
                
                {documents.length === 0 ? (
                    <p className="no-documents">No hay documentos adjuntos</p>
                ) : (
                    <div className="documents-grid">
                        {documents.map(doc => (
                            <div key={doc.id} className="document-preview-wrapper">
                                <DocumentPreview document={doc} />
                                <div className="document-actions">
                                    <button 
                                        onClick={() => handleDownload(doc.id, doc.document_name)}
                                        className="btn btn-secondary btn-sm"
                                        title="Descargar"
                                    >
                                        ⬇️
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteDocument(doc.id)}
                                        className="btn btn-danger btn-sm"
                                        title="Eliminar"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
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
                                    Ver Detalles
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
