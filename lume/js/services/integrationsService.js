// ===========================================
// INTEGRATIONS SERVICE - Payment & Calendar Stubs
// OAuth2 Flow Preparation with Scope Minimization
// ===========================================

const IntegrationsService = {
    // Integration status storage
    STORAGE_KEY: 'lume_integrations',

    // Available integrations
    PROVIDERS: {
        // Payment Providers
        stripe: {
            id: 'stripe',
            name: 'Stripe',
            type: 'payment',
            icon: '💳',
            color: '#635BFF',
            description: 'Accept payments and manage subscriptions',
            scopes: ['read_payments', 'create_charges'],
            oauthUrl: 'https://connect.stripe.com/oauth/authorize',
            website: 'https://stripe.com'
        },
        square: {
            id: 'square',
            name: 'Square',
            type: 'payment',
            icon: '⬜',
            color: '#006AFF',
            description: 'Point of sale and payment processing',
            scopes: ['PAYMENTS_READ', 'PAYMENTS_WRITE'],
            oauthUrl: 'https://connect.squareup.com/oauth2/authorize',
            website: 'https://squareup.com'
        },
        // Calendar Providers
        google_calendar: {
            id: 'google_calendar',
            name: 'Google Calendar',
            type: 'calendar',
            icon: '📅',
            color: '#4285F4',
            description: 'Sync appointments with Google Calendar',
            scopes: ['calendar.events.readonly', 'calendar.events'],
            oauthUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
            website: 'https://calendar.google.com'
        },
        outlook: {
            id: 'outlook',
            name: 'Outlook Calendar',
            type: 'calendar',
            icon: '📆',
            color: '#0078D4',
            description: 'Sync with Microsoft Outlook',
            scopes: ['Calendars.Read', 'Calendars.ReadWrite'],
            oauthUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
            website: 'https://outlook.com'
        },
        // Marketing Providers
        mailchimp: {
            id: 'mailchimp',
            name: 'Mailchimp',
            type: 'marketing',
            icon: '📧',
            color: '#FFE01B',
            description: 'Email marketing automation',
            scopes: ['campaigns:read', 'campaigns:write'],
            oauthUrl: 'https://login.mailchimp.com/oauth2/authorize',
            website: 'https://mailchimp.com'
        }
    },

    // Connected integrations state
    connected: {},

    // ===========================================
    // INITIALIZATION
    // ===========================================

    init() {
        this.loadState();
    },

    loadState() {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (stored) {
                this.connected = JSON.parse(stored);
            }
        } catch (e) {
            console.error('Failed to load integrations state:', e);
            this.connected = {};
        }
    },

    saveState() {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.connected));
    },

    // ===========================================
    // CONNECTION MANAGEMENT
    // ===========================================

    /**
     * Get all available integrations
     */
    getAvailable() {
        return Object.values(this.PROVIDERS).map(provider => ({
            ...provider,
            isConnected: this.isConnected(provider.id),
            connectedAt: this.connected[provider.id]?.connectedAt || null
        }));
    },

    /**
     * Get integrations by type
     */
    getByType(type) {
        return this.getAvailable().filter(i => i.type === type);
    },

    /**
     * Check if provider is connected
     */
    isConnected(providerId) {
        return !!this.connected[providerId]?.connected;
    },

    /**
     * Get connected integrations
     */
    getConnected() {
        return this.getAvailable().filter(i => i.isConnected);
    },

    /**
     * Initiate OAuth connection flow or Config Modal
     */
    async connect(providerId) {
        const provider = this.PROVIDERS[providerId];
        if (!provider) {
            return { success: false, error: 'Unknown provider' };
        }

        if (provider.requiresConfig) {
            // SMS/Twilio requires manual config
            if (providerId === 'twilio') {
                this.openTwilioConfig();
                return { success: true, pending: true };
            }
            return { success: false, error: 'Config modal not implemented' };
        }

        // In production, this would redirect to OAuth URL
        // For demo, we'll simulate the connection

        console.log(`[Integrations] Starting OAuth flow for ${provider.name}`);
        console.log(`[Integrations] Scopes: ${provider.scopes?.join(', ') || ''}`);

        // Show connecting toast
        showToast(`Connecting to ${provider.name}...`, 'info');

        // Simulate OAuth delay
        await this.delay(1500);

        // Simulate successful connection
        this.connected[providerId] = {
            connected: true,
            connectedAt: new Date().toISOString(),
            accessToken: 'demo_access_token_' + Math.random().toString(36).substr(2, 9),
            refreshToken: 'demo_refresh_token_' + Math.random().toString(36).substr(2, 9),
            scopes: provider.scopes || [],
            expiresAt: Date.now() + (3600 * 1000) // 1 hour
        };

        this.saveState();

        showToast(`Connected to ${provider.name}!`, 'success');
        if (typeof NotificationCenter !== 'undefined') {
            NotificationCenter.success('Integration Connected', `Your ${provider.name} account has been linked successfully.`, { category: 'system' });
        }

        return { success: true };
    },

    /**
     * Open Twilio Modal
     */
    openTwilioConfig() {
        const modal = document.getElementById('twilio-config-modal');
        if (modal) {
            modal.style.display = 'flex';

            // Pre-fill if exists
            const existing = this.connected['twilio'];
            if (existing && existing.config) {
                document.getElementById('twilio-sid').value = existing.config.accountSid || '';
                document.getElementById('twilio-token').value = existing.config.authToken || '';
                document.getElementById('twilio-phone').value = existing.config.phoneNumber || '';
            }
        }
    },

    /**
     * Save Twilio Config
     */
    async saveTwilioConfig(config) {
        showToast('Validating Twilio credentials...', 'info');
        await this.delay(1000);

        this.connected['twilio'] = {
            connected: true,
            connectedAt: new Date().toISOString(),
            config: config
        };

        this.saveState();
        showToast('Twilio connected successfully!', 'success');

        const modal = document.getElementById('twilio-config-modal');
        if (modal) modal.style.display = 'none';

        if (window.refreshIntegrationsUI) window.refreshIntegrationsUI();

        return { success: true };
    },

    /**
     * Disconnect integration
     */
    async disconnect(providerId) {
        const provider = this.PROVIDERS[providerId];
        if (!provider) {
            return { success: false, error: 'Unknown provider' };
        }

        delete this.connected[providerId];
        this.saveState();

        showToast(`Disconnected from ${provider.name}`, 'info');
        return { success: true };
    },

    /**
     * Refresh expired token
     */
    async refreshToken(providerId) {
        const connection = this.connected[providerId];
        if (!connection || !connection.refreshToken) {
            return { success: false, error: 'No refresh token available' };
        }

        // In production, this would make an API call
        console.log(`[Integrations] Refreshing token for ${providerId}`);

        // Simulate refresh
        connection.accessToken = 'refreshed_' + Math.random().toString(36).substr(2, 9);
        connection.expiresAt = Date.now() + (3600 * 1000);
        this.saveState();

        return { success: true };
    },

    // ===========================================
    // PAYMENT STUBS
    // ===========================================

    payments: {
        /**
         * Create a payment intent
         */
        async createPaymentIntent(amount, currency = 'usd', options = {}) {
            const provider = IntegrationsService.getConnected().find(i => i.type === 'payment');
            if (!provider) {
                return { success: false, error: 'No payment provider connected' };
            }

            console.log(`[Payments] Creating payment intent: $${amount / 100} ${currency.toUpperCase()}`);

            // Simulate API call
            await IntegrationsService.delay(500);

            return {
                success: true,
                paymentIntent: {
                    id: 'pi_' + Math.random().toString(36).substr(2, 12),
                    amount,
                    currency,
                    status: 'requires_payment_method',
                    clientSecret: 'cs_' + Math.random().toString(36).substr(2, 20),
                    provider: provider.id
                }
            };
        },

        /**
         * Capture a payment
         */
        async capturePayment(paymentIntentId) {
            console.log(`[Payments] Capturing payment: ${paymentIntentId}`);
            await IntegrationsService.delay(300);

            return {
                success: true,
                payment: {
                    id: paymentIntentId,
                    status: 'succeeded',
                    capturedAt: new Date().toISOString()
                }
            };
        },

        /**
         * Refund a payment
         */
        async refundPayment(paymentId, amount = null) {
            console.log(`[Payments] Refunding payment: ${paymentId}, amount: ${amount || 'full'}`);
            await IntegrationsService.delay(300);

            return {
                success: true,
                refund: {
                    id: 're_' + Math.random().toString(36).substr(2, 12),
                    paymentId,
                    amount,
                    status: 'succeeded',
                    createdAt: new Date().toISOString()
                }
            };
        },

        /**
         * Get payment history
         */
        async getPaymentHistory(clientId = null, limit = 10) {
            await IntegrationsService.delay(200);

            // Return demo payment history
            return {
                success: true,
                payments: [
                    { id: 'pay_1', amount: 15000, currency: 'usd', status: 'succeeded', date: '2024-01-15', description: 'Facial Treatment' },
                    { id: 'pay_2', amount: 8500, currency: 'usd', status: 'succeeded', date: '2024-01-08', description: 'Botox Consultation' },
                    { id: 'pay_3', amount: 25000, currency: 'usd', status: 'succeeded', date: '2023-12-20', description: 'Package Purchase' }
                ].slice(0, limit)
            };
        }
    },

    // ===========================================
    // CALENDAR STUBS
    // ===========================================

    calendar: {
        /**
         * Get upcoming appointments
         */
        async getUpcomingAppointments(days = 7) {
            const provider = IntegrationsService.getConnected().find(i => i.type === 'calendar');
            if (!provider) {
                return { success: false, error: 'No calendar provider connected' };
            }

            console.log(`[Calendar] Fetching appointments for next ${days} days`);
            await IntegrationsService.delay(300);

            // Return demo appointments
            const today = new Date();
            return {
                success: true,
                appointments: [
                    {
                        id: 'evt_1',
                        title: 'Facial Treatment - Emma W.',
                        start: new Date(today.getTime() + 2 * 60 * 60 * 1000).toISOString(),
                        end: new Date(today.getTime() + 3 * 60 * 60 * 1000).toISOString(),
                        status: 'confirmed'
                    },
                    {
                        id: 'evt_2',
                        title: 'Consultation - New Client',
                        start: new Date(today.getTime() + 26 * 60 * 60 * 1000).toISOString(),
                        end: new Date(today.getTime() + 27 * 60 * 60 * 1000).toISOString(),
                        status: 'pending'
                    },
                    {
                        id: 'evt_3',
                        title: 'Botox Follow-up - Sarah M.',
                        start: new Date(today.getTime() + 50 * 60 * 60 * 1000).toISOString(),
                        end: new Date(today.getTime() + 51 * 60 * 60 * 1000).toISOString(),
                        status: 'confirmed'
                    }
                ],
                provider: provider.id
            };
        },

        /**
         * Create an appointment
         */
        async createAppointment(appointment) {
            const provider = IntegrationsService.getConnected().find(i => i.type === 'calendar');
            if (!provider) {
                return { success: false, error: 'No calendar provider connected' };
            }

            console.log('[Calendar] Creating appointment:', appointment);
            await IntegrationsService.delay(300);

            return {
                success: true,
                appointment: {
                    id: 'evt_' + Math.random().toString(36).substr(2, 8),
                    ...appointment,
                    status: 'confirmed',
                    provider: provider.id,
                    createdAt: new Date().toISOString()
                }
            };
        },

        /**
         * Update an appointment
         */
        async updateAppointment(appointmentId, updates) {
            console.log(`[Calendar] Updating appointment ${appointmentId}:`, updates);
            await IntegrationsService.delay(200);

            return {
                success: true,
                appointment: {
                    id: appointmentId,
                    ...updates,
                    updatedAt: new Date().toISOString()
                }
            };
        },

        /**
         * Cancel an appointment
         */
        async cancelAppointment(appointmentId, reason = '') {
            console.log(`[Calendar] Cancelling appointment: ${appointmentId}, reason: ${reason}`);
            await IntegrationsService.delay(200);

            return {
                success: true,
                status: 'cancelled',
                cancelledAt: new Date().toISOString()
            };
        },

        /**
         * Sync calendar events
         */
        async syncEvents() {
            const provider = IntegrationsService.getConnected().find(i => i.type === 'calendar');
            if (!provider) {
                return { success: false, error: 'No calendar provider connected' };
            }

            console.log('[Calendar] Syncing events...');
            showToast('Syncing calendar...', 'info');
            await IntegrationsService.delay(1000);

            showToast('Calendar synced!', 'success');
            return {
                success: true,
                synced: 12,
                added: 3,
                updated: 2,
                removed: 1
            };
        }
    },

    // ===========================================
    // HELPERS
    // ===========================================

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    /**
     * Build OAuth URL with minimal scopes
     */
    buildOAuthUrl(providerId, redirectUri) {
        const provider = this.PROVIDERS[providerId];
        if (!provider) return null;

        const params = new URLSearchParams({
            client_id: 'LUME_CLIENT_ID', // Would be actual client ID in production
            redirect_uri: redirectUri || `${window.location.origin}/oauth/callback`,
            response_type: 'code',
            scope: provider.scopes.join(' '),
            state: Math.random().toString(36).substr(2, 16) // CSRF protection
        });

        return `${provider.oauthUrl}?${params.toString()}`;
    }
};

