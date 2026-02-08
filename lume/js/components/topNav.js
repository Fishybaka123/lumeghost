// ===========================================
// TOP NAVIGATION COMPONENT
// Horizontal navigation bar with hamburger menu
// Inspired by professional SaaS design
// ===========================================

function createTopNav(activePage = 'dashboard') {
    const user = JSON.parse(sessionStorage.getItem('lume_user')) || { name: 'Admin', initials: 'AD' };

    return `
        <header class="top-nav" role="banner">
            <a href="#main-content" class="skip-link">Skip to main content</a>
            
            <!-- Left Section: Back + Forward + Hamburger + Logo -->
            <div class="top-nav-left">
                <button class="nav-back-btn" onclick="goBack()" aria-label="Go back" id="back-btn">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <path d="M19 12H5"/>
                        <polyline points="12 19 5 12 12 5"/>
                    </svg>
                </button>
                <button class="nav-forward-btn" onclick="goForward()" aria-label="Go forward" id="forward-btn">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <path d="M5 12h14"/>
                        <polyline points="12 5 19 12 12 19"/>
                    </svg>
                </button>
                <button class="hamburger-btn" onclick="toggleMobileMenu()" aria-label="Toggle menu" aria-expanded="false">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <line x1="3" y1="6" x2="21" y2="6"/>
                        <line x1="3" y1="12" x2="21" y2="12"/>
                        <line x1="3" y1="18" x2="21" y2="18"/>
                    </svg>
                </button>
                <a href="#/dashboard" class="top-nav-logo">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                        <path d="M2 17l10 5 10-5"/>
                        <path d="M2 12l10 5 10-5"/>
                    </svg>
                    <span class="logo-text">LUME</span>
                </a>
            </div>
            
            <!-- Center Section: Main Navigation -->
            <nav class="top-nav-center" role="navigation" aria-label="Main navigation">
                <a href="#/dashboard" class="nav-link ${activePage === 'dashboard' ? 'active' : ''}" data-page="dashboard">
                    DASHBOARD
                </a>
                <a href="#/clients" class="nav-link ${activePage === 'clients' ? 'active' : ''}" data-page="clients">
                    CLIENTS
                </a>
                <a href="#/analytics" class="nav-link ${activePage === 'analytics' ? 'active' : ''}" data-page="analytics">
                    ANALYTICS
                </a>
                <a href="#/communications" class="nav-link ${activePage === 'communications' ? 'active' : ''}" data-page="communications">
                    COMMS
                </a>
                <a href="#/operations" class="nav-link ${activePage === 'operations' ? 'active' : ''}" data-page="operations">
                    OPERATIONS
                </a>
            </nav>
            
            <!-- Right Section: Actions + User -->
            <div class="top-nav-right">
                <!-- Theme Toggle Removed per user request -->
                <!-- <button class="nav-icon-btn theme-toggle" ...> -->
                
                <!-- Search -->
                <button class="nav-icon-btn" onclick="openSearchModal()" aria-label="Search">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <circle cx="11" cy="11" r="8"/>
                        <path d="m21 21-4.35-4.35"/>
                    </svg>
                </button>
                
                <!-- Settings -->
                <a href="#/settings" class="nav-icon-btn ${activePage === 'settings' ? 'active' : ''}" aria-label="Settings">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <circle cx="12" cy="12" r="3"/>
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                </a>
                
                <!-- User Avatar & Dropdown -->
                <div class="user-menu-container">
                    <button class="user-avatar-btn" onclick="toggleUserMenu()" aria-label="User menu" aria-haspopup="true">
                        <div class="user-avatar">${user.initials}</div>
                    </button>
                    <div class="user-menu-dropdown" id="user-menu-dropdown">
                        <div class="user-menu-header">
                            <div class="user-avatar large">${user.initials}</div>
                            <div class="user-menu-info">
                                <span class="user-menu-name">${user.name || 'Admin'}</span>
                                <span class="user-menu-email">${user.email || 'admin@lume.com'}</span>
                            </div>
                        </div>
                        <div class="user-menu-form">
                            <div class="user-menu-field">
                                <label>Name</label>
                                <input type="text" id="user-name-input" value="${user.name || 'Admin'}" placeholder="Your name">
                            </div>
                            <div class="user-menu-field">
                                <label>Company</label>
                                <input type="text" id="user-company-input" value="${user.company || 'Lume MedSpa'}" placeholder="Company name">
                            </div>
                            <div class="user-menu-field">
                                <label>Email</label>
                                <input type="email" id="user-email-input" value="${user.email || 'admin@lume.com'}" placeholder="Email address">
                            </div>
                            <button class="btn btn-primary btn-sm" onclick="saveUserProfile()">Save Changes</button>
                        </div>
                        <div class="user-menu-divider"></div>
                        <a href="#/settings" class="user-menu-item" onclick="closeUserMenu()">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                                <circle cx="12" cy="12" r="3"/>
                                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21"/>
                            </svg>
                            Settings
                        </a>
                        <button class="user-menu-item logout" onclick="logout()">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                                <polyline points="16 17 21 12 16 7"/>
                                <line x1="21" y1="12" x2="9" y2="12"/>
                            </svg>
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </header>
        
        <!-- Mobile Side Menu -->
        <div class="mobile-menu-overlay" onclick="closeMobileMenu()"></div>
        <aside class="mobile-menu" role="navigation" aria-label="Mobile navigation">
            <div class="mobile-menu-header">
                <span class="mobile-menu-title">LUME</span>
                <button class="mobile-menu-close" onclick="closeMobileMenu()" aria-label="Close menu">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            </div>
            <nav class="mobile-nav-links">
                <a href="#/dashboard" class="mobile-nav-link ${activePage === 'dashboard' ? 'active' : ''}" onclick="closeMobileMenu()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
                    Dashboard
                </a>
                <a href="#/clients" class="mobile-nav-link ${activePage === 'clients' ? 'active' : ''}" onclick="closeMobileMenu()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    Clients
                </a>
                <a href="#/analytics" class="mobile-nav-link ${activePage === 'analytics' ? 'active' : ''}" onclick="closeMobileMenu()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                    Analytics
                </a>
                <a href="#/communications" class="mobile-nav-link ${activePage === 'communications' ? 'active' : ''}" onclick="closeMobileMenu()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    Communications
                </a>
                <a href="#/leads" class="mobile-nav-link ${activePage === 'leads' ? 'active' : ''}" onclick="closeMobileMenu()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
                    Leads
                </a>
                <a href="#/operations" class="mobile-nav-link ${activePage === 'operations' ? 'active' : ''}" onclick="closeMobileMenu()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                    Operations
                </a>
                <a href="#/settings" class="mobile-nav-link ${activePage === 'settings' ? 'active' : ''}" onclick="closeMobileMenu()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                    Settings
                </a>
            </nav>
            <div class="mobile-menu-footer">
                <button class="btn btn-ghost" onclick="logout()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                        <polyline points="16 17 21 12 16 7"/>
                        <line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                    Logout
                </button>
            </div>
        </aside>
    `;
}

