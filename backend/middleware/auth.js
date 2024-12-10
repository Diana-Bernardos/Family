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