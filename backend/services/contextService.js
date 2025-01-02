// backend/services/contextService.js
class ContextService {
    static recentContexts = new Map();
    static CONTEXT_EXPIRY = 60 * 60 * 1000;

    static updateContext(userId, newContext) {
        this.recentContexts.set(userId, {
            ...newContext,
            lastUpdate: Date.now()
        });
        this.cleanOldContexts();
    }

    static getRecentContext(userId) {
        const context = this.recentContexts.get(userId);
        if (!context || Date.now() - context.lastUpdate > this.CONTEXT_EXPIRY) {
            return null;
        }
        return context;
    }

    static cleanOldContexts() {
        const expiryTime = Date.now() - this.CONTEXT_EXPIRY;
        for (const [userId, context] of this.recentContexts.entries()) {
            if (context.lastUpdate < expiryTime) {
                this.recentContexts.delete(userId);
            }
        }
    }
}

module.exports = ContextService;