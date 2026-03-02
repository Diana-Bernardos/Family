const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const api = {
    // Realizar solicitudes (sin autenticación requerida)
    async authenticatedRequest(url, options = {}) {
        // No forzar Content-Type si el body es FormData (fetch lo maneja automáticamente)
        const headers = {
            ...options.headers,
        };
        
        // Solo agregar Content-Type si no es FormData
        if (!(options.body instanceof FormData)) {
            headers['Content-Type'] = 'application/json';
        }

        const response = await fetch(url, { ...options, headers });

        if (!response.ok) {
            try {
                const errorData = await response.json();
                throw new Error(errorData.error || `Error: ${response.status}`);
            } catch (e) {
                throw new Error(`Error en la solicitud: ${response.status}`);
            }
        }

        return response.json();
    },

    // Eventos
    getEvents: async () => {
        return api.authenticatedRequest(`${API_URL}/events`);
    },

    getEvent: async (id) => {
        return api.authenticatedRequest(`${API_URL}/events/${id}`);
    },

    createEvent: async (eventData) => {
        return api.authenticatedRequest(`${API_URL}/events`, {
            method: 'POST',
            body: eventData,
        });
    },

    updateEvent: async (id, eventData) => {
        // Si es FormData, enviar directamente; si es objeto, convertir a JSON
        const body = eventData instanceof FormData ? eventData : JSON.stringify(eventData);
        return api.authenticatedRequest(`${API_URL}/events/${id}`, {
            method: 'PUT',
            body: body,
        });
    },

    deleteEvent: async (id) => {
        return api.authenticatedRequest(`${API_URL}/events/${id}`, { method: 'DELETE' });
    },

    // Miembros
    getMembers: async () => {
        return api.authenticatedRequest(`${API_URL}/members`);
    },

    getMember: async (id) => {
        return api.authenticatedRequest(`${API_URL}/members/${id}`);
    },

    createMember: async (memberData) => {
        return api.authenticatedRequest(`${API_URL}/members`, {
            method: 'POST',
            body: memberData,
        });
    },

    updateMember: async (id, memberData) => {
        // Si es FormData, enviar directamente; si es objeto, convertir a JSON
        const body = memberData instanceof FormData ? memberData : JSON.stringify(memberData);
        return api.authenticatedRequest(`${API_URL}/members/${id}`, {
            method: 'PUT',
            body: body,
        });
    },

    deleteMember: async (id) => {
        return api.authenticatedRequest(`${API_URL}/members/${id}`, { method: 'DELETE' });
    },

    getMemberEvents: async (id) => {
        return api.authenticatedRequest(`${API_URL}/members/${id}/events`);
    },    // Documentos
    uploadDocument: async (memberId, file) => {
        const formData = new FormData();
        formData.append('document', file);

        const response = await fetch(`${API_URL}/documents/${memberId}/upload`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error al subir documento');
        }

        return response.json();
    },

    getMemberDocuments: async (memberId) => {
        const res = await api.authenticatedRequest(`${API_URL}/documents/${memberId}/documents`);
        // la ruta ahora puede devolver un objeto de error aunque el status sea 200
        if (res && res.error) {
            throw new Error(res.error + (res.details ? `: ${res.details}` : ''));
        }
        return res;
    },

    downloadDocument: async (documentId) => {
        const response = await fetch(`${API_URL}/documents/download/${documentId}`);
        if (!response.ok) throw new Error('Error al descargar documento');
        return response.blob();
    },

    deleteDocument: async (documentId) => {
        return api.authenticatedRequest(`${API_URL}/documents/${documentId}`, { method: 'DELETE' });
    },

    // Autenticación
    login: async (email, password) => {
        return api.authenticatedRequest(`${API_URL}/auth/login`, {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
    },

    register: async (username, email, password) => {
        return api.authenticatedRequest(`${API_URL}/auth/register`, {
            method: 'POST',
            body: JSON.stringify({ username, email, password }),
        });
    },

    // Métodos de ChatBot
    sendChatMessage: async (userId, message) => {
        try {
            const response = await fetch(`${API_URL}/ai/process`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId, message })
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                // status de error, convertir en objeto legible
                console.error('sendChatMessage received error status', response.status, data);
                return { success: false, error: data.error || 'Error al enviar mensaje', details: data.details };
            }

            // si la API marcó error, retornamos el mismo objeto pero no lanzamos excepción
            if (data && data.success === false) {
                return data;
            }

            return data;
        } catch (error) {
            console.error('Error en sendChatMessage:', error);
            // en caso de fallo de red devolvemos un mensaje básico
            return { success: false, error: 'No se pudo conectar con el servidor' };
        }
    },

    getChatContext: async (userId) => {
        try {
            const response = await fetch(`${API_URL}/ai/context/${userId}`);
            
            if (!response.ok) {
                throw new Error('Error al obtener contexto');
            }

            return await response.json();
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    },


    getChatHistory: async (userId) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/ai/history/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Error al obtener historial');
        }
    
        return response.json();
    }};