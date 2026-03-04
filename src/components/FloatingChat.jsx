// frontend/src/components/FloatingChat.jsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, Bot } from 'lucide-react';
import { useChatContext } from '../context/chatContext';
import '../styles/FloatingChat.css';

const WELCOME_MESSAGE = {
    id: 'welcome',
    type: 'assistant',
    content: '¡Hola! 👋 Soy tu asistente familiar. Puedo ayudarte a:\n\n• 📅 Consultar eventos del calendario\n• 👨‍👩‍👧 Gestionar miembros de la familia\n• ➕ Crear eventos: "crear evento llamado Cena para 2026-04-01"\n• 📋 Ver tareas y recordatorios\n\n¿En qué te puedo ayudar hoy?'
};

const FloatingChat = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const { context, loadContext, sendMessage, history, loadHistory, clearHistory, isHistoryLoading } = useChatContext();

    // Usar userId genérico ya que no hay autenticación en el gestor familiar
    const userId = 1;

    // Cargar contexto + historial cuando se abre el chat
    useEffect(() => {
        if (isOpen) {
            loadContext(userId).catch(err => {
                console.error('Error loading context:', err);
            });
            loadHistory(userId).catch(err => {
                console.error('Error loading history:', err);
            });
            // Enfocar input al abrir
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen, loadContext, loadHistory]);

    // Sincronizar mensajes visibles con el historial cuando cambie
    useEffect(() => {
        if (!isOpen) return;

        if (history && history.length > 0) {
            const mapped = history.map((item, index) => ({
                // Forzar IDs únicos incluso si varias entradas comparten timestamp
                id: item.timestamp ? `${item.timestamp}-${index}` : `${item.type}-${index}`,
                type: item.type,
                content: item.content
            }));
            setMessages(mapped);
        } else {
            setMessages([WELCOME_MESSAGE]);
        }
    }, [history, isOpen]);

    // Auto-scroll a últimos mensajes
    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
            
            const userMessage = {
                id: Date.now(),
                type: 'user',
                content: trimmedMessage
            };
            
            setMessages(prev => [...prev, userMessage]);
            setInputMessage('');

            const response = await sendMessage(userId, trimmedMessage);
            
            let replyText;
            if (response && response.success === false) {
                replyText = response.error || response.response || 'Lo siento, ocurrió un problema.';
            } else {
                replyText = response?.response || 'Lo siento, no pude procesar tu mensaje.';
            }

            const assistantMessage = {
                id: Date.now() + 1,
                type: 'assistant',
                content: replyText
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
    }, [inputMessage, isLoading, sendMessage, userId]);

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

    const handleSuggestionClick = (suggestion) => {
        setInputMessage(suggestion);
        inputRef.current?.focus();
    };

    const handleClearHistory = async () => {
        try {
            await clearHistory();
            setMessages([WELCOME_MESSAGE]);
        } catch (e) {
            console.error('Error clearing history from chat:', e);
        }
    };

    const SUGGESTIONS = [
        'Hazme un resumen de eventos y tareas de esta semana',
        'Organiza un plan de estudio para el próximo examen',
        'Reparte tareas domésticas entre los miembros',
        'Mostrar próximos eventos importantes'
    ];

    return (
        <div className="floating-chat-container">
            <button 
                className={`chat-toggle-button ${isOpen ? 'open' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                title={isOpen ? 'Cerrar chat' : 'Abrir asistente familiar'}
                aria-label={isOpen ? 'Cerrar chat' : 'Abrir asistente familiar'}
            >
                {isOpen ? <X className="icon" /> : <Bot className="icon" />}
            </button>

            {isOpen && (
                <div className="chat-window" role="dialog" aria-labelledby="chat-header">
                    <div className="chat-header" id="chat-header">
                        <div className="chat-header-info">
                            <Bot size={20} />
                            <div>
                                <h5>Asistente Familiar</h5>
                                <span className="chat-status">
                                    {isLoading || isHistoryLoading ? 'Pensando...' : 'En línea para ayudarte'}
                                </span>
                            </div>
                        </div>
                        <div className="chat-header-actions">
                            <div className="chat-header-stats">
                                <span className="chat-chip">
                                    📅 {context.events?.length || 0} eventos
                                </span>
                                <span className="chat-chip">
                                    👨‍👩‍👧 {context.members?.length || 0} miembros
                                </span>
                                <span className="chat-chip">
                                    ✅ {context.tasks?.filter(t => t.completed).length || 0}/{context.tasks?.length || 0} tareas
                                </span>
                            </div>
                            <button
                                type="button"
                                className="chat-clear-button"
                                onClick={handleClearHistory}
                                title="Borrar conversación"
                            >
                                Limpiar
                            </button>
                            {error && <div className="error-badge">{error}</div>}
                        </div>
                    </div>

                    <div className="chat-messages">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`message-wrapper ${message.type}`}
                            >
                                {message.type === 'assistant' && (
                                    <div className="message-avatar">
                                        <Bot size={16} />
                                    </div>
                                )}
                                <div className="message">
                                    <div className="message-content" style={{ whiteSpace: 'pre-wrap' }}>
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
                            <div className="message-wrapper assistant">
                                <div className="message-avatar">
                                    <Bot size={16} />
                                </div>
                                <div className="message">
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

                    {messages.length === 1 && (
                        <div className="chat-suggestions">
                            {SUGGESTIONS.map((s, i) => (
                                <button
                                    key={i}
                                    className="suggestion-chip"
                                    onClick={() => handleSuggestionClick(s)}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    )}

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
                            <Send size={18} />
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default FloatingChat;
