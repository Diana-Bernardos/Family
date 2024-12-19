const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
const OLLAMA_URL = 'http://localhost:11434/api/generate';

export const chatbotService = {
    async analyzeContext(userId, message) {
        try {
            // Obtener contexto del usuario
            const [events, documents, members] = await Promise.all([
                fetch(`${API_URL}/events/user/${userId}`).then(res => res.json()),
                fetch(`${API_URL}/documents/${userId}`).then(res => res.json()),
                fetch(`${API_URL}/members`).then(res => res.json())
            ]);

            // Crear contexto para Ollama
            const context = {
                upcomingEvents: events.filter(e => new Date(e.date) > new Date()),
                recentDocuments: documents.slice(0, 5),
                familyMembers: members,
                userMessage: message
            };

            // Enviar a Ollama con contexto
            const response = await fetch(OLLAMA_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: "llama2",
                    prompt: this.createPrompt(context),
                    stream: false
                })
            });

            return await response.json();
        } catch (error) {
            console.error('Error en chatbot:', error);
            throw error;
        }
    },

    createPrompt(context) {
        return `
            Como asistente familiar, tienes acceso a la siguiente información:
            
            Próximos eventos: ${JSON.stringify(context.upcomingEvents)}
            Documentos recientes: ${JSON.stringify(context.recentDocuments)}
            Miembros de la familia: ${JSON.stringify(context.familyMembers)}

            Basado en este contexto, responde a: ${context.userMessage}
            
            Proporciona una respuesta útil y personalizada.
        `;
    },

    async createReminder(eventDetails) {
        try {
            const response = await fetch(`${API_URL}/events`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(eventDetails)
            });
            return await response.json();
        } catch (error) {
            console.error('Error creando recordatorio:', error);
            throw error;
        }
    }
};