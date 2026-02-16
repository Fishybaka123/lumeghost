// ===========================================
// CLIENT DATA SERVICE
// Central data management with localStorage persistence
// ===========================================

const ClientDataService = {
    STORAGE_KEY: 'lume_imported_clients',

    /**
     * Initialize - load from storage or use defaults
     */
    init() {
        const stored = this.loadFromStorage();
        if (stored && stored.length > 0) {
            // Replace CLIENTS with imported data
            window.CLIENTS = stored;
            console.log(`Loaded ${stored.length} clients from storage`);
        }
        return window.CLIENTS;
    },

    /**
     * Import clients from CSV and save
     */
    importFromCSV(csvText) {
        try {
            // Parse CSV
            let clients = CSVParser.parse(csvText);

            // Analyze each client for churn risk
            if (typeof AdvancedChurnCalculator !== 'undefined') {
                clients = clients.map(c => {
                    const analysis = AdvancedChurnCalculator.analyze(c);
                    return { ...c, ...analysis };
                });
            } else {
                clients = ChurnAnalyzer.analyzeAll(clients);
            }

            // Save to storage
            this.saveToStorage(clients);

            // Update global CLIENTS
            window.CLIENTS = clients;

            return {
                success: true,
                count: clients.length,
                clients
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    },

    /**
     * Get all clients
     */
    getAll() {
        return window.CLIENTS || [];
    },

    /**
     * Get client by ID
     */
    getById(id) {
        const clients = this.getAll();
        return clients.find(c => c.id === parseInt(id));
    },

    /**
     * Update a client
     */
    update(clientId, updates) {
        const clients = this.getAll();
        const index = clients.findIndex(c => c.id === parseInt(clientId));

        if (index !== -1) {
            // Merge updates
            clients[index] = { ...clients[index], ...updates };

            // Re-analyze if relevant fields changed
            if (updates.remainingSessions !== undefined ||
                updates.expireDate !== undefined) {
                const analysis = typeof AdvancedChurnCalculator !== 'undefined'
                    ? AdvancedChurnCalculator.analyze(clients[index])
                    : ChurnAnalyzer.analyze(clients[index]);
                clients[index] = { ...clients[index], ...analysis };
            }

            // Save
            this.saveToStorage(clients);
            window.CLIENTS = clients;

            return clients[index];
        }
        return null;
    },

    /**
     * Add a new client
     */
    add(clientData) {
        const clients = this.getAll();

        // Generate ID
        clientData.id = Date.now();

        // Analyze
        const analysis = typeof AdvancedChurnCalculator !== 'undefined'
            ? AdvancedChurnCalculator.analyze(clientData)
            : ChurnAnalyzer.analyze(clientData);
        const newClient = { ...clientData, ...analysis };

        clients.push(newClient);
        this.saveToStorage(clients);
        window.CLIENTS = clients;

        return newClient;
    },

    /**
     * Delete a client
     */
    delete(clientId) {
        let clients = this.getAll();
        clients = clients.filter(c => c.id !== parseInt(clientId));
        this.saveToStorage(clients);
        window.CLIENTS = clients;
        return true;
    },

    /**
     * Save to localStorage
     */
    saveToStorage(clients) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(clients));
            return true;
        } catch (e) {
            console.error('Failed to save clients:', e);
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
            console.error('Failed to load clients:', e);
            return null;
        }
    },

    /**
     * Clear all client data (reset to empty)
     */
    clearImportedData() {
        localStorage.removeItem(this.STORAGE_KEY);
        window.CLIENTS = [];
    },

    /**
     * Reset to demo data for testing
     */
    resetToDemoData() {
        // Clear storage and reload to get fresh empty state
        localStorage.removeItem(this.STORAGE_KEY);
        location.reload();
    },

    /**
     * Check if using imported data
     */
    isUsingImportedData() {
        return localStorage.getItem(this.STORAGE_KEY) !== null;
    },

    /**
     * Get summary statistics
     */
    getStats() {
        const clients = this.getAll();

        return {
            total: clients.length,
            atRisk: clients.filter(c => c.churnRisk >= 60).length,
            healthy: clients.filter(c => c.healthScore >= 70).length,
            expiringSoon: clients.filter(c => {
                if (!c.expireDate) return false;
                const days = Math.ceil((new Date(c.expireDate) - new Date()) / (1000 * 60 * 60 * 24));
                return days <= 14 && days > 0;
            }).length,
            lowSessions: clients.filter(c => c.remainingSessions <= 2).length,
            byMembership: {
                vip: clients.filter(c => c.membershipType === 'vip').length,
                premium: clients.filter(c => c.membershipType === 'premium').length,
                basic: clients.filter(c => c.membershipType === 'basic').length,
                none: clients.filter(c => !c.membershipType || c.membershipType === 'none').length
            }
        };
    }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    ClientDataService.init();
});

// Export for use
window.ClientDataService = ClientDataService;
