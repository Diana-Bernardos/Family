export const EVENT_TYPES = [
    { value: 'familiar', label: 'Evento Familiar' },
    { value: 'cumpleanos', label: 'Cumpleaños' },
    { value: 'reunion', label: 'Reunión' },
    { value: 'celebracion', label: 'Celebración' },
    { value: 'examen', label: 'Examen/Estudio' },
    { value: 'otro', label: 'Otro' }
];

export const ICONS = [
    { value: 'fas fa-birthday-cake', label: '🎂 Cumpleaños' },
    { value: 'fas fa-users', label: '👥 Reunión' },
    { value: 'fas fa-heart', label: '❤️ Familiar' },
    { value: 'fas fa-gift', label: '🎁 Celebración' },
    { value: 'fas fa-book', label: '📖 Examen/Estudio' },
    { value: 'fas fa-star', label: '⭐ Otro' }
];

export const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

export const DEFAULT_COLORS = [
    '#FF6B6B',
    '#4ECDC4',
    '#45B7D1',
    '#96CEB4',
    '#FFEEAD'
];