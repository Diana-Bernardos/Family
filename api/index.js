// wrapper para Vercel
const app = require('../backend/server');

// Vercel ejecuta la función exportada
module.exports = (req, res) => {
    return app(req, res);
};