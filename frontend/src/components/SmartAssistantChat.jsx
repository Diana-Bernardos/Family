import React, { useState, useEffect } from 'react';
import { MessageCircle, Calendar, User, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import SmartAssistantService from '../services/SmartAssitantService';

const SmartAssistantChat = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [currentContext, setCurrentContext] = useState(null);
    const [suggestions, setSuggestions] = useState([]);
    const { user } = useAuth();

    useEffect(() => {
        // Escuchar eventos para abrir el asistente
        const handleOpenAssistant = (event) => {
            const { suggestions, type } = event.detail;
            setIsOpen(true);
            setSuggestions(suggestions);
            setCurrentContext(type);
        };

        window.addEventListener('openAssistant', handleOpenAssistant);
        return () => window.removeEventListener('openAssistant', handleOpenAssistant);
    }, []);

    // Renderizar diferentes tipos de mensajes
    const renderMessage = (message) => {
        switch (message.type) {
            case 'calendar':
                return (
                    <div className="flex items-start gap-2">
                        <Calendar className="w-5 h-5 text-blue-500" />
                        <div>{message.text}</div>
                    </div>
                );
            case 'member':
                return (
                    <div className="flex items-start gap-2">
                        <User className="w-5 h-5 text-green-500" />
                        <div>{message.text}</div>
                    </div>
                );
            case 'document':
                return (
                    <div className="flex items-start gap-2">
                        <FileText className="w-5 h-5 text-yellow-500" />
                        <div>{message.text}</div>
                    </div>
                );
            default:
                return <div>{message.text}</div>;
        }
    };

    // ... resto del componente con la UI del chat
};

export default SmartAssistantChat;