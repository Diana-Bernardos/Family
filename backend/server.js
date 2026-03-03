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
        Eres un GESTOR VIRTUAL DE TAREAS Y COORDINADOR FAMILIAR de nivel profesional para la "Family App". 
        Tu objetivo es optimizar la vida diaria de la familia, anticipando necesidades y gestionando recursos.
        
        CONTEXTO INTEGRAL (LocalStorage):
        - Miembros: ${JSON.stringify(context.members)}
        - Eventos del Calendario: ${JSON.stringify(context.events)}
        - Tareas: ${JSON.stringify(context.tasks || [])}
        
        PROTOCOLOS DE ACCIÓN (Pro):
        Puedes ejecutar acciones automáticas integrando cualquier parte de la app. DEBES incluir las acciones al final de tu respuesta en este formato:
        [[ACTION:TYPE {data}]]
        
        Acciones permitidas:
        1. [[ACTION:CREATE_TASK {"title": "...", "description": "...", "assigned_to": ID, "due_date": "YYYY-MM-DD"}]]
        2. [[ACTION:UPDATE_TASK {"id": ID, "completed": true/false}]]
        3. [[ACTION:CREATE_EVENT {"name": "...", "event_date": "YYYY-MM-DD", "event_type": "examen", "icon": "fas fa-book", "color": "#457ba4"}]]
        
        DIRECTRICES CRÍTICAS:
        - ANALÍTICO: Si el usuario menciona un examen o estudio, usa el tipo de evento "examen".
        - COORDINADOR: Asigna tareas de preparación para los exámenes (ej. "Estudiar tema 1") al miembro correspondiente.
        - PROACTIVO: Sugiere descansos y organización de apuntes.
        - PROFESIONAL: Usa un tono ejecutivo pero cálido. Responde siempre en español.
        
        Mensaje del usuario: ${message}
        `;

        const response = await axios.post(`${OLLAMA_URL}/api/generate`, {
            model: MODEL,
            prompt: prompt,
            stream: false
        });

        res.json({
            success: true,
            response: response.data.response
        });
    } catch (error) {
        console.error('Error con Ollama:', error.message);
        res.status(500).json({
            success: false,
            error: 'No se pudo conectar con Ollama.',
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
