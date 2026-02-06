// ===========================================
// CLIENT TABLE COMPONENT
// ===========================================

function createClientRow(client) {
    const healthClass = getHealthScoreClass(client.healthScore);
    const churnClass = getChurnRiskClass(client.churnRisk);

    return `
        <tr data-client-id="${client.id}" onclick="navigateTo('/clients/${client.id}')">
            <td>
                <div class="client-cell">
                    <div class="client-avatar" style="background-color: ${client.avatarColor}">
                        ${getClientInitials(client)}
                    </div>
                    <div class="client-info">
                        <div class="client-name">${getClientFullName(client)}</div>
                        <div class="client-email">${client.email}</div>
                    </div>
                </div>
            </td>
            <td>
                <div class="health-score ${healthClass}">
                    <span>${client.healthScore}</span>
                    <div class="health-score-bar">
                        <div class="health-score-fill" style="width: ${client.healthScore}%"></div>
                    </div>
                </div>
            </td>
            <td>
                <span class="churn-badge ${churnClass}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                    </svg>
                    ${client.churnRisk}% ${client.churnRisk >= 60 ? 'High Risk' : client.churnRisk >= 30 ? 'Medium' : 'Low'}
                </span>
            </td>
            <td>
                <span class="text-sm">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14" style="display: inline-block; vertical-align: middle; margin-right: 4px; color: var(--gray-400);">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                    </svg>
                    ${client.lastVisit ? getRelativeTime(client.lastVisit) : 'No visits yet'}
                </span>
            </td>
            <td>
                <span class="membership-badge ${getMembershipBadgeClass(client.membershipType)}">
                    ${getMembershipLabel(client.membershipType)}
                </span>
            </td>
            <td>
                <div class="action-buttons" onclick="event.stopPropagation()">
                    <button class="action-btn primary" title="Send Nudge" onclick="sendNudge(${client.id})">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="m22 2-7 20-4-9-9-4 20-7Z"/>
                            <path d="M22 2 11 13"/>
                        </svg>
                    </button>
                    <button class="action-btn" title="Schedule" onclick="scheduleAppointment(${client.id})">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                            <line x1="16" y1="2" x2="16" y2="6"/>
                            <line x1="8" y1="2" x2="8" y2="6"/>
                            <line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                    </button>
                    <button class="action-btn" title="More" onclick="showClientMenu(${client.id})">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="1"/>
                            <circle cx="12" cy="5" r="1"/>
                            <circle cx="12" cy="19" r="1"/>
                        </svg>
                    </button>
                </div>
            </td>
        </tr>
    `;
}

function createClientTable(clients, options = {}) {
    const { showSearch = true, showFilters = true, compact = false } = options;

    const searchSection = showSearch ? `
        <div class="table-search">
            <div class="input-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="m21 21-4.35-4.35"/>
                </svg>
                <input type="text" class="input" placeholder="Search clients..." id="client-search" onkeyup="filterClients(this.value)">
            </div>
        </div>
    ` : '';

    const filterSection = showFilters ? `
        <div class="quick-view-header">
            <h3 class="quick-view-title">Clients</h3>
            <div class="quick-view-filters">
                <select class="filter-select" id="treatment-filter" onchange="filterByTreatment(this.value)">
                    <option value="">All Treatments</option>
                    <option value="botox">Botox</option>
                    <option value="hydrafacial">HydraFacial</option>
                    <option value="laser">Laser Treatments</option>
                    <option value="microneedling">Microneedling</option>
                </select>
                <select class="filter-select" id="risk-filter" onchange="filterByRisk(this.value)">
                    <option value="">All Risk Levels</option>
                    <option value="high">High Risk</option>
                    <option value="medium">Medium Risk</option>
                    <option value="low">Low Risk</option>
                </select>
            </div>
        </div>
    ` : '';

    const tableRows = clients.map(client => createClientRow(client)).join('');

    return `
        <div class="quick-view-section">
            ${filterSection}
            ${searchSection}
            <div class="table-container">
                <table class="clients-table">
                    <thead>
                        <tr>
                            <th class="sortable" onclick="sortClients('name')">
                                Client
                                <span class="sort-icon">↕</span>
                            </th>
                            <th class="sortable" onclick="sortClients('healthScore')">
                                Health Score
                                <span class="sort-icon">↕</span>
                            </th>
                            <th class="sortable" onclick="sortClients('churnRisk')">
                                Churn Risk
                                <span class="sort-icon">↕</span>
                            </th>
                            <th class="sortable" onclick="sortClients('lastVisit')">
                                Last Visit
                                <span class="sort-icon">↕</span>
                            </th>
                            <th>Membership</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="clients-table-body">
                        ${tableRows}
                    </tbody>
                </table>
            </div>
            ${clients.length > 10 ? createPagination(clients.length) : ''}
        </div>
    `;
}

function createPagination(total, currentPage = 1, perPage = 10) {
    const totalPages = Math.ceil(total / perPage);
    const start = (currentPage - 1) * perPage + 1;
    const end = Math.min(currentPage * perPage, total);

    let buttons = '';
    for (let i = 1; i <= totalPages; i++) {
        buttons += `<button class="pagination-btn ${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
    }

    return `
        <div class="table-pagination">
            <span class="pagination-info">Showing ${start}-${end} of ${total} clients</span>
            <div class="pagination-buttons">
                <button class="pagination-btn" onclick="goToPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>Previous</button>
                ${buttons}
                <button class="pagination-btn" onclick="goToPage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>Next</button>
            </div>
        </div>
    `;
}

// Action handlers (placeholder functions for future implementation)
function sendNudge(clientId) {
    const client = getClientById(clientId);
    alert(`📤 Sending nudge to ${getClientFullName(client)}...\n\n(AI-powered message will be generated here)`);
}

function scheduleAppointment(clientId) {
    const client = getClientById(clientId);
    alert(`📅 Opening scheduler for ${getClientFullName(client)}...\n\n(Calendar integration will appear here)`);
}

function showClientMenu(clientId) {
    alert('More options menu coming soon!');
}

function filterClients(searchTerm) {
    const filtered = CLIENTS.filter(c => {
        const fullName = getClientFullName(c).toLowerCase();
        const email = c.email.toLowerCase();
        const term = searchTerm.toLowerCase();
        return fullName.includes(term) || email.includes(term);
    });

    const tbody = document.getElementById('clients-table-body');
    if (tbody) {
        tbody.innerHTML = filtered.map(client => createClientRow(client)).join('');
    }
}

function sortClients(field) {
    // Placeholder for sorting functionality
    console.log('Sorting by:', field);
}

function filterByTreatment(treatment) {
    console.log('Filtering by treatment:', treatment);
}

function filterByRisk(risk) {
    let filtered = CLIENTS;

    if (risk === 'high') {
        filtered = CLIENTS.filter(c => c.churnRisk >= 60);
    } else if (risk === 'medium') {
        filtered = CLIENTS.filter(c => c.churnRisk >= 30 && c.churnRisk < 60);
    } else if (risk === 'low') {
        filtered = CLIENTS.filter(c => c.churnRisk < 30);
    }

    const tbody = document.getElementById('clients-table-body');
    if (tbody) {
        tbody.innerHTML = filtered.map(client => createClientRow(client)).join('');
    }
}

function goToPage(page) {
    console.log('Going to page:', page);
}
