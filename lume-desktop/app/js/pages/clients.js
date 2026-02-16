// ===========================================
// CLIENTS LIST PAGE
// ===========================================

function renderClientsPage() {
    const user = JSON.parse(sessionStorage.getItem('lume_user')) || { name: 'Admin', initials: 'AD' };

    // Get clients from service with error handling
    let clients = [];
    let isImported = false;

    try {
        if (typeof ClientDataService !== 'undefined') {
            clients = ClientDataService.getAll() || [];
            isImported = ClientDataService.isUsingImportedData();
        } else if (typeof CLIENTS !== 'undefined') {
            clients = CLIENTS || [];
        }

        // Enrich clients with real-time analysis
        if (typeof AdvancedChurnCalculator !== 'undefined') {
            clients = clients.map(c => {
                const analysis = AdvancedChurnCalculator.analyze(c);
                return { ...c, healthScore: analysis.healthScore, churnRisk: analysis.churnRisk };
            });
        }
    } catch (e) {
        console.error('Error loading clients:', e);
        clients = [];
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
                            <input type="file" id="csv-file-input" accept=".csv,.txt" style="display: none;" onchange="handleFileImport(event)">
                            <button class="btn btn-secondary" onclick="document.getElementById('csv-file-input').click()">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                    <polyline points="17 8 12 3 7 8"/>
                                    <line x1="12" y1="3" x2="12" y2="15"/>
                                </svg>
                                Import CSV
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
                            <button class="filter-pill" onclick="setClientFilter('healthy', this)">Healthy (${clients.filter(c => c.healthScore >= 70).length})</button>
                            <button class="filter-pill" onclick="setClientFilter('attention', this)">Needs Attention (${clients.filter(c => c.healthScore >= 40 && c.healthScore < 70).length})</button>
                            <button class="filter-pill" onclick="setClientFilter('at-risk', this)">At Risk (${clients.filter(c => c.healthScore < 40).length})</button>
                            <button class="filter-pill" onclick="setClientFilter('expiring', this)">Expiring Soon (${clients.filter(c => {
        if (!c.expireDate) return false;
        const days = Math.ceil((new Date(c.expireDate) - new Date()) / (1000 * 60 * 60 * 24));
        return days <= 14 && days > 0;
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
                    <div class="clients-table-container">
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
                                    <th>Actions</th>
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

// Handle CSV file import
function handleFileImport(event) {
    console.log('handleFileImport called');

    const file = event.target.files[0];
    if (!file) {
        console.log('No file selected');
        return;
    }

    console.log('File selected:', file.name);

    // Show loading state
    showImportModal('loading', `Importing ${file.name}...`);

    const reader = new FileReader();
    reader.onload = function (e) {
        const csvText = e.target.result;
        console.log('File read successfully, length:', csvText.length);

        try {
            // Check if required services exist
            if (typeof CSVParser === 'undefined') {
                throw new Error('CSVParser not loaded');
            }
            if (typeof ClientDataService === 'undefined') {
                throw new Error('ClientDataService not loaded');
            }

            const result = ClientDataService.importFromCSV(csvText);
            console.log('Import result:', result);

            if (result.success) {
                showImportModal('success', `Successfully imported ${result.count} clients!`);

                // Refresh the page after a short delay
                setTimeout(() => {
                    // Close the modal first
                    const modal = document.getElementById('import-modal');
                    if (modal) modal.style.display = 'none';

                    // Force a proper page refresh by reloading the route
                    router();
                }, 1500);
            } else {
                showImportModal('error', `Import failed: ${result.error}`);
            }
        } catch (error) {
            console.error('Import error:', error);
            showImportModal('error', `Import failed: ${error.message}`);
        }
    };

    reader.onerror = function (e) {
        console.error('FileReader error:', e);
        showImportModal('error', 'Failed to read file');
    };

    reader.readAsText(file);

    // Reset the input so the same file can be selected again
    event.target.value = '';
}

// Make function globally accessible
window.handleFileImport = handleFileImport;

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
            filtered = clients.filter(c => c.healthScore >= 70);
            break;
        case 'attention':
            filtered = clients.filter(c => c.healthScore >= 40 && c.healthScore < 70);
            break;
        case 'at-risk':
            filtered = clients.filter(c => c.healthScore < 40);
            break;
        case 'expiring':
            filtered = clients.filter(c => {
                if (!c.expireDate) return false;
                const days = Math.ceil((new Date(c.expireDate) - new Date()) / (1000 * 60 * 60 * 24));
                return days <= 14 && days > 0;
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
                filtered = filtered.filter(c => c.healthScore >= 70);
                break;
            case 'attention':
                filtered = filtered.filter(c => c.healthScore >= 40 && c.healthScore < 70);
                break;
            case 'at-risk':
                filtered = filtered.filter(c => c.healthScore < 40);
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
    let sorted = [...clients];

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

// Updated client row to show new fields
function createClientRow(client) {
    // Defensive null check
    if (!client) return '';

    try {
        const healthScore = client.healthScore || 50;
        // Inline health class calculation (function was undefined)
        const healthClass = healthScore >= 70 ? 'good' : healthScore >= 40 ? 'medium' : 'poor';
        const remainingSessions = client.remainingSessions !== undefined ? client.remainingSessions : 0;
        const sessionsClass = remainingSessions <= 2 ? 'low' : remainingSessions <= 5 ? 'medium' : 'high';

        let expiryDisplay = 'N/A';
        let expiryClass = '';
        if (client.expireDate) {
            try {
                const days = Math.ceil((new Date(client.expireDate) - new Date()) / (1000 * 60 * 60 * 24));
                if (days < 0) {
                    expiryDisplay = 'Expired';
                    expiryClass = 'expired';
                } else if (days <= 7) {
                    expiryDisplay = `${days}d left`;
                    expiryClass = 'urgent';
                } else if (days <= 14) {
                    expiryDisplay = `${days}d left`;
                    expiryClass = 'warning';
                } else {
                    expiryDisplay = formatDate(client.expireDate);
                }
            } catch (e) {
                expiryDisplay = 'Invalid';
            }
        }

        // Safe getters for client info
        const firstName = client.firstName || '';
        const lastName = client.lastName || '';
        const fullName = (firstName + ' ' + lastName).trim() || client.name || 'Unknown';

        // Calculate initials safely
        let initials = 'XX';
        if (firstName && lastName) {
            initials = (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
        } else if (fullName && fullName !== 'Unknown') {
            const nameParts = fullName.split(' ').filter(p => p.length > 0);
            if (nameParts.length >= 2) {
                initials = (nameParts[0].charAt(0) + nameParts[1].charAt(0)).toUpperCase();
            } else if (nameParts.length === 1) {
                initials = nameParts[0].substring(0, 2).toUpperCase();
            }
        }

        const avatarColor = client.avatarColor || '#8b5cf6';
        const email = client.email || '';

        return `
            <tr class="client-row" onclick="navigateTo('/clients/${client.id}')">
                <td>
                    <div class="client-cell">
                        <div class="client-avatar" style="background-color: ${avatarColor}">
                            ${initials}
                        </div>
                        <div class="client-info">
                            <span class="client-name">${fullName}</span>
                            <span class="client-email">${email}</span>
                        </div>
                    </div>
                </td>
                <td>
                    <div class="health-score ${healthClass}">
                        <div class="health-bar">
                            <div class="health-fill" style="width: ${healthScore}%"></div>
                        </div>
                        <span>${healthScore}</span>
                    </div>
                </td>
                <td>
                    <span class="sessions-badge ${sessionsClass}">${remainingSessions}</span>
                </td>
                <td>
                    <span class="expiry-badge ${expiryClass}">${expiryDisplay}</span>
                </td>
                <td>
                    <span class="package-name">${client.packageName || client.membershipType || 'None'}</span>
                </td>
                <td>
                    <div class="row-actions" onclick="event.stopPropagation()">
                        <button class="action-btn" onclick="sendNudge(${client.id})" title="Send Nudge">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="m22 2-7 20-4-9-9-4 20-7Z"/>
                            </svg>
                        </button>
                        <button class="action-btn" onclick="navigateTo('/clients/${client.id}')" title="View Profile">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                <circle cx="12" cy="12" r="3"/>
                            </svg>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    } catch (e) {
        console.error('Error rendering client row:', e, client);
        return '';
    }
}
