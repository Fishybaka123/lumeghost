// ===========================================
// ANALYTICS PAGE - Redesigned
// ===========================================

function renderAnalyticsPage() {
    const user = AuthService ? AuthService.getCurrentUser() :
        JSON.parse(sessionStorage.getItem('lume_user')) || { name: 'Admin', initials: 'AD' };

    // Get dynamic data from clients
    const clients = typeof ClientDataService !== 'undefined' ? ClientDataService.getAll() : [];
    const hasData = clients.length > 0;

    return `
        <div class="app-layout-topnav">
            ${createTopNav('analytics')}
            
            <main class="main-content" id="main-content">
                <div class="page-content analytics-page">
                    <!-- Page Header -->
                    <div class="page-header">
                        <div class="page-title-section">
                            <h1>📊 Analytics</h1>
                            <p>Track performance, monitor retention, and discover growth opportunities</p>
                        </div>
                        <div class="page-actions">
                            <select class="filter-select" id="analytics-timeframe" onchange="updateAnalyticsTimeframe(this.value)">
                                <option value="mtd">Month to Date</option>
                                <option value="ytd">Year to Date</option>
                                <option value="last30">Last 30 Days</option>
                                <option value="last90">Last 90 Days</option>
                            </select>
                            <button class="btn btn-primary" onclick="exportAnalyticsReport()">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                    <polyline points="7 10 12 15 17 10"/>
                                    <line x1="12" y1="15" x2="12" y2="3"/>
                                </svg>
                                Export Report
                            </button>
                        </div>
                    </div>
                    
                    ${hasData ? renderAnalyticsContent(clients) : renderEmptyAnalytics()}
                </div>
            </main>
        </div>
    `;
}

function renderEmptyAnalytics() {
    return `
        <div class="analytics-empty-state">
            <div class="empty-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="64" height="64">
                    <path d="M18 20V10"/>
                    <path d="M12 20V4"/>
                    <path d="M6 20v-6"/>
                </svg>
            </div>
            <h2>No Data Yet</h2>
            <p>Import your client data to see analytics and insights</p>
            <button class="btn btn-primary" onclick="navigateTo('/clients')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                Import Clients
            </button>
        </div>
    `;
}

function renderAnalyticsContent(clients) {
    const stats = calculateAnalyticsStats(clients);

    return `
        <!-- Key Metrics Section -->
        <section class="analytics-section">
            <div class="section-header">
                <div class="section-header-icon blue">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                        <polyline points="17 6 23 6 23 12"/>
                    </svg>
                </div>
                <div>
                    <h2>Key Metrics</h2>
                    <p>Your most important performance indicators</p>
                </div>
            </div>
            
            <div class="analytics-metrics-grid">
                ${createAnalyticsMetric('Total Clients', stats.totalClients || 0, '', 'users', 'blue')}
                ${createAnalyticsMetric('At-Risk Clients', stats.atRisk || 0, (stats.atRiskPercent || 0) + '%', 'alert-triangle', stats.atRisk > 0 ? 'coral' : 'emerald')}
                ${createAnalyticsMetric('Avg Health Score', stats.avgHealth || 0, 'of 100', 'heart', stats.avgHealth >= 70 ? 'emerald' : 'amber')}
                ${createAnalyticsMetric('Total Revenue', '$' + formatNumber(stats.totalRevenue || 0), 'lifetime', 'dollar-sign', 'purple')}
            </div>
        </section>
        
        <!-- Client Health Section -->
        <section class="analytics-section">
            <div class="section-header">
                <div class="section-header-icon emerald">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                    </svg>
                </div>
                <div>
                    <h2>Client Health Overview</h2>
                    <p>Monitor the wellness of your client relationships</p>
                </div>
            </div>
            
            <div class="analytics-cards-row">
                <div class="analytics-card">
                    <h3>Health Distribution</h3>
                    <div class="health-distribution">
                        ${renderHealthDistribution(stats)}
                    </div>
                </div>
                
                <div class="analytics-card">
                    <h3>Churn Risk Analysis</h3>
                    <div class="churn-analysis">
                        ${renderChurnAnalysis(stats)}
                    </div>
                </div>
            </div>
        </section>
        
        <!-- Retention Section -->
        <section class="analytics-section">
            <div class="section-header">
                <div class="section-header-icon purple">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                </div>
                <div>
                    <h2>Retention Insights</h2>
                    <p>Understand how clients move through your business</p>
                </div>
            </div>
            
            <div class="analytics-cards-row three-col">
                <div class="analytics-card">
                    <h3>Membership Breakdown</h3>
                    <div class="membership-breakdown">
                        ${renderMembershipBreakdown(stats)}
                    </div>
                </div>
                
                <div class="analytics-card">
                    <h3>Visit Frequency</h3>
                    <div class="visit-frequency">
                        ${renderVisitFrequency(stats)}
                    </div>
                </div>
                
                <div class="analytics-card">
                    <h3>Expiring Soon</h3>
                    <div class="expiring-clients">
                        ${renderExpiringClients(stats)}
                    </div>
                </div>
            </div>
        </section>
        
        <!-- AI Insights Section -->
        <section class="analytics-section">
            <div class="section-header">
                <div class="section-header-icon amber">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                </div>
                <div>
                    <h2>AI Insights</h2>
                    <p>Smart recommendations based on your data</p>
                </div>
            </div>
            
            <div class="insights-cards">
                ${renderAIInsightsCards(stats)}
            </div>
        </section>
    `;
}

