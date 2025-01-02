// frontend/src/services/chatbotService.js
import { api } from './api';

export const chatbotService = {
    sendMessage: async (userId, message) => {
        try {
            const response = await api.sendChatMessage(userId, message);
            if (!response.success) {
                throw new Error(response.error || 'Error al enviar mensaje');
            }
            return response;
        } catch (error) {
            console.error('Error in chatbot service:', error);
            throw error;
        }
    },

    getContext: async (userId) => {
        try {
            const response = await api.getChatContext(userId);
            return response.data;
        } catch (error) {
            console.error('Error getting context:', error);
            return null;
        }
    },

    getHistory: async (userId) => {
        try {
            const response = await api.getChatHistory(userId);
            return response.data;
        } catch (error) {
            console.error('Error getting history:', error);
            return [];
        }
    }
};

export default chatbotService;