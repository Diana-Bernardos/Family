import React, { useState, useEffect } from 'react';
import { MessageCircle, Calendar, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import FamilyAssistantService from '../services/FamilyAssistantService';
import '../styles/chatbot.css';

const EnhancedChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const { user, loading } = useAuth();
    const [ollamaAvailable, setOllamaAvailable] = useState(true);

    const suggestions = [
        "¿Qué eventos tengo próximamente?",
        "Recordar documentos por vencer",
        "Sugerir actividades familiares",
        "Crear recordatorio"
    ];

    // Mensaje de bienvenida
    useEffect(() => {
        async function checkOllama() {
            const isAvailable = await FamilyAssistantService.checkOllamaStatus();
            setOllamaAvailable(isAvailable);
            if (!isAvailable) {
                setMessages(prev => [...prev, {
                    type: 'bot',
                    text: 'Lo siento, el servicio de asistente no está disponible en este momento.'
                }]);
            }
        }
        checkOllama();
    }, []);

    const handleSend = async () => {
        if (!input.trim() || !ollamaAvailable) return;

        const userMessage = input;
        setInput('');
        setMessages(prev => [...prev, { type: 'user', text: userMessage }]);
        setIsTyping(true);

        try {
            const response = await FamilyAssistantService.handleRequest(userMessage, user?.id);
            setMessages(prev => [...prev, { 
                type: 'bot', 
                text: response 
            }]);
        } catch (error) {
            console.error('Error:', error);
            setMessages(prev => [...prev, { 
                type: 'bot', 
                text: 'Lo siento, ha ocurrido un error al procesar tu solicitud.' 
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="fixed bottom-4 right-4 z-50">
            {!isOpen ? (
               <button 
               onClick={() => setIsOpen(true)}
               className="chat-button"
               title="Asistente Familiar"
           >
               <MessageCircle size={20} strokeWidth={2} className="chat-icon" />
           </button>
            ) : (
                <div className="bg-white rounded-lg shadow-xl w-96 h-[32rem] flex flex-col">
                    {/* Header */}
                    <div className="p-4 bg-blue-500 text-white rounded-t-lg flex justify-between items-center">
                        <h3 className="font-semibold">Asistente Familiar</h3>
                        <button 
                            onClick={() => setIsOpen(false)}
                            className="hover:bg-blue-600 p-1 rounded"
                        >
                            ×
                        </button>
                    </div>

                    {/* Sugerencias */}
                    <div className="p-2 bg-gray-50 grid grid-cols-2 gap-2">
                        {suggestions.map((suggestion, index) => (
                            <button
                                key={index}
                                onClick={() => setInput(suggestion)}
                                className="text-xs bg-white p-2 rounded border hover:bg-gray-50 text-left transition-colors"
                            >
                                {suggestion}
                            </button>
                        ))}
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4">
                        {messages.map((msg, idx) => (
                            <div 
                                key={idx} 
                                className={`mb-3 ${
                                    msg.type === 'user' ? 'flex justify-end' : 'flex justify-start'
                                }`}
                            >
                                <div className={`p-3 rounded-lg max-w-[75%] ${
                                    msg.type === 'user' 
                                        ? 'bg-blue-500 text-white' 
                                        : 'bg-gray-100'
                                }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-gray-100 p-3 rounded-lg">
                                    Escribiendo...
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input */}
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
                                disabled={!input.trim()}
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