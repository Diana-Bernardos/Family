import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
                date: event.event_date.split('T')[0],
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
            setError('Error loading events');
            console.error('Error:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleAssistantSearch = async () => {
        if (!searchTerm.trim()) return;

        try {
            setIsLoading(true);
            const response = await chatbotService.processUserQuery(searchTerm, 'calendar');
            
            if (response.events) {
                const formattedEvents = response.events.map(event => ({
                    id: event.id,
                    title: event.name,
                    date: event.event_date.split('T')[0],
                    backgroundColor: event.color || '#3788d8',
                    borderColor: event.color || '#3788d8',
                    textColor: getContrastColor(event.color || '#3788d8'),
                    extendedProps: {
                        icon: event.icon,
                        image: event.image
                    }
                }));
                setEvents(formattedEvents);
            }
        } catch (err) {
            console.error('Error in assistant search:', err);
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
        // Convert hex to RGB
        const r = parseInt(hexcolor.slice(1, 3), 16);
        const g = parseInt(hexcolor.slice(3, 5), 16);
        const b = parseInt(hexcolor.slice(5, 7), 16);
        
        // Calculate luminance
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        
        return luminance > 0.5 ? '#000000' : '#FFFFFF';
    };

    const renderEventContent = (eventInfo) => {
        return (
            <div className="flex items-center p-1 overflow-hidden">
                {eventInfo.event.extendedProps.icon && (
                    <i className={`${eventInfo.event.extendedProps.icon} mr-1`}></i>
                )}
                <span className="event-title truncate">{eventInfo.event.title}</span>
            </div>
        );
    };

    if (error) {
        return (
            <div className="error-container bg-red-50 p-4 rounded-lg">
                <div className="text-red-700 font-medium">
                    Oops, something went wrong! We couldn't load the events.
                </div>
                <p className="text-red-600 mt-2">
                    {error}
                </p>
                <button
                    onClick={loadEvents}
                    className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
                >
                    Try again
                </button>
            </div>
        );
    }

    return (
        <div className="calendar-container p-4">
            <div className="calendar-header flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Event Calendar</h1>
                
            </div>
            
            <div className="calendar-content">
                {isLoading ? (
                    <div className="loading-spinner flex justify-center items-center h-96">
                        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
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
                        className="calendar-view"
                    />
                )}
            </div>
        </div>
    );
};

export default Calendar;
