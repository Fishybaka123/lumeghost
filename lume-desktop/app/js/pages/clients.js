// ===========================================
// CLIENTS LIST PAGE
// ===========================================

function renderClientsPage() {
    const user = JSON.parse(sessionStorage.getItem('lume_user')) || { name: 'Admin', initials: 'AD' };

    // Sort clients by health score (lowest first = needs most attention)
    const sortedClients = [...CLIENTS].sort((a, b) => a.healthScore - b.healthScore);

    return `
        <div class="app-layout clients-page">
            ${createSidebar('clients')}
            
            <main class="main-content">
                ${createHeader(user)}
                
                <div class="page-content">
                    <div class="page-header">
                        <div class="page-title-section">
                            <h1>Clients</h1>
                            <p>Manage and monitor your client relationships</p>
                        </div>
                        <div class="page-actions">
                            <button class="btn btn-secondary">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                    <polyline points="17 8 12 3 7 8"/>
                                    <line x1="12" y1="3" x2="12" y2="15"/>
                                </svg>
                                Import
                            </button>
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
                            <button class="filter-pill active" onclick="setClientFilter('all', this)">All Clients (${CLIENTS.length})</button>
                            <button class="filter-pill" onclick="setClientFilter('healthy', this)">Healthy (${CLIENTS.filter(c => c.healthScore >= 70).length})</button>
                            <button class="filter-pill" onclick="setClientFilter('attention', this)">Needs Attention (${CLIENTS.filter(c => c.healthScore >= 40 && c.healthScore < 70).length})</button>
                            <button class="filter-pill" onclick="setClientFilter('at-risk', this)">At Risk (${CLIENTS.filter(c => c.healthScore < 40).length})</button>
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
                                    <th class="sortable" onclick="sortClientsPage('churnRisk')">
                                        Churn Risk
                                        <span class="sort-icon">↕</span>
                                    </th>
                                    <th class="sortable" onclick="sortClientsPage('lastVisit')">
                                        Last Visit
                                        <span class="sort-icon">↕</span>
                                    </th>
                                    <th>Membership</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody id="clients-page-body">
                                ${sortedClients.map(client => createClientRow(client)).join('')}
                            </tbody>
                        </table>
                        
                        <div class="table-pagination">
                            <span class="pagination-info">Showing 1-${CLIENTS.length} of ${CLIENTS.length} clients</span>
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
    `;
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

    // Apply filter
    let filtered = [...CLIENTS];

    switch (filter) {
        case 'healthy':
            filtered = CLIENTS.filter(c => c.healthScore >= 70);
            break;
        case 'attention':
            filtered = CLIENTS.filter(c => c.healthScore >= 40 && c.healthScore < 70);
            break;
        case 'at-risk':
            filtered = CLIENTS.filter(c => c.healthScore < 40);
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
    let filtered = [...CLIENTS];

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

    let filtered = CLIENTS.filter(c => {
        const fullName = getClientFullName(c).toLowerCase();
        const email = c.email.toLowerCase();
        const phone = c.phone.toLowerCase();
        return fullName.includes(searchTerm) || email.includes(searchTerm) || phone.includes(searchTerm);
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

    let sorted = [...CLIENTS];

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
        if (field === 'lastVisit') {
            aVal = new Date(a.lastVisit).getTime();
            bVal = new Date(b.lastVisit).getTime();
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
    alert('➕ Add New Client\n\n(Client creation form will appear here)');
}
