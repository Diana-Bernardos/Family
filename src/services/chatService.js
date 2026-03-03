// frontend/src/services/chatService.js
// Pure service wrapper — the React context provider lives in context/chatContext.js
import { api } from './api';

const chatService = {
    sendMessage: async (userId, message) => {
        return api.sendChatMessage(userId, message);
    },

    getContext: async (userId) => {
        const response = await api.getChatContext(userId);
        return response?.data || null;
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

export default chatService;
export { chatService };
