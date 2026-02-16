// ===========================================
// ANALYTICS PAGE - Redesigned
// ===========================================

function renderAnalyticsPage() {
    const user = AuthService ? AuthService.getCurrentUser() :
        JSON.parse(sessionStorage.getItem('lume_user')) || { name: 'Admin', initials: 'AD' };

    // Get dynamic data from clients and enrich with real-time analysis
    let clients = typeof ClientDataService !== 'undefined' ? ClientDataService.getAll() : [];
    if (clients.length > 0 && typeof AdvancedChurnCalculator !== 'undefined') {
        clients = clients.map(c => {
            try {
                const analysis = AdvancedChurnCalculator.analyze(c);
                return { ...c, healthScore: analysis.healthScore, churnRisk: analysis.churnRisk };
            } catch (e) { return c; }
        });
    }
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
                            <p>Track performance, monitor retention, and discovery growth opportunities</p>
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
        <!-- Notifications & Insights Section (Moved to Top) -->
        <section class="analytics-section">
            <div class="section-header">
                <div class="section-header-icon coral">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                    </svg>
                </div>
                <div>
                    <h2>Notifications & AI Insights</h2>
                    <p>Recent alerts, updates, and smart recommendations</p>
                </div>
            </div>
            
            <div class="insights-cards">
                ${renderNotificationsAndInsights(stats, clients, 3)}
            </div>
        </section>

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
                <div class="analytics-card glass-card">
                    <h3>Health Distribution</h3>
                    <div class="health-distribution">
                        ${renderHealthDistribution(stats)}
                    </div>
                </div>
                
                <div class="analytics-card glass-card">
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
                <div class="analytics-card glass-card">
                    <h3>Membership Breakdown</h3>
                    <div class="membership-breakdown">
                        ${renderMembershipBreakdown(stats)}
                    </div>
                </div>
                
                <div class="analytics-card glass-card">
                    <h3>Visit Frequency</h3>
                    <div class="visit-frequency">
                        ${renderVisitFrequency(stats)}
                    </div>
                </div>
                
                <div class="analytics-card glass-card">
                    <h3>Expiring Soon</h3>
                    <div class="expiring-clients">
                        ${renderExpiringClients(stats, clients)}
                    </div>
                </div>
            </div>
        </section>
    `;
}

function calculateAnalyticsStats(clients) {
    const totalClients = clients.length;
    const atRisk = clients.filter(c => c.churnRisk >= 40).length;
    const healthy = clients.filter(c => c.healthScore >= 70).length;
    const moderate = clients.filter(c => c.healthScore >= 40 && c.healthScore < 70).length;
    const poor = clients.filter(c => c.healthScore < 40).length;

    const avgHealth = totalClients > 0
        ? Math.round(clients.reduce((sum, c) => sum + (c.healthScore || 0), 0) / totalClients)
        : 0;

    const totalRevenue = clients.reduce((sum, c) => sum + (c.totalSpend || 0), 0);

    // Membership counts - dynamic grouping by actual membership type
    const membershipCounts = {};
    clients.forEach(c => {
        const type = c.membershipType || c.packageName || 'None';
        membershipCounts[type] = (membershipCounts[type] || 0) + 1;
    });

    // Expiring soon (within 14 days)
    const expiringClients = clients.filter(c => {
        if (!c.expireDate) return false;
        const days = Math.ceil((new Date(c.expireDate) - new Date()) / (1000 * 60 * 60 * 24));
        return days <= 14 && days > 0;
    }).sort((a, b) => new Date(a.expireDate) - new Date(b.expireDate));
    const expiringSoon = expiringClients.length;

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
        membershipCounts,
        expiringClients,
        lowSessions
    };
}

function createAnalyticsMetric(label, value, subtitle, icon, color) {
    const iconSvg = getMetricIcon(icon);

    return `
        <div class="analytics-metric glass-card ${color}">
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
    const colors = ['purple', 'blue', 'cyan', 'green', 'orange', 'pink', 'yellow', 'gray'];

    // Sort by count descending
    const entries = Object.entries(stats.membershipCounts || {})
        .sort((a, b) => b[1] - a[1]);

    const items = entries.map(([label, count], i) => ({
        label: label.length > 30 ? label.substring(0, 28) + '…' : label,
        fullLabel: label,
        count,
        color: colors[i % colors.length],
        percent: Math.round((count / total) * 100)
    }));

    return `
        <div class="membership-list">
            ${items.map(item => `
                <div class="membership-row" title="${item.fullLabel}">
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

function renderExpiringClients(stats, clients) {
    const expiring = stats.expiringClients || [];

    if (expiring.length === 0) {
        return `
            <div class="expiring-empty">
                <span class="check-icon">✓</span>
                <p>No memberships expiring in the next 14 days</p>
            </div>
        `;
    }

    return `
        <div class="expiring-list">
            ${expiring.slice(0, 8).map(c => {
        const days = Math.ceil((new Date(c.expireDate) - new Date()) / (1000 * 60 * 60 * 24));
        const urgency = days <= 3 ? 'critical' : days <= 7 ? 'warning' : 'low';
        return `
                    <div class="expiring-client-row ${urgency}" onclick="navigateTo('/clients/${c.id}')" style="cursor:pointer;">
                        <div class="expiring-client-info">
                            <span class="expiring-client-name">${c.firstName} ${c.lastName}</span>
                            <span class="expiring-client-pkg">${c.packageName || c.membershipType || ''}</span>
                        </div>
                        <span class="expiring-days ${urgency}">${days}d</span>
                    </div>
                `;
    }).join('')}
            ${expiring.length > 8 ? `<p class="expiring-more">+${expiring.length - 8} more</p>` : ''}
        </div>
    `;
}

function renderNotificationsAndInsights(stats, clients, limit = null) {
    const items = getAllNotifications(stats, clients);

    // Empty State
    if (items.length === 0) {
        return `
            <div class="insight-card success">
                <span class="insight-icon">🎉</span>
                <div class="insight-content">
                    <h4>All Caught Up</h4>
                    <p>No immediate alerts or insights. Great job!</p>
                </div>
            </div>
        `;
    }

    const displayItems = limit ? items.slice(0, limit) : items;
    const hasMore = limit && items.length > limit;

    let html = displayItems.map(item => renderNotificationItem(item)).join('');

    if (hasMore) {
        html += `
            <div class="show-more-container">
                <button class="btn btn-secondary btn-sm" onclick="openNotificationsModal()">
                    Show All (${items.length})
                </button>
            </div>
        `;
    }

    return html;
}

function getAllNotifications(stats, clients) {
    const items = [];

    // 1. Critical Alerts (High Priority)

    // High Risk Clients
    if (stats.atRisk > 0) {
        items.push({
            type: 'danger',
            icon: '⚠️',
            title: `${stats.atRisk} High Risk Clients`,
            message: 'These clients have a high probability of churning. Review their profiles.',
            actionLabel: 'View High Risk',
            actionFn: "navigateWithFilter('/clients', { type: 'risk', message: 'Showing At-Risk Clients' })"
        });
    }

    // Low Health
    const lowHealth = clients.filter(c => c.healthScore < 50);
    if (lowHealth.length > 0) {
        items.push({
            type: 'warning',
            icon: '❤️',
            title: `${lowHealth.length} Health Alerts`,
            message: 'Clients with health scores below 50 need attention.',
            actionLabel: 'View Low Health',
            actionFn: "navigateWithFilter('/clients', { type: 'health', value: 'attention', message: 'Showing Clients Needing Attention' })"
        });
    }

    // 2. Operational / Timely

    // Expiring Soon
    if (stats.expiringSoon > 0) {
        items.push({
            type: 'info',
            icon: '📅',
            title: `${stats.expiringSoon} Renewals Due`,
            message: 'Memberships expiring within 14 days.',
            actionLabel: 'View Expiring',
            actionFn: "navigateWithFilter('/clients', { type: 'expiring', message: 'Showing Expiring Managers' })"
        });
    }

    // Low Sessions
    if (stats.lowSessions > 0) {
        items.push({
            type: 'warning',
            icon: '📉',
            title: `${stats.lowSessions} Low Sessions`,
            message: 'Clients with 2 or fewer sessions remaining.',
            actionLabel: 'View Clients',
            actionFn: "navigateWithFilter('/clients', { type: 'expiring', message: 'Clients with low sessions often fall into expiring filter' })" // Mapping to expiring or we'd need a specific filter
        });
    }

    // 3. Growth & Opportunities

    // Win-back Opportunity (No visit > 90 days)
    const winback = clients.filter(c => {
        if (!c.lastVisit) return false;
        const days = Math.floor((new Date() - new Date(c.lastVisit)) / (1000 * 60 * 60 * 24));
        return days > 90;
    });

    if (winback.length > 0) {
        items.push({
            type: 'opportunity',
            icon: '👋',
            title: `${winback.length} Win-back Targets`,
            message: 'Clients who haven\'t visited in 90+ days.',
            actionLabel: 'View Inactive',
            actionFn: "navigateWithFilter('/clients', { type: 'winback', message: 'Showing clients inactive for 90+ days' })"
        });
    }

    // Missing Contact Info
    const missingInfo = clients.filter(c => !c.email && !c.phone).length;
    if (missingInfo > 0) {
        items.push({
            type: 'info',
            icon: '📝',
            title: `${missingInfo} Incomplete Profiles`,
            message: 'Clients missing both email and phone number.',
            actionLabel: 'Fix Profiles',
            actionFn: "navigateWithFilter('/clients', { type: 'missing-info', message: 'Showing clients with missing contact info' })"
        });
    }

    // 4. Successes

    // Strong Retention
    if (stats.healthyPercent >= 70) {
        items.push({
            type: 'success',
            icon: '✅',
            title: 'Strong Retention',
            message: `${stats.healthyPercent}% of your client base is healthy!`,
            actionLabel: 'View Healthy',
            actionFn: "navigateWithFilter('/clients', { type: 'health', value: 'healthy', message: 'Showing Healthy Clients' })"
        });
    }

    return items;
}

function renderNotificationItem(item) {
    return `
        <div class="insight-card glass-card ${item.type}">
            <span class="insight-icon">${item.icon}</span>
            <div class="insight-content">
                <div class="insight-header">
                    <h4>${item.title}</h4>
                    <span class="insight-time">Today</span>
                </div>
                <p>${item.message}</p>
                ${item.actionLabel ? `
                    <button class="btn btn-sm btn-outline insight-action-btn" onclick="${item.actionFn}">
                        ${item.actionLabel}
                    </button>
                ` : ''}
            </div>
        </div>
    `;
}

function openNotificationsModal() {
    // Get data again (or cache it, but getting fresh is safer for display)
    const clients = typeof ClientDataService !== 'undefined' ? ClientDataService.getAll() : [];
    const stats = calculateAnalyticsStats(clients);
    const allItems = getAllNotifications(stats, clients);

    const modalHtml = `
        <div class="modal" id="notifications-modal">
            <div class="modal-backdrop" onclick="closeNotificationsModal()"></div>
            <div class="modal-content modal-lg">
                <div class="modal-header">
                    <h3>Notifications & Insights</h3>
                    <button class="modal-close" onclick="closeNotificationsModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="insights-cards">
                        ${allItems.map(item => renderNotificationItem(item)).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;

    // Remove existing if any
    const existing = document.getElementById('notifications-modal');
    if (existing) existing.remove();

    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function closeNotificationsModal() {
    const modal = document.getElementById('notifications-modal');
    if (modal) modal.remove();
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
    const clients = typeof ClientDataService !== 'undefined' ? ClientDataService.getAll() : [];

    if (clients.length === 0) {
        showToast('No data to export', 'warning');
        return;
    }

    // Enrich and prepare data
    const exportData = clients.map(c => {
        let health = c.healthScore;
        let risk = c.churnRisk;

        if (typeof AdvancedChurnCalculator !== 'undefined') {
            const analysis = AdvancedChurnCalculator.analyze(c);
            health = analysis.healthScore;
            risk = analysis.churnRisk;
        }

        const daysSinceVisit = c.lastVisit
            ? Math.floor((new Date() - new Date(c.lastVisit)) / (1000 * 60 * 60 * 24))
            : '-';

        return {
            ...c,
            healthScore: health,
            churnRisk: risk,
            daysSinceVisit
        };
    });

    // CSV Headers
    const headers = ['Client Name', 'Email', 'Membership', 'Join Date', 'Last Visit', 'Days Since Visit', 'Health Score', 'Churn Risk', 'Total Spent'];

    // CSV Rows
    const rows = exportData.map(c => [
        `"${getClientFullName(c)}"`,
        c.email || '',
        c.packageName || c.membershipType || 'None',
        c.joinDate ? new Date(c.joinDate).toLocaleDateString() : '-',
        c.lastVisit ? new Date(c.lastVisit).toLocaleDateString() : 'Never',
        c.daysSinceVisit,
        c.healthScore || 0,
        `${c.churnRisk || 0}%`,
        `$${c.totalSpent || 0}`
    ]);

    // Build CSV Content
    const csvContent = [
        headers.join(','),
        ...rows.map(r => r.join(','))
    ].join('\n');

    // Trigger Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `lume_analytics_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('✅ Analytics report exported', 'success');
}


