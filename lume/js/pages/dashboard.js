// ===========================================
// DASHBOARD PAGE
// ===========================================

function renderDashboardPage() {
    const user = (typeof AuthService !== 'undefined' && AuthService.getCurrentUser()) ? AuthService.getCurrentUser() :
        JSON.parse(sessionStorage.getItem('lume_user')) || { name: 'Admin', initials: 'AD' };

    // Refresh metrics before rendering
    if (typeof refreshMetrics === 'function') {
        refreshMetrics();
    }

    // Get clients (safe access)
    if (typeof ClientDataService !== 'undefined' && !ClientDataService.isInitialized()) {
        ClientDataService.init();
    }

    let clients = typeof ClientDataService !== 'undefined' ? ClientDataService.getAll() : (window.CLIENTS || []);
    const hasClients = clients && clients.length > 0;

    // Get all clients (limited to 50 for performance if needed, but user asked for all)
    // We'll show top 20 by default sorted by risk, or just all. User said "see all clients".
    // Let's truncate to 100 to avoid performance issues if there are thousands, but for now just all.
    // Enrich clients with real-time analysis to ensure sync with profile page
    if (hasClients && typeof AdvancedChurnCalculator !== 'undefined') {
        clients = clients.map(c => {
            const analysis = AdvancedChurnCalculator.analyze(c);
            // Return a new object with updated metrics to avoid mutating store directly if not desired
            // or just for display purposes here
            return {
                ...c,
                healthScore: analysis.healthScore,
                churnRisk: analysis.churnRisk,
                // Also update other potential derivative metrics if needed
                churnPrediction: analysis.churnPrediction
            };
        });
    }

    const displayClients = hasClients ? clients.sort((a, b) => b.churnRisk - a.churnRisk) : [];

    return `
        <div class="app-layout-topnav">
            ${createTopNav('dashboard')}
            
            <main class="main-content" id="main-content">
                <div class="page-content">
                    <div class="page-header">
                        <div class="page-title-section">
                            <h1 id="dashboard-greeting">Welcome back, ${user.businessName || 'Lume MedSpa'}! 👋</h1>
                            <p>Here's what's happening with your clients today</p>
                        </div>
                        <div class="page-actions">
                            <button class="btn btn-secondary" onclick="refreshDashboard()">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                                    <path d="M21 2v6h-6"/>
                                    <path d="M3 12a9 9 0 0 1 15-6.7L21 8"/>
                                    <path d="M3 22v-6h6"/>
                                    <path d="M21 12a9 9 0 0 1-15 6.7L3 16"/>
                                </svg>
                                Refresh
                            </button>
                            <button class="btn btn-secondary" onclick="exportReport()">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                    <polyline points="7 10 12 15 17 10"/>
                                    <line x1="12" y1="15" x2="12" y2="3"/>
                                </svg>
                                Export
                            </button>
                        </div>
                    </div>
                    
                    <!-- Metrics Grid -->
                    <div class="metrics-grid">
                        ${createMetricFromData('totalClients', METRICS.totalClients)}
                        ${createMetricFromData('atRiskClients', METRICS.atRiskClients)}
                        ${createMetricFromData('healthScore', METRICS.healthScore)}
                    </div>
                    
                    <!-- All Clients Quick View -->
                    <div class="quick-view-section glass-panel">
                        <div class="quick-view-header">
                            <h3 class="quick-view-title">All Clients</h3>
                            <div class="quick-view-filters">
                                <select class="filter-select" id="treatment-filter">
                                    <option value="">All Treatments</option>
                                    <option value="botox">Botox</option>
                                    <option value="hydrafacial">HydraFacial</option>
                                    <option value="laser">Laser Treatments</option>
                                </select>
                                <select class="filter-select" id="risk-filter" onchange="dashboardFilterByRisk(this.value)">
                                    <option value="all">All Risk Levels</option>
                                    <option value="high">High Risk</option>
                                    <option value="low">Low Risk</option>
                                </select>
                            </div>
                        </div>
                        
                        ${hasClients ? `
                            <div class="table-search">
                                <div class="input-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <circle cx="11" cy="11" r="8"/>
                                        <path d="m21 21-4.35-4.35"/>
                                    </svg>
                                    <input type="text" class="input" placeholder="Search clients..." id="dashboard-client-search" onkeyup="dashboardFilterClients(this.value)">
                                </div>
                            </div>
                            
                            <div class="table-container">
                                <table class="clients-table">
                                    <thead>
                                        <tr>
                                            <th>Client</th>
                                            <th>Health Score</th>
                                            <th>Sessions Left</th>
                                            <th>Expires</th>
                                            <th>Package</th>
                                        </tr>
                                    </thead>
                                    <tbody id="dashboard-clients-body">
                                        ${displayClients.length > 0
                ? displayClients.map(client => createDashboardClientRow(client)).join('')
                : '<tr><td colspan="5" class="empty-table-message">No clients found</td></tr>'
            }
                                    </tbody>
                                </table>
                            </div>
                        ` : `
                            <div class="empty-state-card glass-card">
                                <div class="empty-state-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="48" height="48">
                                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                        <circle cx="9" cy="7" r="4"/>
                                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                                        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                                    </svg>
                                </div>
                                <h3>No Clients Yet</h3>
                                <p>Import your client data to start tracking churn risk and health scores</p>
                                <button class="btn btn-primary" onclick="navigateTo('/clients')">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                        <polyline points="17 8 12 3 7 8"/>
                                        <line x1="12" y1="3" x2="12" y2="15"/>
                                    </svg>
                                    Import Clients
                                </button>
                            </div>
                        `}
                    </div>
                </div>
            </main>
        </div>
    `;
}

