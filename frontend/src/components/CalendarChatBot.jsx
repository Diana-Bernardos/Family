import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Calendar, Bell, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import CalendarAIService from '../services/CalendarAiService';

const CalendarChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [error, setError] = useState(null);
    const messagesEndRef = useRef(null);
    const { user } = useAuth();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Mensaje de bienvenida cuando se abre el chat
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([{
                type: 'bot',
                text: '¡Hola! Soy tu asistente del calendario familiar. Puedo ayudarte con:\n- Recordatorios de eventos\n- Búsqueda de fechas importantes\n- Sugerencias para actividades familiares'
            }]);
        }
    }, [isOpen]);

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
            const response = await CalendarAIService.processCalendarQuery(userMessage, user.id);
            
            // Mostrar la respuesta principal
            setMessages(prev => [...prev, {
                type: 'bot',
                text: response.message,
                actions: response.actions || []
            }]);

            // Si hay acciones sugeridas, mostrarlas
            if (response.actions?.length > 0) {
                response.actions.forEach(action => {
                    if (action.type === 'reminder') {
                        setMessages(prev => [...prev, {
                            type: 'reminder',
                            text: action.details.title,
                            details: action.details
                        }]);
                    }
                });
            }

            // Si hay eventos relacionados, mostrarlos
            if (response.relatedEvents?.length > 0) {
                setMessages(prev => [...prev, {
                    type: 'events',
                    events: response.relatedEvents
                }]);
            }

        } catch (error) {
            console.error('Error:', error);
            setError('Lo siento, ha ocurrido un error al procesar tu mensaje.');
        } finally {
            setIsTyping(false);
        }
    };

    const handleReminderAction = async (reminderDetails) => {
        try {
            await CalendarAIService.createReminder(reminderDetails);
            setMessages(prev => [...prev, {
                type: 'bot',
                text: '✅ Recordatorio creado exitosamente.'
            }]);
        } catch (error) {
            console.error('Error creating reminder:', error);
            setError('No se pudo crear el recordatorio');
        }
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
                        <div className="bg-gray-100 rounded-lg py-2 px-4 max-w-[75%]">
                            {message.text}
                        </div>
                    </div>
                );
            case 'reminder':
                return (
                    <div key={index} className="flex justify-start mb-3">
                        <div className="bg-blue-50 rounded-lg py-2 px-4 max-w-[75%]">
                            <div className="flex items-center gap-2">
                                <Bell className="w-4 h-4 text-blue-500" />
                                <span>{message.text}</span>
                            </div>
                            <button 
                                onClick={() => handleReminderAction(message.details)}
                                className="mt-2 text-blue-500 text-sm hover:underline"
                            >
                                Crear recordatorio
                            </button>
                        </div>
                    </div>
                );
            case 'events':
                return (
                    <div key={index} className="flex justify-start mb-3">
                        <div className="bg-green-50 rounded-lg py-2 px-4 max-w-[75%]">
                            <div className="flex items-center gap-2 mb-2">
                                <Calendar className="w-4 h-4 text-green-500" />
                                <span className="font-medium">Eventos relacionados:</span>
                            </div>
                            {message.events.map((event, i) => (
                                <div key={i} className="mb-2 last:mb-0">
                                    <div className="font-medium">{event.title}</div>
                                    <div className="text-sm text-gray-600">
                                        {new Date(event.event_date).toLocaleDateString()}
                                    </div>
                                </div>
                            ))}
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
                    className="bg-blue-500 p-3 rounded-full text-white shadow-lg hover:bg-blue-600 transition-all"
                    title="Asistente del Calendario"
                >
                    <MessageCircle className="w-6 h-6" />
                </button>
            ) : (
                <div className="bg-white rounded-lg shadow-xl w-96 h-[32rem] flex flex-col">
                    {/* Header */}
                    <div className="p-4 bg-blue-500 text-white rounded-t-lg flex justify-between items-center">
                        <h3 className="font-semibold">Asistente del Calendario</h3>
                        <button 
                            onClick={() => setIsOpen(false)}
                            className="hover:bg-blue-600 p-1 rounded"
                        >
                            ×
                        </button>
                    </div>

                    {/* Messages */}
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

export default CalendarChatBot;