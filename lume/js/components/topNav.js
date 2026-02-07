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
            
            <!-- Left Section: Hamburger + Logo -->
            <div class="top-nav-left">
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
                <!-- Theme Toggle -->
                <button class="nav-icon-btn theme-toggle" onclick="toggleTheme()" aria-label="Toggle dark mode">
                    <svg class="theme-icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <circle cx="12" cy="12" r="5"/>
                        <line x1="12" y1="1" x2="12" y2="3"/>
                        <line x1="12" y1="21" x2="12" y2="23"/>
                        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                        <line x1="1" y1="12" x2="3" y2="12"/>
                        <line x1="21" y1="12" x2="23" y2="12"/>
                        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                    </svg>
                    <svg class="theme-icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" style="display:none">
                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                    </svg>
                </button>
                
                <!-- Search -->
                <button class="nav-icon-btn" onclick="openSearchModal()" aria-label="Search">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <circle cx="11" cy="11" r="8"/>
                        <path d="m21 21-4.35-4.35"/>
                    </svg>
                </button>
                
                <!-- Notifications -->
                <button class="nav-icon-btn" id="notifications-btn" aria-label="Notifications">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                    </svg>
                    <span class="notification-badge">3</span>
                </button>
                
                <!-- Settings -->
                <a href="#/settings" class="nav-icon-btn ${activePage === 'settings' ? 'active' : ''}" aria-label="Settings">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <circle cx="12" cy="12" r="3"/>
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                    </svg>
                </a>
                
                <!-- User Avatar -->
                <button class="user-avatar-btn" onclick="toggleUserMenu()" aria-label="User menu" aria-haspopup="true">
                    <div class="user-avatar">${user.initials}</div>
                </button>
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
    // Placeholder for search modal
    showToast('Search feature coming soon', 'info');
}

function toggleUserMenu() {
    // Placeholder for user dropdown
    showToast('User menu coming soon', 'info');
}

// Expose globally
window.createTopNav = createTopNav;
window.toggleMobileMenu = toggleMobileMenu;
window.closeMobileMenu = closeMobileMenu;
window.openSearchModal = openSearchModal;
window.toggleUserMenu = toggleUserMenu;
