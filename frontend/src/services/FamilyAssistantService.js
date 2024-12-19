const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
const OLLAMA_URL = 'http://localhost:11434/api/generate';

class FamilyAssistantService {
    async handleRequest(input, userId) {
        try {
            // Preparar el contexto para Ollama
            const prompt = `
            Eres un asistente familiar que ayuda con:
            - Gestión de eventos familiares
            - Recordatorios importantes
            - Sugerencias de actividades
            - Organización familiar

            Usuario: ${input}
            Asistente:`;

            // Llamada a Ollama
            const response = await fetch(OLLAMA_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: "llama3.2:1b-instruct-fp16",
                    prompt: prompt,
                    stream: false
                })
            });

            if (!response.ok) {
                throw new Error('Error en la respuesta de Ollama');
            }

            const data = await response.json();
            return data.response;

        } catch (error) {
            console.error('Error al procesar la solicitud:', error);
            return "Lo siento, ha ocurrido un error al procesar tu solicitud.";
        }
    }

    // Método para verificar si Ollama está funcionando
    async checkOllamaStatus() {
        try {
            const response = await fetch(OLLAMA_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: "llama3.2:1b-instruct-fp16",
                    prompt: "Hola",
                    stream: false
                })
            });

            return response.ok;
        } catch (error) {
            console.error('Error al verificar Ollama:', error);
            return false;
        }
    }
}

export default new FamilyAssistantService();