// config/config.js
const config = {
    OLLAMA_API_URL: 'http://localhost:11434/api',
    MODEL_NAME: 'llama3.2:1b-instruct-fp16',
    PORT: 3001,
    DB: {
        host: 'localhost',
        user: 'root',
        password: 'Dianaleire',
        database: 'calendar_app'
    }
};

module.exports = config;