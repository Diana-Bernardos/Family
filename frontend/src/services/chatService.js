// src/services/chatService.js
import React, { createContext, useState, useContext, useCallback } from 'react';
import { chatbotService } from './chatbotService';
import authenticatedRequest from './authenticatedRequest';  // O la ruta correcta
 // Asegúrate de tener el chatbotService disponible

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

    // Cargar el contexto desde el chatbotService
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

    const authenticatedRequest = async (config) => {
        const token = localStorage.getItem('authToken');  // Asegúrate de que el token esté almacenado
        if (!token) {
            throw new Error('Token de autenticación no encontrado');
        }
        
        const headers = {
            ...config.headers,
            Authorization: `Bearer ${token}`,
        };
    
        try {
            const response = await axios({
                ...config,
                headers,
            });
            return response;
        } catch (error) {
            throw new Error(`Error al hacer la solicitud: ${error.message}`);
        }
    };
    

    // Definir la función sendMessage
    const sendMessage = async (userId, message) => {
        try {
            const response = await authenticatedRequest({
                method: 'POST',
                url: '/chat/send',
                data: { userId, message },
            });
            return response.data;
        } catch (error) {
            console.error('Error al enviar el mensaje:', error);
            throw error;
        }
    };
    // El valor proporcionado al contexto debe incluir la función sendMessage
    const value = {
        context,
        sendMessage,
        loadContext
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
};

// Hook personalizado para acceder al contexto
export const useChatContext = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChatContext must be used within a ChatContextProvider');
    }
    return context;
};
