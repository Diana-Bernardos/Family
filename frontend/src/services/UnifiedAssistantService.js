// frontend/src/services/UnifiedAssistantService.js

class UnifiedAssistantService {
    constructor() {
        this.API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
        this.defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            credentials: 'include'
        };
    }

    // Método para procesar consultas generales
    async processQuery(query, type = 'general', memberId = null) {
        try {
            const response = await fetch(`${this.API_URL}/assistant/query`, {
                ...this.defaultOptions,
                method: 'POST',
                body: JSON.stringify({ query, type, memberId })
            });

            if (!response.ok) {
                throw new Error('Error al procesar la consulta');
            }

            return await response.json();
        } catch (error) {
            console.error('Error en processQuery:', error);
            throw error;
        }
    }

    // Obtener contexto general
    async getContextData() {
        try {
            const response = await fetch(
                `${this.API_URL}/assistant/context`,
                this.defaultOptions
            );

            if (!response.ok) {
                throw new Error('Error al obtener el contexto');
            }

            return await response.json();
        } catch (error) {
            console.error('Error en getContextData:', error);
            throw error;
        }
    }

    // Obtener contexto específico de un miembro
    async getMemberContext(memberId) {
        try {
            const response = await fetch(
                `${this.API_URL}/assistant/context/member/${memberId}`,
                this.defaultOptions
            );

            if (!response.ok) {
                throw new Error('Error al obtener el contexto del miembro');
            }

            return await response.json();
        } catch (error) {
            console.error('Error en getMemberContext:', error);
            throw error;
        }
    }

    // Obtener historial de eventos
    async getEventHistory() {
        try {
            const response = await fetch(
                `${this.API_URL}/assistant/events/history`,
                this.defaultOptions
            );

            if (!response.ok) {
                throw new Error('Error al obtener el historial de eventos');
            }

            return await response.json();
        } catch (error) {
            console.error('Error en getEventHistory:', error);
            throw error;
        }
    }

    // Obtener próximos eventos
    async getUpcomingEvents() {
        try {
            const response = await fetch(
                `${this.API_URL}/assistant/events/upcoming`,
                this.defaultOptions
            );

            if (!response.ok) {
                throw new Error('Error al obtener los próximos eventos');
            }

            return await response.json();
        } catch (error) {
            console.error('Error en getUpcomingEvents:', error);
            throw error;
        }
    }

    // Obtener documentos de un miembro
    async getMemberDocuments(memberId) {
        try {
            const response = await fetch(
                `${this.API_URL}/assistant/documents/${memberId}`,
                this.defaultOptions
            );

            if (!response.ok) {
                throw new Error('Error al obtener los documentos');
            }

            return await response.json();
        } catch (error) {
            console.error('Error en getMemberDocuments:', error);
            throw error;
        }
    }

    // Obtener sugerencias de eventos
    async getEventSuggestions() {
        try {
            const response = await fetch(
                `${this.API_URL}/assistant/suggestions/events`,
                this.defaultOptions
            );

            if (!response.ok) {
                throw new Error('Error al obtener sugerencias');
            }

            return await response.json();
        } catch (error) {
            console.error('Error en getEventSuggestions:', error);
            throw error;
        }
    }
}

export default new UnifiedAssistantService();