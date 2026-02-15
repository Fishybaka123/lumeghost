// ===========================================
// CLIENTS LIST PAGE
// ===========================================

// Add Action Modal
const actionModalHTML = `
<div id="smart-action-modal" class="modal-overlay" style="display: none;">
    <div class="modal-container glass-card" style="max-width: 500px;">
        <div class="modal-header">
            <h3 class="modal-title" id="action-modal-title">Take Action</h3>
            <button class="modal-close" onclick="closeActionModal()">×</button>
        </div>
        <div class="modal-body">
            <div id="action-client-info" style="margin-bottom: 20px; padding: 12px; background: rgba(59, 130, 246, 0.1); border-radius: 8px; border: 1px solid rgba(59, 130, 246, 0.2);">
                <!-- Client Info Populated Here -->
            </div>
            
            <div class="form-group">
                <label class="form-label">Action Type</label>
                <select class="input" id="action-type-select" onchange="updateActionTemplate()">
                    <option value="nudge">Send Re-engagement Nudge</option>
                    <option value="discount">Offer Loyalty Discount</option>
                    <option value="call">Log Call</option>
                    <option value="note">Add Note</option>
                </select>
            </div>

            <div class="form-group">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <label class="form-label" style="margin-bottom: 0;">Message / Notes</label>
                    <button class="btn btn-secondary" style="padding: 4px 8px; font-size: 11px;" onclick="generateAISuggestion()">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12" style="margin-right: 4px;">
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                        </svg>
                        Make AI Suggestion
                    </button>
                </div>
                <textarea class="input" id="action-message" rows="4" placeholder="Hi [Name], we missed you..."></textarea>
            </div>
        </div>
        <div class="modal-footer">
            <button class="btn btn-secondary" onclick="closeActionModal()">Cancel</button>
            <button class="btn btn-primary" onclick="submitSmartAction()">Send Action</button>
        </div>
    </div>
</div>
`;

// Append modal if not exists
document.addEventListener('DOMContentLoaded', () => {
    if (!document.getElementById('smart-action-modal')) {
        document.body.insertAdjacentHTML('beforeend', actionModalHTML);
    }
});

// Global action functions
window.openActionModal = function (clientId, title) {
    let client = null;

    // Try to find client in ClientDataService or window.CLIENTS
    if (typeof ClientDataService !== 'undefined') {
        const clients = ClientDataService.getAll();
        client = clients.find(c => String(c.id) === String(clientId));
    }

    if (!client && window.CLIENTS) {
        client = window.CLIENTS.find(c => String(c.id) === String(clientId));
    }

    if (!client) {
        console.error('Client not found for action modal:', clientId);
        return;
    }

    const modal = document.getElementById('smart-action-modal');
    const titleEl = document.getElementById('action-modal-title');
    const infoEl = document.getElementById('action-client-info');
    const msgEl = document.getElementById('action-message');
    const typeEl = document.getElementById('action-type-select');

    if (modal) {
        modal.style.display = 'flex';
        titleEl.textContent = title || 'Recommended Action';

        infoEl.innerHTML = `
            <strong>${client.firstName} ${client.lastName}</strong><br>
            <span style="font-size: 12px; opacity: 0.8">Health: ${client.healthScore || 0} | Last Visit: ${client.lastVisit || 'Unknown'}</span>
        `;

        // Pre-fill based on title
        if (title.toLowerCase().includes('nudge')) {
            typeEl.value = 'nudge';
            msgEl.value = `Hi ${client.firstName}, we haven't seen you in a while! Come in this week for a complimentary skin analysis.`;
        } else if (title.toLowerCase().includes('discount')) {
            typeEl.value = 'discount';
            msgEl.value = `Hi ${client.firstName}, as a valued member, we'd like to offer you 15% off your next treatment!`;
        } else {
            typeEl.value = 'note';
            msgEl.value = '';
        }

        window.currentActionClientId = clientId;
    }
};

window.updateActionTemplate = function () {
    const type = document.getElementById('action-type-select').value;
    // Clearing it allows user to type freely, or they can click AI button
    // document.getElementById('action-message').value = ''; 
    // Actually, let's auto-suggest if empty
    if (document.getElementById('action-message').value.trim() === '') {
        generateAISuggestion();
    }
};

