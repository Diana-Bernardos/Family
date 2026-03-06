const STORAGE_KEYS = {
    MEMBERS: 'family_app_members',
    EVENTS: 'family_app_events',
    EVENT_MEMBERS: 'family_app_event_members',
    DOCUMENTS: 'family_app_documents',
    USER: 'family_app_user',
    TASKS: 'family_app_tasks',
    CHAT_HISTORY: 'family_app_chat_history'
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

    if (!localStorage.getItem(STORAGE_KEYS.EVENTS)) {
        const initialEvents = [
            { 
                id: 1, 
                name: 'Cena Familiar', 
                event_date: new Date(Date.now() + 172800000).toISOString(), 
                event_type: 'familiar', 
                icon: 'fas fa-heart', 
                color: '#FF6B6B' 
            },
            { 
                id: 2, 
                name: 'Examen de Matemáticas', 
                event_date: new Date(Date.now() + 432000000).toISOString(), 
                event_type: 'examen', 
                icon: 'fas fa-book', 
                color: '#457ba4' 
            }
        ];
        setLocal(STORAGE_KEYS.EVENTS, initialEvents);
        
        // Asignar miembros al examen
        const initialEventMembers = [
            { event_id: 1, member_id: 1 },
            { event_id: 1, member_id: 2 },
            { event_id: 2, member_id: 3 } // Hijos tienen el examen
        ];
        setLocal(STORAGE_KEYS.EVENT_MEMBERS, initialEventMembers);
    }

    if (!localStorage.getItem(STORAGE_KEYS.TASKS)) {
        const initialTasks = [
            { id: 1, title: 'Comprar leche y pan', description: 'Para el desayuno de mañana', completed: false, assigned_to: 2, due_date: new Date().toISOString().split('T')[0] },
            { id: 2, title: 'Revisar calendario escolar', description: 'Verificar fechas de exámenes', completed: true, assigned_to: 1, due_date: new Date().toISOString().split('T')[0] },
            { id: 3, title: 'Organizar cena de cumpleaños', description: 'Llamar al restaurante y confirmar reserva', completed: false, assigned_to: 1, due_date: new Date(Date.now() + 86400000).toISOString().split('T')[0] }
        ];
        setLocal(STORAGE_KEYS.TASKS, initialTasks);
    }
};

