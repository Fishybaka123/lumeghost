// ===========================================
// COMMUNICATION SERVICE
// Tracks all messages, nudges, and notes sent to clients
// Now synced with Supabase and Realtime
// ===========================================

const CommunicationService = {
    // Local cache
    messages: [],

    TYPES: {
        NUDGE: 'nudge',
        SMS: 'sms',
        EMAIL: 'email',
        NOTE: 'note',
        CALL: 'call'
    },

    /**
     * Initialize - Load from Supabase and Subscribe
     */
    async init() {
        this.messages = [];

        if (!window.supabase) {
            console.warn('Supabase not initialized, falling back to local storage');
            this.loadFromStorage();
            return;
        }

        // 1. Load initial data
        await this.fetchMessages();

        // 2. Subscribe to Realtime changes
        this.subscribeToRealtime();

        return this.messages;
    },

    async fetchMessages() {
        try {
            const { data, error } = await supabase
                .from('communications')
                .select(`
                    *,
                    clients (first_name, last_name, email, phone)
                `)
                .order('created_at', { ascending: false })
                .limit(100);

            if (error) throw error;

            this.messages = data.map(this.mapSupabaseResponse);
            this.notifyUI();
        } catch (err) {
            console.error('Failed to fetch messages:', err);
        }
    },

    subscribeToRealtime() {
        supabase
            .channel('public:communications')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'communications' }, payload => {
                this.handleRealtimeInsert(payload.new);
            })
            .subscribe();
    },

    async handleRealtimeInsert(newMessage) {
        // Fetch full details to get client info if needed, or simple map
        // For efficiency, we might just append if we have the client info locally
        // But the insert payload doesn't have the joined client data.
        // So we fetch this specific message again to get the join.

        try {
            const { data, error } = await supabase
                .from('communications')
                .select('*, clients (first_name, last_name, email, phone)')
                .eq('id', newMessage.id)
                .single();

            if (!error && data) {
                const formatted = this.mapSupabaseResponse(data);
                // Avoid duplicates
                if (!this.messages.find(m => m.id === formatted.id)) {
                    this.messages.unshift(formatted);
                    this.notifyUI();

                    // Show toast for incoming SMS
                    if (formatted.direction === 'inbound') {
                        showToast(`New message from ${formatted.clientName}`, 'info');
                    }
                }
            }
        } catch (e) {
            console.error('Realtime update error:', e);
        }
    },

    mapSupabaseResponse(row) {
        return {
            id: row.id,
            clientId: row.client_id,
            clientName: row.clients ? `${row.clients.first_name} ${row.clients.last_name}` : 'Unknown',
            clientEmail: row.clients?.email || '',
            clientPhone: row.clients?.phone || '',
            type: row.type,
            content: row.content,
            subject: row.metadata?.subject || '',
            channel: row.type, // Map type to channel for UI compatibility
            status: row.status,
            read: row.is_read,
            timestamp: row.created_at,
            direction: row.direction || 'outbound'
        };
    },

    notifyUI() {
        // Trigger UI refresh if on communications page
        if (window.location.hash.includes('communications') && window.renderCommunicationsList) {
            window.renderCommunicationsList();
        }
    },

    /**
     * Send/Log a new message
     */
    async log(clientId, type, content, metadata = {}) {
        // 1. Optimistic Update
        const tempId = Date.now();
        const client = ClientDataService ? ClientDataService.getById(clientId) : null;

        const optimisticMessage = {
            id: tempId,
            clientId: parseInt(clientId),
            clientName: client ? `${client.firstName} ${client.lastName}` : 'Unknown',
            clientEmail: client?.email || '',
            clientPhone: client?.phone || '',
            type,
            content,
            subject: metadata.subject || '',
            channel: type,
            status: 'sending',
            read: true,
            timestamp: new Date().toISOString(),
            direction: 'outbound',
            ...metadata
        };

        this.messages.unshift(optimisticMessage);
        this.notifyUI();

        if (!window.supabase || !client) return optimisticMessage;

        try {
            // Get session user_id (must match auth.uid() for RLS)
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user?.id) {
                throw new Error('Not authenticated. Please log in again.');
            }

            // 2. Prepare DB Insert
            const dbPayload = {
                client_id: clientId,
                user_id: session.user.id,
                type,
                direction: 'outbound',
                content,
                status: 'queued',
                metadata: metadata,
                is_read: true
            };

            // 3. Send via Netlify Function if SMS or NUDGE (if SMS channel is appropriate)
            // For now, we assume all Nudges go to SMS if Twilio is connected
            const isSms = type === this.TYPES.SMS;
            const isNudge = type === this.TYPES.NUDGE;

            // Should we send SMS? 
            // Yes if type is SMS, OR if it's a Nudge and we have a phone number (and metadata doesn't explicitly exclude sms)
            if (isSms || isNudge) {
                // Get User credentials
                let twilioConfig = {};
                if (window.IntegrationsService && IntegrationsService.connected['twilio']?.config) {
                    twilioConfig = IntegrationsService.connected['twilio'].config;
                }

                // Validate: Do we have what we need?
                if (!twilioConfig.accountSid || !twilioConfig.authToken || !twilioConfig.phoneNumber) {
                    throw new Error('Twilio is not configured. Go to Settings > Integrations to connect Twilio.');
                }
                if (!client.phone) {
                    throw new Error('This client has no phone number on file.');
                }

                console.log('[SMS] Sending to:', client.phone, 'from:', twilioConfig.phoneNumber);

                // Call Send SMS Function
                const response = await fetch('/.netlify/functions/send-sms', {
                    method: 'POST',
                    body: JSON.stringify({
                        to: client.phone,
                        body: content,
                        accountSid: twilioConfig.accountSid,
                        authToken: twilioConfig.authToken,
                        fromNumber: twilioConfig.phoneNumber
                    })
                });

                const result = await response.json();

                if (!result.success) {
                    throw new Error(result.error || 'SMS send failed');
                }

                console.log('[SMS] ✅ Sent successfully, SID:', result.sid);
                dbPayload.status = 'sent';
                dbPayload.sid = result.sid;

                // Check delivery status after 3 seconds
                setTimeout(async () => {
                    try {
                        const statusResp = await fetch('/.netlify/functions/check-sms-status', {
                            method: 'POST',
                            body: JSON.stringify({
                                accountSid: twilioConfig.accountSid,
                                authToken: twilioConfig.authToken,
                                messageSid: result.sid
                            })
                        });
                        const statusResult = await statusResp.json();
                        console.log('[SMS] Delivery status:', statusResult.status,
                            statusResult.errorCode ? `Error ${statusResult.errorCode}: ${statusResult.errorMessage}` : '(no errors)');
                        if (statusResult.errorCode) {
                            showToast(`⚠️ SMS delivery issue: Error ${statusResult.errorCode} - ${statusResult.errorMessage}`, 'warning');
                        }
                    } catch (e) {
                        console.warn('[SMS] Could not check delivery status:', e.message);
                    }
                }, 3000);
            }

            // 4. Insert into Supabase
            const { data, error } = await supabase
                .from('communications')
                .insert(dbPayload)
                .select()
                .single();

            if (error) throw error;

            // 5. Replace optimistic message
            const index = this.messages.findIndex(m => m.id === tempId);
            if (index !== -1) {
                this.messages[index] = this.mapSupabaseResponse({
                    ...data,
                    clients: { first_name: client.firstName, last_name: client.lastName, email: client.email, phone: client.phone }
                });
                this.notifyUI();
            }

            return this.messages[index];

        } catch (error) {
            console.error('Message send failed:', error);
            showToast('Failed to send message: ' + error.message, 'error');

            // Mark optimistic as failed
            const index = this.messages.findIndex(m => m.id === tempId);
            if (index !== -1) {
                this.messages[index].status = 'failed';
                this.notifyUI();
            }
        }
    },

    // ... (Keep wrappers for compatibility)
    logSMS(clientId, message) { return this.log(clientId, this.TYPES.SMS, message, { provider: 'twilio' }); },
    logEmail(clientId, subject, body) { return this.log(clientId, this.TYPES.EMAIL, body, { subject }); },
    logNudge(clientId, data) { return this.log(clientId, this.TYPES.NUDGE, data.message, { subject: data.subject }); },
    logNote(clientId, content) { return this.log(clientId, this.TYPES.NOTE, content); },
    logCall(clientId, notes) { return this.log(clientId, this.TYPES.CALL, notes); },

    /**
     * Getters
     */
    getAll() { return this.messages; },
    getRecent(limit = 15) { return this.messages.slice(0, limit); },
    getByClient(id) { return this.messages.filter(m => m.clientId == id); },

    /**
     * Get statistics
     */
    getStats() {
        const messages = this.messages;
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

    // Fallback for local storage (optional, if you want to keep it)
    loadFromStorage() {
        // ... (legacy implementation if needed, otherwise removed)
    },
    saveToStorage() { /* no-op */ }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    CommunicationService.init();
});

window.CommunicationService = CommunicationService;
