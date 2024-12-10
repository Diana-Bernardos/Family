const errorHandler = (err, req, res, next) => {
    console.error(err.stack);

    if (err.name === 'MulterError') {
        return res.status(400).json({
            error: 'Error al subir el archivo',
            details: err.message
        });
    }

    if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({
            error: 'Ya existe un registro con esos datos'
        });
    }

    res.status(500).json({
        error: 'Error interno del servidor',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
};

module.exports = errorHandler;