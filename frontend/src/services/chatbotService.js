// frontend/src/services/chatbotService.js
import { api } from './api';

export const chatbotService = {
    sendMessage: async (userId, message) => {
        try {
            const response = await api.sendChatMessage(userId, message);
            // Return the full response object regardless of success flag
            // Let the component decide how to handle success:false responses
            return response;
        } catch (error) {
            console.error('Error in chatbot service:', error);
            return { success: false, response: 'Error de conexión con el asistente.', error: error.message };
        }
    },

    getContext: async (userId) => {
        try {
            const response = await api.getChatContext(userId);
            return response?.data || null;
        } catch (error) {
            console.error('Error getting context:', error);
            return null;
        }
    },

    getHistory: async (userId) => {
        try {
            const response = await api.getChatHistory(userId);
            return response?.data || [];
        } catch (error) {
            console.error('Error getting history:', error);
            return [];
        }
    }
};

export default chatbotService;