class CalendarAIService {
    constructor() {
        this.OLLAMA_URL = 'http://localhost:11434/api/generate';
        this.API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
    }

    async getCalendarContext(userId) {
        try {
            // Obtener todos los datos relevantes del calendario
            const [events, members, reminders] = await Promise.all([
                this.getUpcomingEvents(userId),
                this.getFamilyMembers(userId),
                this.getActiveReminders(userId)
            ]);

            // Agrupar eventos por tipo y fecha
            const groupedEvents = this.groupEventsByDate(events);

            return {
                events: groupedEvents,
                members,
                reminders,
                currentDate: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error getting calendar context:', error);
            throw error;
        }
    }

    async processCalendarQuery(query, userId) {
        const context = await this.getCalendarContext(userId);
        const prompt = this.createCalendarPrompt(query, context);

        try {
            const response = await fetch(this.OLLAMA_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: "llama3.2:1b-instruct-fp16",
                    prompt: prompt,
                    stream: false
                })
            });

            const data = await response.json();
            return this.processResponse(data.response, context);
        } catch (error) {
            console.error('Error processing calendar query:', error);
            throw error;
        }
    }

    createCalendarPrompt(query, context) {
        return `
        Eres un asistente familiar especializado en calendario y recordatorios.
        
        Contexto actual:
        Fecha: ${context.currentDate}
        Eventos próximos: ${JSON.stringify(context.events)}
        Miembros de la familia: ${JSON.stringify(context.members)}
        Recordatorios activos: ${JSON.stringify(context.reminders)}

        Instrucciones específicas:
        1. Si la consulta es sobre fechas, verifica los eventos existentes
        2. Sugiere recordatorios cuando sea relevante
        3. Considera las fechas importantes de los miembros
        4. Propón organización de eventos familiares

        La respuesta debe ser en formato JSON:
        {
            "text": "respuesta principal",
            "actions": [
                {
                    "type": "reminder|event|suggestion",
                    "details": {...},
                    "priority": "high|medium|low"
                }
            ],
            "relatedEvents": [...],
            "suggestions": [...]
        }

        Consulta del usuario: ${query}
        `;
    }

    async processResponse(aiResponse, context) {
        try {
            const parsed = JSON.parse(aiResponse);
            
            // Procesar acciones sugeridas
            if (parsed.actions && parsed.actions.length > 0) {
                for (const action of parsed.actions) {
                    await this.processAction(action, context);
                }
            }

            return {
                message: parsed.text,
                actions: parsed.actions || [],
                suggestions: parsed.suggestions || [],
                relatedEvents: await this.getEventDetails(parsed.relatedEvents || [])
            };
        } catch (error) {
            console.error('Error processing AI response:', error);
            return {
                message: aiResponse,
                actions: [],
                suggestions: [],
                relatedEvents: []
            };
        }
    }

    async processAction(action, context) {
        switch (action.type) {
            case 'reminder':
                return await this.createReminder(action.details);
            case 'event':
                return await this.createEvent(action.details);
            case 'suggestion':
                return await this.storeSuggestion(action.details);
            default:
                return null;
        }
    }

    async createReminder(details) {
        const response = await fetch(`${this.API_URL}/reminders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(details)
        });
        return response.json();
    }

    groupEventsByDate(events) {
        return events.reduce((acc, event) => {
            const date = event.event_date.split('T')[0];
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(event);
            return acc;
        }, {});
    }

    // Métodos auxiliares para obtener datos
    async getUpcomingEvents(userId) {
        const response = await fetch(`${this.API_URL}/events/upcoming/${userId}`);
        return response.json();
    }

    async getFamilyMembers(userId) {
        const response = await fetch(`${this.API_URL}/members`);
        return response.json();
    }

    async getActiveReminders(userId) {
        const response = await fetch(`${this.API_URL}/reminders/active/${userId}`);
        return response.json();
    }
}

export default new CalendarAIService();