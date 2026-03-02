// backend/services/chatService.js
const pool = require('../config/database');
const axios = require('axios');
const config = require('../config/config');

class ChatService {
    static async getFullContext(userId) {
        try {
            const [events, members, tasks, reminders] = await Promise.all([
                this.getEvents(userId),
                this.getMembers(),
                this.getTasks(userId),
                this.getReminders(userId)
            ]);

            return {
                events,
                members,
                tasks,
                reminders
            };
        } catch (error) {
            console.error('Error getting context:', error);
            throw error;
        }
    }

    static async getEvents(userId) {
        try {
            const [events] = await pool.query(`
                SELECT e.*, em.member_id,
                       COALESCE(m.name, 'Sin asignar') as member_name
                FROM events e
                LEFT JOIN event_members em ON e.id = em.event_id
                LEFT JOIN members m ON em.member_id = m.id
                WHERE e.event_date >= CURDATE()
                ORDER BY e.event_date ASC
            `);
            return events;
        } catch (error) {
            console.error('Error getting events:', error);
            return [];
        }
    }

    static async getMembers() {
        try {
            const [members] = await pool.query(`
                SELECT m.*, COUNT(e.id) as total_events
                FROM members m
                LEFT JOIN event_members em ON m.id = em.member_id
                LEFT JOIN events e ON em.event_id = e.id
                GROUP BY m.id
            `);
            return members;
        } catch (error) {
            console.error('Error getting members:', error);
            return [];
        }
    }

    static async getTasks(userId) {
        try {
            const [tasks] = await pool.query(`
                SELECT * FROM tasks 
                WHERE user_id = ? AND completed = FALSE
                ORDER BY due_date ASC
            `, [userId]);
            return tasks;
        } catch (error) {
            console.error('Error getting tasks:', error);
            return [];
        }
    }

    static async getReminders(userId) {
        try {
            const [reminders] = await pool.query(`
                SELECT r.*, e.name as event_name
                FROM reminders r
                LEFT JOIN events e ON r.event_id = e.id
                WHERE r.user_id = ? AND r.status = 'active'
                ORDER BY reminder_date ASC
            `, [userId]);
            return reminders;
        } catch (error) {
            console.error('Error getting reminders:', error);
            return [];
        }
    }

    static createPrompt(message, context) {
        const { events, members, tasks, reminders } = context;

        return `Eres un asistente familiar especializado para nuestra aplicación. 
        Debes ayudar a gestionar la organización familiar respondiendo sobre:

        DATOS ACTUALES DE LA FAMILIA:

        EVENTOS PRÓXIMOS (${events.length}):
        ${events.map(e => 
            `- ${e.name} el ${new Date(e.event_date).toLocaleDateString('es-ES')} (Asignado a: ${e.member_name})`
        ).join('\n')}

        MIEMBROS DE LA FAMILIA (${members.length}):
        ${members.map(m => `- ${m.name}`).join('\n')}

        TAREAS PENDIENTES (${tasks.length}):
        ${tasks.map(t => 
            `- ${t.title} (Vence: ${new Date(t.due_date).toLocaleDateString('es-ES')})`
        ).join('\n')}

        RECORDATORIOS ACTIVOS (${reminders.length}):
        ${reminders.map(r => 
            `- ${r.title} ${r.event_name ? `para ${r.event_name}` : ''}`
        ).join('\n')}

        INSTRUCCIONES:
        1. Responde usando SOLO la información proporcionada arriba
        2. Si te preguntan por datos que no tienes, indícalo claramente
        3. Mantén un tono amigable y familiar
        4. Proporciona fechas en formato legible
        5. Sugiere acciones basadas en el contexto
        6. Si no entiendes algo, pide aclaración

        CONSULTA DEL USUARIO: ${message}`;
    }

