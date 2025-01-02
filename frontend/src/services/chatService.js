// src/services/chatService.js
import React, { createContext, useState, useContext, useCallback } from 'react';
import { chatbotService } from './chatbotService';

const ChatContext = createContext(null);

export const ChatContextProvider = ({ children }) => {
    const [context, setContext] = useState({
        events: [],
        members: [],
        tasks: [],
        reminders: [],
        chatHistory: [],
        suggestions: []
    });
    const sendMessage = useCallback(async (userId, message) => {
        try {
            return await chatbotService.sendMessage(userId, message);
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    }, []);

    const loadContext = useCallback(async (userId) => {
        try {
            const contextData = await chatbotService.getContext(userId);
            if (contextData) {
                setContext(prev => ({
                    ...prev,
                    ...contextData
                }));
            }
        } catch (error) {
            console.error('Error loading context:', error);
        }
    }, []);

    const sendMessage = useCallback(async (userId, message) => {
        try {
            const response = await chatbotService.sendMessage(userId, message);
            return response;
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    }, []);

    const value = {
        context,
        loadContext,
        sendMessage
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChatContext = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChatContext must be used within a ChatContextProvider');
    }
    return context;
};