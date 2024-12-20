class AIService {
    constructor() {
        this.OLLAMA_URL = 'http://localhost:11434/api/generate';
        this.API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
    }

    async processMessage(message, userId) {
        try {
            // Obtener contexto de la base de datos
            const context = await this.getContextData(userId);
            
            // Crear el prompt con el contexto
            const prompt = this.createPromptWithContext(message, context);

            // Obtener respuesta de Ollama
            const response = await this.getOllamaResponse(prompt);

            // Procesar y formatear la respuesta
            return await this.formatResponse(response, context);
        } catch (error) {
            console.error('Error procesando mensaje:', error);
            throw error;
        }
    }

    async getContextData(userId) {
        const [events, members] = await Promise.all([
            this.fetchEvents(userId),
            this.fetchMembers(userId)
        ]);
        return { events, members };
    }

    async fetchEvents(userId) {
        const response = await fetch(`${this.API_URL}/events/user/${userId}`);
        if (!response.ok) throw new Error('Error fetching events');
        return await response.json();
    }

    async fetchMembers(userId) {
        const response = await fetch(`${this.API_URL}/members`);
        if (!response.ok) throw new Error('Error fetching members');
        return await response.json();
    }

    createPromptWithContext(message, context) {
        return `
        Contexto actual:
        Eventos: ${JSON.stringify(context.events)}
        Miembros: ${JSON.stringify(context.members)}

        Instrucciones:
        - Proporciona respuestas concisas
        - Sugiere eventos relacionados cuando sea relevante
        - Responde en formato JSON siguiendo esta estructura:
        {
            "text": "respuesta principal",
            "suggestions": ["sugerencia1", "sugerencia2"],
            "relatedEvents": [eventIds],
            "type": "general|event|task|reminder"
        }

        Mensaje del usuario: ${message}
        `;
    }

    async getOllamaResponse(prompt) {
        const response = await fetch(this.OLLAMA_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: "llama3.2:1b-instruct-fp16",
                prompt: prompt,
                stream: false
            })
        });

        if (!response.ok) {
            throw new Error('Error en la respuesta de Ollama');
        }

        return await response.json();
    }

    async formatResponse(ollamaResponse, context) {
        try {
            const parsed = JSON.parse(ollamaResponse.response);
            
            // Si hay eventos relacionados, obtener sus detalles
            if (parsed.relatedEvents && parsed.relatedEvents.length > 0) {
                const eventDetails = await this.getEventDetails(parsed.relatedEvents);
                parsed.eventDetails = eventDetails;
            }

            return parsed;
        } catch (error) {
            // Si no se puede parsear como JSON, devolver respuesta simple
            return {
                text: ollamaResponse.response,
                suggestions: [],
                relatedEvents: [],
                type: 'general'
            };
        }
    }

    async getEventDetails(eventIds) {
        try {
            const events = await Promise.all(
                eventIds.map(id => 
                    fetch(`${this.API_URL}/events/${id}`).then(r => r.json())
                )
            );
            return events.filter(e => e); // Filtrar nulls
        } catch (error) {
            console.error('Error getting event details:', error);
            return [];
        }
    }
}

export default new AIService();