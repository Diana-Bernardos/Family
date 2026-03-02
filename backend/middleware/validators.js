// backend/middleware/validators.js
const validateEventCreation = (req, res, next) => {
    const { name, event_date } = req.body;

    // Validación básica
    if (!name || name.trim() === '') {
        return res.status(400).json({ 
            success: false,
            error: 'El nombre del evento es requerido' 
        });
    }

    if (!event_date) {
        return res.status(400).json({ 
            success: false,
            error: 'La fecha del evento es requerida' 
        });
    }

    // Validar formato de fecha
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(event_date)) {
        return res.status(400).json({ 
            success: false,
            error: 'Formato de fecha inválido (debe ser YYYY-MM-DD)' 
        });
    }

    // Validar que la fecha no sea una fecha pasada (opcional)
    const eventDateObj = new Date(event_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Permitir crear eventos en el pasado, solo validar que sea una fecha válida
    if (isNaN(eventDateObj.getTime())) {
        return res.status(400).json({ 
            success: false,
            error: 'La fecha del evento no es válida' 
        });
    }

    next();
};

const validateMemberCreation = (req, res, next) => {
    const { name, email } = req.body;

    if (!name || name.trim() === '') {
        return res.status(400).json({ 
            success: false,
            error: 'El nombre del miembro es requerido' 
        });
    }

    if (email && !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        return res.status(400).json({ 
            success: false,
            error: 'El email no es válido' 
        });
    }

    next();
};

const validateFileSize = (maxSizeMB = 5) => {
    return (req, res, next) => {
        if (req.file) {
            const maxSizeBytes = maxSizeMB * 1024 * 1024;
            if (req.file.size > maxSizeBytes) {
                return res.status(400).json({ 
                    success: false,
                    error: `El archivo es demasiado grande (máximo ${maxSizeMB}MB)` 
                });
            }
        }
        next();
    };
};

const errorHandler = (error, req, res, next) => {
    console.error('Error:', error);

    // Errores de validación de MySQL
    if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ 
            success: false,
            error: 'El registro ya existe (violación de restricción única)' 
        });
    }

    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
        return res.status(400).json({ 
            success: false,
            error: 'El registro referenciado no existe' 
        });
    }

    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
        return res.status(500).json({ 
            success: false,
            error: 'Error de acceso a la base de datos' 
        });
    }

    // Error genérico
    res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
};

module.exports = {
    validateEventCreation,
    validateMemberCreation,
    validateFileSize,
    errorHandler
};
