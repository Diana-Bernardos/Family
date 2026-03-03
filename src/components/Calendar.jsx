import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import { api } from '../services/api';
import { chatbotService } from '../services/chatbotService';

const Calendar = () => {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const loadEvents = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await api.getEvents();
            const formattedEvents = data.map(event => ({
                id: event.id,
                title: event.name,
                date: event.event_date ? event.event_date.split('T')[0] : new Date().toISOString().split('T')[0],
                backgroundColor: event.color || '#3788d8',
                borderColor: event.color || '#3788d8',
                textColor: getContrastColor(event.color || '#3788d8'),
                extendedProps: {
                    icon: event.icon,
                    image: event.image ? {
                        data: event.image.data,
                        type: event.image.type
                    } : null
                }
            }));
            setEvents(formattedEvents);
            setError(null);
        } catch (err) {
            setError('Error al cargar los eventos');
            console.error('Error:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleAssistantSearch = async () => {
        if (!searchTerm.trim()) return;

        try {
            setIsLoading(true);
            // Usamos sendMessage que es el estándar ahora
            const response = await chatbotService.sendMessage(1, searchTerm);
            
            // Si el asistente devolvió una respuesta que generó cambios en LocalStorage, recargamos
            if (response.success) {
                await loadEvents();
                setSearchTerm('');
            }
        } catch (err) {
            console.error('Error en búsqueda del asistente:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadEvents();
    }, [loadEvents]);

    const handleEventClick = (info) => {
        navigate(`/event/${info.event.id}`);
    };

    const getContrastColor = (hexcolor) => {
        const r = parseInt(hexcolor.slice(1, 3), 16);
        const g = parseInt(hexcolor.slice(3, 5), 16);
        const b = parseInt(hexcolor.slice(5, 7), 16);
        
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        
        return luminance > 0.5 ? '#000000' : '#FFFFFF';
    };

    const renderEventContent = (eventInfo) => {
        return (
            <div className="flex items-center p-1 overflow-hidden">
                {eventInfo.event.extendedProps.icon && (
                    <span className="mr-1">{eventInfo.event.extendedProps.icon}</span>
                )}
                <span className="event-title truncate">{eventInfo.event.title}</span>
            </div>
        );
    };

    if (error) {
        return (
            <div className="error-container bg-red-50 p-4 rounded-lg">
                <div className="text-red-700 font-medium">
                    ¡Oops! Algo salió mal
                </div>
                <p className="text-red-600 mt-2">{error}</p>
                <button
                    onClick={loadEvents}
                    className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
                >
                    Reintentar
                </button>
            </div>
        );
    }

    return (
        <div className="calendar-container">
            <div className="calendar-header">
                <div className="calendar-header-info">
                    <h2 className="calendar-title">📅 Calendario de Eventos</h2>
                    <p className="calendar-subtitle">
                        {events.length} evento{events.length !== 1 ? 's' : ''} registrado{events.length !== 1 ? 's' : ''}
                    </p>
                </div>
                <Link to="/new-event" className="btn btn-primary">
                    <span>➕</span>
                    Nuevo Evento
                </Link>
            </div>
            
            <div className="calendar-content">
                {isLoading ? (
                    <div className="loading-spinner">
                        <div className="spinner"></div>
                        <p>Cargando eventos...</p>
                    </div>
                ) : (
                    <div className="calendar-view">
                        <FullCalendar
                            plugins={[dayGridPlugin]}
                            initialView="dayGridMonth"
                            events={events}
                            locale="es"
                            headerToolbar={{
                                left: 'prev,next today',
                                center: 'title',
                                right: 'dayGridMonth'
                            }}
                            eventClick={handleEventClick}
                            eventContent={renderEventContent}
                            dayMaxEvents={true}
                            height="auto"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Calendar;
