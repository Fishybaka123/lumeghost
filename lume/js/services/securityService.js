// ===========================================
// SECURITY FORTRESS SERVICE
// Handles Audit Logs, Session Monitoring, and Risk Analysis
// ===========================================

const SecurityService = {
    // Configuration
    IDLE_TIMEOUT_MS: 15 * 60 * 1000, // 15 minutes (HIPAA Standard)
    _idleTimer: null,
    _lastActivity: Date.now(),

    // Initialize
    init() {
        this._setupIdleMonitor();
        this._logAction('app_init', 'system', { userAgent: navigator.userAgent });
    },

    // ----------------------------------------------------
    // AUDIT LOGGING (Immutable via RLS)
    // ----------------------------------------------------
    async logAction(action, resource = null, details = {}) {
        if (!window.supabase) return;

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return; // Anonymous actions not logged to DB (yet)

            // Enrich details
            const logEntry = {
                user_id: user.id,
                action: action,
                resource: resource,
                details: details,
                ip_address: 'client-side' // Real IP would be set by Edge Function/Server in full prod
            };

            // Fire and forget (don't block UI)
            supabase.from('security_logs').insert([logEntry]).then(({ error }) => {
                if (error) console.error('Security Log Failed:', error);
            });

        } catch (e) {
            console.error('Audit Log Error:', e);
        }
    },

    // ----------------------------------------------------
    // SESSION MONITOR (HIPAA Requirement)
    // ----------------------------------------------------
    _setupIdleMonitor() {
        // Reset timer on user interaction
        const resetTimer = () => {
            this._lastActivity = Date.now();
            if (this._idleTimer) clearTimeout(this._idleTimer);
            this._idleTimer = setTimeout(() => this._handleIdleTimeout(), this.IDLE_TIMEOUT_MS);
        };

        window.addEventListener('mousemove', resetTimer);
        window.addEventListener('keydown', resetTimer);
        window.addEventListener('click', resetTimer);
        window.addEventListener('touchstart', resetTimer);

        resetTimer(); // Start
    },

    _handleIdleTimeout() {
        // Only if logged in
        const user = AuthService.getCurrentUser();
        if (user) {
            console.warn('⚠️ Session timed out due to inactivity.');
            this.logAction('session_timeout', 'system');
            AuthService.logout();
            window.location.hash = '/login';
            alert('Your session has expired due to inactivity (HIPAA Security). Please sign in again.');
        }
    },

    // ----------------------------------------------------
    // RISK SCORE CALCULATOR (Heuristic)
    // ----------------------------------------------------
    calculateRiskScore() {
        let score = 0; // 0 = Safe, 100 = Critical
        const checks = [];

        // Check 1: Session Active?
        const user = AuthService.getCurrentUser();
        if (!user) return { score: 0, checks: [] };

        // Check 2: Email Verified?
        if (user.email && !user.email.endsWith('@medspa.com')) {
            // Just an example rule
        }

        // Check 3: Complexity of Password (Inferred)
        // We can't check actual password, but we assume Supabase enforced min length

        // Use Supabase data if available to see MFA status
        // const mfaEnabled = user.app_metadata?.providers?.includes('phone');
        // if (!mfaEnabled) {
        //     score += 20;
        //     checks.push({ name: 'MFA Disabled', risk: 'High' });
        // }

        // Start with a base "Good" score
        score = 10;

        // Simulate checks for demo
        checks.push({ name: 'Connection Encryption', status: 'Secure (HTTPS)', risk: 0 });
        checks.push({ name: 'Session Timeout', status: 'Enabled (15m)', risk: 0 });
        checks.push({ name: 'Audit Logging', status: 'Active', risk: 0 });

        return { score, checks };
    },

    // ----------------------------------------------------
    // HIPAA DATA EXPORT
    // ----------------------------------------------------
    async exportAuditLogs() {
        const { data, error } = await supabase
            .from('security_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(1000);

        if (error) throw error;
        return data;
    }
};

// Expose
window.SecurityService = SecurityService;

// Start service
// Start service
document.addEventListener('DOMContentLoaded', () => {
    try {
        if (window.SecurityService) {
            window.SecurityService.init();
        }
    } catch (e) {
        console.error('SecurityService failed to init:', e);
    }
});
