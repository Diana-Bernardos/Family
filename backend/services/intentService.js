// services/intentService.js
class IntentService {
    static analyzeIntent(query) {
        query = query.toLowerCase();
        
        // Analizar intención principal
        for (const [intent, data] of Object.entries(intents)) {
            if (data.keywords.some(keyword => query.includes(keyword))) {
                // Analizar acción específica
                const action = data.actions.find(action => query.includes(action)) || 'mostrar';
                return {
                    intent,
                    action,
                    confidence: this.calculateConfidence(query, data.keywords)
                };
            }
        }

        return {
            intent: 'general',
            action: 'mostrar',
            confidence: 0.5
        };
    }

    static calculateConfidence(query, keywords) {
        const matches = keywords.filter(keyword => query.includes(keyword)).length;
        return Math.min(matches / keywords.length, 0.9);
    }}
const intents = {
    calendar: {
        keywords: ['evento', 'calendario', 'fecha', 'cuando', 'programado', 'agenda'],
        actions: ['crear', 'mostrar', 'listar', 'eliminar', 'modificar']
    },
    members: {
        keywords: ['miembro', 'familia', 'quien', 'contacto', 'familiar'],
        actions: ['agregar', 'mostrar', 'eliminar', 'editar']
    },
    tasks: {
        keywords: ['tarea', 'pendiente', 'hacer', 'completar', 'actividad'],
        actions: ['crear', 'mostrar', 'completar', 'eliminar']
    },
    reminders: {
        keywords: ['recordatorio', 'recordar', 'avisar', 'notificar', 'alarma'],
        actions: ['crear', 'mostrar', 'eliminar', 'modificar']
    }
};




module.exports = IntentService;