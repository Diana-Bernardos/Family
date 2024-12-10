const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const api = {
    // Eventos
    getEvents: async () => {
        try {
            const response = await fetch(`${API_URL}/events`);
            if (!response.ok) throw new Error('Error al obtener eventos');
            return await response.json();
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    },

    getEvent: async (id) => {
        try {
            const response = await fetch(`${API_URL}/events/${id}`);
            if (!response.ok) throw new Error('Error al obtener evento');
            return await response.json();
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    },

    createEvent: async (eventData) => {
        try {
            const response = await fetch(`${API_URL}/events`, {
                method: 'POST',
                body: eventData
            });
            if (!response.ok) throw new Error('Error al crear evento');
            return await response.json();
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    },

    updateEvent: async (id, eventData) => {
        try {
            const response = await fetch(`${API_URL}/events/${id}`, {
                method: 'PUT',
                body: eventData
            });
            if (!response.ok) throw new Error('Error al actualizar evento');
            return await response.json();
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    },

    deleteEvent: async (id) => {
        try {
            const response = await fetch(`${API_URL}/events/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Error al eliminar evento');
            return await response.json();
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    },

    // Miembros
    getMembers: async () => {
        try {
            const response = await fetch(`${API_URL}/members`);
            if (!response.ok) throw new Error('Error al obtener miembros');
            return await response.json();
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    },

    getMember: async (id) => {
        try {
            const response = await fetch(`${API_URL}/members/${id}`);
            if (!response.ok) throw new Error('Error al obtener miembro');
            return await response.json();
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    },

    getMemberEvents: async (id) => {
        try {
            const response = await fetch(`${API_URL}/members/${id}/events`);
            if (!response.ok) {
                console.log('Respuesta del servidor:', await response.text());
                throw new Error('Error al obtener eventos del miembro');
            }
            return await response.json();
        } catch (error) {
            console.error('Error detallado:', error);
            throw error;
        }
    },

    createMember: async (memberData) => {
        try {
            const response = await fetch(`${API_URL}/members`, {
                method: 'POST',
                body: memberData
            });
            if (!response.ok) throw new Error('Error al crear miembro');
            return await response.json();
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    },

    updateMember: async (id, memberData) => {
        try {
            const response = await fetch(`${API_URL}/members/${id}`, {
                method: 'PUT',
                body: memberData
            });
            if (!response.ok) throw new Error('Error al actualizar miembro');
            return await response.json();
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    },

    deleteMember: async (id) => {
        try {
            const response = await fetch(`${API_URL}/members/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Error al eliminar miembro');
            return await response.json();
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    }
  }

    
