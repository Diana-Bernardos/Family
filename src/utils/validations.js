export const validateEventForm = (formData) => {
    const errors = {};
    
    if (!formData.name?.trim()) {
        errors.name = 'El nombre es obligatorio';
    }
    
    if (!formData.event_date) {
        errors.event_date = 'La fecha es obligatoria';
    }
    
    if (!formData.event_type) {
        errors.event_type = 'El tipo de evento es obligatorio';
    }
    
    return errors;
};