function calculateAnalyticsStats(clients) {
    const totalClients = clients.length;
    const atRisk = clients.filter(c => c.churnRisk >= 60).length;
    const healthy = clients.filter(c => c.healthScore >= 70).length;
    const moderate = clients.filter(c => c.healthScore >= 40 && c.healthScore < 70).length;
    const poor = clients.filter(c => c.healthScore < 40).length;

    const avgHealth = totalClients > 0
        ? Math.round(clients.reduce((sum, c) => sum + (c.healthScore || 0), 0) / totalClients)
        : 0;

    const totalRevenue = clients.reduce((sum, c) => sum + (c.totalSpend || 0), 0);

    // Membership counts
    const vip = clients.filter(c => c.membershipType === 'vip').length;
    const premium = clients.filter(c => c.membershipType === 'premium').length;
    const basic = clients.filter(c => c.membershipType === 'basic').length;
    const none = clients.filter(c => !c.membershipType || c.membershipType === 'none').length;

    // Expiring soon (within 14 days)
    const expiringSoon = clients.filter(c => {
        if (!c.expireDate) return false;
        const days = Math.ceil((new Date(c.expireDate) - new Date()) / (1000 * 60 * 60 * 24));
        return days <= 14 && days > 0;
    }).length;

    // Low sessions
    const lowSessions = clients.filter(c => c.remainingSessions !== undefined && c.remainingSessions <= 2).length;

    return {
        totalClients,
        atRisk,
        atRiskPercent: totalClients > 0 ? Math.round((atRisk / totalClients) * 100) : 0,
        healthy,
        healthyPercent: totalClients > 0 ? Math.round((healthy / totalClients) * 100) : 0,
        moderate,
        moderatePercent: totalClients > 0 ? Math.round((moderate / totalClients) * 100) : 0,
        poor,
        poorPercent: totalClients > 0 ? Math.round((poor / totalClients) * 100) : 0,
        avgHealth,
        totalRevenue,
        vip, premium, basic, none,
        expiringSoon,
        lowSessions
    };
}

function createAnalyticsMetric(label, value, subtitle, icon, color) {
    const iconSvg = getMetricIcon(icon);

    return `
        <div class="analytics-metric ${color}">
            <div class="analytics-metric-icon">
                ${iconSvg}
            </div>
            <div class="analytics-metric-info">
                <span class="metric-value">${value}</span>
                <span class="metric-label">${label}</span>
                ${subtitle ? `<span class="metric-subtitle">${subtitle}</span>` : ''}
            </div>
        </div>
    `;
}

function getMetricIcon(type) {
    const icons = {
        'users': '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
        'alert-triangle': '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
        'heart': '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>',
        'dollar-sign': '<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>'
    };

    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24">${icons[type] || icons['users']}</svg>`;
}

function renderHealthDistribution(stats) {
    const total = stats.totalClients || 1;

    return `
        <div class="health-bars">
            <div class="health-bar-row">
                <div class="health-bar-label">
                    <span class="dot emerald"></span>
                    <span>Healthy (70+)</span>
                </div>
                <div class="health-bar-track">
                    <div class="health-bar-fill emerald" style="width: ${stats.healthyPercent}%"></div>
                </div>
                <span class="health-bar-value">${stats.healthy}</span>
            </div>
            <div class="health-bar-row">
                <div class="health-bar-label">
                    <span class="dot amber"></span>
                    <span>Moderate (40-69)</span>
                </div>
                <div class="health-bar-track">
                    <div class="health-bar-fill amber" style="width: ${stats.moderatePercent}%"></div>
                </div>
                <span class="health-bar-value">${stats.moderate}</span>
            </div>
            <div class="health-bar-row">
                <div class="health-bar-label">
                    <span class="dot coral"></span>
                    <span>At Risk (<40)</span>
                </div>
                <div class="health-bar-track">
                    <div class="health-bar-fill coral" style="width: ${stats.poorPercent}%"></div>
                </div>
                <span class="health-bar-value">${stats.poor}</span>
            </div>
        </div>
    `;
}

