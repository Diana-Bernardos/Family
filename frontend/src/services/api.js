const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const api = {
    // Reutilizar headers comunes
    async authenticatedRequest(url, options = {}) {
        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            ...options.headers,
        };

        const response = await fetch(url, { ...options, headers });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error en la solicitud');
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
            body: JSON.stringify(eventData),
        });
    },

    updateEvent: async (id, eventData) => {
        return api.authenticatedRequest(`${API_URL}/events/${id}`, {
            method: 'PUT',
            body: JSON.stringify(eventData),
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
            body: JSON.stringify(memberData),
        });
    },

    updateMember: async (id, memberData) => {
        return api.authenticatedRequest(`${API_URL}/members/${id}`, {
            method: 'PUT',
            body: JSON.stringify(memberData),
        });
    },

    deleteMember: async (id) => {
        return api.authenticatedRequest(`${API_URL}/members/${id}`, { method: 'DELETE' });
    },

    getMemberEvents: async (id) => {
        return api.authenticatedRequest(`${API_URL}/members/${id}/events`);
    },

    // Documentos
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
        return api.authenticatedRequest(`${API_URL}/documents/${memberId}/documents`);
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
        return api.authenticatedRequest(`${API_URL}/ai/process`, {
            method: 'POST',
            body: JSON.stringify({ userId, message }),
        });
    },

    getChatContext: async (userId) => {
        return api.authenticatedRequest(`${API_URL}/ai/context/${userId}`);
    },

    getChatSuggestions: async (userId) => {
        return api.authenticatedRequest(`${API_URL}/ai/suggestions/${userId}`);
    },

    getChatHistory: async (userId) => {
        return api.authenticatedRequest(`${API_URL}/ai/history/${userId}`);
    },

    getChatCalendarData: async (userId) => {
        const [events, members, tasks, reminders] = await Promise.all([
            api.getEvents(),
            api.getMembers(),
            api.getTasks(userId),
            api.getReminders(userId),
        ]);

        return { events, members, tasks, reminders };
    },

    // Tareas y Recordatorios
    getTasks: async (userId) => {
        return api.authenticatedRequest(`${API_URL}/tasks/${userId}`);
    },

    getReminders: async (userId) => {
        return api.authenticatedRequest(`${API_URL}/reminders/${userId}`);
    },
};
