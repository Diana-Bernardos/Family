// frontend/src/components/FloatingChat.jsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { useChatContext } from '../context/chatContext';
import { useAuth } from '../context/AuthContext';
import '../styles/FloatingChat.css';

const FloatingChat = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const chatBoxRef = useRef(null);

    const { context, loadContext, sendMessage } = useChatContext();

    const { user } = useAuth();

    // Cargar contexto cuando se abre el chat
    useEffect(() => {
        if (user?.id && isOpen) {
            loadContext(user.id).catch(err => {
                console.error('Error loading context:', err);
                setError('Error al cargar el contexto');
            });
        }
    }, [user?.id, isOpen, loadContext]);

    // Auto-scroll a últimos mensajes
    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    // Manejar envío de mensajes
    const handleSend = useCallback(async () => {
        const trimmedMessage = inputMessage.trim();
        if (!trimmedMessage || isLoading) return;

        try {
            setIsLoading(true);
            setError(null);
            
            // Mensaje del usuario
            const userMessage = {
                id: Date.now(),
                type: 'user',
                content: trimmedMessage
            };
            
            setMessages(prev => [...prev, userMessage]);
            setInputMessage('');

            // Obtener respuesta
            const response = await sendMessage(user.id, trimmedMessage);
            
            // Respuesta del asistente
            const assistantMessage = {
                id: Date.now() + 1,
                type: 'assistant',
                content: response.response || 'Lo siento, no pude procesar tu mensaje.'
            };
            
            setMessages(prev => [...prev, assistantMessage]);

        } catch (error) {
            console.error('Chat error:', error);
            setError(error.message || 'Error al procesar el mensaje');
            
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                type: 'error',
                content: 'Error al procesar el mensaje. Por favor, intenta de nuevo.'
            }]);
        } finally {
            setIsLoading(false);
            inputRef.current?.focus();
        }
    }, [inputMessage, isLoading, sendMessage, user]);

    const handleSubmit = useCallback((e) => {
        e.preventDefault();
        handleSend();
    }, [handleSend]);

    const handleKeyPress = useCallback((e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    }, [handleSend]);

    return (
        <div className="floating-chat-container">
            <button 
                className="chat-toggle-button"
                onClick={() => setIsOpen(!isOpen)}
                title={isOpen ? "Cerrar chat" : "Abrir chat"}
                aria-label={isOpen ? "Cerrar chat" : "Abrir chat"}
            >
                {isOpen ? <X className="icon" /> : <MessageCircle className="icon" />}
            </button>

            {isOpen && (
                <div className="chat-window" role="dialog" aria-labelledby="chat-header">
                    <div className="chat-header" id="chat-header">
                        <h5>Asistente Familiar</h5>
                        {error && <div className="error-badge">{error}</div>}
                    </div>

                    <div className="chat-messages" ref={chatBoxRef}>
                        {context?.suggestions?.map((suggestion, index) => (
                            <div key={`suggestion-${index}`} className="suggestion-message">
                                {suggestion}
                            </div>
                        ))}

                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`message-wrapper ${message.type}`}
                            >
                                <div className="message">
                                    <div className="message-content">
                                        {message.content}
                                    </div>
                                    {message.type === 'error' && (
                                        <button 
                                            onClick={handleSend} 
                                            className="retry-button"
                                        >
                                            Reintentar
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                        
                        {isLoading && (
                            <div className="message-wrapper">
                                <div className="message assistant">
                                    <div className="message-content typing">
                                        <div className="typing-indicator">
                                            <span></span>
                                            <span></span>
                                            <span></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <form 
                        onSubmit={handleSubmit}
                        className="chat-footer"
                    >
                        <input
                            ref={inputRef}
                            type="text"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Escribe un mensaje..."
                            disabled={isLoading}
                            className="chat-input"
                            maxLength={500}
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !inputMessage.trim()}
                            className="send-button"
                            aria-label="Enviar mensaje"
                        >
                            <Send size={20} />
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default FloatingChat;