// Initialize
IntegrationsService.init();

// Expose globally
window.IntegrationsService = IntegrationsService;

// ===========================================
// INTEGRATION SETTINGS UI
// ===========================================

window.renderIntegrationsSettings = function () {
    const integrations = IntegrationsService.getAvailable();
    const byType = {
        payment: integrations.filter(i => i.type === 'payment'),
        calendar: integrations.filter(i => i.type === 'calendar'),
        sms: integrations.filter(i => i.type === 'sms'),
        marketing: integrations.filter(i => i.type === 'marketing')
    };

    return `
        <div class="integrations-settings">
            <h3 style="margin-bottom: 20px;">Connected Services</h3>
            
            <div class="integration-section" style="margin-bottom: 32px;">
                <h4 style="font-size: 14px; color: var(--nav-text-secondary); margin-bottom: 12px;">💬 SMS & Messaging</h4>
                <div class="integrations-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px;">
                    ${byType.sms.map(renderIntegrationCard).join('')}
                </div>
            </div>

            <div class="integration-section" style="margin-bottom: 32px;">
                <h4 style="font-size: 14px; color: var(--nav-text-secondary); margin-bottom: 12px;">💳 Payment Providers</h4>
                <div class="integrations-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px;">
                    ${byType.payment.map(renderIntegrationCard).join('')}
                </div>
            </div>
            
            <div class="integration-section" style="margin-bottom: 32px;">
                <h4 style="font-size: 14px; color: var(--nav-text-secondary); margin-bottom: 12px;">📅 Calendar Sync</h4>
                <div class="integrations-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px;">
                    ${byType.calendar.map(renderIntegrationCard).join('')}
                </div>
            </div>
            
            <div class="integration-section">
                <h4 style="font-size: 14px; color: var(--nav-text-secondary); margin-bottom: 12px;">📧 Marketing</h4>
                <div class="integrations-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px;">
                    ${byType.marketing.map(renderIntegrationCard).join('')}
                </div>
            </div>
        </div>
    `;
};

