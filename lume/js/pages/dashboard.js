// ===========================================
// DASHBOARD PAGE
// ===========================================

function renderDashboardPage() {
    const user = AuthService ? AuthService.getCurrentUser() :
        JSON.parse(sessionStorage.getItem('lume_user')) || { name: 'Admin', initials: 'AD' };

    // Refresh metrics before rendering
    if (typeof refreshMetrics === 'function') {
        refreshMetrics();
    }

    // Get clients (safe access)
    const clients = typeof ClientDataService !== 'undefined' ? ClientDataService.getAll() : (window.CLIENTS || []);
    const hasClients = clients && clients.length > 0;

    // Get at-risk clients for the quick view
    const atRiskClients = hasClients
        ? clients.filter(c => c.churnRisk >= 50).sort((a, b) => b.churnRisk - a.churnRisk).slice(0, 5)
        : [];

    return `
        <div class="app-layout-topnav">
            ${createTopNav('dashboard')}
            
            <main class="main-content" id="main-content">
                <div class="page-content">
                    <div class="page-header">
                        <div class="page-title-section">
                            <h1>Welcome back! 👋</h1>
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
                        ${createMetricFromData('activeLeads', METRICS.activeLeads)}
                        ${createMetricFromData('atRiskClients', METRICS.atRiskClients)}
                        ${createMetricFromData('leadConversion', METRICS.leadConversion)}
                        ${createMetricFromData('revenueSaved', METRICS.revenueSaved)}
                        ${createMetricFromData('healthScore', METRICS.healthScore)}
                    </div>
                    
                    <!-- At-Risk Clients Quick View -->
                    <div class="quick-view-section">
                        <div class="quick-view-header">
                            <h3 class="quick-view-title">⚠️ At-Risk Clients</h3>
                            <div class="quick-view-filters">
                                <select class="filter-select" id="treatment-filter">
                                    <option value="">All Treatments</option>
                                    <option value="botox">Botox</option>
                                    <option value="hydrafacial">HydraFacial</option>
                                    <option value="laser">Laser Treatments</option>
                                </select>
                                <select class="filter-select" id="risk-filter" onchange="dashboardFilterByRisk(this.value)">
                                    <option value="high">High Risk</option>
                                    <option value="all">All Risk Levels</option>
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
                                            <th>Churn Risk</th>
                                            <th>Last Visit</th>
                                            <th>Membership</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody id="dashboard-clients-body">
                                        ${atRiskClients.length > 0
                ? atRiskClients.map(client => createClientRow(client)).join('')
                : '<tr><td colspan="6" class="empty-table-message">No at-risk clients found 🎉</td></tr>'
            }
                                    </tbody>
                                </table>
                            </div>
                        ` : `
                            <div class="empty-state-card">
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

function dashboardFilterClients(searchTerm) {
    const clients = typeof ClientDataService !== 'undefined' ? ClientDataService.getAll() : (window.CLIENTS || []);
    const filtered = clients.filter(c => c.churnRisk >= 50).filter(c => {
        const fullName = getClientFullName(c).toLowerCase();
        const email = (c.email || '').toLowerCase();
        const term = searchTerm.toLowerCase();
        return fullName.includes(term) || email.includes(term);
    }).sort((a, b) => b.churnRisk - a.churnRisk);

    const tbody = document.getElementById('dashboard-clients-body');
    if (tbody) {
        tbody.innerHTML = filtered.length > 0
            ? filtered.map(client => createClientRow(client)).join('')
            : '<tr><td colspan="6" class="empty-table-message">No matching clients found</td></tr>';
    }
}

function dashboardFilterByRisk(risk) {
    const clients = typeof ClientDataService !== 'undefined' ? ClientDataService.getAll() : (window.CLIENTS || []);
    let filtered = risk === 'all'
        ? clients
        : clients.filter(c => c.churnRisk >= 50);

    filtered = filtered.sort((a, b) => b.churnRisk - a.churnRisk).slice(0, 10);

    const tbody = document.getElementById('dashboard-clients-body');
    if (tbody) {
        tbody.innerHTML = filtered.length > 0
            ? filtered.map(client => createClientRow(client)).join('')
            : '<tr><td colspan="6" class="empty-table-message">No clients in this category</td></tr>';
    }
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
    showToast('📊 Generating dashboard report...', 'info');
    setTimeout(() => {
        showToast('✅ Report ready for download!', 'success');
    }, 1500);
}