function renderChurnAnalysis(stats) {
    const riskLevel = stats.atRiskPercent >= 30 ? 'High' : stats.atRiskPercent >= 15 ? 'Moderate' : 'Low';
    const riskColor = stats.atRiskPercent >= 30 ? 'coral' : stats.atRiskPercent >= 15 ? 'amber' : 'emerald';

    return `
        <div class="churn-summary">
            <div class="churn-gauge-simple">
                <div class="gauge-circle ${riskColor}">
                    <span class="gauge-value">${stats.atRiskPercent}%</span>
                </div>
                <div class="gauge-info">
                    <span class="gauge-label">Churn Risk Rate</span>
                    <span class="gauge-status ${riskColor}">${riskLevel} Risk</span>
                </div>
            </div>
            <div class="churn-detail">
                <div class="churn-stat">
                    <span class="stat-num">${stats.atRisk}</span>
                    <span class="stat-label">At-Risk Clients</span>
                </div>
                <div class="churn-stat">
                    <span class="stat-num">${stats.lowSessions}</span>
                    <span class="stat-label">Low Sessions (≤2)</span>
                </div>
            </div>
        </div>
    `;
}

function renderMembershipBreakdown(stats) {
    const total = stats.totalClients || 1;
    const items = [
        { label: 'VIP', count: stats.vip, color: 'purple', percent: Math.round((stats.vip / total) * 100) },
        { label: 'Premium', count: stats.premium, color: 'blue', percent: Math.round((stats.premium / total) * 100) },
        { label: 'Basic', count: stats.basic, color: 'cyan', percent: Math.round((stats.basic / total) * 100) },
        { label: 'None', count: stats.none, color: 'gray', percent: Math.round((stats.none / total) * 100) }
    ];

    return `
        <div class="membership-list">
            ${items.map(item => `
                <div class="membership-row">
                    <span class="membership-dot ${item.color}"></span>
                    <span class="membership-label">${item.label}</span>
                    <span class="membership-count">${item.count}</span>
                    <span class="membership-percent">${item.percent}%</span>
                </div>
            `).join('')}
        </div>
    `;
}

function renderVisitFrequency(stats) {
    // This would need actual visit data - showing placeholder structure
    return `
        <div class="visit-summary">
            <div class="visit-stat-large">
                <span class="visit-num">${stats.totalClients}</span>
                <span class="visit-label">Total Clients</span>
            </div>
            <p class="visit-note">Import client visit history to see detailed frequency analytics</p>
        </div>
    `;
}

function renderExpiringClients(stats) {
    if (stats.expiringSoon === 0) {
        return `
            <div class="expiring-empty">
                <span class="check-icon">✓</span>
                <p>No memberships expiring in the next 14 days</p>
            </div>
        `;
    }

    return `
        <div class="expiring-alert">
            <div class="expiring-count">
                <span class="count-num">${stats.expiringSoon}</span>
                <span class="count-label">Expiring Soon</span>
            </div>
            <p class="expiring-note">Within the next 14 days</p>
            <button class="btn btn-sm btn-secondary" onclick="navigateTo('/clients')">View Clients</button>
        </div>
    `;
}

function renderAIInsightsCards(stats) {
    const insights = [];

    // Generate dynamic insights based on data
    if (stats.atRiskPercent >= 20) {
        insights.push({
            type: 'warning',
            icon: '⚠️',
            title: 'High Churn Alert',
            message: `${stats.atRisk} clients are at high risk of churning. Consider sending personalized nudges to re-engage them.`
        });
    }

    if (stats.healthyPercent >= 60) {
        insights.push({
            type: 'success',
            icon: '✅',
            title: 'Strong Retention',
            message: `${stats.healthyPercent}% of your clients are healthy. Keep up the excellent engagement!`
        });
    }

    if (stats.expiringSoon > 0) {
        insights.push({
            type: 'info',
            icon: '📅',
            title: 'Renewals Due',
            message: `${stats.expiringSoon} memberships expire soon. Reach out to encourage renewals.`
        });
    }

    if (stats.none > stats.vip + stats.premium) {
        insights.push({
            type: 'opportunity',
            icon: '💡',
            title: 'Membership Opportunity',
            message: 'Many clients don\'t have a membership. Consider creating a campaign to convert them.'
        });
    }

    if (insights.length === 0) {
        insights.push({
            type: 'success',
            icon: '🎉',
            title: 'Looking Great!',
            message: 'Your client base is healthy. Continue your current engagement strategy.'
        });
    }

    return insights.map(insight => `
        <div class="insight-card ${insight.type}">
            <span class="insight-icon">${insight.icon}</span>
            <div class="insight-content">
                <h4>${insight.title}</h4>
                <p>${insight.message}</p>
            </div>
        </div>
    `).join('');
}

function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}

function updateAnalyticsTimeframe(timeframe) {
    showToast(`Updated to ${timeframe.toUpperCase()} view`, 'info');
}

function exportAnalyticsReport() {
    showToast('📊 Generating analytics report...', 'info');
    setTimeout(() => {
        showToast('✅ Report ready for download!', 'success');
    }, 1500);
}
