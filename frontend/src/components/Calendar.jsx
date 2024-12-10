// src/components/Calendar.jsx


import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import { api } from '../services/api';
import ErrorBoundary from './ErrorBoundary';

const Calendar = () => {
    const [events, setEvents] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = async () => {
        try {
            const data = await api.getEvents();
            const formattedEvents = data.map(event => ({
                id: event.id,
                title: event.name,
                date: event.event_date.split('T')[0],
                backgroundColor: event.color || '#3788d8',
                extendedProps: {
                    icon: event.icon,
                    image_url: event.image_url
                }
            }));
            setEvents(formattedEvents);
        } catch (err) {
            setError('Error al cargar los eventos');
            console.error('Error:', err);
        }
    };

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    return (
        <div className="calendar-container">
            <div className="calendar-header">
                <h1>Calendario de Eventos</h1>
                <Link to="/new-event" className="btn btn-primary">
                    Añadir Evento
                </Link>
            </div>
            <div className="calendar-content">
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
                    eventClick={(info) => {
                        window.location.href = `/event/${info.event.id}`;
                    }}
                    eventContent={(eventInfo) => {
                        return (
                            <div className="event-content">
                                {eventInfo.event.extendedProps.icon && (
                                    <i className={eventInfo.event.extendedProps.icon}></i>
                                )}
                                <span className="event-title">{eventInfo.event.title}</span>
                            </div>
                        );
                    }}
                    eventDidMount={(info) => {
                        if (info.event.extendedProps.image_url) {
                            info.el.style.backgroundImage = `url(http://localhost:3001${info.event.extendedProps.image_url})`;
                            info.el.style.backgroundSize = 'contain';
                            info.el.style.backgroundRepeat = 'no-repeat';
                            info.el.style.backgroundPosition = 'right center';
                        }
                    }}
                />
            </div>
        </div>
    );
};

export default Calendar;