function createDashboardClientRow(client) {
    const healthScore = Math.min(Math.max(Number(client.healthScore) || 0, 0), 100);
    const healthClass = getHealthScoreClass(healthScore);

    return `
        <tr data-client-id="${client.id}" onclick="navigateTo('/clients/${client.id}')">
            <td>
                <div class="client-cell">
                    <div class="client-avatar" style="background-color: ${client.avatarColor}">
                        ${getClientInitials(client)}
                    </div>
                    <div class="client-info">
                        <div class="client-name">${getClientFullName(client)}</div>
                        <div class="client-email">${client.email || ''}</div>
                    </div>
                </div>
            </td>
            <td>
                <div class="health-score ${healthClass}">
                    <span>${healthScore}</span>
                    <div class="health-score-bar">
                        <div class="health-score-fill" style="width: ${healthScore}%"></div>
                    </div>
                </div>
            </td>
            <td>
                <div class="session-info">
                    <span class="session-count">${client.remainingSessions !== undefined ? (client.remainingSessions == 999 || String(client.remainingSessions).toLowerCase().includes('unlimited') ? 'Unlimited' : client.remainingSessions) : '-'}</span>
                </div>
            </td>
            <td>
                <div class="expiry-info ${client.expireDate && new Date(client.expireDate) < new Date() ? 'expired' : ''}">
                    ${client.expireDate ? formatDate(client.expireDate) : '-'}
                </div>
            </td>
            <td>
                <span class="package-name" title="${client.packageName || ''}">
                    ${client.packageName || '-'}
                </span>
            </td>
        </tr>
    `;
}

function dashboardFilterClients(searchTerm) {
    const allClients = typeof ClientDataService !== 'undefined' ? ClientDataService.getAll() : (window.CLIENTS || []);
    let clients = allClients;

    // Enrich with same logic as main render
    if (typeof AdvancedChurnCalculator !== 'undefined') {
        clients = clients.map(c => {
            const analysis = AdvancedChurnCalculator.analyze(c);
            return { ...c, healthScore: analysis.healthScore, churnRisk: analysis.churnRisk };
        });
    }

    const filtered = clients.filter(c => {
        const fullName = getClientFullName(c).toLowerCase();
        const email = (c.email || '').toLowerCase();
        const term = searchTerm.toLowerCase();
        return fullName.includes(term) || email.includes(term);
    }).sort((a, b) => b.churnRisk - a.churnRisk);

    const tbody = document.getElementById('dashboard-clients-body');
    if (tbody) {
        tbody.innerHTML = filtered.length > 0
            ? filtered.map(client => createDashboardClientRow(client)).join('')
            : '<tr><td colspan="5" class="empty-table-message">No matching clients found</td></tr>';
    }
}

