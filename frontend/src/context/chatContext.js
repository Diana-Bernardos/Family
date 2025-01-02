// frontend/src/context/chatContext.js
import React, { createContext, useState, useContext, useCallback } from 'react';
import { api } from '../services/api';

const ChatContext = createContext(null);

export const ChatContextProvider = ({ children }) => {
    const [context, setContext] = useState({
        events: [],
        members: [],
        tasks: [],
        reminders: []
    });

    const loadContext = useCallback(async (userId) => {
        try {
            const response = await api.getChatContext(userId);
            if (response.success) {
                setContext(response.data);
            }
        } catch (error) {
            console.error('Error loading context:', error);
        }
    }, []);

    const sendMessage = useCallback(async (userId, message) => {
        try {
            const response = await api.sendChatMessage(userId, message);
            return response;
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    }, []);

    return (
        <ChatContext.Provider value={{
            context,
            loadContext,
            sendMessage
        }}>
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