// ===========================================
// API CLIENT - HTTP Client with JWT Auth
// Automatic Token Refresh, Interceptors, Offline Queue
// ===========================================

const APIClient = {
    // Configuration
    config: {
        baseURL: '/api/v1',
        timeout: 30000,
        retries: 3,
        retryDelay: 1000
    },

    // Token storage
    tokens: {
        access: null,
        refresh: null,
        expiresAt: null
    },

    // Request queue for offline mode
    offlineQueue: [],
    isOnline: navigator.onLine,

    // Request interceptors
    requestInterceptors: [],
    responseInterceptors: [],

    // ===========================================
    // INITIALIZATION
    // ===========================================

    init() {
        this.loadTokens();
        this.setupOnlineStatusListener();
        this.loadOfflineQueue();
    },

    loadTokens() {
        try {
            const stored = sessionStorage.getItem('lume_api_tokens');
            if (stored) {
                this.tokens = JSON.parse(stored);
            }
        } catch (e) {
            console.error('Failed to load API tokens:', e);
        }
    },

    saveTokens() {
        sessionStorage.setItem('lume_api_tokens', JSON.stringify(this.tokens));
    },

    clearTokens() {
        this.tokens = { access: null, refresh: null, expiresAt: null };
        sessionStorage.removeItem('lume_api_tokens');
    },

    setupOnlineStatusListener() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.processOfflineQueue();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
        });
    },

    // ===========================================
    // TOKEN MANAGEMENT
    // ===========================================

    setTokens(accessToken, refreshToken, expiresIn = 3600) {
        this.tokens = {
            access: accessToken,
            refresh: refreshToken,
            expiresAt: Date.now() + (expiresIn * 1000)
        };
        this.saveTokens();
    },

    getAccessToken() {
        return this.tokens.access;
    },

    isTokenExpired() {
        if (!this.tokens.expiresAt) return true;
        // Consider expired 60 seconds before actual expiry
        return Date.now() > (this.tokens.expiresAt - 60000);
    },

    async refreshToken() {
        if (!this.tokens.refresh) {
            throw new Error('No refresh token available');
        }

        try {
            const response = await this.request('/auth/refresh', {
                method: 'POST',
                body: { refreshToken: this.tokens.refresh },
                skipAuth: true,
                skipRefresh: true
            });

            if (response.success && response.data) {
                this.setTokens(
                    response.data.accessToken,
                    response.data.refreshToken || this.tokens.refresh,
                    response.data.expiresIn
                );
                return true;
            }

            return false;
        } catch (error) {
            console.error('Token refresh failed:', error);
            this.clearTokens();
            throw error;
        }
    },

    // ===========================================
    // REQUEST METHODS
    // ===========================================

    /**
     * Make HTTP request
     * @param {string} endpoint - API endpoint
     * @param {Object} options - Request options
     */
    async request(endpoint, options = {}) {
        const {
            method = 'GET',
            body = null,
            headers = {},
            skipAuth = false,
            skipRefresh = false,
            timeout = this.config.timeout,
            retries = this.config.retries,
            queueIfOffline = false
        } = options;

        // Check online status
        if (!this.isOnline && queueIfOffline) {
            return this.queueForLater(endpoint, options);
        }

        // Build URL
        const url = this.buildURL(endpoint);

        // Build headers
        const requestHeaders = {
            'Content-Type': 'application/json',
            ...headers
        };

        // Add auth header
        if (!skipAuth && this.tokens.access) {
            // Refresh token if expired
            if (!skipRefresh && this.isTokenExpired()) {
                try {
                    await this.refreshToken();
                } catch (e) {
                    // Token refresh failed, continue without auth
                    console.warn('Token refresh failed, proceeding without auth');
                }
            }

            if (this.tokens.access) {
                requestHeaders['Authorization'] = `Bearer ${this.tokens.access}`;
            }
        }

        // Run request interceptors
        let requestConfig = { url, method, headers: requestHeaders, body };
        for (const interceptor of this.requestInterceptors) {
            requestConfig = await interceptor(requestConfig);
        }

        // Make request with retries
        let lastError;
        for (let attempt = 0; attempt <= retries; attempt++) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), timeout);

                const response = await fetch(requestConfig.url, {
                    method: requestConfig.method,
                    headers: requestConfig.headers,
                    body: requestConfig.body ? JSON.stringify(requestConfig.body) : null,
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                // Parse response
                let data;
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    data = await response.json();
                } else {
                    data = await response.text();
                }

                // Build response object
                let result = {
                    success: response.ok,
                    status: response.status,
                    statusText: response.statusText,
                    data,
                    headers: Object.fromEntries(response.headers.entries())
                };

                // Run response interceptors
                for (const interceptor of this.responseInterceptors) {
                    result = await interceptor(result);
                }

                // Handle error responses
                if (!response.ok) {
                    const error = new Error(data.message || data.error || 'Request failed');
                    error.status = response.status;
                    error.data = data;
                    throw error;
                }

                return result;

            } catch (error) {
                lastError = error;

                // Don't retry on auth errors or client errors
                if (error.status && error.status >= 400 && error.status < 500) {
                    throw error;
                }

                // Don't retry on abort
                if (error.name === 'AbortError') {
                    throw new Error('Request timeout');
                }

                // Wait before retry
                if (attempt < retries) {
                    await this.delay(this.config.retryDelay * Math.pow(2, attempt));
                }
            }
        }

        throw lastError;
    },

    // Convenience methods
    async get(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'GET' });
    },

    async post(endpoint, body, options = {}) {
        return this.request(endpoint, { ...options, method: 'POST', body });
    },

    async put(endpoint, body, options = {}) {
        return this.request(endpoint, { ...options, method: 'PUT', body });
    },

    async patch(endpoint, body, options = {}) {
        return this.request(endpoint, { ...options, method: 'PATCH', body });
    },

    async delete(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'DELETE' });
    },

    // ===========================================
    // OFFLINE QUEUE
    // ===========================================

    loadOfflineQueue() {
        try {
            const stored = localStorage.getItem('lume_api_queue');
            this.offlineQueue = stored ? JSON.parse(stored) : [];
        } catch (e) {
            this.offlineQueue = [];
        }
    },

    saveOfflineQueue() {
        localStorage.setItem('lume_api_queue', JSON.stringify(this.offlineQueue));
    },

    queueForLater(endpoint, options) {
        const queueItem = {
            id: Date.now() + Math.random().toString(36).substr(2, 9),
            endpoint,
            options,
            timestamp: Date.now()
        };

        this.offlineQueue.push(queueItem);
        this.saveOfflineQueue();

        return {
            success: true,
            queued: true,
            queueId: queueItem.id,
            message: 'Request queued for when online'
        };
    },

    async processOfflineQueue() {
        if (this.offlineQueue.length === 0) return;

        console.log(`[API] Processing ${this.offlineQueue.length} queued requests`);

        const queue = [...this.offlineQueue];
        this.offlineQueue = [];
        this.saveOfflineQueue();

        for (const item of queue) {
            try {
                await this.request(item.endpoint, {
                    ...item.options,
                    queueIfOffline: false // Prevent re-queuing
                });
                console.log(`[API] Queued request processed: ${item.endpoint}`);
            } catch (error) {
                console.error(`[API] Queued request failed: ${item.endpoint}`, error);
                // Re-queue on failure
                this.offlineQueue.push(item);
            }
        }

        this.saveOfflineQueue();
    },

    // ===========================================
    // INTERCEPTORS
    // ===========================================

    addRequestInterceptor(interceptor) {
        this.requestInterceptors.push(interceptor);
        return () => {
            const index = this.requestInterceptors.indexOf(interceptor);
            if (index >= 0) this.requestInterceptors.splice(index, 1);
        };
    },

    addResponseInterceptor(interceptor) {
        this.responseInterceptors.push(interceptor);
        return () => {
            const index = this.responseInterceptors.indexOf(interceptor);
            if (index >= 0) this.responseInterceptors.splice(index, 1);
        };
    },

    // ===========================================
    // HELPERS
    // ===========================================

    buildURL(endpoint) {
        if (endpoint.startsWith('http')) return endpoint;
        return `${this.config.baseURL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    },

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};

// ===========================================
// API ENDPOINTS DEFINITIONS
// ===========================================

const API = {
    // Auth endpoints
    auth: {
        login: (email, password) => APIClient.post('/auth/login', { email, password }, { skipAuth: true }),
        register: (data) => APIClient.post('/auth/register', data, { skipAuth: true }),
        logout: () => APIClient.post('/auth/logout'),
        refresh: () => APIClient.post('/auth/refresh', { refreshToken: APIClient.tokens.refresh }, { skipAuth: true }),
        me: () => APIClient.get('/auth/me'),
        verifyMFA: (code) => APIClient.post('/auth/mfa/verify', { code }),
    },

    // Client endpoints
    clients: {
        list: (params = {}) => APIClient.get('/clients', { params }),
        get: (id) => APIClient.get(`/clients/${id}`),
        create: (data) => APIClient.post('/clients', data, { queueIfOffline: true }),
        update: (id, data) => APIClient.patch(`/clients/${id}`, data, { queueIfOffline: true }),
        delete: (id) => APIClient.delete(`/clients/${id}`),
        search: (query) => APIClient.get(`/clients/search?q=${encodeURIComponent(query)}`),
        import: (data) => APIClient.post('/clients/import', data),
        export: (format) => APIClient.get(`/clients/export?format=${format}`),
    },

    // Analytics endpoints
    analytics: {
        dashboard: () => APIClient.get('/analytics/dashboard'),
        churnRisk: () => APIClient.get('/analytics/churn-risk'),
        retention: (period) => APIClient.get(`/analytics/retention?period=${period}`),
        revenue: (period) => APIClient.get(`/analytics/revenue?period=${period}`),
        healthScores: () => APIClient.get('/analytics/health-scores'),
    },

    // Communications endpoints
    communications: {
        list: (params = {}) => APIClient.get('/communications', { params }),
        get: (id) => APIClient.get(`/communications/${id}`),
        send: (data) => APIClient.post('/communications', data, { queueIfOffline: true }),
        markRead: (id) => APIClient.patch(`/communications/${id}/read`),
        getStats: () => APIClient.get('/communications/stats'),
    },

    // Nudges endpoints
    nudges: {
        list: () => APIClient.get('/nudges'),
        generate: (clientId) => APIClient.post(`/nudges/generate/${clientId}`),
        send: (nudgeId) => APIClient.post(`/nudges/${nudgeId}/send`, null, { queueIfOffline: true }),
        dismiss: (nudgeId) => APIClient.patch(`/nudges/${nudgeId}/dismiss`),
    },

    // Settings endpoints
    settings: {
        get: () => APIClient.get('/settings'),
        update: (data) => APIClient.patch('/settings', data),
        updatePassword: (current, newPassword) => APIClient.post('/settings/password', { current, newPassword }),
    },

    // Integrations endpoints
    integrations: {
        list: () => APIClient.get('/integrations'),
        connect: (provider) => APIClient.get(`/integrations/${provider}/connect`),
        disconnect: (provider) => APIClient.delete(`/integrations/${provider}`),
        sync: (provider) => APIClient.post(`/integrations/${provider}/sync`),
    }
};

// Initialize
APIClient.init();

// Expose globally
window.APIClient = APIClient;
window.API = API;
