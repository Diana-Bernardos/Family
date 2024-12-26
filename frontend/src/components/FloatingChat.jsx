import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import { MessageCircle, X } from 'lucide-react';
import '../styles/FloatingChat.css';
import ChatService from '../services/chatService';
import { useChatContext } from '../services/contextService';

const FloatingChat = memo(() => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const { context, loadContext } = useChatContext();

    useEffect(() => {
        const userId = 1; 
        loadContext(userId);
    }, [loadContext]);

    const handleSendMessage = async () => {
        const message = inputMessage.trim();
        if (message) {
            try {
                const { userMessage, assistantMessage } = await ChatService.sendMessage(
                    userId,
                    message
                );
                // Handle the user and assistant messages
            } catch (error) {
                console.error('Error sending message:', error);
                // Handle the error
            }
        }
    };

    // Optimized scroll to bottom effect
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    // Memoized send handler with improved error handling
    const handleSend = useCallback(async () => {
        const trimmedMessage = inputMessage.trim();
        
        if (!trimmedMessage) return;

        const userMessage = { 
            id: Date.now(), 
            type: 'user', 
            content: trimmedMessage 
        };

        try {
            setIsLoading(true);
            setMessages(prev => [...prev, userMessage]);
            setInputMessage('');

            const response = await fetch('http://localhost:3001/api/assistant/query', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    query: trimmedMessage,
                    type: 'general'
                }),
                timeout: 10000
            });

            if (!response.ok) {
                throw new Error('The request could not be processed');
            }

            const data = await response.json();
            
            const assistantMessage = { 
                id: Date.now() + 1, 
                type: 'assistant', 
                content: data.response || 'The response could not be processed'
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Chat error:', error);
            
            const errorMessage = { 
                id: Date.now() + 2, 
                type: 'error', 
                content: error.message || 'An error occurred while processing the message'
            };

            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
            inputRef.current?.focus();
        }
    }, [inputMessage]);

    const handleInputChange = useCallback((e) => {
        setInputMessage(e.target.value);
    }, []);

    const handleSubmit = useCallback((e) => {
        e.preventDefault();
        handleSend();
    }, [handleSend]);

    return (
        <div className="floating-chat-container">
            <button 
                className="chat-toggle-button"
                onClick={() => setIsOpen(!isOpen)}
                title={isOpen ? "Close chat" : "Open chat"}
                aria-label={isOpen ? "Close chat" : "Open chat"}
            >
                {isOpen ? (
                    <X className="icon" aria-hidden="true" />
                ) : (
                    <MessageCircle className="icon" aria-hidden="true" />
                )}
            </button>

            {isOpen && (
                <div className="chat-window" role="dialog" aria-labelledby="chat-header">
                    <div className="chat-header" id="chat-header">
                        <h5>Family Assistant</h5>
                        <button 
                            type="button" 
                            className="close-button"
                            onClick={() => setIsOpen(false)}
                            aria-label="Close chat"
                        >
                            <X size={20} aria-hidden="true" />
                        </button>
                    </div>

                    <div className="chat-messages" aria-live="polite">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`message-wrapper ${message.type === 'user' ? 'user' : ''}`}
                            >
                                <div className={`message ${message.type}`}>
                                    <div className="message-content">
                                        {message.content}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="message-wrapper">
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

                    <div className="chat-footer">
                        <form 
                            onSubmit={handleSubmit}
                            className="chat-form"
                            role="form"
                        >
                            <input
                                ref={inputRef}
                                type="text"
                                className="chat-input"
                                id="chat-input"
                                name="chat-input"
                                value={inputMessage}
                                onChange={handleInputChange}
                                placeholder="Enter your message here..."
                                disabled={isLoading}
                                autoComplete="off"
                                aria-label="Chat message"
                                maxLength={500}
                            />
                            <button
                                type="submit"
                                className="send-button"
                                disabled={isLoading || !inputMessage.trim()}
                                aria-label="Send message"
                            >
                                Send
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
});

FloatingChat.displayName = 'FloatingChat';

export default FloatingChat;
