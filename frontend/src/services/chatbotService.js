// src/services/chatbotService.js
import { api } from './api';

export const chatbotService = {
    sendMessage: async (userId, message) => {
        try {
            const response = await api.sendChatMessage(userId, message);
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

    getSuggestions: async (userId) => {
        try {
            const response = await api.getChatSuggestions(userId);
            return response.data;
        } catch (error) {
            console.error('Error getting suggestions:', error);
            return [];
        }
    }
};