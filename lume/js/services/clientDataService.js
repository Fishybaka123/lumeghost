// ===========================================
// CLIENT DATA SERVICE - SUPABASE DB INTEGRATION
// ===========================================

const ClientDataService = {
    // In-memory cache
    _clients: [],
    _initialized: false,

    /**
     * Initialize - load from Supabase
     */
    async init() {
        if (!supabase) return [];
        if (this._initialized) return this._clients;

        try {
            // Check if user is logged in first
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                console.log('ℹ️ No active session, skipping data load');
                return [];
            }

            const { data, error } = await supabase
                .from('clients')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Map DB columns to app keys if necessary (snake_case -> camelCase)
            this._clients = data.map(this._mapFromDB);

            // Analyze loaded clients
            this._clients = this._enrichClients(this._clients);

            window.CLIENTS = this._clients;
            this._initialized = true;
            console.log(`✅ Loaded ${this._clients.length} clients from Supabase`);

            // Notify app that data is ready
            window.dispatchEvent(new CustomEvent('lume-clients-loaded', { detail: { count: this._clients.length } }));

            return this._clients;
        } catch (error) {
            console.error('Failed to load clients:', error);
            return [];
        }
    },

    /**
     * Check if data is loaded
     */
    isInitialized() {
        return this._initialized;
    },

    /**
     * Get all clients
     */
    getAll() {
        return this._clients;
    },

    /**
     * Get client by ID
     */
    getById(id) {
        return this._clients.find(c => c.id == id);
    },

    /**
     * Add a new client
     */
    async add(clientData) {
        if (!supabase) return null;

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            // Name parsing logic
            let firstName = clientData.firstName;
            let lastName = clientData.lastName;

            if (!firstName && clientData.name) {
                const nameParts = clientData.name.trim().split(' ');
                firstName = nameParts[0];
                lastName = nameParts.slice(1).join(' ') || '';
                // Handle comma format "Last, First"
                if (clientData.name.includes(',')) {
                    const parts = clientData.name.split(',');
                    lastName = parts[0].trim();
                    firstName = parts[1].trim();
                }
            }

            // Prepare for DB
            const dbPayload = {
                user_id: user.id,
                first_name: firstName || 'Unknown',
                last_name: lastName || '',
                email: clientData.email,
                phone: clientData.phone,
                status: clientData.status || 'active',
                membership_type: clientData.membershipTier || clientData.membershipType || clientData.packageName || 'None',
                remaining_sessions: (String(clientData.remainingSessions).toLowerCase().includes('unlimited')) ? -1 : (parseInt(clientData.remainingSessions) || 0),
                expire_date: clientData.expireDate ? new Date(clientData.expireDate) : null,
                total_spend: parseFloat(clientData.totalSpent) || 0,
                visit_count: parseInt(clientData.visitCount) || 0,
                last_visit: clientData.lastVisit ? new Date(clientData.lastVisit) : new Date()
            };

            const { data, error } = await supabase
                .from('clients')
                .insert([dbPayload])
                .select()
                .single();

            if (error) throw error;

            const newClient = this._enrichClients([this._mapFromDB(data)])[0];
            this._clients.unshift(newClient);
            window.CLIENTS = this._clients;

            return newClient;
        } catch (error) {
            console.error('Failed to add client:', error);
            throw error;
        }
    },

    /**
     * Add multiple clients at once (Batch)
     */
    async batchAdd(clientsData) {
        if (!supabase || !clientsData.length) return { success: true, count: 0 };

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            // Prepare payloads
            const dbPayloads = clientsData.map(c => {
                // Name parsing logic
                let firstName = c.firstName;
                let lastName = c.lastName;

                if (!firstName && c.name) {
                    const nameParts = c.name.trim().split(' ');
                    firstName = nameParts[0];
                    lastName = nameParts.slice(1).join(' ') || '';
                    // Handle comma format "Last, First"
                    if (c.name.includes(',')) {
                        const parts = c.name.split(',');
                        lastName = parts[0].trim();
                        firstName = parts[1].trim();
                    }
                }

                return {
                    user_id: user.id,
                    first_name: firstName || 'Unknown',
                    last_name: lastName || '',
                    email: c.email,
                    phone: c.phone,
                    status: c.status || 'active',
                    membership_type: c.membershipTier || c.membershipType || c.packageName || 'None',
                    remaining_sessions: (String(c.remainingSessions).toLowerCase().includes('unlimited')) ? -1 : (parseInt(c.remainingSessions) || 0),
                    expire_date: c.expireDate ? new Date(c.expireDate) : null,
                    total_spend: parseFloat(c.totalSpent) || 0,
                    visit_count: parseInt(c.visitCount) || 0,
                    last_visit: c.lastVisit ? new Date(c.lastVisit) : new Date()
                };
            });

            // Supabase allows bulk insert
            console.log("🚀 Payload to Supabase:", dbPayloads);
            const { data, error } = await supabase
                .from('clients')
                .insert(dbPayloads)
                .select();

            if (error) {
                console.error("❌ Supabase Batch Insert Error:", error);
                throw error;
            }
            console.log("✅ Supabase Return:", data);

            if (!data || data.length === 0) {
                console.warn("⚠️ Warning: Insert succeeded but returned NO data (possible RLS blocking SELECT).");
            }

            const newClients = this._enrichClients(data.map(this._mapFromDB));
            this._clients = [...newClients, ...this._clients]; // Prepend? Or refetch.
            window.CLIENTS = this._clients;

            // Notify app using refined event
            window.dispatchEvent(new CustomEvent('lume-clients-loaded', { detail: { count: this._clients.length } }));

            // Debug alert for user
            try {
                // Check if running in browser
                // alert(`Debug: Inserted ${data.length} records to DB.`); 
            } catch (e) { }

            return { success: true, count: newClients.length, clients: newClients };

        } catch (error) {
            console.error('Batch add error:', error);
            throw error;
        }
    },

    /**
     * Delete a client
     */
    async delete(clientId) {
        if (!supabase) return false;

        try {
            const { error } = await supabase
                .from('clients')
                .delete()
                .eq('id', clientId);

            if (error) throw error;

            this._clients = this._clients.filter(c => c.id != clientId);
            window.CLIENTS = this._clients;
            return true;
        } catch (error) {
            console.error('Failed to delete client:', error);
            return false;
        }
    },

    /**
     * Delete ALL clients for current user
     */
    async deleteAll() {
        if (!supabase) return false;

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const { error } = await supabase
                .from('clients')
                .delete()
                .eq('user_id', user.id);

            if (error) throw error;

            this._clients = [];
            window.CLIENTS = [];

            // Notify app
            window.dispatchEvent(new CustomEvent('lume-clients-loaded', { detail: { count: 0 } }));

            return true;
        } catch (error) {
            console.error('Failed to delete all clients:', error);
            return false;
        }
    },

    /**
     * Helper: Map DB snake_case to app camelCase
     */
    _mapFromDB(record) {
        // Convert -1 back to 'Unlimited' for display
        let sessions = record.remaining_sessions;
        if (sessions === -1) sessions = 'Unlimited';

        return {
            id: record.id,
            firstName: record.first_name,
            lastName: record.last_name,
            email: record.email,
            phone: record.phone,
            membershipType: record.membership_type,
            packageName: record.membership_type,  // packageName stored in membership_type column
            status: record.status,
            joinDate: record.join_date,
            expireDate: record.expire_date,
            remainingSessions: sessions,
            totalSessions: record.total_sessions,
            visitCount: record.visit_count || 0,
            totalSpend: record.total_spend || 0,
            lastVisit: record.last_visit,

            // Map analyzed fields if they exist in DB (fallback for enrichment)
            healthScore: record.health_score || 50,
            churnRisk: record.churn_risk || 0,

            // Generate UI fields
            avatarColor: window.generateAvatarColor ?
                window.generateAvatarColor(record.first_name, record.last_name) : '#3b82f6',

            raw: record
        };
    },

    /**
    * Helper: Enrich with AI analysis
    */
    _enrichClients(clients) {
        if (typeof AdvancedChurnCalculator !== 'undefined') {
            return clients.map(c => {
                try {
                    const analysis = AdvancedChurnCalculator.analyze(c);
                    return { ...c, ...analysis };
                } catch (e) {
                    console.warn(`Failed to enrich client ${c.id}:`, e);
                    return c; // Return basic client if analysis fails
                }
            });
        }
        return clients;
    },

    /**
     * Get summary statistics
     */
    getStats() {
        const clients = this.getAll();

        return {
            total: clients.length,
            atRisk: clients.filter(c => c.churnRisk >= 40).length,
            healthy: clients.filter(c => c.healthScore >= 70).length,
            expiringSoon: clients.filter(c => {
                if (!c.expireDate) return false;
                const days = Math.ceil((new Date(c.expireDate) - new Date()) / (1000 * 60 * 60 * 24));
                return days <= 14 && days > 0;
            }).length,
            lowSessions: clients.filter(c => c.remainingSessions <= 2).length
        };
    }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    ClientDataService.init();
});

// Listen for login event to re-init
window.addEventListener('lume:auth:login', () => {
    console.log('🔑 Login detected, initializing ClientDataService...');
    ClientDataService._initialized = false; // Force re-fetch
    ClientDataService.init();
});

// Export for use
window.ClientDataService = ClientDataService;
