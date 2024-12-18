
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    try {
        // Obtener el token del header
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ error: 'Acceso denegado' });
        }

        // Verificar token
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Token inválido' });
    }
};


const validateEvent = (req, res, next) => {
    const { name, event_date } = req.body;
    if (!name || !event_date) {
        return res.status(400).json({ error: 'Nombre y fecha son requeridos' });
    }
    next();
};

const validateMember = (req, res, next) => {
    const { name, email } = req.body;
    if (!name || !email) {
        return res.status(400).json({ error: 'Nombre y email son requeridos' });
    }
    next();
};

module.exports = { validateEvent, validateMember };