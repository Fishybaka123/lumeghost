// ===========================================
// CLIENT TABLE COMPONENT
// ===========================================



function createClientRow(client) {
    const healthScore = Math.min(Math.max(Number(client.healthScore) || 0, 0), 100);
    const healthClass = getHealthScoreClass(healthScore);
    const churnClass = getChurnRiskClass(client.churnRisk);

    return `
        <tr data-client-id="${client.id}" onclick="window.navigateTo('/clients/${client.id}')" style="cursor: pointer;">
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
                            <th>Membership</th>
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
