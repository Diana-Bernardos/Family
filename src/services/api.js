const STORAGE_KEYS = {
    MEMBERS: 'family_app_members',
    EVENTS: 'family_app_events',
    EVENT_MEMBERS: 'family_app_event_members',
    DOCUMENTS: 'family_app_documents',
    USER: 'family_app_user'
};

const getLocal = (key, defaultValue = []) => {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
};

const setLocal = (key, data) => {
    localStorage.setItem(key, JSON.stringify(data));
};

// Semilla de datos iniciales si no hay nada
const initializeData = () => {
    if (!localStorage.getItem(STORAGE_KEYS.MEMBERS)) {
        const initialMembers = [
            { id: 1, name: 'Mamá', email: 'mama@family.com', phone: '123456789' },
            { id: 2, name: 'Papá', email: 'papa@family.com', phone: '987654321' },
            { id: 3, name: 'Hijos', email: 'hijos@family.com', phone: '555555555' }
        ];
        setLocal(STORAGE_KEYS.MEMBERS, initialMembers);
    }
};

initializeData();

export const api = {
    // Helper to convert ArrayBuffer to Base64 (browser compatible)
    arrayBufferToBase64(buffer) {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    },

    // Eventos
    getEvents: async () => {
        const events = getLocal(STORAGE_KEYS.EVENTS);
        const eventMembers = getLocal(STORAGE_KEYS.EVENT_MEMBERS);
        
        return events.map(event => ({
            ...event,
            participants: eventMembers
                .filter(em => em.event_id === event.id)
                .map(em => em.member_id),
            image: event.image_data ? { data: event.image_data, type: event.image_type } : null
        }));
    },

    getEvent: async (id) => {
        const events = getLocal(STORAGE_KEYS.EVENTS);
        const eventMembers = getLocal(STORAGE_KEYS.EVENT_MEMBERS);
        const event = events.find(e => e.id === parseInt(id));
        
        if (!event) throw new Error('Evento no encontrado');
        
        return {
            ...event,
            participants: eventMembers
                .filter(em => em.event_id === event.id)
                .map(em => em.member_id),
            image: event.image_data ? { data: event.image_data, type: event.image_type } : null
        };
    },

    createEvent: async (eventData) => {
        const isFormData = eventData instanceof FormData;
        const eventFields = isFormData ? Object.fromEntries(eventData.entries()) : { ...eventData };
        // El frontend usa 'members' en el FormData para los IDs de los participantes
        const participantsStr = isFormData ? eventData.get('members') : null;
        const participants = participantsStr ? JSON.parse(participantsStr) : (eventData.participants || []);
        
        let finalFields = { ...eventFields };
        delete finalFields.members; // No es una columna real
        delete finalFields.participants;
        finalFields.id = Date.now();
        finalFields.created_at = new Date().toISOString();

        if (isFormData && eventData.get('image')) {
            const file = eventData.get('image');
            if (file instanceof File && file.size > 0) {
                const buffer = await file.arrayBuffer();
                finalFields.image_data = api.arrayBufferToBase64(buffer);
                finalFields.image_type = file.type;
            }
        }

        const events = getLocal(STORAGE_KEYS.EVENTS);
        events.push(finalFields);
        setLocal(STORAGE_KEYS.EVENTS, events);

        if (participants && participants.length > 0) {
            const eventMembers = getLocal(STORAGE_KEYS.EVENT_MEMBERS);
            participants.forEach(memberId => {
                eventMembers.push({
                    event_id: finalFields.id,
                    member_id: parseInt(memberId)
                });
            });
            setLocal(STORAGE_KEYS.EVENT_MEMBERS, eventMembers);
        }

        return finalFields;
    },

    updateEvent: async (id, eventData) => {
        const isFormData = eventData instanceof FormData;
        const eventFields = isFormData ? Object.fromEntries(eventData.entries()) : { ...eventData };
        const participantsStr = isFormData ? eventData.get('members') : null;
        const participants = participantsStr ? JSON.parse(participantsStr) : eventData.participants;

        const events = getLocal(STORAGE_KEYS.EVENTS);
        const eventId = parseInt(id);
        const index = events.findIndex(e => e.id === eventId);
        if (index === -1) throw new Error('Evento no encontrado');

        let finalFields = { ...events[index], ...eventFields };
        delete finalFields.members;
        delete finalFields.participants;

        if (isFormData && eventData.get('image')) {
            const file = eventData.get('image');
            if (file instanceof File && file.size > 0) {
                const buffer = await file.arrayBuffer();
                finalFields.image_data = api.arrayBufferToBase64(buffer);
                finalFields.image_type = file.type;
            }
        }

        events[index] = finalFields;
        setLocal(STORAGE_KEYS.EVENTS, events);

        if (participants) {
            let eventMembers = getLocal(STORAGE_KEYS.EVENT_MEMBERS).filter(em => em.event_id !== eventId);
            participants.forEach(memberId => {
                eventMembers.push({
                    event_id: eventId,
                    member_id: parseInt(memberId)
                });
            });
            setLocal(STORAGE_KEYS.EVENT_MEMBERS, eventMembers);
        }

        return finalFields;
    },

    deleteEvent: async (id) => {
        let events = getLocal(STORAGE_KEYS.EVENTS);
        events = events.filter(e => e.id !== parseInt(id));
        setLocal(STORAGE_KEYS.EVENTS, events);

        let eventMembers = getLocal(STORAGE_KEYS.EVENT_MEMBERS);
        eventMembers = eventMembers.filter(em => em.event_id !== parseInt(id));
        setLocal(STORAGE_KEYS.EVENT_MEMBERS, eventMembers);

        return { success: true };
    },

    // Miembros
    getMembers: async () => {
        const members = getLocal(STORAGE_KEYS.MEMBERS);
        return members.map(m => ({
            ...m,
            avatar: m.avatar_data ? { data: m.avatar_data, type: m.avatar_type } : null
        }));
    },

    getMember: async (id) => {
        const members = getLocal(STORAGE_KEYS.MEMBERS);
        const member = members.find(m => m.id === parseInt(id));
        if (!member) throw new Error('Miembro no encontrado');
        return {
            ...member,
            avatar: member.avatar_data ? { data: member.avatar_data, type: member.avatar_type } : null
        };
    },

    createMember: async (memberData) => {
        const isFormData = memberData instanceof FormData;
        const fields = isFormData ? Object.fromEntries(memberData.entries()) : { ...memberData };
        
        let finalFields = { ...fields };
        finalFields.id = Date.now();
        
        if (isFormData && memberData.get('avatar')) {
            const file = memberData.get('avatar');
            if (file instanceof File && file.size > 0) {
                const buffer = await file.arrayBuffer();
                finalFields.avatar_data = api.arrayBufferToBase64(buffer);
                finalFields.avatar_type = file.type;
            }
        }

        const members = getLocal(STORAGE_KEYS.MEMBERS);
        members.push(finalFields);
        setLocal(STORAGE_KEYS.MEMBERS, members);
        return finalFields;
    },

    updateMember: async (id, memberData) => {
        const isFormData = memberData instanceof FormData;
        const fields = isFormData ? Object.fromEntries(memberData.entries()) : { ...memberData };
        
        const members = getLocal(STORAGE_KEYS.MEMBERS);
        const index = members.findIndex(m => m.id === parseInt(id));
        if (index === -1) throw new Error('Miembro no encontrado');

        let finalFields = { ...members[index], ...fields };
        if (isFormData && memberData.get('avatar')) {
            const file = memberData.get('avatar');
            if (file instanceof File && file.size > 0) {
                const buffer = await file.arrayBuffer();
                finalFields.avatar_data = api.arrayBufferToBase64(buffer);
                finalFields.avatar_type = file.type;
            }
        }

        members[index] = finalFields;
        setLocal(STORAGE_KEYS.MEMBERS, members);
        return finalFields;
    },

    deleteMember: async (id) => {
        const memberId = parseInt(id);
        
        let members = getLocal(STORAGE_KEYS.MEMBERS);
        members = members.filter(m => m.id !== memberId);
        setLocal(STORAGE_KEYS.MEMBERS, members);

        // Limpiar participaciones en eventos
        let eventMembers = getLocal(STORAGE_KEYS.EVENT_MEMBERS);
        eventMembers = eventMembers.filter(em => em.member_id !== memberId);
        setLocal(STORAGE_KEYS.EVENT_MEMBERS, eventMembers);

        // Limpiar documentos
        let docs = getLocal(STORAGE_KEYS.DOCUMENTS);
        docs = docs.filter(d => d.member_id !== memberId);
        setLocal(STORAGE_KEYS.DOCUMENTS, docs);

        return { success: true };
    },

    getMemberEvents: async (id) => {
        const eventMembers = getLocal(STORAGE_KEYS.EVENT_MEMBERS);
        const events = getLocal(STORAGE_KEYS.EVENTS);
        const memberEventIds = eventMembers
            .filter(em => em.member_id === parseInt(id))
            .map(em => em.event_id);
        
        return events
            .filter(e => memberEventIds.includes(e.id))
            .map(e => ({
                ...e,
                image: e.image_data ? { data: e.image_data, type: e.image_type } : null
            }));
    },

    // Documentos
    uploadDocument: async (memberId, file) => {
        const buffer = await file.arrayBuffer();
        const doc = {
            id: Date.now(),
            member_id: parseInt(memberId),
            document_name: file.name,
            document_type: file.type,
            file_data: api.arrayBufferToBase64(buffer),
            file_size: file.size,
            created_at: new Date().toISOString()
        };
        
        const docs = getLocal(STORAGE_KEYS.DOCUMENTS);
        docs.push(doc);
        setLocal(STORAGE_KEYS.DOCUMENTS, docs);
        return doc;
    },

    getMemberDocuments: async (memberId) => {
        const docs = getLocal(STORAGE_KEYS.DOCUMENTS);
        return docs.filter(d => d.member_id === parseInt(memberId));
    },

    deleteDocument: async (documentId) => {
        let docs = getLocal(STORAGE_KEYS.DOCUMENTS);
        docs = docs.filter(d => d.id !== parseInt(documentId));
        setLocal(STORAGE_KEYS.DOCUMENTS, docs);
        return { success: true };
    },

    // Autenticación Mock
    login: async (email, password) => {
        const user = { id: 1, email, username: email.split('@')[0], token: 'mock-token-' + Date.now() };
        setLocal(STORAGE_KEYS.USER, user);
        return user;
    },

    register: async (username, email, password) => {
        const user = { id: Date.now(), email, username, token: 'mock-token-' + Date.now() };
        setLocal(STORAGE_KEYS.USER, user);
        return { message: 'Registro exitoso (Demo)', user };
    },

    sendChatMessage: async (userId, message) => {
        return { 
            success: true, 
            response: "Hola! Soy tu asistente en modo demo. Como no hay servidor, responderé con mensajes predefinidos. ¿En qué puedo ayudarte con tu calendario familiar?" 
        };
    }
};
