// services/calendarService.js
const mysql = require('mysql2/promise');
const config = require('../config');

class CalendarService {
    constructor() {
        this.pool = mysql.createPool(config.DB);
    }

    async addEvent(title, date, description = '', type = 'event') {
        try {
            const [result] = await this.pool.execute(
                'INSERT INTO calendar_events (title, description, event_date, event_type) VALUES (?, ?, ?, ?)',
                [title, description, date, type]
            );
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
            const [events] = await this.pool.execute(
                `SELECT title, description, event_date, event_type 
                 FROM calendar_events 
                 WHERE event_date >= CURDATE() 
                 ORDER BY event_date ASC 
                 LIMIT 5`
            );
            return {
                success: true,
                events: events
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
        const words = text.toLowerCase().split(' ');
        
        // Comandos básicos
        if (text.includes('mostrar eventos') || text.includes('próximos eventos')) {
            const result = await this.getUpcomingEvents();
            if (result.success && result.events.length > 0) {
                return {
                    success: true,
                    message: 'Próximos eventos:\n' + result.events.map(event => 
                        `- ${event.title}: ${this.formatDate(event.event_date)} (${event.event_type})`
                    ).join('\n')
                };
            }
            return {
                success: true,
                message: 'No hay eventos próximos programados.'
            };
        }

        // Añadir nuevo evento/recordatorio
        if (text.includes('recordatorio') || text.includes('evento')) {
            // Extraer fecha y hora usando regex
            const dateRegex = /(\d{1,2}\/\d{1,2}\/\d{4}|\d{1,2}\/\d{1,2})/;
            const timeRegex = /(\d{1,2}:\d{2})/;
            
            const dateMatch = text.match(dateRegex);
            const timeMatch = text.match(timeRegex);
            
            if (!dateMatch) {
                return {
                    success: false,
                    message: 'Por favor, especifica una fecha (ejemplo: 25/12/2024)'
                };
            }

            const title = text.replace(dateRegex, '').replace(timeRegex, '').replace('recordatorio', '').replace('evento', '').trim();
            const type = text.includes('recordatorio') ? 'reminder' : 'event';
            
            // Construir fecha
            let eventDate = dateMatch[0];
            if (!eventDate.includes('/2024')) {
                eventDate += '/2024';
            }
            if (timeMatch) {
                eventDate += ' ' + timeMatch[0];
            } else {
                eventDate += ' 00:00';
            }

            const result = await this.addEvent(title, new Date(eventDate.split('/').reverse().join('-')), '', type);
            return result;
        }

        return {
            success: false,
            message: 'No entendí el comando. Prueba con "mostrar eventos" o "recordatorio [título] [fecha] [hora]"'
        };
    }
}

module.exports = new CalendarService();