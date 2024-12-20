class SmartAssistantService {
    constructor() {
        this.OLLAMA_URL = 'http://localhost:11434/api/generate';
        this.API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
    }

    async getContextualSuggestions(type) {
        switch(type) {
            case 'calendar':
                return [
                    "¿Qué eventos tengo esta semana?",
                    "Recordar próximos cumpleaños",
                    "Crear evento familiar"
                ];
            case 'member':
                return [
                    "Ver eventos del miembro",
                    "Crear recordatorio",
                    "Gestionar documentos"
                ];
            default:
                return [
                    "¿En qué puedo ayudarte?",
                    "Mostrar próximos eventos",
                    "Crear recordatorio"
                ];
        }
    }

    async handleRequest(input, userId) {
        try {
            const response = await fetch(this.OLLAMA_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: "llama3.2:1b-instruct-fp16",
                    prompt: input,
                    stream: false
                })
            });

            if (!response.ok) {
                throw new Error('Error en la respuesta de Ollama');
            }

            const data = await response.json();
            return {
                text: data.response,
                suggestions: [],
                type: 'text'
            };
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    }
}

export default new SmartAssistantService();