// ============================================================
// Family App — API Service with Intelligent Local AI Assistant
// ============================================================
// All data lives in localStorage. The AI assistant works
// fully offline with a rich rules engine, and optionally
// upgrades to an Ollama/local backend if available.
// ============================================================

const STORAGE_KEYS = {
    MEMBERS:      'family_app_members',
    EVENTS:       'family_app_events',
    EVENT_MEMBERS: 'family_app_event_members',
    DOCUMENTS:    'family_app_documents',
    USER:         'family_app_user',
    TASKS:        'family_app_tasks',
    CHAT_HISTORY: 'family_app_chat_history'
};

const getLocal = (key, defaultValue = []) => {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    } catch { return defaultValue; }
};

const setLocal = (key, data) => {
    try { localStorage.setItem(key, JSON.stringify(data)); } catch(e) { console.error('localStorage error:', e); }
};

// ─── Seed inicial ────────────────────────────────────────────
const initializeData = () => {
    if (!localStorage.getItem(STORAGE_KEYS.MEMBERS)) {
        setLocal(STORAGE_KEYS.MEMBERS, [
            { id: 1, name: 'Mamá',  email: 'mama@family.com',  phone: '123456789' },
            { id: 2, name: 'Papá',  email: 'papa@family.com',  phone: '987654321' },
            { id: 3, name: 'Hijos', email: 'hijos@family.com', phone: '555555555' }
        ]);
    }
    if (!localStorage.getItem(STORAGE_KEYS.EVENTS)) {
        setLocal(STORAGE_KEYS.EVENTS, [
            { id: 1, name: 'Cena Familiar',         event_date: new Date(Date.now() + 172800000).toISOString(), event_type: 'familiar', icon: 'fas fa-heart',  color: '#FF6B6B' },
            { id: 2, name: 'Examen de Matemáticas', event_date: new Date(Date.now() + 432000000).toISOString(), event_type: 'examen',   icon: 'fas fa-book',   color: '#457ba4' }
        ]);
        setLocal(STORAGE_KEYS.EVENT_MEMBERS, [
            { event_id: 1, member_id: 1 },
            { event_id: 1, member_id: 2 },
            { event_id: 2, member_id: 3 }
        ]);
    }
    if (!localStorage.getItem(STORAGE_KEYS.TASKS)) {
        setLocal(STORAGE_KEYS.TASKS, [
            { id: 1, title: 'Comprar leche y pan',          description: 'Para el desayuno', completed: false, assigned_to: 2, due_date: new Date().toISOString().split('T')[0] },
            { id: 2, title: 'Revisar calendario escolar',    description: 'Fechas de exámenes', completed: true, assigned_to: 1, due_date: new Date().toISOString().split('T')[0] },
            { id: 3, title: 'Organizar cena de cumpleaños', description: 'Confirmar reserva', completed: false, assigned_to: 1, due_date: new Date(Date.now() + 86400000).toISOString().split('T')[0] }
        ]);
    }
};

initializeData();

// ─── Helpers ─────────────────────────────────────────────────

const formatDate = (dateStr) => {
    try {
        return new Date(dateStr).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
    } catch { return dateStr; }
};

const findMemberByName = (members, name) => {
    const n = name.toLowerCase();
    return members.find(m => m.name.toLowerCase().includes(n));
};

const findTaskByTitle = (tasks, title) => {
    const t = title.toLowerCase();
    return tasks.find(task => task.title.toLowerCase().includes(t));
};

// ─── Intelligent Local AI ────────────────────────────────────
// This engine handles user intents locally, without a server.

