import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import SmartAssistantService from '../services/SmartAssitantService';

const SmartAssistantButton = ({ type, tooltip }) => {
    const [showTooltip, setShowTooltip] = useState(false);

    const handleClick = async () => {
        try {
            const suggestions = await SmartAssistantService.getContextualSuggestions(type);
            window.dispatchEvent(new CustomEvent('openAssistant', { 
                detail: { suggestions, type } 
            }));
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <div className="relative">
            <button
                className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 transition-colors"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                onClick={handleClick}
            >
                <MessageCircle size={20} />
            </button>
            {showTooltip && (
                <div className="absolute bottom-full mb-2 bg-gray-800 text-white text-sm py-1 px-2 rounded">
                    {tooltip}
                </div>
            )}
        </div>
    );
};

export default SmartAssistantButton;