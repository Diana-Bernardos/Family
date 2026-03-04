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
    const [history, setHistory] = useState([]);
    const [isHistoryLoading, setIsHistoryLoading] = useState(false);

    const loadContext = useCallback(async (userId) => {
        try {
            if (typeof api.getChatContext !== 'function') {
                console.warn('⚠️ api.getChatContext is not defined. Using default empty context.');
                return;
            }
            const response = await api.getChatContext(userId);
            if (response.success) {
                setContext(response.data);
            }
        } catch (error) {
            console.error('Error loading context:', error);
        }
    }, []);

    const loadHistory = useCallback(async (userId) => {
        try {
            if (typeof api.getChatHistory !== 'function') {
                console.warn('⚠️ api.getChatHistory is not defined. Using empty history.');
                return;
            }
            setIsHistoryLoading(true);
            const response = await api.getChatHistory(userId);
            if (response.success) {
                setHistory(response.data || []);
            }
        } catch (error) {
            console.error('Error loading chat history:', error);
        } finally {
            setIsHistoryLoading(false);
        }
    }, []);

    const clearHistory = useCallback(async () => {
        try {
            if (typeof api.clearChatHistory !== 'function') {
                console.warn('⚠️ api.clearChatHistory is not defined.');
                return;
            }
            await api.clearChatHistory();
            setHistory([]);
        } catch (error) {
            console.error('Error clearing chat history:', error);
        }
    }, []);

    const sendMessage = useCallback(async (userId, message) => {
        // siempre devolvemos el objeto obtenido, aunque indique success:false
        const response = await api.sendChatMessage(userId, message);
        // refrescar historial para que quede siempre sincronizado
        loadHistory(userId).catch(err => {
            console.error('Error refreshing history after sendMessage:', err);
        });
        return response;
    }, [loadHistory]);

    return (
        <ChatContext.Provider value={{
            context,
            loadContext,
            sendMessage,
            history,
            loadHistory,
            clearHistory,
            isHistoryLoading
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