// Mobile menu toggle functions
function toggleMobileMenu() {
    document.body.classList.toggle('mobile-menu-open');
    const btn = document.querySelector('.hamburger-btn');
    if (btn) {
        btn.setAttribute('aria-expanded', document.body.classList.contains('mobile-menu-open'));
    }
}

function closeMobileMenu() {
    document.body.classList.remove('mobile-menu-open');
    const btn = document.querySelector('.hamburger-btn');
    if (btn) btn.setAttribute('aria-expanded', 'false');
}

function openSearchModal() {
    // Create search modal if it doesn't exist
    let modal = document.getElementById('search-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'search-modal';
        modal.className = 'search-modal-overlay';
        modal.innerHTML = `
            <div class="search-modal">
                <div class="search-modal-header">
                    <div class="search-input-wrapper">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                            <circle cx="11" cy="11" r="8"/>
                            <path d="m21 21-4.35-4.35"/>
                        </svg>
                        <input type="text" id="global-search-input" placeholder="Search clients, memberships, dates..." autofocus>
                        <kbd>ESC</kbd>
                    </div>
                </div>
                <div class="search-results" id="search-results">
                    <div class="search-hint">
                        <p>Search by:</p>
                        <ul>
                            <li><strong>Name</strong> - client name</li>
                            <li><strong>Email</strong> - email address</li>
                            <li><strong>Phone</strong> - phone number</li>
                            <li><strong>Membership</strong> - VIP, Premium, Basic</li>
                            <li><strong>Treatment</strong> - treatment type</li>
                        </ul>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Close on overlay click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeSearchModal();
        });

        // Search input handler
        const input = document.getElementById('global-search-input');
        input.addEventListener('input', (e) => performGlobalSearch(e.target.value));
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeSearchModal();
            if (e.key === 'Enter') {
                const firstResult = document.querySelector('.search-result-item');
                if (firstResult) firstResult.click();
            }
        });
    }

    modal.classList.add('active');
    document.getElementById('global-search-input').value = '';
    document.getElementById('global-search-input').focus();
    document.getElementById('search-results').innerHTML = `
        <div class="search-hint">
            <p>Search by:</p>
            <ul>
                <li><strong>Name</strong> - client name</li>
                <li><strong>Email</strong> - email address</li>
                <li><strong>Phone</strong> - phone number</li>
                <li><strong>Membership</strong> - VIP, Premium, Basic</li>
                <li><strong>Treatment</strong> - treatment type</li>
            </ul>
        </div>
    `;
}

function closeSearchModal() {
    const modal = document.getElementById('search-modal');
    if (modal) modal.classList.remove('active');
}

function performGlobalSearch(query) {
    const resultsContainer = document.getElementById('search-results');
    if (!query || query.length < 2) {
        resultsContainer.innerHTML = `
            <div class="search-hint">
                <p>Type at least 2 characters to search...</p>
            </div>
        `;
        return;
    }

    const clients = typeof ClientDataService !== 'undefined' ? ClientDataService.getAll() : [];
    const q = query.toLowerCase();

    const results = clients.filter(client => {
        // Search across all relevant fields
        const searchableFields = [
            client.name,
            client.email,
            client.phone,
            client.membershipTier,
            client.treatment,
            client.lastVisit,
            client.expireDate,
            client.notes,
            String(client.healthScore),
            String(client.churnRisk)
        ].filter(Boolean).map(f => String(f).toLowerCase());

        return searchableFields.some(field => field.includes(q));
    }).slice(0, 10); // Limit to 10 results

    if (results.length === 0) {
        resultsContainer.innerHTML = `
            <div class="search-no-results">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="48" height="48">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="m21 21-4.35-4.35"/>
                </svg>
                <p>No results found for "${query}"</p>
            </div>
        `;
        return;
    }

    resultsContainer.innerHTML = results.map(client => `
        <div class="search-result-item" onclick="goToClient(${client.id}); closeSearchModal();">
            <div class="search-result-avatar">${getInitials(client.name)}</div>
            <div class="search-result-info">
                <div class="search-result-name">${highlightMatch(client.name, q)}</div>
                <div class="search-result-details">
                    ${client.email ? `<span>${highlightMatch(client.email, q)}</span>` : ''}
                    ${client.membershipTier ? `<span class="membership-tag">${client.membershipTier}</span>` : ''}
                    ${client.treatment ? `<span>${client.treatment}</span>` : ''}
                </div>
            </div>
            <div class="search-result-meta">
                <span class="health-indicator ${getHealthClass(client.healthScore)}">${client.healthScore || 0}</span>
            </div>
        </div>
    `).join('');
}

function highlightMatch(text, query) {
    if (!text) return '';
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
}

function getInitials(name) {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function getHealthClass(score) {
    if (score >= 70) return 'healthy';
    if (score >= 40) return 'warning';
    return 'at-risk';
}

function goToClient(clientId) {
    navigateTo(`/clients/${clientId}`);
}

function toggleUserMenu() {
    const dropdown = document.getElementById('user-menu-dropdown');
    if (dropdown) {
        dropdown.classList.toggle('active');
    }
}

function closeUserMenu() {
    const dropdown = document.getElementById('user-menu-dropdown');
    if (dropdown) {
        dropdown.classList.remove('active');
    }
}

function saveUserProfile() {
    const name = document.getElementById('user-name-input')?.value || 'Admin';
    const company = document.getElementById('user-company-input')?.value || 'Lume MedSpa';
    const email = document.getElementById('user-email-input')?.value || 'admin@lume.com';

    // Generate initials from name
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'AD';

    const user = { name, company, email, initials };
    sessionStorage.setItem('lume_user', JSON.stringify(user));

    // Update avatar display
    const avatars = document.querySelectorAll('.user-avatar');
    avatars.forEach(avatar => {
        avatar.textContent = initials;
    });

    // Update name display
    const nameDisplay = document.querySelector('.user-menu-name');
    if (nameDisplay) nameDisplay.textContent = name;

    const emailDisplay = document.querySelector('.user-menu-email');
    if (emailDisplay) emailDisplay.textContent = email;

    showToast('✓ Profile saved!', 'success');
    closeUserMenu();
}

// Close user menu when clicking outside
document.addEventListener('click', (e) => {
    const container = document.querySelector('.user-menu-container');
    if (container && !container.contains(e.target)) {
        closeUserMenu();
    }
});

// Keyboard shortcut for search (Cmd/Ctrl + K)
document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        openSearchModal();
    }
});

// Navigation history tracking
let navigationHistory = [];
let forwardHistory = [];

function goBack() {
    if (navigationHistory.length > 1) {
        // Remove current page and save to forward history
        const currentPage = navigationHistory.pop();
        forwardHistory.push(currentPage);
        // Go to previous page
        const previousPage = navigationHistory[navigationHistory.length - 1];
        if (previousPage) {
            // Navigate without tracking (we're going back)
            window.location.hash = previousPage;
        }
        updateNavButtons();
    }
}

function goForward() {
    if (forwardHistory.length > 0) {
        const nextPage = forwardHistory.pop();
        if (nextPage) {
            navigationHistory.push(nextPage);
            window.location.hash = nextPage;
        }
        updateNavButtons();
    }
}

function updateNavButtons() {
    updateBackButton();
    updateForwardButton();
}

function updateBackButton() {
    const backBtn = document.getElementById('back-btn');
    if (backBtn) {
        if (navigationHistory.length <= 1) {
            backBtn.disabled = true;
            backBtn.classList.add('disabled');
        } else {
            backBtn.disabled = false;
            backBtn.classList.remove('disabled');
        }
    }
}

function updateForwardButton() {
    const forwardBtn = document.getElementById('forward-btn');
    if (forwardBtn) {
        if (forwardHistory.length === 0) {
            forwardBtn.disabled = true;
            forwardBtn.classList.add('disabled');
        } else {
            forwardBtn.disabled = false;
            forwardBtn.classList.remove('disabled');
        }
    }
}

function trackNavigation(path) {
    // Avoid duplicates
    if (navigationHistory[navigationHistory.length - 1] !== path) {
        navigationHistory.push(path);
        // Clear forward history when navigating to a new page
        forwardHistory = [];
        // Keep history limited
        if (navigationHistory.length > 20) {
            navigationHistory.shift();
        }
    }
    updateNavButtons();
}

// Expose globally
window.createTopNav = createTopNav;
window.toggleMobileMenu = toggleMobileMenu;
window.closeMobileMenu = closeMobileMenu;
window.openSearchModal = openSearchModal;
window.closeSearchModal = closeSearchModal;
window.toggleUserMenu = toggleUserMenu;
window.closeUserMenu = closeUserMenu;
window.saveUserProfile = saveUserProfile;
window.goBack = goBack;
window.goForward = goForward;
window.updateBackButton = updateBackButton;
window.updateForwardButton = updateForwardButton;
window.trackNavigation = trackNavigation;