console.log("🚀 Family API Service Initialized V1.1");

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

    // Tareas
    getTasks: async () => {
        return getLocal(STORAGE_KEYS.TASKS);
    },

    createTask: async (taskData) => {
        const tasks = getLocal(STORAGE_KEYS.TASKS);
        const newTask = {
            id: Date.now(),
            title: taskData.title,
            description: taskData.description || '',
            completed: false,
            assigned_to: taskData.assigned_to ? parseInt(taskData.assigned_to) : null,
            due_date: taskData.due_date || new Date().toISOString().split('T')[0],
            created_at: new Date().toISOString()
        };
        tasks.push(newTask);
        setLocal(STORAGE_KEYS.TASKS, tasks);
        return newTask;
    },

    updateTask: async (id, taskData) => {
        const tasks = getLocal(STORAGE_KEYS.TASKS);
        const index = tasks.findIndex(t => t.id === parseInt(id));
        if (index === -1) throw new Error('Tarea no encontrada');
        
        tasks[index] = { ...tasks[index], ...taskData };
        setLocal(STORAGE_KEYS.TASKS, tasks);
        return tasks[index];
    },

    deleteTask: async (id) => {
        let tasks = getLocal(STORAGE_KEYS.TASKS);
        tasks = tasks.filter(t => t.id !== parseInt(id));
        setLocal(STORAGE_KEYS.TASKS, tasks);
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
        try {
            // Obtener contexto completo de LocalStorage, pero limpiando campos pesados (imágenes/base64)
            const rawMembers = getLocal(STORAGE_KEYS.MEMBERS);
            const rawEvents = getLocal(STORAGE_KEYS.EVENTS);
            const tasks = getLocal(STORAGE_KEYS.TASKS);

            const members = rawMembers.map(({ avatar_data, avatar_type, ...rest }) => rest);
            const events = rawEvents.map(({ image_data, image_type, ...rest }) => rest);

            const context = { members, events, tasks };

            const response = await fetch('http://localhost:3001/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message, context })
            });

            if (!response.ok) throw new Error('Backend AI no disponible');
            
            const data = await response.json();
            
            // Procesar múltiples acciones automáticas si existen
            if (data.success && data.response.includes('[[ACTION:')) {
                const actionRegex = /\[\[ACTION:(\w+)\s+({.*?})\]\]/g;
                let match;
                while ((match = actionRegex.exec(data.response)) !== null) {
                    const actionType = match[1];
                    try {
                        const actionData = JSON.parse(match[2]);
                        console.log(`Ejecutando acción AI: ${actionType}`, actionData);
                        
                        switch (actionType) {
                            case 'CREATE_TASK':
                                await api.createTask(actionData);
                                break;
                            case 'UPDATE_TASK':
                                if (actionData.id) await api.updateTask(actionData.id, actionData);
                                break;
                            case 'DELETE_TASK':
                                if (actionData.id) await api.deleteTask(actionData.id);
                                break;
                            case 'CREATE_EVENT':
                                await api.createEvent(actionData);
                                break;
                            case 'UPDATE_EVENT':
                                if (actionData.id) await api.updateEvent(actionData.id, actionData);
                                break;
                            case 'DELETE_EVENT':
                                if (actionData.id) await api.deleteEvent(actionData.id);
                                break;
                            case 'CREATE_MEMBER':
                                await api.createMember(actionData);
                                break;
                            case 'UPDATE_MEMBER':
                                if (actionData.id) await api.updateMember(actionData.id, actionData);
                                break;
                            case 'DELETE_MEMBER':
                                if (actionData.id) await api.deleteMember(actionData.id);
                                break;
                            case 'DELETE_DOCUMENT':
                                if (actionData.id) await api.deleteDocument(actionData.id);
                                break;
                            case 'CLEAR_CHAT_HISTORY':
                                await api.clearChatHistory();
                                break;
                            default:
                                console.warn(`Acción desconocida: ${actionType}`);
                        }
                    } catch (e) {
                        console.error(`Error procesando acción ${actionType}:`, e);
                    }
                }
                // Limpiar todas las etiquetas de la respuesta visible
                data.response = data.response.replace(/\[\[ACTION:.*?\]\]/g, '').trim();
            }
            
            if (data.success) {
                // Guardar en historial local
                const history = getLocal(STORAGE_KEYS.CHAT_HISTORY);
                history.push({ type: 'user', content: message, timestamp: new Date().toISOString() });
                history.push({ type: 'assistant', content: data.response, timestamp: new Date().toISOString() });
                setLocal(STORAGE_KEYS.CHAT_HISTORY, history.slice(-50)); // Mantener últimos 50
            }

            return data;
        } catch (error) {
            // Fallback local rápido: responde siempre usando los datos de la app,
            // incluso si el modelo remoto está lento o no disponible.
            const members = getLocal(STORAGE_KEYS.MEMBERS);
            const events = getLocal(STORAGE_KEYS.EVENTS);
            const tasks = getLocal(STORAGE_KEYS.TASKS);

            const pendingTasks = tasks.filter(t => !t.completed);
            const completedTasks = tasks.filter(t => t.completed);
            const upcomingEvents = events
                .slice()
                .sort((a, b) => new Date(a.event_date) - new Date(b.event_date))
                .slice(0, 3);

            let quickSummary = "Te respondo en modo rápido local usando los datos que tengo guardados en la app:\n\n";
            quickSummary += `• Miembros: ${members.length}\n`;
            quickSummary += `• Eventos totales: ${events.length}\n`;
            quickSummary += `• Tareas pendientes: ${pendingTasks.length} | Completadas: ${completedTasks.length}\n\n`;

            if (upcomingEvents.length > 0) {
                quickSummary += "Próximos eventos destacados:\n";
                upcomingEvents.forEach(ev => {
                    const date = new Date(ev.event_date).toLocaleDateString();
                    quickSummary += `  - ${ev.name} (${ev.event_type || "evento"}) el ${date}\n`;
                });
                quickSummary += "\n";
            }

            quickSummary += "Aunque el asistente avanzado está tardando o fallando, puedes pedirme cosas como:\n";
            quickSummary += "• \"Muéstrame las tareas pendientes\"\n";
            quickSummary += "• \"Qué eventos hay esta semana\"\n";
            quickSummary += "• \"Qué miembro tiene el próximo examen\"\n";

            // save fallback into history as well so conversation is complete
            try {
                const hist = getLocal(STORAGE_KEYS.CHAT_HISTORY);
                hist.push({ type: 'user', content: message, timestamp: new Date().toISOString() });
                hist.push({ type: 'assistant', content: quickSummary, timestamp: new Date().toISOString() });
                setLocal(STORAGE_KEYS.CHAT_HISTORY, hist.slice(-50));
            } catch (e) {
                console.error('Error saving fallback chat history:', e);
            }

            if (error.name === 'AbortError') {
                console.warn('Asistente: petición abortada por timeout (demasiado lenta).');
                return {
                    success: true,
                    response: quickSummary
                };
            }

            console.error('Error llamando al asistente real:', error);
            return { 
                success: true, 
                response: quickSummary
            };
        }
    },

    getChatContext: async () => {
        const members = getLocal(STORAGE_KEYS.MEMBERS);
        const events = getLocal(STORAGE_KEYS.EVENTS);
        const tasks = getLocal(STORAGE_KEYS.TASKS);
        return { 
            success: true, 
            data: { members, events, tasks } 
        };
    },

    getChatHistory: async () => {
        const history = getLocal(STORAGE_KEYS.CHAT_HISTORY);
        return { success: true, data: history };
    },

    clearChatHistory: async () => {
        localStorage.removeItem(STORAGE_KEYS.CHAT_HISTORY);
        return { success: true };
    }
};

export default api;
