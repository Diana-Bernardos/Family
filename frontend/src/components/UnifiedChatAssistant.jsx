import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import UnifiedAssistantService from '../services/UnifiedAssistantService';

const UnifiedChatAssistant = ({ userId }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        try {
            setLoading(true);
            setMessages(prev => [...prev, { type: 'user', text: input }]);
            
            const response = await UnifiedAssistantService.processQuery(input, userId);
            
            setMessages(prev => [...prev, { 
                type: 'bot', 
                text: response.text || response.response || 'No se pudo procesar la respuesta'
            }]);
            
            setInput('');
        } catch (error) {
            console.error('Error:', error);
            setMessages(prev => [...prev, { 
                type: 'error', 
                text: 'Error al procesar tu mensaje.' 
            }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="chatbot-container">
            {!isOpen ? (
                <button 
                    onClick={() => setIsOpen(true)}
                    className="chat-button"
                >
                    <MessageCircle className="chat-icon" size={24} />
                </button>
            ) : (
                <div className="chat-window">
                    <div className="chat-header">
                        <div className="flex items-center gap-2">
                            <MessageCircle size={20} />
                            <span className="font-medium">Chat Familiar</span>
                        </div>
                        <button 
                            onClick={() => setIsOpen(false)}
                            className="hover:bg-blue-600 rounded-full p-1 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="messages-area">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`message ${msg.type}`}>
                                <div className="message-content">
                                    {msg.text}
                                </div>
                                {loading && msg.type === 'user' && idx === messages.length - 1 && (
                                    <div className="typing-indicator">
                                        <div className="typing-dot"></div>
                                        <div className="typing-dot"></div>
                                        <div className="typing-dot"></div>
                                    </div>
                                )}
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="input-area">
                        <div className="input-container">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Escribe un mensaje..."
                                className="chat-input"
                                disabled={loading}
                            />
                            <button
                                onClick={handleSend}
                                disabled={loading || !input.trim()}
                                className="send-button"
                            >
                                <Send size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UnifiedChatAssistant;
