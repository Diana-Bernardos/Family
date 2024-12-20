
import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Calendar, Bell, Loader, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const EnhancedChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [error, setError] = useState(null);
    const messagesEndRef = useRef(null);
    const { user } = useAuth();

    const quickSuggestions = [
        "¿Qué eventos tengo próximamente?",
        "Recordar documentos por vencer",
        "Sugerir actividades familiares",
        "Crear recordatorio"
    ];

    // Auto-scroll a los nuevos mensajes
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Mensaje de bienvenida al abrir el chat
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([
                {
                    type: 'bot',
                    text: '👋 ¡Hola! Soy tu asistente familiar. Puedo ayudarte con:\n• Recordatorios de eventos\n• Búsqueda de fechas importantes\n• Sugerencias para actividades familiares\n• Gestión de documentos'
                }
            ]);
        }
    }, [isOpen]);

    // Función para enviar mensaje al asistente
    const handleSend = async () => {
        if (!input.trim() || !user) return;

        const userMessage = input;
        setInput('');
        setError(null);

        // Agregar mensaje del usuario
        setMessages(prev => [...prev, { 
            type: 'user', 
            text: userMessage 
        }]);

        setIsTyping(true);

        try {
            // Simular respuesta del asistente (aquí irá la integración con Ollama)
            setTimeout(() => {
                setMessages(prev => [...prev, { 
                    type: 'bot', 
                    text: '¡Entiendo! Déjame ayudarte con eso...' 
                }]);
                setIsTyping(false);
            }, 1000);

        } catch (error) {
            console.error('Error:', error);
            setError('Lo siento, ha ocurrido un error al procesar tu mensaje.');
            setIsTyping(false);
        }
    };

    // Manejar sugerencias rápidas
    const handleSuggestion = (suggestion) => {
        setInput(suggestion);
    };

    const renderMessage = (message, index) => {
        switch (message.type) {
            case 'user':
                return (
                    <div key={index} className="flex justify-end mb-3">
                        <div className="bg-blue-500 text-white rounded-lg py-2 px-4 max-w-[75%]">
                            {message.text}
                        </div>
                    </div>
                );
            case 'bot':
                return (
                    <div key={index} className="flex justify-start mb-3">
                        <div className="bg-gray-100 rounded-lg py-2 px-4 max-w-[75%] whitespace-pre-line">
                            {message.text}
                        </div>
                    </div>
                );
            case 'error':
                return (
                    <div key={index} className="flex justify-center mb-3">
                        <div className="bg-red-100 text-red-600 rounded-lg py-2 px-4 text-sm">
                            {message.text}
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="fixed bottom-4 right-4 z-50">
            {!isOpen ? (
                <button 
                    onClick={() => setIsOpen(true)}
                    className="bg-blue-500 p-3 rounded-full text-white shadow-lg hover:bg-blue-600 transition-colors"
                    title="Asistente Familiar"
                >
                    <MessageCircle className="w-6 h-6" />
                </button>
            ) : (
                <div className="bg-white rounded-lg shadow-xl w-96 h-[32rem] flex flex-col">
                    {/* Header */}
                    <div className="p-4 bg-blue-500 text-white rounded-t-lg flex justify-between items-center">
                        <h3 className="font-semibold flex items-center gap-2">
                            <MessageCircle className="w-5 h-5" />
                            Asistente Familiar
                        </h3>
                        <button 
                            onClick={() => setIsOpen(false)}
                            className="hover:bg-blue-600 p-1 rounded transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Sugerencias rápidas */}
                    <div className="p-2 bg-gray-50 grid grid-cols-2 gap-2">
                        {quickSuggestions.map((suggestion, index) => (
                            <button
                                key={index}
                                onClick={() => handleSuggestion(suggestion)}
                                className="text-xs bg-white p-2 rounded border hover:bg-gray-50 text-left transition-colors"
                            >
                                {suggestion}
                            </button>
                        ))}
                    </div>

                    {/* Área de mensajes */}
                    <div className="flex-1 overflow-y-auto p-4">
                        {messages.map((message, index) => renderMessage(message, index))}
                        {isTyping && (
                            <div className="flex justify-start mb-3">
                                <div className="bg-gray-100 rounded-lg py-2 px-4">
                                    <Loader className="w-4 h-4 animate-spin" />
                                </div>
                            </div>
                        )}
                        {error && (
                            <div className="text-red-500 text-sm mb-3">
                                {error}
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Área de entrada */}
                    <div className="p-4 border-t">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Escribe tu mensaje..."
                                className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                            />
                            <button 
                                onClick={handleSend}
                                disabled={!input.trim() || isTyping}
                                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-300"
                            >
                                Enviar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EnhancedChatBot;