window.generateAISuggestion = function () {
    const clientId = window.currentActionClientId;
    const client = window.CLIENTS.find(c => c.id === clientId);
    const type = document.getElementById('action-type-select').value;
    const msgEl = document.getElementById('action-message');

    if (!client) return;

    let suggestion = '';
    const firstName = client.firstName;

    if (type === 'nudge') {
        const nudges = [
            `Hi ${firstName}, we miss seeing you at Lume! Book your next appointment this week and receive a complimentary add-on.`,
            `It's been a while, ${firstName}. Your skin deserves the best! Reply to book your refresh session.`,
            `Hello ${firstName}, just checking in to see how your results are holding up? Let us know if you're ready for a follow-up.`
        ];
        suggestion = nudges[Math.floor(Math.random() * nudges.length)];
    } else if (type === 'discount') {
        suggestion = `Hi ${firstName}, as a special treat, enjoy 15% off your next filler or neurotoxin treatment if you book before Friday!`;
    } else if (type === 'call') {
        suggestion = `Called to check in on post-treatment progress. Client sounded happy with results.`;
    } else if (type === 'note') {
        suggestion = `Client expressed interest in CoolSculpting during last visit. Follow up in 2 weeks.`;
    }

    msgEl.value = suggestion;

    // Flash effect to show it updated
    msgEl.style.transition = 'background-color 0.2s';
    msgEl.style.backgroundColor = 'rgba(79, 125, 243, 0.1)';
    setTimeout(() => {
        msgEl.style.backgroundColor = '';
    }, 300);
};

window.closeActionModal = function () {
    const modal = document.getElementById('smart-action-modal');
    if (modal) modal.style.display = 'none';
};

window.submitSmartAction = function () {
    const clientId = window.currentActionClientId;
    const type = document.getElementById('action-type-select').value;
    const msg = document.getElementById('action-message').value;

    // In a real app, this would call an API
    console.log(`Action submitted for client ${clientId}: ${type} - ${msg}`);

    showToast('Action sent successfully!', 'success');
    closeActionModal();
};