    static async sendMessage(userId, message) {
        console.log('ChatService.sendMessage called', { userId, message });
        if (!userId || !message) {
            // validation early return
            const errMsg = 'userId y message son requeridos';
            console.error(errMsg);
            return { success: false, response: errMsg, error: errMsg };
        }

        try {
            // Primero verificar si el mensaje corresponde a alguna acción CRUD
            const actionResult = await this.handleAction(message, userId);
            if (actionResult && actionResult.handled) {
                // guardar en historial antes de devolver
                await this.saveInteraction(userId, message, actionResult.response || '', {});
                return actionResult;
            }

            // Obtener contexto actualizado
            const context = await this.getFullContext(userId);
            
            // Crear prompt con contexto
            const prompt = this.createPrompt(message, context);

            try {
                // Intentar con Ollama
                const response = await axios.post(`${config.OLLAMA_API_URL}/generate`, {
                    model: config.MODEL_NAME,
                    prompt: prompt,
                    options: config.OLLAMA_CONFIG
                }, { timeout: 10000 }); // Timeout de 10 segundos

                // Guardar interacción
                await this.saveInteraction(userId, message, response.data.response, context);

                return {
                    success: true,
                    response: response.data.response,
                    context: context
                };
            } catch (ollamaError) {
                // Si Ollama falla, proporcionar respuesta basada en contexto
                console.error('Ollama no disponible, usando respuesta contextual:', ollamaError.message);
                
                const fallbackResponse = this.generateFallbackResponse(message, context);
                
                // Guardar interacción con fallback
                await this.saveInteraction(userId, message, fallbackResponse, context);

                return {
                    success: true,
                    response: fallbackResponse,
                    context: context,
                    isFromCache: true
                };
            }
        } catch (error) {
            console.error('Error in sendMessage:', error);
            
            // Respuesta de emergencia si todo falla
            const emergencyResponse = `Lo siento, hubo un error procesando tu mensaje: ${error.message}. 
Por favor intenta de nuevo más tarde o verifica tu conexión.`;

            return {
                success: false,
                response: emergencyResponse,
                error: error.message
            };
        }
    }

    static async handleAction(message, userId) {
        const lower = message.toLowerCase();
        // crear evento simple: "crear evento llamado <nombre> para <YYYY-MM-DD>"
        const eventMatch = message.match(/crear evento llamado\s+"?(.+?)"?\s+(?:para|el)\s+(\d{4}-\d{2}-\d{2})/i);
        if (eventMatch) {
            const name = eventMatch[1];
            const date = eventMatch[2];
            try {
                await pool.query('INSERT INTO events (name, event_date) VALUES (?, ?)', [name, date]);
                return { handled: true, success: true, response: `✅ Evento "${name}" creado para el ${date}.` };
            } catch (err) {
                console.error('Error creating event via assistant:', err);
                return { handled: true, success: false, response: '❌ No pude crear el evento. Verifica la información.' };
            }
        }

        // crear miembro simple: "crear miembro llamado <nombre>" (opcional email despues)
        const memberMatch = message.match(/crear miembro llamado\s+"?(.+?)"?(?: con email (\S+))?/i);
        if (memberMatch) {
            const name = memberMatch[1];
            const email = memberMatch[2] || null;
            try {
                await pool.query('INSERT INTO members (name, email) VALUES (?, ?)', [name, email]);
                return { handled: true, success: true, response: `✅ Miembro "${name}" creado${email ? ' con email ' + email : ''}.` };
            } catch (err) {
                console.error('Error creating member via assistant:', err);
                return { handled: true, success: false, response: '❌ No pude crear el miembro. Puede que ya exista.' };
            }
        }

        // eliminar miembro: "eliminar miembro <nombre>"
        const deleteMatch = message.match(/eliminar miembro\s+"?(.+?)"?/i);
        if (deleteMatch) {
            const name = deleteMatch[1];
            try {
                const [rows] = await pool.query('SELECT id FROM members WHERE name = ? LIMIT 1', [name]);
                if (rows.length === 0) {
                    return { handled: true, success: false, response: `No encontré un miembro llamado "${name}".` };
                }
                await pool.query('DELETE FROM members WHERE id = ?', [rows[0].id]);
                return { handled: true, success: true, response: `🗑️ Miembro "${name}" eliminado.` };
            } catch (err) {
                console.error('Error deleting member via assistant:', err);
                return { handled: true, success: false, response: '❌ No pude eliminar el miembro.' };
            }
        }

        // mostrar calendario de miembro: "calendario del miembro <nombre>"
        const calMatch = message.match(/calendario (?:del |de )?miembro\s+"?(.+?)"?/i);
        if (calMatch) {
            const name = calMatch[1];
            try {
                const [members] = await pool.query('SELECT id FROM members WHERE name = ? LIMIT 1', [name]);
                if (members.length === 0) {
                    return { handled: true, success: true, response: `No encontré un miembro llamado "${name}".` };
                }
                const memberId = members[0].id;
                const [events] = await pool.query(
                    `SELECT name, event_date FROM events e
                     JOIN event_members em ON e.id = em.event_id
                     WHERE em.member_id = ?`,
                    [memberId]
                );
                if (events.length === 0) {
                    return { handled: true, success: true, response: `${name} no tiene eventos asignados.` };
                }
                const list = events.map(e => `${e.name} (${new Date(e.event_date).toLocaleDateString()})`).join('; ');
                return { handled: true, success: true, response: `Eventos de ${name}: ${list}` };
            } catch (err) {
                console.error('Error fetching member calendar via assistant:', err);
                return { handled: true, success: false, response: '❌ No pude obtener el calendario del miembro.' };
            }
        }

        // ninguna acción detectada
        return { handled: false };
    }

