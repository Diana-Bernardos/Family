// src/services/chatbotService.js

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
const OLLAMA_URL = 'http://localhost:11434/api/generate';

const defaultOptions = {
    headers: {
        'Content-Type': 'application/json'
    },
    credentials: 'include'
};

export const chatbotService = {
    async analyzeContext(message) {
        try {
            // Obtener contexto
            const context = await this.getContextData();
            
            // Preparar la petición a Ollama con el modelo específico
            const ollamaResponse = await fetch(OLLAMA_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: "llama3.2:1b-instruct-fp16",
                    prompt: this.createPrompt(context, message),
                    stream: false,
                    options: {
                        temperature: 0.7,
                        top_k: 50,
                        top_p: 0.95,
                        num_ctx: 2048,
                        repeat_penalty: 1.1
                    }
                })
            });

            if (!ollamaResponse.ok) {
                const errorData = await ollamaResponse.json().catch(() => ({}));
                throw new Error(errorData.error || 'Error en la respuesta de Ollama');
            }

            const data = await ollamaResponse.json();
            console.log('Respuesta de Ollama:', data); // Para debugging

            if (data.error) {
                throw new Error(data.error);
            }

            // Guardar en el historial
            await this.saveChatHistory(message, data.response);

            return {
                response: data.response,
                context: context
            };
        } catch (error) {
            console.error('Error detallado en analyzeContext:', error);
            throw new Error('No se pudo procesar la consulta: ' + error.message);
        }
    },

    async getContextData() {
        try {
            const [events, members] = await Promise.all([
                fetch(`${API_URL}/events`, defaultOptions)
                    .then(res => res.json())
                    .catch(() => []),
                fetch(`${API_URL}/members`, defaultOptions)
                    .then(res => res.json())
                    .catch(() => [])
            ]);

            const upcomingEvents = events
                .filter(event => new Date(event.event_date) > new Date())
                .sort((a, b) => new Date(a.event_date) - new Date(b.event_date))
                .slice(0, 5);

            return {
                upcomingEvents,
                members
            };
        } catch (error) {
            console.error('Error obteniendo contexto:', error);
            return {
                upcomingEvents: [],
                members: []
            };
        }
    },

    createPrompt(context, userMessage) {
        const { upcomingEvents, members } = context;

        // Formatear eventos próximos
        const eventsText = upcomingEvents.map(event => 
            `- ${event.name} en ${new Date(event.event_date).toLocaleDateString()}`
        ).join('\\n');

        // Formatear miembros
        const membersText = members.map(member => 
            `- ${member.name}`
        ).join('\\n');

        // Prompt específico para Llama 3.2
        return `[INST] Eres un asistente familiar inteligente y amigable. Tienes acceso a la siguiente información:

EVENTOS PRÓXIMOS:
${eventsText || 'No hay eventos próximos programados'}

MIEMBROS DE LA FAMILIA:
${membersText || 'No hay miembros registrados'}

Basado en este contexto, responde a la siguiente consulta:
${userMessage}

Instrucciones:
1. Sé conciso y claro en tu respuesta
2. Menciona eventos o miembros relevantes si aplica
3. Ofrece sugerencias prácticas cuando sea apropiado [/INST]`;
    },

    async saveChatHistory(message, response) {
        try {
            await fetch(`${API_URL}/chat/history`, {
                ...defaultOptions,
                method: 'POST',
                body: JSON.stringify({
                    message,
                    response,
                    timestamp: new Date().toISOString()
                })
            });
        } catch (error) {
            console.error('Error guardando historial:', error);
        }
    },

    async getChatHistory() {
        try {
            const response = await fetch(`${API_URL}/chat/history`, defaultOptions);
            if (!response.ok) throw new Error('Error obteniendo historial');
            return await response.json();
        } catch (error) {
            console.error('Error obteniendo historial:', error);
            return [];
        }
    }
};