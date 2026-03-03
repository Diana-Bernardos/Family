// services/calendarService.js
// REFACTORED: This service now uses the API instead of direct database access
import { api } from './api';

class CalendarService {
    async addEvent(title, date, description = '', type = 'event') {
        try {
            const eventData = new FormData();
            eventData.append('name', title);
            eventData.append('event_date', date);
            eventData.append('event_type', type);
            eventData.append('description', description);
            
            await api.createEvent(eventData);
            
            return {
                success: true,
                message: `${type === 'reminder' ? 'Recordatorio' : 'Evento'} agregado: ${title}`
            };
        } catch (error) {
            console.error('Error adding event:', error);
            return {
                success: false,
                message: 'Error al agregar al calendario'
            };
        }
    }

    async getUpcomingEvents() {
        try {
            const events = await api.getEvents();
            return {
                success: true,
                events: events.slice(0, 5) // Limit to 5 as the original logic did
            };
        } catch (error) {
            console.error('Error getting events:', error);
            return {
                success: false,
                message: 'Error al obtener eventos'
            };
        }
    }

    formatDate(date) {
        return new Date(date).toLocaleString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    async processCalendarCommand(text) {
        // This is a simplified frontend command processor
        // Ideally, this logic should be in the AI backend
        if (text.includes('mostrar eventos') || text.includes('próximos eventos')) {
            const result = await this.getUpcomingEvents();
            if (result.success && result.events.length > 0) {
                return {
                    success: true,
                    message: 'Próximos eventos:\n' + result.events.map(event => 
                        `- ${event.name}: ${this.formatDate(event.event_date)} (${event.event_type})`
                    ).join('\n')
                };
            }
            return {
                success: true,
                message: 'No hay eventos próximos programados.'
            };
        }

        return {
            success: false,
            message: 'No entendí el comando. Prueba con "mostrar eventos" o usa el chat del asistente.'
        };
    }
}

const calendarServiceInstance = new CalendarService();
export default calendarServiceInstance;