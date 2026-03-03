const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Proxy para Ollama
app.post('/api/chat', async (req, res) => {
    const { message, context } = req.body;
    const OLLAMA_URL = process.env.OLLAMA_API_URL || 'http://localhost:11434';
    const MODEL = process.env.OLLAMA_MODEL || 'phi3';

    try {
        // Construir el prompt con el contexto de LocalStorage enviado desde el frontend
        const prompt = `
        Eres un asistente familiar para la "Family App". 
        Contexto actual de la familia (LocalStorage): ${JSON.stringify(context)}
        
        Pregunta del usuario: ${message}
        
        Responde de manera amable y útil. Si te preguntan por miembros o eventos, consulta el contexto proporcionado.
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
            error: 'No se pudo conectar con Ollama. Asegúrate de que esté ejecutándose localmente.',
            details: error.message
        });
    }
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', mode: 'hybrid-ai-proxy' });
});

app.listen(PORT, () => {
    console.log(`Backend AI Proxy ejecutándose en http://localhost:${PORT}`);
});
