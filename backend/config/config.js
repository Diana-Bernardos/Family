// config/config.js

const config = {
    OLLAMA_API_URL: 'http://localhost:11434/api',
    MODEL_NAME: 'phi3:3.8b',  // Usando phi3 para mejor rendimiento
    PORT: 3001,
    DB: {
        host: 'localhost',
        user: 'root',
        password: 'Dianaleire',
        database: 'calendar_app'
    },
    JWT_SECRET: 'tu_secreto_jwt',
    OLLAMA_CONFIG: {
        temperature: 0.3,  // Respuestas más precisas
        top_k: 10,
        top_p: 0.9,
        num_ctx: 2048,
        repeat_penalty: 1.2,
        stream: false
    }
};

module.exports = config;