const ai = {
    process: async (message) => {
        const msg = message.toLowerCase().trim();
        const members  = getLocal(STORAGE_KEYS.MEMBERS);
        const events   = getLocal(STORAGE_KEYS.EVENTS);
        const tasks    = getLocal(STORAGE_KEYS.TASKS);

        // ── INTENCIÓN: resumen general ──────────────────────
        if (/resumen|qué hay|qu[eé] tengo|qu[eé] pasa|situaci[oó]n|estado/i.test(msg)) {
            const pending   = tasks.filter(t => !t.completed);
            const completed = tasks.filter(t =>  t.completed);
            const upcoming  = [...events].sort((a, b) => new Date(a.event_date) - new Date(b.event_date)).slice(0, 3);
            let r = `📊 *Resumen familiar*\n\n`;
            r += `👨‍👩‍👧 ${members.length} miembro${members.length !== 1 ? 's' : ''}: ${members.map(m => m.name).join(', ')}\n`;
            r += `📅 ${events.length} evento${events.length !== 1 ? 's' : ''} totales\n`;
            r += `✅ Tareas: ${pending.length} pendientes · ${completed.length} completadas\n\n`;
            if (upcoming.length) {
                r += `📌 Próximos eventos:\n`;
                upcoming.forEach(e => { r += `  • ${e.name} — ${formatDate(e.event_date)}\n`; });
            }
            if (pending.length) {
                r += `\n📋 Tareas pendientes:\n`;
                pending.slice(0, 4).forEach(t => { r += `  • ${t.title}${t.assigned_to ? ` (asignada a miembro ${t.assigned_to})` : ''}\n`; });
            }
            return r;
        }

        // ── INTENCIÓN: ver eventos ──────────────────────────
        if (/eventos?|calendario|agenda|pr[oó]xim/i.test(msg) && !/crea|añad|nueva|nuevo/i.test(msg)) {
            if (!events.length) return '📅 No hay eventos registrados. ¡Crea uno con el botón ➕!';
            const sorted = [...events].sort((a, b) => new Date(a.event_date) - new Date(b.event_date));
            let r = `📅 *Eventos registrados (${events.length}):*\n\n`;
            sorted.forEach(e => { r += `• ${e.name}\n  📆 ${formatDate(e.event_date)} · 🏷️ ${e.event_type || 'evento'}\n`; });
            return r;
        }

        // ── INTENCIÓN: ver tareas ──────────────────────────
        if (/tareas?|pendientes?|lista de|qu[eé] falta|recordatorio/i.test(msg) && !/crea|añad|nueva|nuevo/i.test(msg)) {
            const pending = tasks.filter(t => !t.completed);
            const done    = tasks.filter(t =>  t.completed);
            if (!tasks.length) return '📋 No hay tareas registradas aún.';
            let r = `📋 *Tareas familiares:*\n\n`;
            if (pending.length) {
                r += `⏳ Pendientes (${pending.length}):\n`;
                pending.forEach(t => { r += `  • ${t.title}${t.due_date ? ` — vence ${formatDate(t.due_date)}` : ''}\n`; });
            }
            if (done.length) {
                r += `\n✅ Completadas (${done.length}):\n`;
                done.slice(0, 3).forEach(t => { r += `  • ${t.title}\n`; });
            }
            return r;
        }

        // ── INTENCIÓN: ver miembros ─────────────────────────
        if (/miembros?|familia|qui[eé]n|personas?/i.test(msg) && !/crea|añad|nuevo|nueva/i.test(msg)) {
            if (!members.length) return '👨‍👩‍👧 No hay miembros registrados.';
            let r = `👨‍👩‍👧 *Miembros de la familia (${members.length}):*\n\n`;
            members.forEach(m => {
                r += `• ${m.name}`;
                if (m.email) r += `\n  📧 ${m.email}`;
                if (m.phone) r += `\n  📱 ${m.phone}`;
                r += '\n';
            });
            return r;
        }

        // ── INTENCIÓN: crear tarea ─────────────────────────
        const createTaskMatch = msg.match(/crea(?:r)?\s+(?:una?\s+)?tarea\s+(?:llamada?\s+|titulada?\s+)?['""]?([^'""\n]+?)['""]?(?:\s+para\s+(.+))?$/i)
            || msg.match(/a[ñn]ade?\s+(?:una?\s+)?tarea[:\s]+['""]?([^'""\n]+?)['""]?(?:\s+para\s+(.+))?$/i);
        if (createTaskMatch) {
            const title = createTaskMatch[1].trim();
            const rawDate = createTaskMatch[2];
            let due_date = new Date().toISOString().split('T')[0];
            if (rawDate) {
                if (/ma[ñn]ana/i.test(rawDate)) due_date = new Date(Date.now() + 86400000).toISOString().split('T')[0];
                else if (/pasado\s+ma[ñn]ana/i.test(rawDate)) due_date = new Date(Date.now() + 172800000).toISOString().split('T')[0];
                else if (/semana\s+que\s+viene|pr[oó]xima\s+semana/i.test(rawDate)) due_date = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
                else {
                    const parsed = new Date(rawDate);
                    if (!isNaN(parsed)) due_date = parsed.toISOString().split('T')[0];
                }
            }
            await api.createTask({ title, description: '', due_date });
            return `✅ ¡Tarea creada!\n\n📋 **${title}**\n📆 Vence: ${formatDate(due_date)}\n\nPuedes verla en la sección de tareas.`;
        }

        // ── INTENCIÓN: completar/marcar tarea ─────────────
        const completeTaskMatch = msg.match(/(?:marca(?:r)?|complet(?:ar)?|termina(?:r)?|haz\s+completada)\s+(?:la\s+tarea\s+)?['""]?(.+?)['""]?\s*(?:como\s+completada)?$/i);
        if (completeTaskMatch) {
            const title = completeTaskMatch[1].trim();
            const found = findTaskByTitle(tasks, title);
            if (found) {
                await api.updateTask(found.id, { completed: true });
                return `✅ ¡Tarea marcada como completada!\n\n📋 **${found.title}**\n\n¡Buen trabajo!`;
            }
            return `⚠️ No encontré ninguna tarea con ese nombre. Las tareas actuales son:\n${tasks.map(t => `• ${t.title}`).join('\n')}`;
        }

        // ── INTENCIÓN: eliminar tarea ──────────────────────
        const deleteTaskMatch = msg.match(/(?:elimina(?:r)?|borra(?:r)?|quita(?:r)?)\s+(?:la\s+tarea\s+)?['""]?(.+?)['""]?$/i);
        if (deleteTaskMatch && /tarea/i.test(msg)) {
            const title = deleteTaskMatch[1].trim();
            const found = findTaskByTitle(tasks, title);
            if (found) {
                await api.deleteTask(found.id);
                return `🗑️ Tarea eliminada: **${found.title}**`;
            }
            return `⚠️ No encontré la tarea "${title}". Tareas disponibles:\n${tasks.map(t => `• ${t.title}`).join('\n')}`;
        }

        // ── INTENCIÓN: crear evento ────────────────────────
        const createEventMatch = msg.match(/crea(?:r)?\s+(?:un\s+)?evento\s+(?:llamado?\s+|titulado?\s+)?['""]?([^'""\n]+?)['""]?\s+para\s+(.+)/i)
            || msg.match(/a[ñn]ade?\s+(?:un\s+)?evento[:\s]+['""]?([^'""\n]+?)['""]?\s+(?:el\s+|para\s+)?(.+)/i);
        if (createEventMatch) {
            const name     = createEventMatch[1].trim();
            const rawDate  = createEventMatch[2].trim();
            let event_date = new Date(Date.now() + 86400000).toISOString();
            if (/ma[ñn]ana/i.test(rawDate)) event_date = new Date(Date.now() + 86400000).toISOString();
            else {
                const parsed = new Date(rawDate);
                if (!isNaN(parsed)) event_date = parsed.toISOString();
            }
            const type = /exam[ae]n|escuel|class|clase|estudi/i.test(name) ? 'examen' : 'familiar';
            await api.createEvent({ name, event_date, event_type: type, icon: 'fas fa-calendar', color: '#457ba4' });
            return `📅 ¡Evento creado!\n\n🗓️ **${name}**\n📆 ${formatDate(event_date)}\n🏷️ Tipo: ${type}\n\nAparecerá en el calendario.`;
        }

        // ── INTENCIÓN: limpiar historial ───────────────────
        if (/limpi(?:a|ar)|borra(?:r)?\s+(?:el\s+)?historial|borrar\s+conversaci[oó]n|nueva\s+conversaci[oó]n/i.test(msg)) {
            await api.clearChatHistory();
            return '🗑️ Historial de conversación eliminado. ¡Empezamos de nuevo!\n\n¿En qué te puedo ayudar?';
        }

        // ── INTENCIÓN: ayuda / saludo ──────────────────────
        if (/hola|hey|buenas?|qu[eé]\s+puedes?|ayuda|help|qu[eé]\s+hac[ae]s?/i.test(msg)) {
            return `¡Hola! 👋 Soy tu asistente familiar.\n\nPuedo ayudarte a:\n\n📅 **Ver eventos:** "¿Qué eventos hay?"\n📋 **Ver tareas:** "Muéstrame las tareas"\n👨‍👩‍👧 **Ver familia:** "¿Quiénes son los miembros?"\n📊 **Resumen:** "Dame un resumen"\n\n➕ **Crear tarea:** "Crea una tarea llamada 'Comprar pan' para mañana"\n🗓️ **Crear evento:** "Crea un evento llamado 'Cena' para el 2026-04-15"\n✅ **Completar tarea:** "Marca la tarea 'Comprar pan' como completada"\n🗑️ **Borrar tarea:** "Elimina la tarea 'Comprar pan'"\n\n¿Qué necesitas?`;
        }

        // ── INTENCIÓN: organizar tareas domésticas ─────────
        if (/reparte?|distribuy(?:e|e)|asigna?|organiz(?:a|ar)?\s+tareas?/i.test(msg)) {
            if (!members.length) return '⚠️ No hay miembros registrados para asignar tareas.';
            const chores = ['Limpiar salón', 'Fregar los platos', 'Hacer la compra', 'Limpiar baño', 'Tender la ropa'];
            const shuffled = chores.sort(() => Math.random() - 0.5);
            let r = `🏠 **Plan de tareas domésticas:**\n\n`;
            members.forEach((m, i) => {
                const assigned = shuffled[i % shuffled.length];
                r += `• **${m.name}** → ${assigned}\n`;
            });
            r += `\n¿Quieres que cree estas tareas en la app?`;
            return r;
        }

        // ── INTENCIÓN: plan de estudio ─────────────────────
        if (/plan.*estudio|estudia(?:r)?|organiza.*examen|preparar.*examen/i.test(msg)) {
            const exams = events.filter(e => e.event_type === 'examen');
            if (!exams.length) return '📚 No hay exámenes registrados. Crea uno en el calendario y vuelvo a ayudarte con el plan.';
            let r = `📚 **Plan de estudio:**\n\n`;
            exams.forEach(exam => {
                const daysLeft = Math.ceil((new Date(exam.event_date) - Date.now()) / 86400000);
                r += `📖 **${exam.name}** — ${formatDate(exam.event_date)}\n`;
                if (daysLeft > 0) {
                    r += `  ⏳ ${daysLeft} día${daysLeft !== 1 ? 's' : ''} para estudiarlo\n`;
                    r += `  💡 Recomendación: ${Math.max(1, Math.floor(daysLeft / 3))}h/día\n`;
                } else {
                    r += `  ⚠️ ¡Ya pasó!\n`;
                }
                r += '\n';
            });
            return r;
        }

        // ── Fallback genérico ──────────────────────────────
        const pending   = tasks.filter(t => !t.completed);
        const nextEvent = [...events].sort((a, b) => new Date(a.event_date) - new Date(b.event_date))[0];
        let resp = `Entiendo que preguntas sobre: *"${message}"*\n\n`;
        if (nextEvent) resp += `📅 Próximo evento: **${nextEvent.name}** el ${formatDate(nextEvent.event_date)}\n`;
        if (pending.length) resp += `📋 Tienes **${pending.length}** tarea${pending.length !== 1 ? 's' : ''} pendiente${pending.length !== 1 ? 's' : ''}\n`;
        resp += `\nEscribe **"ayuda"** para ver todo lo que puedo hacer por ti.`;
        return resp;
    }
};

// ─── API EXPORT ───────────────────────────────────────────────
console.log('🚀 Family API Service Initialized V2.0');

export const api = {
    // Helper para convertir ArrayBuffer a Base64
    arrayBufferToBase64(buffer) {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
        return window.btoa(binary);
    },

    // ─── Eventos ────────────────────────────────────────────
    getEvents: async () => {
        const events      = getLocal(STORAGE_KEYS.EVENTS);
        const eventMembers = getLocal(STORAGE_KEYS.EVENT_MEMBERS);
        return events.map(event => ({
            ...event,
            participants: eventMembers.filter(em => em.event_id === event.id).map(em => em.member_id),
            image: event.image_data ? { data: event.image_data, type: event.image_type } : null
        }));
    },

    getEvent: async (id) => {
        const events      = getLocal(STORAGE_KEYS.EVENTS);
        const eventMembers = getLocal(STORAGE_KEYS.EVENT_MEMBERS);
        const event = events.find(e => e.id === parseInt(id));
        if (!event) throw new Error('Evento no encontrado');
        return {
            ...event,
            participants: eventMembers.filter(em => em.event_id === event.id).map(em => em.member_id),
            image: event.image_data ? { data: event.image_data, type: event.image_type } : null
        };
    },

    createEvent: async (eventData) => {
        const isFormData = eventData instanceof FormData;
        const fields     = isFormData ? Object.fromEntries(eventData.entries()) : { ...eventData };
        const participantsStr = isFormData ? eventData.get('members') : null;
        const participants    = participantsStr ? JSON.parse(participantsStr) : (eventData.participants || []);
        let final = { ...fields };
        delete final.members; delete final.participants;
        final.id = Date.now();
        final.created_at = new Date().toISOString();
        if (isFormData && eventData.get('image')) {
            const file = eventData.get('image');
            if (file instanceof File && file.size > 0) {
                const buf = await file.arrayBuffer();
                final.image_data = api.arrayBufferToBase64(buf);
                final.image_type = file.type;
            }
        }
        const events = getLocal(STORAGE_KEYS.EVENTS);
        events.push(final);
        setLocal(STORAGE_KEYS.EVENTS, events);
        if (participants && participants.length > 0) {
            const em = getLocal(STORAGE_KEYS.EVENT_MEMBERS);
            participants.forEach(mId => em.push({ event_id: final.id, member_id: parseInt(mId) }));
            setLocal(STORAGE_KEYS.EVENT_MEMBERS, em);
        }
        return final;
    },

    updateEvent: async (id, eventData) => {
        const isFormData = eventData instanceof FormData;
        const fields     = isFormData ? Object.fromEntries(eventData.entries()) : { ...eventData };
        const participantsStr = isFormData ? eventData.get('members') : null;
        const participants    = participantsStr ? JSON.parse(participantsStr) : eventData.participants;
        const events = getLocal(STORAGE_KEYS.EVENTS);
        const eventId = parseInt(id);
        const idx = events.findIndex(e => e.id === eventId);
        if (idx === -1) throw new Error('Evento no encontrado');
        let final = { ...events[idx], ...fields };
        delete final.members; delete final.participants;
        if (isFormData && eventData.get('image')) {
            const file = eventData.get('image');
            if (file instanceof File && file.size > 0) {
                const buf = await file.arrayBuffer();
                final.image_data = api.arrayBufferToBase64(buf);
                final.image_type = file.type;
            }
        }
        events[idx] = final;
        setLocal(STORAGE_KEYS.EVENTS, events);
        if (participants) {
            let em = getLocal(STORAGE_KEYS.EVENT_MEMBERS).filter(e => e.event_id !== eventId);
            participants.forEach(mId => em.push({ event_id: eventId, member_id: parseInt(mId) }));
            setLocal(STORAGE_KEYS.EVENT_MEMBERS, em);
        }
        return final;
    },

    deleteEvent: async (id) => {
        setLocal(STORAGE_KEYS.EVENTS,       getLocal(STORAGE_KEYS.EVENTS).filter(e => e.id !== parseInt(id)));
        setLocal(STORAGE_KEYS.EVENT_MEMBERS, getLocal(STORAGE_KEYS.EVENT_MEMBERS).filter(em => em.event_id !== parseInt(id)));
        return { success: true };
    },

    // ─── Miembros ──────────────────────────────────────────
    getMembers: async () => {
        return getLocal(STORAGE_KEYS.MEMBERS).map(m => ({
            ...m,
            avatar: m.avatar_data ? { data: m.avatar_data, type: m.avatar_type } : null
        }));
    },

    getMember: async (id) => {
        const member = getLocal(STORAGE_KEYS.MEMBERS).find(m => m.id === parseInt(id));
        if (!member) throw new Error('Miembro no encontrado');
        return { ...member, avatar: member.avatar_data ? { data: member.avatar_data, type: member.avatar_type } : null };
    },

    createMember: async (memberData) => {
        const isFormData = memberData instanceof FormData;
        const fields     = isFormData ? Object.fromEntries(memberData.entries()) : { ...memberData };
        let final = { ...fields, id: Date.now() };
        if (isFormData && memberData.get('avatar')) {
            const file = memberData.get('avatar');
            if (file instanceof File && file.size > 0) {
                const buf = await file.arrayBuffer();
                final.avatar_data = api.arrayBufferToBase64(buf);
                final.avatar_type = file.type;
            }
        }
        const members = getLocal(STORAGE_KEYS.MEMBERS);
        members.push(final);
        setLocal(STORAGE_KEYS.MEMBERS, members);
        return final;
    },

    updateMember: async (id, memberData) => {
        const isFormData = memberData instanceof FormData;
        const fields     = isFormData ? Object.fromEntries(memberData.entries()) : { ...memberData };
        const members = getLocal(STORAGE_KEYS.MEMBERS);
        const idx = members.findIndex(m => m.id === parseInt(id));
        if (idx === -1) throw new Error('Miembro no encontrado');
        let final = { ...members[idx], ...fields };
        if (isFormData && memberData.get('avatar')) {
            const file = memberData.get('avatar');
            if (file instanceof File && file.size > 0) {
                const buf = await file.arrayBuffer();
                final.avatar_data = api.arrayBufferToBase64(buf);
                final.avatar_type = file.type;
            }
        }
        members[idx] = final;
        setLocal(STORAGE_KEYS.MEMBERS, members);
        return final;
    },

    deleteMember: async (id) => {
        const mId = parseInt(id);
        setLocal(STORAGE_KEYS.MEMBERS,      getLocal(STORAGE_KEYS.MEMBERS).filter(m => m.id !== mId));
        setLocal(STORAGE_KEYS.EVENT_MEMBERS, getLocal(STORAGE_KEYS.EVENT_MEMBERS).filter(em => em.member_id !== mId));
        setLocal(STORAGE_KEYS.DOCUMENTS,    getLocal(STORAGE_KEYS.DOCUMENTS).filter(d => d.member_id !== mId));
        return { success: true };
    },

    getMemberEvents: async (id) => {
        const em     = getLocal(STORAGE_KEYS.EVENT_MEMBERS);
        const events = getLocal(STORAGE_KEYS.EVENTS);
        const ids    = em.filter(e => e.member_id === parseInt(id)).map(e => e.event_id);
        return events.filter(e => ids.includes(e.id)).map(e => ({
            ...e,
            image: e.image_data ? { data: e.image_data, type: e.image_type } : null
        }));
    },

    // ─── Documentos ────────────────────────────────────────
    uploadDocument: async (memberId, file) => {
        const buf = await file.arrayBuffer();
        const doc = {
            id: Date.now(),
            member_id: parseInt(memberId),
            document_name: file.name,
            document_type: file.type,
            file_data: api.arrayBufferToBase64(buf),
            file_size: file.size,
            created_at: new Date().toISOString()
        };
        const docs = getLocal(STORAGE_KEYS.DOCUMENTS);
        docs.push(doc);
        setLocal(STORAGE_KEYS.DOCUMENTS, docs);
        return doc;
    },

    getMemberDocuments: async (memberId) => getLocal(STORAGE_KEYS.DOCUMENTS).filter(d => d.member_id === parseInt(memberId)),

    deleteDocument: async (id) => {
        setLocal(STORAGE_KEYS.DOCUMENTS, getLocal(STORAGE_KEYS.DOCUMENTS).filter(d => d.id !== parseInt(id)));
        return { success: true };
    },

    // ─── Tareas ─────────────────────────────────────────────
    getTasks: async () => getLocal(STORAGE_KEYS.TASKS),

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
        const idx = tasks.findIndex(t => t.id === parseInt(id));
        if (idx === -1) throw new Error('Tarea no encontrada');
        tasks[idx] = { ...tasks[idx], ...taskData };
        setLocal(STORAGE_KEYS.TASKS, tasks);
        return tasks[idx];
    },

    deleteTask: async (id) => {
        setLocal(STORAGE_KEYS.TASKS, getLocal(STORAGE_KEYS.TASKS).filter(t => t.id !== parseInt(id)));
        return { success: true };
    },

    // ─── Auth Mock ──────────────────────────────────────────
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

    // ─── Chat / AI ──────────────────────────────────────────
    // Intentamos el backend Ollama primero. Si falla (sin servidor),
    // caemos al motor de IA local inteligente.
    sendChatMessage: async (userId, message) => {
        // 1. Intentar backend real SÓLO si está configurado explícitamente via REACT_APP_AI_BACKEND_URL
        //    Si la variable no está definida, ir directamente a la IA local (evita ERR_CONNECTION_REFUSED)
        const backendUrl = process.env.REACT_APP_AI_BACKEND_URL;

        if (backendUrl) {
        try {
            const rawMembers = getLocal(STORAGE_KEYS.MEMBERS).map(({ avatar_data, avatar_type, ...r }) => r);
            const rawEvents  = getLocal(STORAGE_KEYS.EVENTS).map(({ image_data, image_type, ...r }) => r);
            const tasks      = getLocal(STORAGE_KEYS.TASKS);

            const controller = new AbortController();
            const timeoutId  = setTimeout(() => controller.abort(), 8000); // 8s timeout

            const response = await fetch(`${backendUrl}/api/chat`, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ message, context: { members: rawMembers, events: rawEvents, tasks } }),
                signal:  controller.signal
            });
            clearTimeout(timeoutId);

            if (!response.ok) throw new Error('Backend AI no disponible');
            const data = await response.json();

            // Procesar acciones AI del backend
            if (data.success && data.response && data.response.includes('[[ACTION:')) {
                const actionRegex = /\[\[ACTION:(\w+)\s+({.*?})\]\]/gs;
                let match;
                while ((match = actionRegex.exec(data.response)) !== null) {
                    const actionType = match[1];
                    try {
                        const actionData = JSON.parse(match[2]);
                        console.log(`AI Backend Action: ${actionType}`, actionData);
                        switch (actionType) {
                            case 'CREATE_TASK':   await api.createTask(actionData); break;
                            case 'UPDATE_TASK':   if (actionData.id) await api.updateTask(actionData.id, actionData); break;
                            case 'DELETE_TASK':   if (actionData.id) await api.deleteTask(actionData.id); break;
                            case 'CREATE_EVENT':  await api.createEvent(actionData); break;
                            case 'UPDATE_EVENT':  if (actionData.id) await api.updateEvent(actionData.id, actionData); break;
                            case 'DELETE_EVENT':  if (actionData.id) await api.deleteEvent(actionData.id); break;
                            case 'CREATE_MEMBER': await api.createMember(actionData); break;
                            case 'UPDATE_MEMBER': if (actionData.id) await api.updateMember(actionData.id, actionData); break;
                            case 'DELETE_MEMBER': if (actionData.id) await api.deleteMember(actionData.id); break;
                            case 'DELETE_DOCUMENT': if (actionData.id) await api.deleteDocument(actionData.id); break;
                            case 'CLEAR_CHAT_HISTORY': await api.clearChatHistory(); break;
                            default: console.warn(`Acción desconocida: ${actionType}`);
                        }
                    } catch (e) { console.error(`Error procesando ${actionType}:`, e); }
                }
                data.response = data.response.replace(/\[\[ACTION:.*?\]\]/gs, '').trim();
            }

            if (data.success && data.response) {
                api._saveToHistory(message, data.response);
                return { success: true, response: data.response };
            }
        } catch (_err) {
            // Backend no disponible → usar IA local (silently)
        }
        } // end if (backendUrl)

        // 2. Motor de IA local inteligente
        try {
            const localResponse = await ai.process(message);
            api._saveToHistory(message, localResponse);
            return { success: true, response: localResponse };
        } catch (err) {
            console.error('Error en IA local:', err);
            return {
                success: true,
                response: '⚠️ Lo siento, ocurrió un error en el asistente. Por favor, inténtalo de nuevo.'
            };
        }
    },

    _saveToHistory: (userMsg, assistantMsg) => {
        try {
            const history = getLocal(STORAGE_KEYS.CHAT_HISTORY);
            history.push({ type: 'user',      content: userMsg,      timestamp: new Date().toISOString() });
            history.push({ type: 'assistant', content: assistantMsg, timestamp: new Date().toISOString() });
            setLocal(STORAGE_KEYS.CHAT_HISTORY, history.slice(-60));
        } catch (e) { console.error('Error guardando historial:', e); }
    },

    getChatContext: async () => {
        const members = getLocal(STORAGE_KEYS.MEMBERS);
        const events  = getLocal(STORAGE_KEYS.EVENTS);
        const tasks   = getLocal(STORAGE_KEYS.TASKS);
        return { success: true, data: { members, events, tasks } };
    },

    getChatHistory: async () => {
        return { success: true, data: getLocal(STORAGE_KEYS.CHAT_HISTORY) };
    },

    clearChatHistory: async () => {
        localStorage.removeItem(STORAGE_KEYS.CHAT_HISTORY);
        return { success: true };
    }
};

export default api;
