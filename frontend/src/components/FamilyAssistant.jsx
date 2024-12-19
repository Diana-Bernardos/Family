import React, { useState, useEffect, useRef } from 'react';
import FamilyAssistantService from '../services/FamilyAssistantService';
import { MessageCircle, Calendar, FileText, CheckSquare } from 'lucide-react';
import '../styles/assistant.css';
import '../styles/messages.css';
import '../styles/animations.css';
import '../styles/chatbot.css';

const FamilyAssistant = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const chatRef = useRef(null);

    const quickSuggestions = [
        "¿Qué eventos tengo este fin de semana?",
        "Recordar documentos próximos a vencer",
        "Sugerir actividades familiares",
        "Crear lista de tareas",
    ];

    useEffect(() => {
        if (chatRef.current) {
            chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = input;
        setInput('');
        setMessages(prev => [...prev, { type: 'user', text: userMessage }]);

        try {
            const response = await FamilyAssistantService.handleRequest(userMessage, 1); // userId hardcoded for example
            setMessages(prev => [...prev, { type: 'assistant', text: response }]);
        } catch (error) {
            console.error('Error:', error);
            setMessages(prev => [...prev, { type: 'assistant', text: 'Lo siento, hubo un error.' }]);
        }
    };

    const handleQuickSuggestion = (suggestion) => {
        setInput(suggestion);
    };

    return (
        <div className="fixed bottom-4 right-4 z-50">
            {!isOpen ? (
                <button 
                    onClick={() => setIsOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg"
                >
                    <MessageCircle size={24} />
                </button>
            ) : (
                <div className="bg-white rounded-lg shadow-xl w-96 h-[600px] flex flex-col">
                    <div className="bg-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
                        <h3 className="font-semibold">Asistente Familiar</h3>
                        <button onClick={() => setIsOpen(false)}>×</button>
                    </div>

                    <div className="flex-none p-2 bg-gray-50">
                        <div className="grid grid-cols-2 gap-2">
                            {quickSuggestions.map((suggestion, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleQuickSuggestion(suggestion)}
                                    className="text-xs bg-white p-2 rounded border hover:bg-gray-50 text-left"
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4" ref={chatRef}>
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`mb-4 ${
                                    message.type === 'user' ? 'ml-auto' : 'mr-auto'
                                }`}
                            >
                                <div
                                    className={`p-3 rounded-lg max-w-[80%] ${
                                        message.type === 'user'
                                            ? 'bg-blue-600 text-white ml-auto'
                                            : 'bg-gray-100 text-gray-800'
                                    }`}
                                >
                                    {message.text}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="border-t p-4">
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
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
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

export default FamilyAssistant;