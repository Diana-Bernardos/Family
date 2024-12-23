// src/services/UnifiedAssistantService.js
class UnifiedAssistantService {
    constructor() {
        this.API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
    }

    async processQuery(query, userId) {
        try {
            const context = await this.getContextData(userId);
            
            const response = await fetch(`${this.API_URL}/assistant/query`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    query,
                    userId,
                    context
                })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            return await response.json();
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    }

    async getContextData(userId) {
        try {
            const response = await fetch(`${this.API_URL}/assistant/context/${userId}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return await response.json();
        } catch (error) {
            console.error('Error getting context:', error);
            return {
                events: [],
                members: [],
                documents: []
            };
        }
    }

    async getHistory(userId) {
        try {
            const response = await fetch(`${this.API_URL}/assistant/history/${userId}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return await response.json();
        } catch (error) {
            console.error('Error getting history:', error);
            return [];
        }
    }

    async getSuggestions(userId) {
        try {
            const response = await fetch(`${this.API_URL}/assistant/suggestions/${userId}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return await response.json();
        } catch (error) {
            console.error('Error getting suggestions:', error);
            return [];
        }
    }
}

export default new UnifiedAssistantService();