// services/actionService.js
const axios = require('axios');
const config = require('../config/config');

class ActionService {
    static async handleAction(intentData, query, context) {
        const { intent, action } = intentData;
        
        const handler = this.getActionHandler(intent, action);
        if (handler) {
            return await handler(query, context);
        }

        return await this.getAIResponse(query, context);
    }

    static getActionHandler(intent, action) {
        const handlers = {
            calendar: {
                mostrar: this.handleCalendarShow,
                crear: this.handleCalendarCreate,
                eliminar: this.handleCalendarDelete
            },
            members: {
                mostrar: this.handleMembersShow,
                agregar: this.handleMembersAdd
            },
            tasks: {
                mostrar: this.handleTasksShow,
                crear: this.handleTasksCreate,
                completar: this.handleTasksComplete
            },
            reminders: {
                mostrar: this.handleRemindersShow,
                crear: this.handleRemindersCreate
            }
        };

        return handlers[intent]?.[action];
    }

    static async getAIResponse(query, context) {
        try {
            const prompt = this.createPrompt(query, context);
            
            const response = await axios.post(`${config.OLLAMA_API_URL}/generate`, {
                model: config.MODEL_NAME,
                prompt: prompt,
                options: {
                    temperature: 0.3,
                    top_k: 10,
                    top_p: 0.9,
                    num_ctx: 2048,
                    repeat_penalty: 1.2
                }
            });

            return {
                response: response.data.response,
                context: context
            };
        } catch (error) {
            console.error('Error AI response:', error);
            throw error;
        }
    }

    static createPrompt(query, context) {
        const { events, members, tasks, reminders } = context;
        
        function formatDate(date) {
            return new Date(date).toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }

        const eventsText = events?.map(event => 
            `- ${event.name} (${formatDate(event.event_date)}) - Asignado a: ${event.member_name}`
        ).join('\n') || 'No hay eventos';

        const membersText = members?.map(member => 
            `- ${member.name} (${member.email || 'Sin email'})`
        ).join('\n') || 'No hay miembros';

        const tasksText = tasks?.map(task => 
            `- ${task.title} (Vence: ${formatDate(task.due_date)})`
        ).join('\n') || 'No hay tareas';

        const remindersText = reminders?.map(reminder => 
            `- ${reminder.title} (${formatDate(reminder.reminder_date)})`
        ).join('\n') || 'No hay recordatorios';

        return `Eres un asistente especializado para nuestra aplicación de organización familiar.

DATOS ACTUALES DE LA FAMILIA:

EVENTOS PRÓXIMOS:
${eventsText}

MIEMBROS DE LA FAMILIA:
${membersText}

TAREAS PENDIENTES:
${tasksText}

RECORDATORIOS ACTIVOS:
${remindersText}

CAPACIDADES:
1. Gestionar el calendario familiar y eventos
2. Administrar información de miembros
3. Manejar tareas y recordatorios
4. Ayudar con la organización familiar
5. Proporcionar información sobre eventos próximos
6. Mostrar detalles de los miembros

INSTRUCCIONES:
- Usa solo la información proporcionada arriba
- Da respuestas específicas sobre esta familia
- Mantén un tono amigable y personal
- Si te preguntan por datos que no tienes, indícalo
- Proporciona fechas en formato legible
- Sugiere acciones basadas en el contexto familiar

CONSULTA DEL USUARIO: ${query}`;
    }

    // Handlers específicos para cada acción
    static async handleCalendarShow(query, context) {
        const { events } = context;
        return {
            response: `Aquí están los próximos eventos: ${events.map(e => 
                `${e.name} (${new Date(e.event_date).toLocaleDateString()})`
            ).join(', ')}`,
            context
        };
    }

    static async handleMembersShow(query, context) {
        const { members } = context;
        return {
            response: `Los miembros de la familia son: ${members.map(m => m.name).join(', ')}`,
            context
        };
    }

    static async handleTasksShow(query, context) {
        const { tasks } = context;
        return {
            response: `Tareas pendientes: ${tasks.map(t => t.title).join(', ')}`,
            context
        };
    }

    // Resto de handlers...
}

module.exports = ActionService;