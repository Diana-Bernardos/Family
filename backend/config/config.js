// config/config.js

const config = {
    OLLAMA_API_URL: process.env.OLLAMA_API_URL || 'http://localhost:11434/api',
    MODEL_NAME: process.env.MODEL_NAME || 'phi3:3.8b',  // Usando phi3 para mejor rendimiento
    PORT: process.env.PORT || 3001,
    DB: {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'Dianaleire',
        database: process.env.DB_NAME || 'calendar_app'
    },
    JWT_SECRET: process.env.JWT_SECRET || 'tu_secreto_jwt',
    OLLAMA_CONFIG: {
        temperature: parseFloat(process.env.OLLAMA_TEMP) || 0.3,  // Respuestas más precisas
        top_k: parseInt(process.env.OLLAMA_TOP_K) || 10,
        top_p: parseFloat(process.env.OLLAMA_TOP_P) || 0.9,
        num_ctx: parseInt(process.env.OLLAMA_NUM_CTX) || 2048,
        repeat_penalty: parseFloat(process.env.OLLAMA_REPEAT_PENALTY) || 1.2,
        stream: process.env.OLLAMA_STREAM === 'true' || false
    }
};

module.exports = config;