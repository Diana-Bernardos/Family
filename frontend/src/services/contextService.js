import React, { createContext, useState, useContext, useCallback } from 'react';
import axios from 'axios';

const ChatContext = createContext(null);

export const ChatContextProvider = ({ children }) => {
  const [context, setContext] = useState({
    events: [],
    documents: [],
    chatHistory: [],
  });

  const loadContext = useCallback(async (userId) => {
    try {
      const response = await axios.get(`/api/context/${userId}`, {
        headers: {
          'Cache-Control': 'max-age=300',
        },
      });
      setContext(response.data);
    } catch (error) {
      console.error('Error loading context:', error);
    }
  }, []);

  const clearContext = useCallback(() => {
    setContext({
      events: [],
      documents: [],
      chatHistory: [],
    });
  }, []);

  const contextValue = {
    context,
    loadContext,
    clearContext,
  };

  return (
    <ChatContext.Provider value={contextValue}>
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

 