function renderClientsPage() {
    const user = JSON.parse(sessionStorage.getItem('lume_user')) || { name: 'Admin', initials: 'AD' };

    // Get clients from service with error handling
    let clients = [];
    let isImported = false;

    try {
        if (typeof ClientDataService !== 'undefined') {
            clients = ClientDataService.getAll() || [];
            isImported = clients.length > 0;
        } else if (typeof CLIENTS !== 'undefined') {
            clients = CLIENTS || [];
        }

        // Enrich clients with real-time analysis (per-client try-catch)
        if (typeof AdvancedChurnCalculator !== 'undefined') {
            clients = clients.map(c => {
                try {
                    const analysis = AdvancedChurnCalculator.analyze(c);
                    return { ...c, healthScore: analysis.healthScore, churnRisk: analysis.churnRisk };
                } catch (e) {
                    console.warn('Failed to enrich client:', c.id, e);
                    return c;
                }
            });
        }
    } catch (e) {
        console.error('Error loading clients:', e);
    }

    // Sort clients by health score (lowest first = needs most attention)
    let sortedClients = [];
    try {
        sortedClients = [...clients].sort((a, b) => (a.healthScore || 50) - (b.healthScore || 50));
    } catch (e) {
        console.error('Error sorting clients:', e);
        sortedClients = clients;
    }

    return `
        <div class="app-layout-topnav clients-page">
            ${createTopNav('clients')}
            
            <main class="main-content" id="main-content">
                <div class="page-content">
                    <div class="page-header">
                        <div class="page-title-section">
                            <h1>Clients</h1>
                            <p>Manage and monitor your client relationships</p>
                            ${isImported ? '<span class="badge badge-success" style="margin-left: 12px;">✓ Using Imported Data</span>' : ''}
                        </div>
                        <div class="page-actions">
                            <button class="btn btn-secondary" onclick="refreshClients()" title="Refresh list">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                                    <path d="M23 4v6h-6"/>
                                    <path d="M1 20v-6h6"/>
                                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                                </svg>
                            </button>
                            <input type="file" id="import-file-input" accept=".csv,.txt,.pdf" style="display: none;" onchange="handleFileImport(event)">
                            <button class="btn btn-secondary" onclick="document.getElementById('import-file-input').click()">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                    <polyline points="17 8 12 3 7 8"/>
                                    <line x1="12" y1="3" x2="12" y2="15"/>
                                </svg>
                                Import
                            </button>
                            ${isImported ? `
                                <button class="btn btn-ghost" onclick="clearImportedData()" title="Reset to demo data">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                                        <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                    </svg>
                                </button>
                            ` : ''}
                            <button class="btn btn-primary" onclick="addNewClient()">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                    <circle cx="8.5" cy="7" r="4"/>
                                    <line x1="20" y1="8" x2="20" y2="14"/>
                                    <line x1="23" y1="11" x2="17" y2="11"/>
                                </svg>
                                Add Client
                            </button>
                        </div>
                    </div>
                    
                    <!-- Filter Pills -->
                    <div class="clients-filters">
                        <div class="filter-pills">
                            <button class="filter-pill active" onclick="setClientFilter('all', this)">All Clients (${clients.length})</button>
                            <button class="filter-pill" onclick="setClientFilter('healthy', this)">Healthy (${clients.filter(c => c.healthScore >= 75).length})</button>
                            <button class="filter-pill" onclick="setClientFilter('attention', this)">Needs Attention (${clients.filter(c => c.healthScore >= 50 && c.healthScore < 75).length})</button>
                            <button class="filter-pill" onclick="setClientFilter('at-risk', this)">At Risk (${clients.filter(c => c.churnRisk >= 40).length})</button>
                            <button class="filter-pill" onclick="setClientFilter('expiring', this)">Expiring Soon (${clients.filter(c => {
        if (!c.expireDate) return false;
        const days = Math.ceil((new Date(c.expireDate) - new Date()) / (1000 * 60 * 60 * 24));
        return days <= 14 && days > 0;
    }).length})</button>
                            <button class="filter-pill" onclick="setClientFilter('expired', this)">Expired (${clients.filter(c => {
        if (!c.expireDate) return false;
        const days = Math.ceil((new Date(c.expireDate) - new Date()) / (1000 * 60 * 60 * 24));
        return days <= 0;
    }).length})</button>
                        </div>
                        
                        <div class="filter-group" style="margin-left: auto;">
                            <label>Membership:</label>
                            <select class="filter-select" onchange="filterByMembership(this.value)">
                                <option value="">All</option>
                                <option value="vip">VIP</option>
                                <option value="premium">Premium</option>
                                <option value="basic">Basic</option>
                                <option value="none">No Membership</option>
                            </select>
                        </div>
                    </div>
                    
                    <!-- Clients Table -->
                    <div class="table-container glass-panel">
                        <div class="table-search">
                            <div class="input-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="11" cy="11" r="8"/>
                                    <path d="m21 21-4.35-4.35"/>
                                </svg>
                                <input type="text" class="input" placeholder="Search by name, email, or phone..." id="clients-page-search" onkeyup="clientsPageSearch(this.value)">
                            </div>
                        </div>
                        
                        <table class="clients-table">
                            <thead>
                                <tr>
                                    <th class="sortable" onclick="sortClientsPage('name')">
                                        Client
                                        <span class="sort-icon">↕</span>
                                    </th>
                                    <th class="sortable" onclick="sortClientsPage('healthScore')">
                                        Health Score
                                        <span class="sort-icon">↕</span>
                                    </th>
                                    <th class="sortable" onclick="sortClientsPage('remainingSessions')">
                                        Sessions Left
                                        <span class="sort-icon">↕</span>
                                    </th>
                                    <th class="sortable" onclick="sortClientsPage('expireDate')">
                                        Expires
                                        <span class="sort-icon">↕</span>
                                    </th>
                                    <th>Package</th>
                                </tr>
                            </thead>
                            <tbody id="clients-page-body">
                                ${sortedClients.map(client => createClientRow(client)).join('')}
                            </tbody>
                        </table>
                        
                        <div class="table-pagination">
                            <span class="pagination-info">Showing 1-${clients.length} of ${clients.length} clients</span>
                            <div class="pagination-buttons">
                                <button class="pagination-btn" disabled>Previous</button>
                                <button class="pagination-btn active">1</button>
                                <button class="pagination-btn" disabled>Next</button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
        
        <!-- Import Modal -->
        <div id="import-modal" class="modal" style="display: none;">
            <div class="modal-backdrop" onclick="closeImportModal()"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Import Clients</h3>
                    <button class="modal-close" onclick="closeImportModal()">×</button>
                </div>
                <div class="modal-body" id="import-modal-body">
                    <!-- Content will be set dynamically -->
                </div>
            </div>
        </div>
        
        <!-- Add Client Modal -->
        <div id="add-client-modal" class="modal" style="display: none;">
            <div class="modal-backdrop" onclick="closeAddClientModal()"></div>
            <div class="modal-content modal-lg">
                <div class="modal-header">
                    <h3>➕ Add New Client</h3>
                    <button class="modal-close" onclick="closeAddClientModal()">×</button>
                </div>
                <div class="modal-body">
                    <form id="add-client-form" onsubmit="submitNewClient(event)">
                        <div class="form-row">
                            <div class="form-group">
                                <label>First Name *</label>
                                <input type="text" class="input" id="new-client-firstname" required placeholder="First name">
                            </div>
                            <div class="form-group">
                                <label>Last Name *</label>
                                <input type="text" class="input" id="new-client-lastname" required placeholder="Last name">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Email</label>
                                <input type="email" class="input" id="new-client-email" placeholder="email@example.com">
                            </div>
                            <div class="form-group">
                                <label>Phone</label>
                                <input type="tel" class="input" id="new-client-phone" placeholder="(555) 123-4567">
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Package Name *</label>
                            <input type="text" class="input" id="new-client-package" required placeholder="e.g., Premium Botox Package">
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Remaining Sessions *</label>
                                <input type="number" class="input" id="new-client-sessions" required min="0" value="10">
                            </div>
                            <div class="form-group">
                                <label>Expire Date *</label>
                                <input type="date" class="input" id="new-client-expiry" required>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Notes</label>
                            <textarea class="input" id="new-client-notes" rows="3" placeholder="Any notes about this client..."></textarea>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary" onclick="closeAddClientModal()">Cancel</button>
                            <button type="submit" class="btn btn-primary">Add Client</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
}

// Handle file import using ImportService
async function handleFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Use ImportService if available
    if (typeof ImportService !== 'undefined') {
        showToast('Processing import...', 'info');

        try {
            const result = await ImportService.importFile(file, {
                onProgress: (p) => console.log('Import progress:', p)
            });

            if (result.success) {
                // Use ImportService's modal if available globally
                if (typeof showImportPreviewModal === 'function') {
                    showImportPreviewModal(result);
                } else {
                    // Fallback success
                    showToast(`Imported ${result.validRecords} records successfully`, 'success');
                    setTimeout(() => router(), 1000);
                }
            } else {
                showToast(`Import failed: ${result.error}`, 'error');
            }
        } catch (e) {
            console.error('Import error:', e);
            showToast('Import failed: ' + e.message, 'error');
        }
    } else {
        // Fallback to legacy CSV import if ImportService missing
        console.warn('ImportService not found, falling back to legacy CSV import');
        handleLegacyCSVImport(file);
    }

    // Reset input
    event.target.value = '';
}

function handleLegacyCSVImport(file) {
    const reader = new FileReader();
    reader.onload = function (e) {
        const result = ClientDataService.importFromCSV(e.target.result);
        if (result.success) {
            showToast(`Imported ${result.count} clients`, 'success');
            setTimeout(() => router(), 1000);
        } else {
            showToast(`Import failed: ${result.error}`, 'error');
        }
    };
    reader.readAsText(file);
}

// Refresh clients list
function refreshClients() {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
        // Re-render the whole page content
        // This is a simple way to refresh. Ideally we might just update the table.
        // But renderClientsPage returns the full HTML including nav.
        // We probably just want to update the table or reload the route.
        if (typeof router === 'function') {
            router();
        } else {
            // Fallback if router not available
            window.location.reload();
        }
        showToast('Client list refreshed', 'success');
    }
}

// Make function globally accessible
window.refreshClients = refreshClients;
window.handleFileImport = handleFileImport;
window.closeImportModal = closeImportModal;

// Show import modal with status
function showImportModal(status, message) {
    const modal = document.getElementById('import-modal');
    const body = document.getElementById('import-modal-body');

    if (!modal || !body) return;

    let icon = '';
    let iconClass = '';

    switch (status) {
        case 'loading':
            icon = `<div class="spinner"></div>`;
            iconClass = 'loading';
            break;
        case 'success':
            icon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="48" height="48" style="color: var(--success);">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>`;
            iconClass = 'success';
            break;
        case 'error':
            icon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="48" height="48" style="color: var(--error);">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>`;
            iconClass = 'error';
            break;
    }

    body.innerHTML = `
        <div class="import-status ${iconClass}" style="text-align: center; padding: 40px;">
            ${icon}
            <p style="margin-top: 16px; font-size: 16px;">${message}</p>
            ${status === 'error' ? '<button class="btn btn-secondary" onclick="closeImportModal()" style="margin-top: 16px;">Close</button>' : ''}
        </div>
    `;

    modal.style.display = 'flex';
}

// Close import modal
function closeImportModal() {
    const modal = document.getElementById('import-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Clear imported data
function clearImportedData() {
    if (confirm('Are you sure you want to reset to demo data? Your imported data will be removed.')) {
        ClientDataService.clearImportedData();
    }
}

// Keep track of current filter state
let currentClientFilter = 'all';
let currentSortField = 'healthScore';
let currentSortDirection = 'asc';

function setClientFilter(filter, button) {
    currentClientFilter = filter;

    // Update active pill
    document.querySelectorAll('.filter-pill').forEach(pill => pill.classList.remove('active'));
    button.classList.add('active');

    // Get clients from storage and enrich
    let clients = ClientDataService ? ClientDataService.getAll() : CLIENTS;
    if (typeof AdvancedChurnCalculator !== 'undefined') {
        clients = clients.map(c => {
            const analysis = AdvancedChurnCalculator.analyze(c);
            return { ...c, healthScore: analysis.healthScore, churnRisk: analysis.churnRisk };
        });
    }

    // Apply filter
    let filtered = [...clients];

    switch (filter) {
        case 'healthy':
            filtered = clients.filter(c => c.healthScore >= 75);
            break;
        case 'attention':
            filtered = clients.filter(c => c.healthScore >= 50 && c.healthScore < 75);
            break;
        case 'at-risk':
            filtered = clients.filter(c => c.churnRisk >= 40);
            break;
        case 'expiring':
            filtered = clients.filter(c => {
                if (!c.expireDate) return false;
                const days = Math.ceil((new Date(c.expireDate) - new Date()) / (1000 * 60 * 60 * 24));
                return days <= 14 && days > 0;
            });
            break;
        case 'expired':
            filtered = clients.filter(c => {
                if (!c.expireDate) return false;
                const days = Math.ceil((new Date(c.expireDate) - new Date()) / (1000 * 60 * 60 * 24));
                return days <= 0;
            });
            break;
    }

    // Sort by current sort field
    filtered.sort((a, b) => {
        const aVal = a[currentSortField];
        const bVal = b[currentSortField];
        return currentSortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    });

    updateClientsTable(filtered);
}

function filterByMembership(membership) {
    let clients = ClientDataService ? ClientDataService.getAll() : CLIENTS;
    // Enrich
    if (typeof AdvancedChurnCalculator !== 'undefined') {
        clients = clients.map(c => {
            const analysis = AdvancedChurnCalculator.analyze(c);
            return { ...c, healthScore: analysis.healthScore, churnRisk: analysis.churnRisk };
        });
    }
    let filtered = [...clients];

    if (membership) {
        filtered = filtered.filter(c => c.membershipType === membership);
    }

    // Apply current health filter too
    if (currentClientFilter !== 'all') {
        switch (currentClientFilter) {
            case 'healthy':
                filtered = filtered.filter(c => c.healthScore >= 75);
                break;
            case 'attention':
                filtered = filtered.filter(c => c.healthScore >= 50 && c.healthScore < 75);
                break;
            case 'at-risk':
                filtered = filtered.filter(c => c.healthScore < 50);
                break;
        }
    }

    updateClientsTable(filtered);
}

function clientsPageSearch(term) {
    const searchTerm = term.toLowerCase();
    let clients = ClientDataService ? ClientDataService.getAll() : CLIENTS;
    // Enrich
    if (typeof AdvancedChurnCalculator !== 'undefined') {
        clients = clients.map(c => {
            const analysis = AdvancedChurnCalculator.analyze(c);
            return { ...c, healthScore: analysis.healthScore, churnRisk: analysis.churnRisk };
        });
    }

    let filtered = clients.filter(c => {
        const fullName = getClientFullName(c).toLowerCase();
        const email = (c.email || '').toLowerCase();
        const phone = (c.phone || '').toLowerCase();
        const packageName = (c.packageName || '').toLowerCase();
        return fullName.includes(searchTerm) || email.includes(searchTerm) || phone.includes(searchTerm) || packageName.includes(searchTerm);
    });

    updateClientsTable(filtered);
}

function sortClientsPage(field) {
    if (currentSortField === field) {
        currentSortDirection = currentSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        currentSortField = field;
        currentSortDirection = 'asc';
    }

    let clients = ClientDataService ? ClientDataService.getAll() : CLIENTS;
    // Enrich
    if (typeof AdvancedChurnCalculator !== 'undefined') {
        clients = clients.map(c => {
            const analysis = AdvancedChurnCalculator.analyze(c);
            return { ...c, healthScore: analysis.healthScore, churnRisk: analysis.churnRisk };
        });
    }

    // Apply current filter
    let sorted = [...clients];
    if (currentClientFilter !== 'all') {
        switch (currentClientFilter) {
            case 'healthy':
                sorted = sorted.filter(c => c.healthScore >= 75);
                break;
            case 'attention':
                sorted = sorted.filter(c => c.healthScore >= 50 && c.healthScore < 75);
                break;
            case 'at-risk':
                sorted = sorted.filter(c => c.healthScore < 50);
                break;
            case 'expiring':
                sorted = sorted.filter(c => {
                    if (!c.expireDate) return false;
                    const days = Math.ceil((new Date(c.expireDate) - new Date()) / (1000 * 60 * 60 * 24));
                    return days <= 14 && days > 0;
                });
                break;
            case 'expired':
                sorted = sorted.filter(c => {
                    if (!c.expireDate) return false;
                    const days = Math.ceil((new Date(c.expireDate) - new Date()) / (1000 * 60 * 60 * 24));
                    return days <= 0;
                });
                break;
        }
    }

    sorted.sort((a, b) => {
        let aVal = a[field];
        let bVal = b[field];

        // Handle string comparison for name
        if (field === 'name') {
            aVal = getClientFullName(a).toLowerCase();
            bVal = getClientFullName(b).toLowerCase();
            return currentSortDirection === 'asc'
                ? aVal.localeCompare(bVal)
                : bVal.localeCompare(aVal);
        }

        // Handle date comparison
        if (field === 'expireDate') {
            aVal = a.expireDate ? new Date(a.expireDate).getTime() : Infinity;
            bVal = b.expireDate ? new Date(b.expireDate).getTime() : Infinity;
        }

        // Handle remainingSessions comparison with 'Unlimited'
        if (field === 'remainingSessions') {
            const getVal = (v) => {
                if (v === 'Unlimited' || String(v).toLowerCase().includes('unlimited')) return Infinity;
                return Number(v) || 0;
            };
            aVal = getVal(a[field]);
            bVal = getVal(b[field]);
        }

        return currentSortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    });

    updateClientsTable(sorted);
}

function updateClientsTable(clients) {
    const tbody = document.getElementById('clients-page-body');
    if (tbody) {
        if (clients.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6">
                        <div class="empty-state">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"/>
                                <line x1="12" y1="8" x2="12" y2="12"/>
                                <line x1="12" y1="16" x2="12.01" y2="16"/>
                            </svg>
                            <h3>No clients found</h3>
                            <p>Try adjusting your filters or search terms</p>
                        </div>
                    </td>
                </tr>
            `;
        } else {
            tbody.innerHTML = clients.map(client => createClientRow(client)).join('');
        }

        // Update pagination info
        const paginationInfo = document.querySelector('.pagination-info');
        if (paginationInfo) {
            paginationInfo.textContent = `Showing 1-${clients.length} of ${clients.length} clients`;
        }
    }
}