function dashboardFilterByRisk(risk) {
    const allClients = typeof ClientDataService !== 'undefined' ? ClientDataService.getAll() : (window.CLIENTS || []);
    let clients = allClients;

    // Enrich with same logic
    if (typeof AdvancedChurnCalculator !== 'undefined') {
        clients = allClients.map(c => {
            const analysis = AdvancedChurnCalculator.analyze(c);
            return { ...c, healthScore: analysis.healthScore, churnRisk: analysis.churnRisk };
        });
    }

    let filtered = clients;

    if (risk === 'high') {
        filtered = clients.filter(c => c.churnRisk >= 50);
    } else if (risk === 'low') {
        filtered = clients.filter(c => c.churnRisk < 50);
    }
    // 'all' returns everything

    filtered = filtered.sort((a, b) => b.churnRisk - a.churnRisk);

    const tbody = document.getElementById('dashboard-clients-body');
    if (tbody) {
        tbody.innerHTML = filtered.length > 0
            ? filtered.map(client => createDashboardClientRow(client)).join('')
            : '<tr><td colspan="5" class="empty-table-message">No clients in this category</td></tr>';
    }
}


function handleAISuggestionAction(event, clientId, suggestion) {
    if (event) event.stopPropagation(); // Prevent row click from navigating

    // Map suggestion text to action types
    let actionType = 'review';
    const s = suggestion.toLowerCase();

    if (s.includes('re-engagement') || s.includes('renewal') || s.includes('reach out') || s.includes('discount') || s.includes('offer')) {
        actionType = 'send-nudge';
    } else if (s.includes('schedule')) {
        actionType = 'schedule';
    }

    // Store pending action in sessionStorage for the profile page to pick up
    sessionStorage.setItem('lume_pending_action', JSON.stringify({
        clientId: clientId,
        type: actionType,
        suggestion: suggestion,
        timestamp: Date.now()
    }));

    // Navigate to client profile
    navigateTo(`/clients/${clientId}`);
}

function refreshDashboard() {
    // Refresh metrics
    if (typeof refreshMetrics === 'function') {
        refreshMetrics();
    }

    // Simulate refresh with animation
    const metricsGrid = document.querySelector('.metrics-grid');
    if (metricsGrid) {
        metricsGrid.style.opacity = '0.5';
        setTimeout(() => {
            // Re-render the page
            const app = document.getElementById('app');
            if (app) {
                app.innerHTML = renderDashboardPage();
            }
            showToast('Dashboard refreshed', 'success');
        }, 300);
    }
}

function exportReport() {
    const clients = typeof ClientDataService !== 'undefined' ? ClientDataService.getAll() : [];

    if (clients.length === 0) {
        showToast('No data to export', 'warning');
        return;
    }

    // Enrich data if possible
    const exportData = clients.map(c => {
        let health = c.healthScore;
        let risk = c.churnRisk;

        if (typeof AdvancedChurnCalculator !== 'undefined') {
            const analysis = AdvancedChurnCalculator.analyze(c);
            health = analysis.healthScore;
            risk = analysis.churnRisk;
        }

        return {
            ...c,
            healthScore: health,
            churnRisk: risk
        };
    });

    // CSV Headers
    const headers = ['Client Name', 'Email', 'Phone', 'Health Score', 'Churn Risk', 'Membership', 'Sessions Left', 'Expires', 'Total Spent'];

    // CSV Rows
    const rows = exportData.map(c => [
        `"${getClientFullName(c)}"`,
        c.email || '',
        c.phone || '',
        c.healthScore || 0,
        `${c.churnRisk || 0}%`,
        c.packageName || c.membershipType || 'None',
        c.remainingSessions === 999 ? 'Unlimited' : (c.remainingSessions || 0),
        c.expireDate ? new Date(c.expireDate).toLocaleDateString() : '-',
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
    link.setAttribute('download', `lume_dashboard_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('✅ Dashboard report exported', 'success');
}

