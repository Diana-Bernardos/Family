// utils/aiHelpers.js
export const processAIResponse = (response) => {
    return {
        message: response.text,
        suggestions: response.suggestions,
        events: response.events,
        confidence: response.confidence
    };
};

export const formatEventForAI = (event) => {
    return {
        id: event.id,
        title: event.title,
        date: event.date,
        type: event.type,
        participants: event.participants,
        location: event.location,
        category: event.category
    };
};