function addNewClient() {
    // Set default expiry date to 3 months from now
    const defaultExpiry = new Date();
    defaultExpiry.setMonth(defaultExpiry.getMonth() + 3);
    const expiryInput = document.getElementById('new-client-expiry');
    if (expiryInput) {
        expiryInput.value = defaultExpiry.toISOString().split('T')[0];
    }

    // Open the modal
    const modal = document.getElementById('add-client-modal');
    if (modal) {
        modal.style.display = 'flex';
        // Focus on first input
        setTimeout(() => {
            document.getElementById('new-client-firstname')?.focus();
        }, 100);
    }
}

function closeAddClientModal() {
    const modal = document.getElementById('add-client-modal');
    if (modal) {
        modal.style.display = 'none';
        // Reset form
        document.getElementById('add-client-form')?.reset();
    }
}

function submitNewClient(event) {
    event.preventDefault();

    // Get form values
    const firstName = document.getElementById('new-client-firstname')?.value.trim();
    const lastName = document.getElementById('new-client-lastname')?.value.trim();
    const email = document.getElementById('new-client-email')?.value.trim();
    const phone = document.getElementById('new-client-phone')?.value.trim();
    const packageName = document.getElementById('new-client-package')?.value.trim();
    const sessions = parseInt(document.getElementById('new-client-sessions')?.value) || 0;
    const expireDate = document.getElementById('new-client-expiry')?.value;
    const membershipType = document.getElementById('new-client-membership')?.value || 'basic';
    const notes = document.getElementById('new-client-notes')?.value.trim();

    // Validate required fields
    if (!firstName || !lastName) {
        showToast('Please enter first and last name', 'error');
        return;
    }
    if (!packageName) {
        showToast('Please enter a package name', 'error');
        return;
    }
    if (!expireDate) {
        showToast('Please select an expire date', 'error');
        return;
    }

    // Generate avatar color
    const colors = ['#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#06b6d4', '#ec4899', '#84cc16', '#a855f7', '#14b8a6'];
    const colorIndex = (firstName.charCodeAt(0) + lastName.charCodeAt(0)) % colors.length;

    // Create client object
    const newClient = {
        firstName,
        lastName,
        email: email || `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
        phone: phone || '(555) 000-0000',
        avatar: null,
        avatarColor: colors[colorIndex],
        packageName,
        membershipType,
        remainingSessions: sessions,
        expireDate,
        nextAppointment: null,
        totalSpend: 0,
        visitCount: 0,
        memberSince: new Date().toISOString().split('T')[0],
        preferredTreatments: [packageName.split(' ')[0]],
        notes,
        visits: []
    };

    // Add client using the service
    if (ClientDataService) {
        const savedClient = ClientDataService.add(newClient);
        console.log('New client added:', savedClient);

        // Close modal
        closeAddClientModal();

        // Show success message
        showToast(`✓ ${firstName} ${lastName} added successfully!`, 'success');

        // Refresh the clients page
        navigateTo('/clients');
    } else {
        showToast('Error: Client service not available', 'error');
    }
}

window.testDatabaseConnection = async function () {
    try {
        if (typeof supabase === 'undefined') throw new Error('Supabase not found');
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('No active user found');

        showToast('Testing DB connection...', 'info');

        // Test Insert
        const testPayload = {
            user_id: user.id,
            first_name: "Test",
            last_name: "Connection",
            email: `test-${Date.now()}@example.com`,
            status: "active",
            membership_type: "Debug Tier",
            remaining_sessions: 99,
            created_at: new Date(),
            updated_at: new Date()
        };

        const { data, error } = await supabase.from('clients').insert([testPayload]).select();

        if (error) throw error;

        if (!data || data.length === 0) {
            alert("❌ Insert reported success, but no data returned. This usually means Row Level Security (RLS) is blocking you from viewing your own data.");
        } else {
            alert(`✅ SUCCESS! Database is working.\nInserted: ${data[0].first_name} ${data[0].last_name}\n\nIf Import still fails, the issue is with the FILE, not the database.`);
            window.location.reload();
        }

    } catch (e) {
        alert(`❌ DATABASE ERROR:\n${e.message}\n${e.details || ''}`);
        console.error(e);
    }
};