function renderIntegrationCard(integration) {
    const statusBadge = integration.isConnected
        ? '<span style="background: #d1fae5; color: #059669; padding: 2px 8px; border-radius: 4px; font-size: 11px;">Connected</span>'
        : '<span style="background: rgba(255,255,255,0.1); color: var(--nav-text-secondary); padding: 2px 8px; border-radius: 4px; font-size: 11px;">Not connected</span>';

    const actionButton = integration.isConnected
        ? `<button class="btn btn-secondary" onclick="IntegrationsService.disconnect('${integration.id}').then(() => refreshIntegrationsUI())" style="padding: 6px 12px; font-size: 12px;">Disconnect</button>`
        : `<button class="btn btn-primary" onclick="IntegrationsService.connect('${integration.id}').then(() => refreshIntegrationsUI())" style="padding: 6px 12px; font-size: 12px;">Connect</button>`;

    return `
        <div class="integration-card" style="background: var(--nav-surface, #1E2438); border: 1px solid var(--nav-border, rgba(255,255,255,0.1)); border-radius: 12px; padding: 16px;">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                <div style="width: 40px; height: 40px; background: ${integration.color}20; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 20px;">
                    ${integration.icon}
                </div>
                <div style="flex: 1;">
                    <div style="font-weight: 600; color: var(--nav-text-primary);">${integration.name}</div>
                    ${statusBadge}
                </div>
            </div>
            <p style="font-size: 12px; color: var(--nav-text-secondary); margin-bottom: 12px;">${integration.description}</p>
            <div style="display: flex; justify-content: space-between; align-items: center;">
                ${actionButton}
                <a href="${integration.website}" target="_blank" style="font-size: 11px; color: var(--nav-accent);">Learn more →</a>
            </div>
        </div>
    `;
}

window.refreshIntegrationsUI = function () {
    const container = document.querySelector('.integrations-settings');
    if (container) {
        container.outerHTML = renderIntegrationsSettings();
    }
};
