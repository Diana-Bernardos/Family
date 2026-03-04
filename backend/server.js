const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Proxy para Ollama con capacidades de Gestor de Tareas
app.post('/api/chat', async (req, res) => {
    const { message, context } = req.body;
    const OLLAMA_URL = process.env.OLLAMA_API_URL || 'http://localhost:11434';
    const MODEL = process.env.OLLAMA_MODEL || 'phi3';

    try {
        const prompt = `
Eres un ASISTENTE VIRTUAL FAMILIAR PREMIUM para la "Family App".
Tu misión es ayudar a organizar la vida familiar de forma clara y rápida.

RESUMEN DE DATOS (JSON sin imágenes):
- Miembros: ${JSON.stringify(context.members)}
- Eventos: ${JSON.stringify(context.events)}
- Tareas: ${JSON.stringify(context.tasks || [])}

MODO DE RESPUESTA:
- Siempre responde en español, con tono cercano y positivo.
- Empieza con 1 frase corta resumiendo la situación.
- Después usa viñetas claras con lo que haces o recomiendas.
- Si tiene sentido, propone un siguiente paso (“Lo siguiente que te recomiendo es…”).
- Al final, si corresponde, incluye UNA O VARIAS acciones en ESTE formato exacto (JSON válido):
  [[ACTION:TYPE {"campo": "valor"}]]

ACCIONES PERMITIDAS (puedes usar varias a la vez, cada una en su propia línea):
1. Crear tarea:
   [[ACTION:CREATE_TASK {"title": "texto", "description": "opcional", "assigned_to": ID_MIEMBRO_O_NULL, "due_date": "YYYY-MM-DD"}]]
2. Actualizar tarea (por ejemplo marcar como completada o reasignar):
   [[ACTION:UPDATE_TASK {"id": ID_TAREA, "completed": true, "assigned_to": ID_MIEMBRO_O_NULL}]]
3. Eliminar tarea:
   [[ACTION:DELETE_TASK {"id": ID_TAREA}]]

4. Crear evento:
   [[ACTION:CREATE_EVENT {"name": "texto", "event_date": "YYYY-MM-DD", "event_type": "familiar|examen|otro", "icon": "fas fa-heart", "color": "#FF6B6B"}]]
5. Actualizar evento (solo campos cambiados):
   [[ACTION:UPDATE_EVENT {"id": ID_EVENTO, "name": "nuevo nombre opcional", "event_date": "YYYY-MM-DD opcional"}]]
6. Eliminar evento:
   [[ACTION:DELETE_EVENT {"id": ID_EVENTO}]]

7. Crear miembro de la familia (sin avatar, solo datos básicos):
   [[ACTION:CREATE_MEMBER {"name": "Nombre", "email": "correo@ejemplo.com", "phone": "teléfono opcional"}]]
8. Actualizar miembro de la familia:
   [[ACTION:UPDATE_MEMBER {"id": ID_MIEMBRO, "name": "nuevo nombre opcional", "email": "nuevo correo opcional", "phone": "nuevo teléfono opcional"}]]
9. Eliminar miembro de la familia:
   [[ACTION:DELETE_MEMBER {"id": ID_MIEMBRO}]]

10. Eliminar documento asociado a un miembro (por ejemplo si ha caducado):
   [[ACTION:DELETE_DOCUMENT {"id": ID_DOCUMENTO}]]

11. Limpiar el historial de chat (por ejemplo cuando el usuario pide “borra la conversación”):
   [[ACTION:CLEAR_CHAT_HISTORY {}]]

DIRECTRICES:
- Analiza el mensaje del usuario y estos datos antes de crear o modificar nada.
- Si habla de estudios o exámenes, usa event_type "examen" y propone tareas de estudio.
- Si no estás seguro del ID de tarea, evento, miembro o documento, pide aclaración antes de inventarlo.
- No incluyas las etiquetas [[ACTION:...]] dentro del texto normal, solo al final.

MENSAJE DEL USUARIO:
${message}
`;

        const response = await axios.post(
            `${OLLAMA_URL}/api/generate`,
            {
                model: MODEL,
                prompt,
                stream: false,
                options: {
                    // Respuestas más cortas y rápidas
                    num_predict: 96,
                    temperature: 0.5
                }
            },
            {
                // Timeout algo más amplio, pero razonable
                timeout: 20000
            }
        );

        res.json({
            success: true,
            response: response.data.response
        });
    } catch (error) {
        const isTimeout =
            error.code === 'ECONNABORTED' ||
            (error.message && error.message.toLowerCase().includes('timeout'));

        console.error('Error con Ollama:', error.message);
        res.status(500).json({
            success: false,
            error: isTimeout
                ? 'El modelo está tardando demasiado en responder. He cortado la petición para mantener la app rápida.'
                : 'No se pudo conectar con Ollama.',
            details: error.message
        });
    }
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', mode: 'pro-task-manager-proxy' });
});

app.listen(PORT, () => {
    console.log(`Backend AI Proxy (Pro Task Manager) en http://localhost:${PORT}`);
});