    static generateFallbackResponse(message, context) {
        const { events, members, tasks, reminders } = context;
        const lowerMessage = message.toLowerCase();

        // Respuestas contextuales cuando Ollama no está disponible
        if (lowerMessage.includes('evento') || lowerMessage.includes('próximo')) {
            if (events.length > 0) {
                const nextEvent = events[0];
                return `📅 Próximo evento: "${nextEvent.name}" el ${new Date(nextEvent.event_date).toLocaleDateString('es-ES')}. Tienes ${events.length} evento(s) programado(s).`;
            } else {
                return `No hay eventos programados actualmente.`;
            }
        }

        if (lowerMessage.includes('miembro') || lowerMessage.includes('familia')) {
            return `👨‍👩‍👧‍👦 Tu familia tiene ${members.length} miembro(s): ${members.map(m => m.name).join(', ')}.`;
        }

        if (lowerMessage.includes('tarea') || lowerMessage.includes('pendiente')) {
            if (tasks.length > 0) {
                return `✓ Tienes ${tasks.length} tarea(s) pendiente(s). Considera completarlas pronto.`;
            } else {
                return `¡No hay tareas pendientes! 🎉`;
            }
        }

        if (lowerMessage.includes('recordatorio') || lowerMessage.includes('avisar')) {
            return `🔔 Tienes ${reminders.length} recordatorio(s) activo(s).`;
        }

        // Respuesta genérica
        return `Entiendo que preguntabas: "${message}". Cuento con información de ${events.length} eventos, ${members.length} miembros y ${tasks.length} tareas. ¿Puedo ayudarte con algo específico?`;
    }

    static async generateSuggestions(context) {
        try {
            const { events, members, tasks } = context;
            
            const suggestionsPrompt = `Basándote en estos datos de familia:
            Eventos próximos: ${events.length}
            Miembros: ${members.map(m => m.name).join(', ')}
            Tareas pendientes: ${tasks.length}
            
            Genera 3 sugerencias breves y prácticas para organizar mejor a la familia.
            Responde SOLO con las 3 sugerencias numeradas, sin explicaciones adicionales.`;

            const response = await axios.post(`${config.OLLAMA_API_URL}/generate`, {
                model: config.MODEL_NAME,
                prompt: suggestionsPrompt,
                options: config.OLLAMA_CONFIG
            });

            return response.data.response.split('\n').filter(s => s.trim()).slice(0, 3);
        } catch (error) {
            console.error('Error generating suggestions:', error);
            return [];
        }
    }

    static async saveInteraction(userId, message, response, context) {
        try {
            await pool.query(
                'INSERT INTO chat_interactions (user_id, user_message, assistant_response, context, interaction_type, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
                [userId, message, response, JSON.stringify(context), 'message']
            );
        } catch (error) {
            console.error('Error saving interaction:', error);
            // No lanzar error, solo loguear
        }
    }
}

module.exports = ChatService;