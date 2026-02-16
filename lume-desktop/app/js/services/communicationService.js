// ===========================================
// COMMUNICATION SERVICE
// Tracks all messages, nudges, and notes sent to clients
// ===========================================

const CommunicationService = {
    STORAGE_KEY: 'lume_communications_v2',

    /**
     * Message types
     */
    TYPES: {
        NUDGE: 'nudge',
        SMS: 'sms',
        EMAIL: 'email',
        NOTE: 'note',
        CALL: 'call'
    },

    /**
     * Initialize - load from storage
     */
    init() {
        const stored = this.loadFromStorage();
        if (!stored) {
            this.saveToStorage([]);
        }
        return this.getAll();
    },

    /**
     * Log a new message/communication
     */
    log(clientId, type, content, metadata = {}) {
        const messages = this.getAll();

        // Get client info
        const client = ClientDataService ? ClientDataService.getById(clientId) : null;

        const newMessage = {
            id: Date.now(),
            clientId: parseInt(clientId),
            clientName: client ? `${client.firstName} ${client.lastName}` : 'Unknown',
            clientEmail: client?.email || '',
            clientPhone: client?.phone || '',
            type,
            content,
            subject: metadata.subject || '',
            channel: metadata.channel || type,
            status: metadata.status || 'sent',
            read: false,
            timestamp: new Date().toISOString(),
            ...metadata
        };

        messages.unshift(newMessage); // Add to beginning
        this.saveToStorage(messages);

        return newMessage;
    },

    /**
     * Log a nudge
     */
    logNudge(clientId, nudgeData) {
        return this.log(clientId, this.TYPES.NUDGE, nudgeData.message, {
            subject: nudgeData.subject,
            channel: nudgeData.channels?.[0] || 'email',
            nudgeType: nudgeData.type,
            urgency: nudgeData.urgency
        });
    },

    /**
     * Log a note
     */
    logNote(clientId, noteContent) {
        return this.log(clientId, this.TYPES.NOTE, noteContent, {
            channel: 'internal'
        });
    },

    /**
     * Log an SMS
     */
    logSMS(clientId, message) {
        const isTwilioConnected = window.IntegrationsService && window.IntegrationsService.isConnected('twilio');

        if (isTwilioConnected) {
            console.log(`[CommunicationService] Routing SMS through Twilio for client ${clientId}`);
        } else {
            console.log(`[CommunicationService] Simulating SMS (Twilio not connected) for client ${clientId}`);
        }

        return this.log(clientId, this.TYPES.SMS, message, {
            channel: 'sms',
            provider: isTwilioConnected ? 'twilio' : 'simulated'
        });
    },

    /**
     * Log an email
     */
    logEmail(clientId, subject, body) {
        return this.log(clientId, this.TYPES.EMAIL, body, {
            subject,
            channel: 'email'
        });
    },

    /**
     * Log a call
     */
    logCall(clientId, notes = '') {
        return this.log(clientId, this.TYPES.CALL, notes || 'Phone call made', {
            channel: 'call'
        });
    },

    /**
     * Get all messages
     */
    getAll() {
        return this.loadFromStorage() || [];
    },

    /**
     * Get recent messages (default 15)
     */
    getRecent(limit = 15) {
        const messages = this.getAll();
        return messages.slice(0, limit);
    },

    /**
     * Get messages for a specific client
     */
    getByClient(clientId) {
        const messages = this.getAll();
        return messages.filter(m => m.clientId === parseInt(clientId));
    },

    /**
     * Get messages by type
     */
    getByType(type) {
        const messages = this.getAll();
        return messages.filter(m => m.type === type);
    },

    /**
     * Get messages by channel
     */
    getByChannel(channel) {
        const messages = this.getAll();
        return messages.filter(m => m.channel === channel);
    },

    /**
     * Search messages
     */
    search(query) {
        const messages = this.getAll();
        const q = query.toLowerCase();
        return messages.filter(m =>
            m.clientName.toLowerCase().includes(q) ||
            m.content.toLowerCase().includes(q) ||
            m.subject?.toLowerCase().includes(q) ||
            m.clientEmail?.toLowerCase().includes(q) ||
            m.clientPhone?.includes(q)
        );
    },

    /**
     * Mark message as read
     */
    markAsRead(messageId) {
        const messages = this.getAll();
        const index = messages.findIndex(m => m.id === messageId);
        if (index !== -1) {
            messages[index].read = true;
            this.saveToStorage(messages);
        }
    },

    /**
     * Get unread count
     */
    getUnreadCount() {
        const messages = this.getAll();
        return messages.filter(m => !m.read).length;
    },

    /**
     * Get statistics
     */
    getStats() {
        const messages = this.getAll();
        return {
            total: messages.length,
            sms: messages.filter(m => m.type === this.TYPES.SMS || m.channel === 'sms').length,
            email: messages.filter(m => m.type === this.TYPES.EMAIL || m.channel === 'email').length,
            nudges: messages.filter(m => m.type === this.TYPES.NUDGE).length,
            notes: messages.filter(m => m.type === this.TYPES.NOTE).length,
            calls: messages.filter(m => m.type === this.TYPES.CALL).length,
            unread: messages.filter(m => !m.read).length
        };
    },

    /**
     * Delete a message
     */
    delete(messageId) {
        let messages = this.getAll();
        messages = messages.filter(m => m.id !== messageId);
        this.saveToStorage(messages);
    },

    /**
     * Save to localStorage
     */
    saveToStorage(messages) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(messages));
            return true;
        } catch (e) {
            console.error('Failed to save communications:', e);
            return false;
        }
    },

    /**
     * Load from localStorage
     */
    loadFromStorage() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Failed to load communications:', e);
            return null;
        }
    },

    /**
     * Generate demo data
     */
    generateDemoData() {
        const clients = ClientDataService ? ClientDataService.getAll() : [];
        const demoMessages = [];

        const nudgeTypes = ['renewal', 'low-sessions', 'expiring-soon', 're-engagement', 'check-in'];
        const channels = ['sms', 'email'];

        // Generate 20 sample messages
        for (let i = 0; i < 20; i++) {
            const client = clients[Math.floor(Math.random() * clients.length)];
            if (!client) continue;

            const daysAgo = Math.floor(Math.random() * 30);
            const date = new Date();
            date.setDate(date.getDate() - daysAgo);

            const type = Math.random() > 0.3 ? this.TYPES.NUDGE : (Math.random() > 0.5 ? this.TYPES.SMS : this.TYPES.EMAIL);
            const channel = channels[Math.floor(Math.random() * channels.length)];

            demoMessages.push({
                id: Date.now() - (i * 1000),
                clientId: client.id,
                clientName: `${client.firstName} ${client.lastName}`,
                clientEmail: client.email,
                clientPhone: client.phone,
                type,
                content: type === this.TYPES.NUDGE
                    ? `Hi ${client.firstName}, we noticed your package is expiring soon. Book now to use your remaining sessions!`
                    : `Appointment reminder for ${client.firstName}`,
                subject: `Message for ${client.firstName}`,
                channel,
                status: 'sent',
                read: Math.random() > 0.3,
                timestamp: date.toISOString(),
                nudgeType: type === this.TYPES.NUDGE ? nudgeTypes[Math.floor(Math.random() * nudgeTypes.length)] : null
            });
        }

        // Sort by timestamp
        demoMessages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        this.saveToStorage(demoMessages);
        return demoMessages;
    }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    CommunicationService.init();
});

// Export for use
window.CommunicationService = CommunicationService;
