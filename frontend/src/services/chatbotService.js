// src/services/chatbotService.js

// src/services/chatbotService.js
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const defaultOptions = {
    headers: {
        'Content-Type': 'application/json'
    },
    credentials: 'include'
};

export const chatbotService = {
    async processUserQuery(userId, message) {
        try {
            // First, we fetch the necessary context data from the backend
            const context = await this.getContextData(userId);

            // Next, we analyze the user's message to determine the intent and extract relevant entities
            const { intent, entities } = this.analyzeUserQuery(message);

            // Based on the intent and entities, we generate an appropriate response
            const response = await this.generateResponse(intent, entities, context);

            // Finally, we save the interaction (user's message and assistant's response) to the chat history
            await this.saveChatHistory(userId, message, response);

            return response;
        } catch (error) {
            console.error('Error processing user query:', error);
            throw new Error('Failed to process the query');
        }
    },

    async getContextData(userId) {
        try {
            // We fetch the context data from the /assistant/context/:userId endpoint
            const response = await fetch(`${API_URL}/assistant/context/${userId}`, defaultOptions);
            
            // If the response is not successful, we throw an error
            if (!response.ok) {
                throw new Error('Error fetching context data');
            }

            // Otherwise, we return the context data from the response
            return await response.json();
        } catch (error) {
            console.error('Error getting context:', error);
            
            // If there's an error, we return a default context object
            return {
                events: [],
                members: [],
                reminders: [],
                tasks: [],
                recommendations: []
            };
        }
    },

    analyzeUserQuery(message) {
        // Here, we'd implement the logic to analyze the user's message and extract the intent and entities
        // For now, we'll return a simple example
        return {
            intent: 'getUpcomingEvents',
            entities: {}
        };
    },

    async generateResponse(intent, entities, context) {
        try {
            switch (intent) {
                case 'getUpcomingEvents':
                    return this.formatUpcomingEvents(context.events);
                case 'getMemberDetails':
                    return this.formatMemberDetails(context.members, entities.memberName);
                case 'getTaskDetails':
                    return this.formatTaskDetails(context.tasks, entities.taskId);
                case 'getRecommendations':
                    return this.formatRecommendations(context.recommendations);
                case 'createReminder':
                    return await this.createReminder(entities.reminderTitle, entities.reminderDate, entities.reminderDescription);
                // Add more intent handling logic
                default:
                    return 'I\'m sorry, I didn\'t understand your request. Could you please rephrase it?';
            }
        } catch (error) {
            console.error('Error generating response:', error);
            return 'I encountered an issue while processing your request. Please try again later.';
        }
    },

    formatUpcomingEvents(events) {
        // We format the event data into a structured response
        return {
            type: 'events',
            data: events.map(event => ({
                id: event.id,
                name: event.name,
                date: event.event_date,
                type: event.event_type,
                icon: event.icon,
                color: event.color
            }))
        };
    },

    formatMemberDetails(members, memberName) {
        // We find the member with the given name and format their details
        const member = members.find(m => m.name === memberName);
        if (!member) {
            return `I couldn't find any member with the name "${memberName}".`;
        }
        return {
            type: 'member',
            data: {
                id: member.id,
                name: member.name,
                email: member.email,
                phone: member.phone,
                birthDate: member.birth_date
            }
        };
    },

    async createReminder(title, date, description) {
        try {
            // We create a new reminder in the database and return the details
            const result = await this.addReminder(title, date, description);
            return {
                type: 'reminder',
                data: {
                    id: result.id,
                    title,
                    date,
                    description,
                    status: 'active'
                }
            };
        } catch (error) {
            console.error('Error creating reminder:', error);
            return 'I couldn\'t create the reminder. Please try again later.';
        }
    },

    async saveChatHistory(userId, message, response) {
        try {
            // We save the user's message and the assistant's response to the chat history
            await fetch(`${API_URL}/chat/history`, {
                ...defaultOptions,
                method: 'POST',
                body: JSON.stringify({
                    userId,
                    message,
                    response,
                    timestamp: new Date().toISOString()
                })
            });
        } catch (error) {
            console.error('Error saving chat history:', error);
        }
    }
};