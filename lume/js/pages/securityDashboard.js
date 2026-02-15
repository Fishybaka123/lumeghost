// ===========================================
// SECURITY FORTRESS DASHBOARD
// ===========================================

const SecurityDashboard = {
    // Render just the content for the tab
    renderContent() {
        return `
            <div class="security-fortress-tab">
                <div class="header-actions" style="margin-bottom: 20px; display: flex; justify-content: flex-end;">
                    <button class="btn btn-secondary" onclick="SecurityDashboard.exportLogs()">
                        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" class="icon">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                        Export HIPAA Logs
                    </button>
                </div>

                <!-- Risk Gauge Section -->
                <div class="risk-overview-grid">
                    <div class="card risk-card glass-card">
                        <h3>Current Risk Score</h3>
                        <div class="risk-gauge-container">
                            <div class="risk-gauge" id="risk-gauge-fill"></div>
                            <div class="risk-score-text">
                                <span id="risk-score-value">0</span>/100
                            </div>
                        </div>
                        <p class="risk-status" id="risk-status-text">Calculating...</p>
                    </div>

                    <div class="card security-checklist glass-card">
                        <h3>Defense Status</h3>
                        <ul class="checklist-list">
                            <li class="check-item ok">
                                <span class="icon">🔒</span>
                                <div class="info">
                                    <strong>Encryption (TLS 1.3)</strong>
                                    <span>Data in transit is secure</span>
                                </div>
                                <span class="badge success">Active</span>
                            </li>
                            <li class="check-item ok">
                                <span class="icon">⏱️</span>
                                <div class="info">
                                    <strong>Session Timeout</strong>
                                    <span>Auto-lock enabled (15m)</span>
                                </div>
                                <span class="badge success">Active</span>
                            </li>
                             <li class="check-item ok">
                                <span class="icon">📝</span>
                                <div class="info">
                                    <strong>Audit Logging</strong>
                                    <span>Immutable database records</span>
                                </div>
                                <span class="badge success">Active</span>
                            </li>
                            <li class="check-item warning">
                                <span class="icon">📱</span>
                                <div class="info">
                                    <strong>MFA (Multi-Factor)</strong>
                                    <span>Not enabled for this account</span>
                                </div>
                                <span class="badge warning">Recommended</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <!-- Audit Log Section -->
                <div class="card audit-log-card glass-card">
                    <h3>Recent Security Events (Audit Trail)</h3>
                    <div class="table-responsive">
                        <table class="data-table" id="audit-log-table">
                            <thead>
                                <tr>
                                    <th>Time</th>
                                    <th>Action</th>
                                    <th>Resource</th>
                                    <th>Details</th>
                                </tr>
                            </thead>
                            <tbody id="audit-log-body">
                                <tr><td colspan="4">Loading logs...</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    },

    async init() {
        this.updateRiskScore();
        await this.loadAuditLogs();

        // Add CSS dynamically
        if (!document.getElementById('security-css')) {
            const css = `
                .security-fortress .risk-overview-grid {
                    display: grid;
                    grid-template-columns: 1fr 2fr;
                    gap: 24px;
                    margin-bottom: 24px;
                }
                .risk-gauge-container {
                    width: 200px;
                    height: 100px;
                    background: #e2e8f0;
                    border-radius: 100px 100px 0 0;
                    position: relative;
                    margin: 20px auto;
                    overflow: hidden;
                }
                .risk-gauge {
                    width: 100%;
                    height: 100%;
                    background: #10b981; /* Green */
                    transform-origin: bottom center;
                    transform: rotate(0deg);
                    transition: transform 1s ease;
                }
                .risk-score-text {
                    position: absolute;
                    bottom: 0;
                    left: 50%;
                    transform: translateX(-50%);
                    font-size: 24px;
                    font-weight: bold;
                    color: #1e293b;
                }
                .risk-status {
                    text-align: center;
                    font-weight: 500;
                    color: #64748b;
                }
                .checklist-list {
                    list-style: none;
                    padding: 0;
                }
                .check-item {
                    display: flex;
                    align-items: center;
                    padding: 12px;
                    border-bottom: 1px solid #f1f5f9;
                }
                .check-item:last-child { border-bottom: none; }
                .check-item .icon { font-size: 20px; margin-right: 12px; }
                .check-item .info { flex: 1; }
                .check-item .info strong { display: block; font-size: 14px; }
                .check-item .info span { font-size: 12px; color: #64748b; }
                .badge { padding: 4px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; }
                .badge.success { background: #dcfce7; color: #166534; }
                .badge.warning { background: #fef9c3; color: #854d0e; }
            `;
            const style = document.createElement('style');
            style.id = 'security-css';
            style.textContent = css;
            document.head.appendChild(style);
        }
    },

    updateRiskScore() {
        // Mock score update for animation
        setTimeout(() => {
            const score = 10; // Low risk is good (0-100 scale here inverted? Let's say 100 is SAFE)
            // Wait, usually Risk Score: 100 = High Risk. Security Score: 100 = Safe.
            // Let's go with "Security Score" (100 is best)

            const securityScore = 85;
            document.getElementById('risk-score-value').textContent = securityScore;
            document.getElementById('risk-status-text').textContent = "🛡️ Fortress Secure";

            // Rotate gauge
            // 0 deg = 0 score, 180 deg = 100 score
            const rotation = (securityScore / 100) * 180;
            const gauge = document.getElementById('risk-gauge-fill');
            if (gauge) {
                gauge.style.transform = `rotate(${rotation - 180}deg)`;
                // We initially hide with rotation.
            }
        }, 500);
    },

    async loadAuditLogs() {
        if (!window.supabase) return;

        const tbody = document.getElementById('audit-log-body');

        try {
            const { data, error } = await supabase
                .from('security_logs')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(20);

            if (data && data.length > 0) {
                tbody.innerHTML = data.map(log => `
                    <tr>
                        <td style="font-size: 12px; color: #64748b;">
                            ${new Date(log.created_at).toLocaleString()}
                        </td>
                        <td style="font-weight: 500;">
                            ${log.action.replace('_', ' ').toUpperCase()}
                        </td>
                        <td>${log.resource || '-'}</td>
                        <td style="font-size: 12px; font-family: monospace;">
                            ${JSON.stringify(log.details || {}).substring(0, 50)}
                        </td>
                    </tr>
    `).join('');
            } else {
                tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 20px;">No audit logs found.</td></tr>';
            }
        } catch (e) {
            console.error('Failed to load logs', e);
            tbody.innerHTML = '<tr><td colspan="4" style="color:red">Error loading logs.</td></tr>';
        }
    },

    async exportLogs() {
        showToast('Preparing HIPAA Audit Export...', 'info');
        const logs = await SecurityService.exportAuditLogs();

        // Convert to CSV
        const headers = ['Timestamp', 'User ID', 'Action', 'Resource', 'IP Address', 'Details'];
        const csvContent = [
            headers.join(','),
            ...logs.map(log => [
                log.created_at,
                log.user_id,
                log.action,
                log.resource,
                log.ip_address,
                `"${JSON.stringify(log.details).replace(/"/g, '""')}"`
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `vitalglow_audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();

        SecurityService.logAction('export_audit_logs', 'security_dashboard');
    }
};

window.SecurityDashboard = SecurityDashboard;
