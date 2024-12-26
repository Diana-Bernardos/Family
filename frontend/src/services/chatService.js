import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

class ChatService {
  constructor() {
    this.messageCache = new Map();
    this.MAX_CACHE_SIZE = 50;
  }

  async sendMessage(userId, message) {
    const requestId = uuidv4();

    if (this.messageCache.size >= this.MAX_CACHE_SIZE) {
      const oldestKey = this.messageCache.keys().next().value;
      this.messageCache.delete(oldestKey);
    }

    const userMessage = {
      id: requestId,
      text: message,
      sender: 'user',
      timestamp: Date.now(),
    };

    this.messageCache.set(requestId, userMessage);

    try {
      const response = await axios.post('/api/chatbot/chat', {
        userId,
        message,
        clientTimestamp: Date.now(),
        requestId,
      }, {
        timeout: 10000,
        headers: {
          'X-Request-ID': requestId,
        },
      });

      const aiMessage = {
        id: response.data.responseId || uuidv4(),
        text: response.data.response,
        sender: 'ai',
        timestamp: Date.now(),
      };

      this.messageCache.set(aiMessage.id, aiMessage);

      return {
        userMessage,
        assistantMessage: aiMessage,
      };
    } catch (error) {
      console.error('Chat service error:', error);
      const errorMessage = {
        id: uuidv4(),
        text: 'Error processing your message',
        sender: 'error',
        timestamp: Date.now(),
      };
      return {
        userMessage,
        assistantMessage: errorMessage,
      };
    }
  }

  getCachedMessages() {
    return Array.from(this.messageCache.values())
      .sort((a, b) => a.timestamp - b.timestamp);
  }
}

export default new ChatService();